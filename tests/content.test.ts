import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const contentRoot = join(root, 'src', 'content', 'docs');
const leanRoot = join(root, 'lean');

const chapters = [
  'proof-as-object',
  'connectives',
  'quantifiers',
  'rewriting',
  'numbers',
  'induction',
  'inequalities',
  'iff-vs-implies',
  'sqrt-two',
];

function collect(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collect(path) : extname(entry.name) === '.mdx' ? [path] : [];
  });
}

function routeFor(file: string): string {
  const normalized = relative(contentRoot, file).split(sep).join('/').replace(/\.mdx$/, '');
  return normalized === 'index' ? '/' : `/${normalized.replace(/\/index$/, '')}/`;
}

describe('course content', () => {
  const files = collect(contentRoot);
  const routes = new Set(files.map(routeFor));

  it('has both locales for every chapter', () => {
    const missing: string[] = [];
    for (const chapter of chapters) {
      if (!routes.has(`/${chapter}/`)) missing.push(`en: ${chapter}`);
      if (!routes.has(`/ru/${chapter}/`)) missing.push(`ru: ${chapter}`);
    }
    expect(missing).toEqual([]);
  });

  it('has a landing page in both locales', () => {
    expect(routes.has('/')).toBe(true);
    expect(routes.has('/ru/')).toBe(true);
  });

  it('does not link to routes that do not exist', () => {
    const broken: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/\]\((\/[^)#?\s]*)\)/g)) {
        const link = match[1].endsWith('/') ? match[1] : `${match[1]}/`;
        if (!routes.has(link)) broken.push(`${relative(root, file)} → ${match[1]}`);
      }
    }
    expect(broken).toEqual([]);
  });

  /**
   * The promise of the course is that no snippet on the site is unverified.
   * That only holds if every referenced region really exists in a Lean file
   * that `lake build` reaches.
   */
  it('references only regions that exist in the Lean sources', () => {
    const missing: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/<LeanSnippet[^>]*file="([^"]+)"[^>]*region="([^"]+)"/g)) {
        const [, leanFile, region] = match;
        const path = join(leanRoot, leanFile);
        if (!existsSync(path)) {
          missing.push(`${relative(root, file)} → lean/${leanFile} (нет файла)`);
          continue;
        }
        const lean = readFileSync(path, 'utf8');
        if (!lean.includes(`-- BEGIN: ${region}`) || !lean.includes(`-- END: ${region}`)) {
          missing.push(`${relative(root, file)} → ${leanFile}#${region}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('keeps every chapter file imported by the library root', () => {
    // `lake build` builds the root module, so anything missing from it is
    // never compiled — and a snippet from an uncompiled file is unverified.
    const rootModule = readFileSync(join(leanRoot, 'DiveLean.lean'), 'utf8');

    const modules = readdirSync(join(leanRoot, 'DiveLean'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) =>
        readdirSync(join(leanRoot, 'DiveLean', entry.name))
          .filter((name) => name.endsWith('.lean'))
          .map((name) => `DiveLean.${entry.name}.${name.replace(/\.lean$/, '')}`),
      );

    expect(modules.length).toBeGreaterThan(0);
    expect(modules.filter((module) => !rootModule.includes(`import ${module}`))).toEqual([]);
  });
});
