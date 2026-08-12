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
    diffIntro: 'Warm-up',
    diffCore: 'Core',
    diffTough: 'Tough',
    kataFrom: 'Chapter',
    kataTactics: 'Tactics',
    kataHint: 'Hint',
    kataSolutionShow: 'Reference solution',
    kataSolutionWarn: 'One way of doing it, not the only one. Yours may well be shorter.',
    kataSolved: 'Solved',
    kataMark: 'Mark as solved',
    kataUnmark: 'Remove the mark',
    kataOffline: 'No local checker, so this page cannot tell you whether the proof is right.',
    kataOfflineHow: 'Run the course on your own machine — `npm run dev` alongside `npm run lean` — and a verdict appears here. Otherwise, solve it in the playground and mark it yourself.',
    kataProgress: '{done} of {total} solved',
    kataBack: 'All katas',
    kataTampered: 'The statement is no longer the one in the task. Reset it, or a verdict would mean nothing.',
    kataAuto: 'Marked automatically — it compiled.',
    kataEmptyDone: 'Nothing solved yet.',
    kataTotal: '{total} katas, nothing solved yet',
    kataEditor: 'Your proof',
    chapterKatasTitle: 'Practice for this chapter',
    chapterKatasHint: 'You have read the proofs. Now write them.',
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
    diffIntro: 'Разминка',
    diffCore: 'Основные',
    diffTough: 'Посложнее',
    kataFrom: 'Глава',
    kataTactics: 'Тактики',
    kataHint: 'Подсказка',
    kataSolutionShow: 'Эталонное решение',
    kataSolutionWarn: 'Один из способов, не единственный. Твой вполне может быть короче.',
    kataSolved: 'Решено',
    kataMark: 'Отметить решённой',
    kataUnmark: 'Снять отметку',
    kataOffline: 'Локального проверяльщика нет, поэтому страница не может сказать, верно ли доказательство.',
    kataOfflineHow: 'Запусти курс у себя — `npm run dev` вместе с `npm run lean`, — и вердикт появится здесь. Иначе решай в песочнице и отмечай сам.',
    kataProgress: 'решено {done} из {total}',
    kataBack: 'Все задачи',
    kataTampered: 'Формулировка больше не та, о которой задача. Верни исходную — иначе вердикт ничего не значит.',
    kataAuto: 'Отмечено автоматически — скомпилировалось.',
    kataEmptyDone: 'Пока ничего не решено.',
    kataTotal: 'задач: {total}, пока не решено ничего',
    kataEditor: 'Твоё доказательство',
    chapterKatasTitle: 'Задачи по этой главе',
    chapterKatasHint: 'Доказательства прочитаны. Теперь напиши их сам.',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export function t(lang: Lang, key: keyof (typeof ui)['en']): string {
  return ui[lang][key];
}

/** Same, with `{name}` placeholders filled in — word order differs between the two languages. */
export function tv(
  lang: Lang,
  key: keyof (typeof ui)['en'],
  vars: Record<string, string | number>,
): string {
  return t(lang, key).replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''));
}
