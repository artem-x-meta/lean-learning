import { describe, expect, it } from 'vitest';
import { verdictOf, verdictFromDiagnostics } from '../scripts/lean-verdict.mjs';

/**
 * The three answers the trainer can give, with Lean's real wording.
 *
 * The middle case is why this file exists: a proof whose hole is still there
 * exits 0, because `sorry` is a warning and not an error. Reading the exit code
 * alone would call it solved.
 */

const SORRY_OUTPUT =
  'Snippet.lean:5:8: warning: declaration uses `sorry`';

const ERROR_OUTPUT =
  "Snippet.lean:5:2: error: The rfl tactic failed. Possible reasons:\n- The goal is not a reflexive relation";

describe('verdictOf', () => {
  it('accepts a clean compile', () => {
    expect(verdictOf('', 0)).toEqual({ ok: true, hasSorry: false, output: '' });
  });

  it('rejects a proof that still contains a hole, exit code notwithstanding', () => {
    const verdict = verdictOf(SORRY_OUTPUT, 0);
    expect(verdict.hasSorry).toBe(true);
    expect(verdict.ok).toBe(false);
  });

  it('rejects a proof that does not compile', () => {
    const verdict = verdictOf(ERROR_OUTPUT, 1);
    expect(verdict.ok).toBe(false);
    expect(verdict.hasSorry).toBe(false);
    expect(verdict.output).toContain('error');
  });

  it('is not fooled by the word appearing in a comment', () => {
    expect(verdictOf('-- sorry about the mess\n', 0).ok).toBe(true);
  });
});

/**
 * The same three answers, from the language server, which reports structured
 * diagnostics instead of text. Severity: 1 error, 2 warning, 3 info, 4 hint.
 */
const at = (line: number) => ({ start: { line, character: 4 } });

describe('verdictFromDiagnostics', () => {
  it('accepts a file the server found nothing wrong with', () => {
    const verdict = verdictFromDiagnostics([]);
    expect(verdict).toEqual({ ok: true, hasSorry: false, output: '' });
  });

  it('rejects an error', () => {
    const verdict = verdictFromDiagnostics([
      { severity: 1, message: 'linarith failed to find a contradiction', range: at(4) },
    ]);
    expect(verdict.ok).toBe(false);
    expect(verdict.output).toContain('Snippet.lean:5:4: error:');
  });

  it('rejects a hole, which the server reports only as a warning', () => {
    const verdict = verdictFromDiagnostics([
      { severity: 2, message: 'declaration uses `sorry`', range: at(1) },
    ]);
    expect(verdict.hasSorry).toBe(true);
    expect(verdict.ok).toBe(false);
  });

  it('lets an ordinary warning through — an unused variable is not a broken proof', () => {
    const verdict = verdictFromDiagnostics([
      { severity: 2, message: "unused variable `h` [linter.unusedVariables]", range: at(2) },
    ]);
    expect(verdict.ok).toBe(true);
    expect(verdict.output).toContain('warning:');
  });

  it('puts errors before suggestions, so the reason comes first', () => {
    const verdict = verdictFromDiagnostics([
      { severity: 3, message: 'Try this: nlinarith', range: at(6) },
      { severity: 1, message: 'ring failed', range: at(6) },
    ]);
    expect(verdict.output.split('\n')[0]).toContain('error: ring failed');
  });
});
