/**
 * Turning Lean's output into a verdict.
 *
 * Separate from the server because this is the one piece with a wrong answer
 * worth guarding: an early version looked for 'sorry' in straight quotes, while
 * Lean writes it in backticks, so a proof with a hole in it was reported as
 * solved. tests/verdict.test.ts keeps that from coming back.
 *
 * Two shapes come in. The language server reports structured diagnostics; a
 * one-shot `lean file.lean` prints text. Both end up as the same verdict.
 */

/** Lean builds this message as `declaration uses \`{s}\``, quoting included. */
const SORRY = /declaration uses [`'"]sorry/;

const SEVERITY = { 1: 'error', 2: 'warning', 3: 'info', 4: 'hint' };

/**
 * @param {string} output combined stdout and stderr
 * @param {number|null} exitCode
 */
export function verdictOf(output, exitCode) {
  const hasSorry = SORRY.test(output);
  return { ok: exitCode === 0 && !hasSorry, hasSorry, output };
}

/**
 * @param {Array<{severity?: number, message: string, range: {start: {line: number, character: number}}}>} diagnostics
 *
 * Warnings other than `sorry` are shown but do not fail the check — an unused
 * variable is not a broken proof. A hole is, which is the whole point.
 */
export function verdictFromDiagnostics(diagnostics, file = 'Snippet.lean') {
  const hasError = diagnostics.some((entry) => entry.severity === 1);
  const hasSorry = diagnostics.some((entry) => SORRY.test(entry.message ?? ''));

  // Errors first. Lean interleaves suggestions ("Try this: …") with them, and a
  // failed check whose first line is a hint reads as though nothing went wrong.
  const ordered = [...diagnostics].sort(
    (a, b) => (a.severity ?? 3) - (b.severity ?? 3),
  );

  const output = ordered
    .map((entry) => {
      const line = (entry.range?.start?.line ?? 0) + 1;
      const column = entry.range?.start?.character ?? 0;
      const label = SEVERITY[entry.severity] ?? 'info';
      return `${file}:${line}:${column}: ${label}: ${entry.message}`;
    })
    .join('\n')
    .trim();

  return { ok: !hasError && !hasSorry, hasSorry, output };
}
