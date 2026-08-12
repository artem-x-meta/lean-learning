import { describe, expect, it } from 'vitest';
import { verdictOf } from '../scripts/lean-verdict.mjs';

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
