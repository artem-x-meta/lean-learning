import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { katas, kataItems, difficulties, chapterOrder } from '../src/data/katas';
import { kataSkeleton, kataSolution, kataStatement, normalizeCode, inlineCode } from '../src/lib/practice';

/**
 * What these tests are for.
 *
 * Whether a kata is *provable* is settled by `lake build`, which compiles the
 * reference solutions — no test here can do better than that. What is checked
 * instead is the wiring: that every kata points at regions that exist, that the
 * skeleton really has a hole and the solution really does not, and that the
 * code handed to the reader can stand on its own.
 */

const root = process.cwd();
const statements = readFileSync(join(root, 'lean', 'DiveLean', 'Practice', 'Statements.lean'), 'utf8');
const solutions = readFileSync(join(root, 'lean', 'DiveLean', 'Practice', 'Solutions.lean'), 'utf8');

describe('practice catalogue', () => {
  it('has unique slugs and regions', () => {
    expect(new Set(katas.map((k) => k.slug)).size).toBe(katas.length);
    expect(new Set(katas.map((k) => k.region)).size).toBe(katas.length);
  });

  it('names a region that exists in both Lean files', () => {
    const missing: string[] = [];
    for (const kata of katas) {
      for (const [label, source] of [['Statements', statements], ['Solutions', solutions]] as const) {
        if (!source.includes(`-- BEGIN: ${kata.region}`) || !source.includes(`-- END: ${kata.region}`)) {
          missing.push(`${kata.slug} → ${label}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('gives every kata a chapter that exists', () => {
    const missing = katas.filter(
      (kata) => !existsSync(join(root, 'src', 'content', 'docs', `${kata.chapter}.mdx`)),
    );
    expect(missing.map((k) => `${k.slug} → ${k.chapter}`)).toEqual([]);
  });

  it('is written in both languages throughout', () => {
    const empty: string[] = [];
    for (const kata of katas) {
      for (const lang of ['en', 'ru'] as const) {
        for (const field of ['title', 'brief', 'hint'] as const) {
          if (!kata[field][lang]?.trim()) empty.push(`${kata.slug}.${field}.${lang}`);
        }
      }
    }
    expect(empty).toEqual([]);
  });

  it('lists chapters in the order the course teaches them, and covers every one', () => {
    // A chapter missing from the order would sort to the front of every list.
    expect(katas.filter((kata) => !chapterOrder.includes(kata.chapter)).map((k) => k.slug)).toEqual([]);

    const covered = new Set(katas.map((kata) => kata.chapter));
    expect(chapterOrder.filter((chapter) => !covered.has(chapter))).toEqual([]);

    const positions = katas.map((kata) => chapterOrder.indexOf(kata.chapter));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('uses only declared difficulties, and uses all of them', () => {
    const used = new Set(katas.map((k) => k.difficulty));
    expect([...used].filter((level) => !difficulties.includes(level))).toEqual([]);
    expect(difficulties.filter((level) => !used.has(level))).toEqual([]);
  });
});

describe('the code handed to the reader', () => {
  it('starts from a hole and never ships one in the solution', () => {
    const wrong: string[] = [];
    for (const kata of katas) {
      if (!kataSkeleton(kata).includes('sorry')) wrong.push(`${kata.slug}: skeleton has no sorry`);
      if (kataSolution(kata).includes('sorry')) wrong.push(`${kata.slug}: solution contains sorry`);
    }
    expect(wrong).toEqual([]);
  });

  it('stands on its own: imports, namespace, and any definition it uses', () => {
    for (const kata of katas) {
      const code = kataSkeleton(kata);
      // Most katas are core Lean and carry no imports at all — deliberately.
      for (const module of kata.imports ?? []) {
        expect(code, kata.slug).toContain(`import ${module}`);
      }
      expect(code, kata.slug).toContain('namespace Practice');
      expect(code, kata.slug).toContain('end Practice');
      // A kata about sums is unusable without the definition of the sum.
      for (const need of kata.needs ?? []) {
        const region = statements.split(`-- BEGIN: ${need}`)[1]?.split(`-- END: ${need}`)[0] ?? '';
        expect(region.trim().length, `${kata.slug} needs ${need}`).toBeGreaterThan(0);
        expect(code, `${kata.slug} needs ${need}`).toContain(region.trim().split('\n')[1]);
      }
    }
  });

  /** The tamper check compares against this, so it has to match to begin with. */
  it('can find its own statement inside the untouched skeleton', () => {
    for (const kata of katas) {
      expect(normalizeCode(kataSkeleton(kata)), kata.slug).toContain(kataStatement(kata));
    }
  });

  it('takes the statement only up to the proof', () => {
    for (const kata of katas) {
      expect(kataStatement(kata), kata.slug).not.toContain('sorry');
      expect(kataStatement(kata), kata.slug).toMatch(/theorem /);
      // Cut at `:=`, not `:= by` — a term-mode answer must not read as tampering.
      expect(kataStatement(kata), kata.slug).toMatch(/:=$/);
    }
  });

  it('accepts a term-mode answer as readily as a tactic one', () => {
    for (const kata of katas) {
      const statement = kataStatement(kata);
      const tactic = kataSkeleton(kata).replace('sorry', 'by_the_reader');
      const term = kataSkeleton(kata).replace(/:=\s*by\s*sorry/, ':= fun h => h');
      expect(normalizeCode(tactic), `${kata.slug} tactic`).toContain(statement);
      expect(normalizeCode(term), `${kata.slug} term`).toContain(statement);
    }
  });
});

describe('reaching the katas from the course', () => {
  /** The catalogue is one line in the sidebar; the chapters are where readers are. */
  it('points at its katas from the end of every chapter that has them', () => {
    const missing: string[] = [];
    for (const dir of ['src/content/docs', join('src', 'content', 'docs', 'ru')]) {
      for (const chapter of new Set(katas.map((kata) => kata.chapter))) {
        const source = readFileSync(join(root, dir, `${chapter}.mdx`), 'utf8');
        if (!source.includes(`<ChapterKatas chapter="${chapter}" />`)) {
          missing.push(`${dir}/${chapter}.mdx`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('kata prose', () => {
  it('turns backticks into code and leaves nothing else as markup', () => {
    expect(inlineCode('use `rfl` here')).toBe('use <code>rfl</code> here');
    expect(inlineCode('a < b & c')).toBe('a &lt; b &amp; c');
    // The escaping has to happen first, or a kata about `<` would inject markup.
    expect(inlineCode('`a < b`')).toBe('<code>a &lt; b</code>');
    expect(inlineCode('<img src=x onerror=alert(1)>')).not.toContain('<img');
  });

  it('closes every code span it opens, in both languages', () => {
    for (const kata of katas) {
      for (const lang of ['en', 'ru'] as const) {
        for (const field of ['brief', 'hint'] as const) {
          const ticks = (kata[field][lang].match(/`/g) ?? []).length;
          expect(ticks % 2, `${kata.slug}.${field}.${lang}`).toBe(0);
        }
      }
    }
  });
});

describe('catalogue links', () => {
  it('points at a page for every kata, in both locales', () => {
    for (const lang of ['en', 'ru'] as const) {
      const items = kataItems(lang);
      expect(items).toHaveLength(katas.length);
      for (const item of items) {
        const expected = lang === 'ru' ? `/ru/practice/${item.slug}/` : `/practice/${item.slug}/`;
        expect(item.href.endsWith(expected), `${lang} ${item.slug}: ${item.href}`).toBe(true);
        expect(item.title.trim().length).toBeGreaterThan(0);
        expect(item.brief).not.toContain('`');
      }
    }
  });
});
