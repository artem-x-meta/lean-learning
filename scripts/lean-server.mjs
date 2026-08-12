/**
 * Local checker for course snippets and katas.
 *
 * The published site is static: it can only link out to the playground.
 * When you run the course on your own machine, this server lets the page
 * compile your code with your own Lean and Mathlib instead.
 *
 *   npm run lean
 *
 * The page pings it on load; if it does not answer, the page silently falls
 * back to the playground link. So the same pages work in both modes.
 *
 * Checking goes through a Lean language server that stays running, so the
 * imports of a kata are loaded once rather than on every attempt. If that
 * server cannot be started, checks fall back to running `lean` per request —
 * slower, but still correct, and still without Lake's startup cost.
 *
 * SECURITY: this executes arbitrary Lean code, and Lean can do IO. It binds
 * to 127.0.0.1 on purpose. Do not expose it to a network you do not control.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdictOf, verdictFromDiagnostics } from './lean-verdict.mjs';
import { resolveLeanToolchain } from './lean-env.mjs';
import { LeanSession } from './lean-session.mjs';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const leanRoot = join(projectRoot, 'lean');

const PORT = Number(process.env.LEAN_PORT ?? 4322);
const HOST = '127.0.0.1';
/** A proof that takes longer than this is a mistake, not a proof. */
const TIMEOUT_MS = Number(process.env.LEAN_TIMEOUT ?? 120_000);
const MAX_BODY = 64 * 1024;

let toolchain = null;
let session = null;

/** One `lean` per request. The fallback, and what the very first design did. */
async function checkByProcess(code) {
  const dir = await mkdtemp(join(tmpdir(), 'lean-course-'));
  const file = join(dir, 'Snippet.lean');
  await writeFile(file, code, 'utf8');

  try {
    return await new Promise((resolve) => {
      const child = spawn(toolchain.leanExe, [file], { cwd: leanRoot, env: toolchain.env });

      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => {
        child.kill();
        resolve({ ok: false, timedOut: true, output: `Timed out after ${TIMEOUT_MS / 1000}s.` });
      }, TIMEOUT_MS);

      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });

      child.on('error', (error) => {
        clearTimeout(timer);
        resolve({ ok: false, output: `Could not run lean: ${error.message}` });
      });

      child.on('close', (exitCode) => {
        clearTimeout(timer);
        // Lean reports diagnostics with the temp path; strip it for readability.
        const output = `${stdout}${stderr}`.split(file).join('Snippet.lean').trim();
        resolve(verdictOf(output, exitCode));
      });
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function checkCode(code, id) {
  if (session?.running) {
    try {
      return verdictFromDiagnostics(await session.check(code, id));
    } catch (error) {
      if (session.running) {
        // One document's worker died, not the session: drop that document and
        // answer this one check the slow way. Every other kata keeps its
        // loaded imports.
        console.warn(`Lean stopped on "${id ?? 'scratch'}" (${error.message}); running it separately.`);
        session.forget(id);
      } else {
        console.warn(`Lean server is gone (${error.message}); running one process per check.`);
        session = null;
      }
    }
  }
  return checkByProcess(code);
}

function send(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    // The dev site runs on another port, so the page needs permission to ask.
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
  });
  response.end(body);
}

const server = createServer((request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {});

  // Used by the page to decide which mode it is in.
  if (request.method === 'GET' && request.url === '/ping') {
    return send(response, 200, { lean: true, live: Boolean(session?.running) });
  }

  if (request.method !== 'POST' || request.url !== '/check') {
    return send(response, 404, { error: 'Use POST /check or GET /ping.' });
  }

  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > MAX_BODY) {
      request.destroy();
      send(response, 413, { error: 'Snippet too large.' });
    }
  });

  request.on('end', async () => {
    try {
      const { code, id } = JSON.parse(body || '{}');
      if (typeof code !== 'string' || code.trim() === '') {
        return send(response, 400, { error: 'Nothing to check.' });
      }
      send(response, 200, await checkCode(code, typeof id === 'string' ? id : undefined));
    } catch (error) {
      send(response, 500, { error: String(error) });
    }
  });
});

try {
  toolchain = await resolveLeanToolchain(leanRoot);
} catch (error) {
  console.error(`${error.message}`);
  process.exit(1);
}

try {
  session = new LeanSession({ leanExe: toolchain.leanExe, env: toolchain.env, cwd: leanRoot });
  await session.start();
} catch (error) {
  console.warn(`Could not start the Lean server (${error.message}). Falling back to one run per check.`);
  session = null;
}

// A cold Mathlib load takes far longer than Node's five-second keep-alive, so
// the next check would reuse a connection the server had already closed. A
// browser does not retry a POST, so that surfaces as a network error on the
// page rather than as a verdict.
server.keepAliveTimeout = 10 * 60_000;
server.headersTimeout = 11 * 60_000;
server.requestTimeout = 0;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already taken — a checker is probably running already.`);
    console.error(`Stop that one, or start this with LEAN_PORT set to something else.`);
  } else {
    console.error(String(error));
  }
  session?.stop();
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Lean checker on http://${HOST}:${PORT} — snippets on the local site can now be compiled.`);
  console.log(session ? 'Lean server is live: imports stay loaded between checks.' : 'Running lean once per check.');
  console.log('Bound to localhost only: it runs arbitrary Lean code.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    session?.stop();
    server.close(() => process.exit(0));
  });
}
