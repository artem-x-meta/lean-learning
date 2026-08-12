/**
 * Turning Lean's output into a verdict.
 *
 * Separate from the server because this is the one piece with a wrong answer
 * worth guarding: an early version looked for 'sorry' in straight quotes, while
 * Lean writes it in backticks, so a proof with a hole in it was reported as
 * solved. tests/verdict.test.ts keeps that from coming back.
 */

/** Lean names the offending declaration, then the word in backticks. */
const SORRY = /declaration uses [`'"]sorry[`'"]/;

/**
 * @param {string} output combined stdout and stderr
 * @param {number|null} exitCode
 */
export function verdictOf(output, exitCode) {
  const hasSorry = SORRY.test(output);
  return { ok: exitCode === 0 && !hasSorry, hasSorry, output };
}
