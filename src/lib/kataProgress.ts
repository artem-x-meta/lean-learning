/**
 * Which katas are solved, kept in the browser.
 *
 * No account, no server: the trainer has to work when the site is a folder of
 * static files. Both the catalogue and the individual pages read this, so the
 * key lives here rather than being spelled out twice.
 */

import { readBooleanRecord, writeBooleanRecord } from './storage';

/** Shares the prefix with lesson progress, which shipped first. */
export const KATA_STORAGE_KEY = 'dive-math:katas';

export function readSolved(): Record<string, boolean> {
  if (typeof localStorage === 'undefined') return {};
  return readBooleanRecord(localStorage, KATA_STORAGE_KEY);
}

export function writeSolved(slug: string, solved: boolean): void {
  if (typeof localStorage === 'undefined') return;
  writeBooleanRecord(localStorage, KATA_STORAGE_KEY, slug, solved);
}
