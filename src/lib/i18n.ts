/**
 * Interface strings for the two locales.
 *
 * The course is bilingual, so components must not carry text of their own.
 * Astro components resolve the language from the URL; React islands cannot
 * see Astro context, so they take a `lang` prop instead.
 */

export type Lang = 'en' | 'ru';

/** Language of a page, taken from its path. Everything under /ru/ is Russian. */
export function langFromPath(pathname: string): Lang {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const path = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return path === '/ru' || path.startsWith('/ru/') ? 'ru' : 'en';
}

export const ui = {
  en: {
    goalsTitle: 'After this chapter you will be able to',
    lessonMeta: 'Chapter information',
    prerequisites: 'You should know',
    workedExample: 'Worked through together',
    playground: 'Open in playground',
    quickCheckEyebrow: 'Check your understanding',
    quickCheckSolved: 'already solved',
    correct: 'Correct.',
    incorrect: 'Not yet.',
    completeDone: 'Chapter marked as done',
    completeAsk: 'Finished the chapter?',
    completeDoneHint: 'Nice. The mark is stored in this browser only.',
    completeAskHint: 'Mark your progress — no account needed.',
    completeButtonDone: '✓ Done',
    completeButton: 'Mark as done',
    runnerTitle: 'Local Lean — edit and compile right here',
    runnerCheck: 'Compile',
    runnerChecking: 'Compiling…',
    runnerReset: 'Reset',
    runnerOk: 'Compiles.',
    runnerFail: 'Does not compile.',
    runnerSorry: 'Still contains sorry.',
  },
  ru: {
    goalsTitle: 'После главы ты сможешь',
    lessonMeta: 'Информация о главе',
    prerequisites: 'Нужно знать',
    workedExample: 'Разбираем вместе',
    playground: 'Открыть в песочнице',
    quickCheckEyebrow: 'Проверка понимания',
    quickCheckSolved: 'уже решено',
    correct: 'Верно.',
    incorrect: 'Пока нет.',
    completeDone: 'Глава отмечена как пройденная',
    completeAsk: 'Закончил главу?',
    completeDoneHint: 'Отлично. Отметка хранится только в этом браузере.',
    completeAskHint: 'Отметь прогресс — регистрация не нужна.',
    completeButtonDone: '✓ Пройдено',
    completeButton: 'Отметить пройденной',
    runnerTitle: 'Локальный Lean — правь и компилируй прямо здесь',
    runnerCheck: 'Скомпилировать',
    runnerChecking: 'Компилирую…',
    runnerReset: 'Вернуть исходное',
    runnerOk: 'Компилируется.',
    runnerFail: 'Не компилируется.',
    runnerSorry: 'Внутри остался sorry.',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export function t(lang: Lang, key: keyof (typeof ui)['en']): string {
  return ui[lang][key];
}
