/**
 * Reading marked-off pieces of real Lean files at build time.
 *
 * Code shown on the site is never retyped into markup — it is pulled from
 * `lean/`, which `lake build` verifies. A region is marked in the .lean file:
 *
 *   -- BEGIN: first-proof
 *   theorem my_first : 2 + 2 = 4 := rfl
 *   -- END: first-proof
 *
 * The markers themselves never reach the page.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Reads a file from the `lean/` directory. */
export function readLeanFile(file: string): string {
  return readFileSync(join(process.cwd(), 'lean', file), 'utf8');
}

/**
 * Body of a named region. Throws rather than returning empty text: a missing
 * region means the page and the Lean file have drifted apart, and a silent
 * blank would hide that until a reader noticed.
 */
export function extractRegion(text: string, name: string, file = ''): string {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `-- BEGIN: ${name}`);
  const end = lines.findIndex((line) => line.trim() === `-- END: ${name}`);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Lean region "${name}" not found${file ? ` in lean/${file}` : ''}`);
  }
  return lines.slice(start + 1, end).join('\n').replace(/\s+$/, '');
}

/** The `import` lines of a file — a region on its own does not carry them. */
export function extractImports(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((line) => line.startsWith('import '))
    .join('\n');
}

/** Link to the official playground with the code prefilled. */
export function playgroundUrl(code: string): string {
  return `https://live.lean-lang.org/#code=${encodeURIComponent(code)}`;
}
