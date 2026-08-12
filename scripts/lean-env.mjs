/**
 * Lake's environment, resolved once instead of once per check.
 *
 * `lake env lean file.lean` is the obvious way to compile something against the
 * project's Mathlib, and it was the first thing this checker did. Measured, it
 * turned out that `lake env` alone costs about 3.4 seconds — reading the
 * lakefile and the manifest — against 1.2 seconds of actual Lean on a core-only
 * file. So the environment is captured at startup and `lean` is then run
 * directly with it.
 */

import { spawn } from 'node:child_process';

/** `where` on Windows prints one line per hit; the first is the one PATH picks. */
async function resolveExecutable(name, env = process.env) {
  const finder = process.platform === 'win32' ? 'where' : 'which';
  return new Promise((resolve, reject) => {
    const child = spawn(finder, [name], { shell: true, env });
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      const first = out.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0];
      if (code === 0 && first) resolve(first);
      else reject(new Error(`${name} is not on PATH. Install it with elan, or open a new terminal.`));
    });
  });
}

/**
 * Runs `lake env` once over node itself, which simply prints the environment
 * it was handed. Cheaper than parsing lakefiles, and it stays correct when
 * Lake changes what it sets.
 */
async function captureEnv(leanRoot, lakeExe) {
  return new Promise((resolve, reject) => {
    const child = spawn(lakeExe, ['env', process.execPath, '-p', 'JSON.stringify(process.env)'], {
      cwd: leanRoot,
    });

    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`lake env failed: ${err.trim() || code}`));
      try {
        resolve(JSON.parse(out));
      } catch (error) {
        reject(new Error(`Could not read the environment from lake: ${error.message}`));
      }
    });
  });
}

/** Everything the checker needs to run Lean without going through Lake again. */
export async function resolveLeanToolchain(leanRoot) {
  const lakeExe = await resolveExecutable('lake');
  const env = await captureEnv(leanRoot, lakeExe);
  // Resolved against Lake's own PATH, not ours, so it is the `lean` that
  // belongs to this project's toolchain rather than whatever is installed.
  const leanExe = await resolveExecutable('lean', env);
  return { lakeExe, leanExe, env };
}
