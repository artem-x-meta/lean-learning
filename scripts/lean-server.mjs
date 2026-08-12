/**
 * Local checker for course snippets.
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
 * SECURITY: this executes arbitrary Lean code, and Lean can do IO. It binds
 * to 127.0.0.1 on purpose. Do not expose it to a network you do not control.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdictOf } from './lean-verdict.mjs';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const leanRoot = join(projectRoot, 'lean');

const PORT = Number(process.env.LEAN_PORT ?? 4322);
const HOST = '127.0.0.1';
/** A proof that takes longer than this is a mistake, not a proof. */
const TIMEOUT_MS = Number(process.env.LEAN_TIMEOUT ?? 60_000);
const MAX_BODY = 64 * 1024;

/** Runs `lake env lean` over a throwaway file and returns Lean's own output. */
async function checkCode(code) {
  const dir = await mkdtemp(join(tmpdir(), 'lean-course-'));
  const file = join(dir, 'Snippet.lean');
  await writeFile(file, code, 'utf8');

  try {
    return await new Promise((resolve) => {
      const child = spawn('lake', ['env', 'lean', file], {
        cwd: leanRoot,
        shell: process.platform === 'win32',
      });

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
        resolve({ ok: false, output: `Could not run lake: ${error.message}` });
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
    return send(response, 200, { lean: true });
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
      const { code } = JSON.parse(body || '{}');
      if (typeof code !== 'string' || code.trim() === '') {
        return send(response, 400, { error: 'Nothing to check.' });
      }
      send(response, 200, await checkCode(code));
    } catch (error) {
      send(response, 500, { error: String(error) });
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Lean checker on http://${HOST}:${PORT} — snippets on the local site can now be compiled.`);
  console.log('Bound to localhost only: it runs arbitrary Lean code.');
});
