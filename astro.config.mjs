import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkBaseLinks } from './scripts/remark-base-links.mjs';

const site = process.env.SITE_URL;

// GitHub Pages serves the project from a sub-path. The variable is unset
// locally, so `npm run dev` and root-domain deploys work unchanged.
const base = process.env.BASE_PATH?.replace(/\/$/, '') || undefined;

/** Chapter slugs, shared by both locales. */
const chapters = [
  ['proof-as-object', '1.1 A proof is an object', '1.1 Доказательство как объект'],
  ['connectives', '1.2 Connectives and case analysis', '1.2 Связки и разбор случаев'],
  ['quantifiers', '1.3 Quantifiers', '1.3 Кванторы'],
  ['rewriting', '1.4 Rewriting equalities', '1.4 Переписывание равенств'],
  ['numbers', '1.5 Numbers and solvers', '1.5 Числа и решатели'],
  ['induction', '1.6 Induction', '1.6 Индукция'],
  ['inequalities', '1.7 Inequalities', '1.7 Неравенства'],
  ['iff-vs-implies', '1.8 Equivalence and consequence', '1.8 Равносильность и следствие'],
  ['sqrt-two', '1.9 Irrationality of √2', '1.9 Иррациональность √2'],
];

export default defineConfig({
  ...(site ? { site } : {}),
  ...(base ? { base } : {}),
  integrations: [
    react(),
    starlight({
      title: {
        en: 'Lean, step by step',
        ru: 'Lean по шагам',
      },
      description: 'A Lean 4 course built on math you already know.',
      favicon: '/favicon.svg',
      // English at the root so a bare link opens the version most readers need.
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ru: { label: 'Русский', lang: 'ru' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/artem-x-meta/lean-learning' },
      ],
      sidebar: [
        {
          label: 'Start here',
          translations: { ru: 'Начало' },
          items: [{ label: 'About the course', translations: { ru: 'О курсе' }, slug: '' }],
        },
        {
          label: 'Chapters',
          translations: { ru: 'Главы' },
          items: chapters.map(([slug, en, ru]) => ({
            label: en,
            translations: { ru },
            slug,
          })),
        },
      ],
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, [remarkBaseLinks, { base }]],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
});
