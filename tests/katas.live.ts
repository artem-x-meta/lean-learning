import { describe, expect, it, beforeAll } from 'vitest';
import { katas } from '../src/data/katas';
import { kataSkeleton, kataReference } from '../src/lib/practice';

/**
 * End-to-end check of the trainer, against a real Lean.
 *
 * `lake build` already proves the reference proofs are correct *inside the
 * library*, where the imports, the namespace and the shared definitions are all
 * in place. It says nothing about the code the reader is handed, which is
 * reassembled from fragments — a kata could be provable in the repository and
 * broken on the page.
 *
 * So this compiles what the page actually gives out, twice per kata:
 * untouched it must be rejected for still holding a hole, and with the
 * reference proof in it must be accepted.
 *
 * Not part of `npm test`: it needs Lean, which CI for the site does not have.
 *
 *   npm run lean            # in one terminal
 *   npm run verify:katas    # in another
 */

const ENDPOINT = process.env.LEAN_ENDPOINT ?? 'http://127.0.0.1:4322';
/** A Mathlib import costs seconds, and there are two runs per kata. */
const PER_KATA_MS = 180_000;

interface Verdict {
  ok: boolean;
  hasSorry?: boolean;
  timedOut?: boolean;
  output: string;
}

async function check(code: string, id: string): Promise<Verdict> {
  const response = await fetch(`${ENDPOINT}/check`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // The same id the page sends, so this exercises the path a reader takes:
    // one document per kata, imports loaded once, then edited.
    body: JSON.stringify({ code, id: `kata-${id}` }),
  });
  return response.json() as Promise<Verdict>;
}

beforeAll(async () => {
  try {
    const ping = await fetch(`${ENDPOINT}/ping`);
    if (!ping.ok) throw new Error(String(ping.status));
  } catch {
    throw new Error(
      `No Lean checker at ${ENDPOINT}. Start it with \`npm run lean\` — this suite is ` +
        'meaningless without a real compiler, so it fails rather than skipping.',
    );
  }
});

describe('every kata, as the reader receives it', () => {
  for (const kata of katas) {
    it(
      `${kata.slug}: the skeleton is refused, the reference proof is accepted`,
      async () => {
        const blank = await check(kataSkeleton(kata), kata.slug);
        expect(blank.hasSorry, `${kata.slug} skeleton: ${blank.output}`).toBe(true);
        expect(blank.ok).toBe(false);

        const solved = await check(kataReference(kata), kata.slug);
        expect(solved.ok, `${kata.slug} reference: ${solved.output}`).toBe(true);
        expect(solved.hasSorry).toBe(false);
      },
      PER_KATA_MS,
    );
  }
});
