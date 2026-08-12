import { defineConfig } from 'vitest/config';

/**
 * The suite that needs a real Lean.
 *
 * Kept out of `npm test` — and out of the default `include` — because CI for
 * the site has no toolchain, and a suite that silently skips itself is worse
 * than one you have to ask for:
 *
 *   npm run lean            # in one terminal
 *   npm run verify:katas    # in another
 */
export default defineConfig({
  test: {
    include: ['tests/katas.live.ts'],
    // Every case compiles twice, and a Mathlib import is not instant.
    testTimeout: 180_000,
    hookTimeout: 30_000,
  },
});
