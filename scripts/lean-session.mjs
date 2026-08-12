/**
 * A Lean that stays running between checks.
 *
 * Spawning `lean` per check means reloading every imported module every time —
 * about ten seconds where Mathlib is involved, and no amount of trimming
 * imports fixes that. The language server keeps a worker per open document, so
 * the imports are loaded once and every later edit of the *same* document is
 * re-elaborated against them. That is exactly how an editor stays responsive,
 * and exactly the shape of solving a kata: open one, compile it repeatedly.
 *
 * Documents are keyed by an id supplied by the page — one per kata. A page that
 * sends no id gets a shared scratch document, which still saves the imports if
 * two checks in a row happen to need the same ones.
 *
 * Two things here were found by experiment rather than by reading, and both
 * silently return "no problems found" when got wrong:
 *
 *   - The document must exist on disk. Sending its text in `didOpen` is not
 *     enough: the server answers with an empty diagnostic list and never
 *     elaborates anything.
 *   - The reply to `waitForDiagnostics` is not by itself proof that the
 *     diagnostics in hand belong to the version just sent, so the version is
 *     checked and, if it does not match, waited for.
 */

import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir, writeFile, rm } from 'node:fs/promises';

/** Long enough for a cold Mathlib load on a slow disk, short enough to give up. */
const READY_MS = 180_000;
/** Grace period for a diagnostics publish that lags its own completion signal. */
const SETTLE_MS = 10_000;
/**
 * How many documents stay open at once.
 *
 * Each open document is a worker process with its own copy of the imported
 * environment, and Mathlib is not small — leaving one per kata open ran the
 * machine out of memory partway through checking all of them. Solving katas is
 * a one-at-a-time activity, so a handful is plenty: the current one keeps its
 * imports, the one before it is still warm if you go back.
 */
const MAX_OPEN = Number(process.env.LEAN_MAX_DOCS ?? 3);

export class LeanSession {
  #child = null;
  #buffer = Buffer.alloc(0);
  #nextId = 1;
  #pending = new Map();
  #diagnostics = new Map();
  #waiters = new Map();
  #versions = new Map();
  #opened = new Set();

  constructor({ leanExe, env, cwd }) {
    this.leanExe = leanExe;
    this.env = env;
    this.cwd = cwd;
    this.scratchDir = join(tmpdir(), 'lean-course-session');
  }

  get running() {
    return this.#child !== null && this.#child.exitCode === null;
  }

