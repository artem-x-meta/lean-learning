/**
 * Turning a kata into code that stands on its own.
 *
 * Inside the library a kata is a fragment: it relies on the file's imports, on
 * `namespace Practice`, and sometimes on a definition further up. Handed to the
 * reader it must compile by itself, whether in the playground or in the local
 * checker — so the fragment is reassembled here with everything it depends on.
 */

import { readLeanFile, extractRegion } from './leanRegions';
import type { Kata } from '../data/katas';

const STATEMENTS = 'DiveLean/Practice/Statements.lean';
const SOLUTIONS = 'DiveLean/Practice/Solutions.lean';

/**
 * The namespace is kept even standalone. Without it a kata named `identity` or
 * `contrapositive` could collide with something Mathlib already defines, and
 * the reader would get an error that has nothing to do with their proof.
 *
 * Imports are the kata's own, not the file's: most of these statements are
 * core Lean and compile in about a second, and there is no reason to make a
 * reader wait on Mathlib to prove that `A` implies `A`.
 */
function assemble(kata: Kata, body: string): string {
  const source = readLeanFile(STATEMENTS);
  const parts = (kata.needs ?? []).map((name) => extractRegion(source, name, STATEMENTS));
  const head = (kata.imports ?? []).map((module) => `import ${module}`).join('\n');

  return [
    ...(head ? [head, ''] : []),
    'namespace Practice',
    '',
    ...parts.flatMap((part) => [part, '']),
    body,
    '',
    'end Practice',
  ].join('\n');
}

/** The skeleton the reader starts from: the statement with a `sorry` in it. */
export function kataSkeleton(kata: Kata): string {
  const body = extractRegion(readLeanFile(STATEMENTS), kata.region, STATEMENTS);
  return assemble(kata, body);
}

/** The reference proof, kept behind a disclosure on the page. */
export function kataSolution(kata: Kata): string {
  return extractRegion(readLeanFile(SOLUTIONS), kata.region, SOLUTIONS);
}

/**
 * The skeleton with the hole filled by the reference proof.
 *
 * Not shown anywhere — this is what `npm run verify:katas` compiles, to check
 * that a kata is solvable *as handed out*. The library builds the two files in
 * their own namespaces with their own imports; only here are they put together
 * the way a reader actually receives them.
 */
export function kataReference(kata: Kata): string {
  return assemble(kata, kataSolution(kata));
}

/**
 * The part of the skeleton that must survive editing: everything up to `:=`.
 *
 * Nothing stops a reader from deleting the statement and proving `True` instead,
 * and the checker would honestly report that it compiles. Comparing against this
 * turns that into a visible answer rather than a silent pass — it also catches
 * the ordinary case of mangling the statement by accident.
 *
 * The cut is at `:=` and not at `:= by`, so that a term-mode proof — replacing
 * the whole `by sorry` with `fun h => h` — counts as a proof and not as
 * tampering. It is the statement that is fixed, not the style of the answer.
 */
export function kataStatement(kata: Kata): string {
  const body = extractRegion(readLeanFile(STATEMENTS), kata.region, STATEMENTS);
  const at = body.indexOf(':=');
  return normalizeCode(at === -1 ? body : body.slice(0, at + 2));
}

/** Whitespace-insensitive form, so reformatting a proof is not treated as tampering. */
export function normalizeCode(code: string): string {
  return code.replace(/\s+/g, ' ').trim();
}

/**
 * Kata prose to HTML: backticks become `<code>`, and nothing else is markup.
 *
 * Escaping comes first. None of the present briefs contain an angle bracket,
 * but a kata about `<` or `≠` is an obvious one to add, and "no one will ever
 * write that character" is not a property worth depending on.
 */
export function inlineCode(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
}