  async start() {
    await rm(this.scratchDir, { recursive: true, force: true });
    await mkdir(this.scratchDir, { recursive: true });

    this.#child = spawn(this.leanExe, ['--server'], { cwd: this.cwd, env: this.env });
    this.#child.stdout.on('data', (chunk) => this.#receive(chunk));
    this.#child.on('exit', () => this.#collapse('The Lean server exited.'));
    this.#child.on('error', () => this.#collapse('The Lean server could not be started.'));

    await this.#request('initialize', {
      processId: process.pid,
      rootUri: pathToFileURL(this.cwd).href,
      capabilities: {},
    });
    this.#notify('initialized', {});
  }

  /**
   * Ends the server and, with it, its workers.
   *
   * The watchdog spawns a worker process per open document, and on Windows
   * killing the parent leaves those children running — with a Mathlib
   * environment each, that is gigabytes of orphans per restart. `taskkill /T`
   * takes the tree down together.
   */
  stop() {
    const child = this.#child;
    this.#child = null;
    if (!child) return;

    if (process.platform === 'win32' && child.pid) {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
        .on('error', () => child.kill());
    } else {
      child.kill();
    }
    void rm(this.scratchDir, { recursive: true, force: true });
  }

  /**
   * Forgets one document, so the next check of it opens a fresh one.
   *
   * The server runs a worker per document and a worker can die on its own —
   * Lean reports "crashed, likely due to a stack overflow" and that document
   * stops answering. The session as a whole is unharmed, and treating one dead
   * worker as a dead session would throw away the loaded imports of every
   * other kata.
   */
  forget(id = 'scratch') {
    const uri = pathToFileURL(join(this.scratchDir, `${safeName(id)}.lean`)).href;
    this.#opened.delete(uri);
    this.#diagnostics.delete(uri);
    this.#waiters.delete(uri);
  }

  /**
   * Diagnostics for one piece of code, as the server reports them.
   *
   * The first check of a document pays for its imports; the rest do not, which
   * is the whole reason this class exists.
   */
  async check(code, id = 'scratch') {
    const path = join(this.scratchDir, `${safeName(id)}.lean`);
    const uri = pathToFileURL(path).href;
    const version = (this.#versions.get(uri) ?? 0) + 1;
    this.#versions.set(uri, version);

    // The server elaborates files, not buffers: without this it reports nothing.
    await writeFile(path, code, 'utf8');

    if (this.#opened.has(uri)) {
      this.#notify('textDocument/didChange', {
        textDocument: { uri, version },
        contentChanges: [{ text: code }],
      });
    } else {
      this.#notify('textDocument/didOpen', {
        textDocument: { uri, languageId: 'lean4', version, text: code },
      });
    }

    // A Set keeps insertion order, so re-adding makes this the most recent and
    // leaves the least recently used first in line to be closed.
    this.#opened.delete(uri);
    this.#opened.add(uri);
    this.#evictBeyond(MAX_OPEN);

    // Lean's own extension: it answers once this version has been processed.
    await this.#request('textDocument/waitForDiagnostics', { uri, version }, READY_MS);

    const held = this.#diagnostics.get(uri);
    if (held && held.version === version) return held.list;
    return this.#awaitDiagnostics(uri, version);
  }

  /** Closes the least recently used documents, which ends their worker processes. */
  #evictBeyond(limit) {
    for (const uri of [...this.#opened].slice(0, Math.max(0, this.#opened.size - limit))) {
      this.#notify('textDocument/didClose', { textDocument: { uri } });
      this.#opened.delete(uri);
      this.#versions.delete(uri);
      this.#diagnostics.delete(uri);
    }
  }

  /** Waits for a publish that names this version, rather than trusting the last one. */
  #awaitDiagnostics(uri, version) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.#dropWaiter(uri, entry);
        resolve(this.#diagnostics.get(uri)?.list ?? []);
      }, SETTLE_MS);

      const entry = {
        version,
        resolve: (list) => { clearTimeout(timer); resolve(list); },
      };
      this.#waiters.set(uri, [...(this.#waiters.get(uri) ?? []), entry]);
    });
  }

  #dropWaiter(uri, entry) {
    this.#waiters.set(uri, (this.#waiters.get(uri) ?? []).filter((other) => other !== entry));
  }

  // ── JSON-RPC over stdio ────────────────────────────────────────────────

  #send(message) {
    const body = Buffer.from(JSON.stringify(message), 'utf8');
    this.#child.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
    this.#child.stdin.write(body);
  }

  #notify(method, params) {
    this.#send({ jsonrpc: '2.0', method, params });
  }

  #request(method, params, timeoutMs = READY_MS) {
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`Lean did not answer ${method} within ${timeoutMs / 1000}s.`));
      }, timeoutMs);

      this.#pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      this.#send({ jsonrpc: '2.0', id, method, params });
    });
  }

  #collapse(reason) {
    for (const { reject } of this.#pending.values()) reject(new Error(reason));
    this.#pending.clear();
    for (const waiting of this.#waiters.values()) {
      for (const entry of waiting) entry.resolve([]);
    }
    this.#waiters.clear();
    this.#opened.clear();
  }

  /** LSP frames messages with a Content-Length header; chunks split anywhere. */
  #receive(chunk) {
    this.#buffer = Buffer.concat([this.#buffer, chunk]);

    for (;;) {
      const headerEnd = this.#buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;

      const header = this.#buffer.subarray(0, headerEnd).toString('ascii');
      const length = Number(/content-length:\s*(\d+)/i.exec(header)?.[1]);
      if (!Number.isFinite(length)) {
        // Nothing sane to resynchronise on; drop the frame and keep going.
        this.#buffer = this.#buffer.subarray(headerEnd + 4);
        continue;
      }

      const start = headerEnd + 4;
      if (this.#buffer.length < start + length) return;

      const body = this.#buffer.subarray(start, start + length).toString('utf8');
      this.#buffer = this.#buffer.subarray(start + length);

      try {
        this.#handle(JSON.parse(body));
      } catch {
        // A malformed frame is not worth killing the session over.
      }
    }
  }

  /**
   * A message carrying `method` is something the server is telling or asking
   * us; only a message without one is a reply. The distinction matters more
   * than it looks: the server sends requests of its own — `registerCapability`,
   * the inlay-hint and semantic-token refreshes — and those carry an `id` from
   * its own counter, which collides with ours. Matching on `id` alone resolved
   * a pending `waitForDiagnostics` the moment such a request arrived, so checks
   * returned before the file had been elaborated and every proof looked correct.
   */
  #handle(message) {
    if (message.method !== undefined) {
      if (message.method === 'textDocument/publishDiagnostics') this.#publish(message.params);
      // Server-to-client requests still expect an answer; anything else stalls it.
      if (message.id !== undefined) this.#send({ jsonrpc: '2.0', id: message.id, result: null });
      return;
    }

    const pending = this.#pending.get(message.id);
    if (!pending) return;
    this.#pending.delete(message.id);
    if (message.error) pending.reject(new Error(message.error.message ?? 'Lean reported an error.'));
    else pending.resolve(message.result);
  }

  #publish({ uri, version, diagnostics = [] }) {
    this.#diagnostics.set(uri, { version, list: diagnostics });

    const waiting = this.#waiters.get(uri) ?? [];
    const still = [];
    for (const entry of waiting) {
      if (version === undefined || version >= entry.version) entry.resolve(diagnostics);
      else still.push(entry);
    }
    this.#waiters.set(uri, still);
  }
}

/** Ids come from page URLs; keep them to something that can be a filename. */
function safeName(id) {
  const cleaned = String(id).replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 60);
  return cleaned || 'scratch';
}
