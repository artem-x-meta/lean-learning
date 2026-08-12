/**
 * The practice catalogue.
 *
 * Each kata names a region in `lean/DiveLean/Practice/Statements.lean` (the
 * skeleton, proof replaced by `sorry`) and the region of the same name in
 * `Solutions.lean` (the reference proof). Both files are built by `lake build`,
 * so a kata cannot be shipped unsolvable: the reference proof would fail CI.
 *
 * Prose lives here rather than in the .lean files because it is bilingual and
 * Lean comments are not.
 */

import type { Lang } from '../lib/i18n';
import { withBase } from '../lib/basePath';

export type Difficulty = 'intro' | 'core' | 'tough';

/** A kata as the catalogue needs it: one language, links already resolved. */
export interface KataItem {
  slug: string;
  href: string;
  title: string;
  brief: string;
  difficulty: Difficulty;
  tactics: readonly string[];
}

export interface Kata {
  /** URL segment under /practice/. */
  slug: string;
  /** Region name, shared by the statement and the solution file. */
  region: string;
  difficulty: Difficulty;
  /** Chapter slug this kata follows from. */
  chapter: string;
  /** Tactics the reference solution uses — shown as tags. */
  tactics: string[];
  /** Extra regions to prepend so the skeleton compiles on its own. */
  needs?: string[];
  /**
   * Modules the kata actually needs, if any.
   *
   * The statements file imports everything the whole set uses, but a reader
   * waiting on `Mathlib.Data.Real.Basic` to prove `A → A` is waiting for
   * nothing: most of these live in core Lean and compile in about a second.
   */
  imports?: string[];
  title: Record<Lang, string>;
  /** What is to be proved, in words. */
  brief: Record<Lang, string>;
  /** A nudge, hidden behind a disclosure. */
  hint: Record<Lang, string>;
}

/** Order is the order of the ladder: nothing needs a chapter you have not read. */
export const katas: readonly Kata[] = Object.freeze<Kata[]>([
  {
    slug: 'identity',
    region: 'identity',
    difficulty: 'intro',
    chapter: 'proof-as-object',
    tactics: ['intro', 'exact'],
    title: { en: 'Identity', ru: 'Тождество' },
    brief: {
      en: 'From `A` it follows that `A`. The shortest true implication there is — and a complete exercise in what `intro` and `exact` do.',
      ru: 'Из `A` следует `A`. Самая короткая истинная импликация — и полное упражнение на то, что делают `intro` и `exact`.',
    },
    hint: {
      en: '`intro h` moves the assumption into context; then the goal is exactly `h`.',
      ru: '`intro h` переносит посылку в контекст; после этого цель — это в точности `h`.',
    },
  },
  {
    slug: 'constant',
    region: 'constant',
    difficulty: 'intro',
    chapter: 'proof-as-object',
    tactics: ['intro', 'exact'],
    title: { en: 'Ignoring an assumption', ru: 'Лишняя посылка' },
    brief: {
      en: 'From `A`, and then `B`, it follows that `A`. Nothing obliges you to use every assumption — the second one is there to be ignored.',
      ru: 'Из `A`, а затем `B`, следует `A`. Использовать все посылки никто не обязывает — вторая здесь ровно для того, чтобы её проигнорировать.',
    },
    hint: {
      en: 'Two arrows, two `intro`s. Name the second one `_` to say out loud that you will not need it.',
      ru: 'Две стрелки — два `intro`. Назови вторую посылку `_`, чтобы прямо сказать: она не понадобится.',
    },
  },
  {
    slug: 'and-swap',
    region: 'and-swap',
    difficulty: 'intro',
    chapter: 'connectives',
    tactics: ['constructor', 'exact'],
    title: { en: 'Conjunction is symmetric', ru: 'Конъюнкция симметрична' },
    brief: {
      en: 'From `A ∧ B` it follows that `B ∧ A`. You need both halves of the assumption and you must hand back both halves of the goal.',
      ru: 'Из `A ∧ B` следует `B ∧ A`. Нужны обе половины посылки, и вернуть надо обе половины цели.',
    },
    hint: {
      en: '`h.1` and `h.2` are the two halves. `⟨_, _⟩` builds a conjunction from them — or use `constructor` and prove the parts separately.',
      ru: '`h.1` и `h.2` — две половины посылки. `⟨_, _⟩` собирает из них конъюнкцию — или возьми `constructor` и докажи части по отдельности.',
    },
  },
  {
    slug: 'or-swap',
    region: 'or-swap',
    difficulty: 'intro',
    chapter: 'connectives',
    tactics: ['cases', 'exact'],
    title: { en: 'Disjunction is symmetric', ru: 'Дизъюнкция симметрична' },
    brief: {
      en: 'From `A ∨ B` it follows that `B ∨ A`. The mirror image of the previous kata, and a completely different proof: a disjunction is taken apart, not projected.',
      ru: 'Из `A ∨ B` следует `B ∨ A`. Зеркало предыдущей задачи — и совсем другое доказательство: дизъюнкцию разбирают по случаям, а не проецируют.',
    },
    hint: {
      en: '`cases h with | inl a => ... | inr b => ...`. In each branch you know which side you got, so you know which side to build.',
      ru: '`cases h with | inl a => ... | inr b => ...`. В каждой ветке известно, какая сторона пришла, — значит, известно и какую собирать.',
    },
  },
  {
    slug: 'forall-swap',
    region: 'forall-swap',
    difficulty: 'intro',
    chapter: 'quantifiers',
    tactics: ['intro', 'exact'],
    title: { en: 'Swapping two ∀', ru: 'Перестановка двух ∀' },
    brief: {
      en: 'If `P a b` holds for all `a` and `b`, it holds for all `b` and `a`. The order of universal quantifiers carries no meaning — prove it.',
      ru: 'Если `P a b` верно для всех `a` и `b`, то оно верно и для всех `b` и `a`. Порядок всеобщих кванторов не несёт смысла — докажи это.',
    },
    hint: {
      en: 'A `∀` in the goal is introduced like an implication. Introduce both, then apply `h` in the order it expects.',
      ru: '`∀` в цели вводится так же, как импликация. Введи оба, а затем применяй `h` в том порядке, которого он ждёт.',
    },
  },
  {
    slug: 'contrapositive',
    region: 'contrapositive',
    difficulty: 'core',
    chapter: 'connectives',
    tactics: ['intro', 'exact'],
    title: { en: 'Contraposition', ru: 'Контрапозиция' },
    brief: {
      en: 'If `A` implies `B`, then not-`B` implies not-`A`. The everyday rule of "then it would have followed that" — stated so Lean accepts it.',
      ru: 'Если `A` влечёт `B`, то не-`B` влечёт не-`A`. Обычное «тогда бы следовало» — записанное так, чтобы Lean его принял.',
    },
    hint: {
      en: '`¬A` *is* `A → False`, so it can be introduced. After two `intro`s the goal is `False`, and you have both a way to get `B` and a way to refute it.',
      ru: '`¬A` — это и есть `A → False`, поэтому его можно ввести. После двух `intro` цель — `False`, а у тебя есть и способ получить `B`, и способ его опровергнуть.',
    },
  },
  {
    slug: 'exists-shift',
    region: 'exists-shift',
    difficulty: 'core',
    chapter: 'quantifiers',
    tactics: ['obtain', 'exact'],
    title: { en: 'Carrying a witness across', ru: 'Перенос свидетеля' },
    brief: {
      en: 'Something satisfies `P`, and everything satisfying `P` satisfies `Q`. Conclude that something satisfies `Q`.',
      ru: 'Что-то удовлетворяет `P`, и всё, что удовлетворяет `P`, удовлетворяет `Q`. Заключи, что что-то удовлетворяет `Q`.',
    },
    hint: {
      en: '`obtain ⟨n, hn⟩ := h` unpacks the witness and its property. The same `n` will do for the goal.',
      ru: '`obtain ⟨n, hn⟩ := h` распаковывает свидетеля вместе с его свойством. Для цели подойдёт тот же самый `n`.',
    },
  },
  {
    slug: 'square-of-sum',
    imports: ['Mathlib.Tactic.Ring'],
    region: 'square-of-sum',
    difficulty: 'core',
    chapter: 'rewriting',
    tactics: ['ring'],
    title: { en: 'Square of a sum', ru: 'Квадрат суммы' },
    brief: {
      en: 'The identity everyone learns at fourteen, over the integers. The point is not the mathematics — it is that a whole class of such goals has one tactic.',
      ru: 'Формула, которую учат в седьмом классе, — над целыми числами. Смысл не в математике: важно, что у целого класса таких целей есть одна тактика.',
    },
    hint: {
      en: 'Do not expand it by hand. One tactic proves every identity that holds in any commutative ring.',
      ru: 'Не раскрывай скобки руками. Одна тактика доказывает любое тождество, верное в любом коммутативном кольце.',
    },
  },
  {
    slug: 'even-plus-even',
    region: 'even-plus-even',
    difficulty: 'core',
    chapter: 'numbers',
    tactics: ['omega'],
    title: { en: 'Even plus even', ru: 'Чётное плюс чётное' },
    brief: {
      en: 'Two numbers leave remainder 0 on division by 2; so does their sum. Obvious to you, and the machine has a decision procedure for exactly this.',
      ru: 'Два числа дают остаток 0 при делении на 2 — значит, и сумма даёт. Для тебя очевидно, а у машины ровно на такие утверждения есть разрешающая процедура.',
    },
    hint: {
      en: 'Linear arithmetic over the integers, remainders included. One word.',
      ru: 'Линейная арифметика над целыми, вместе с остатками. Одно слово.',
    },
  },
  {
    slug: 'divides-trans',
    region: 'divides-trans',
    difficulty: 'core',
    chapter: 'numbers',
    tactics: ['exact', 'Nat.dvd_trans'],
    title: { en: 'Divisibility is transitive', ru: 'Делимость транзитивна' },
    brief: {
      en: '`a` divides `b`, `b` divides `c`; conclude `a` divides `c`. Lean already knows this — the exercise is finding what it is called.',
      ru: '`a` делит `b`, `b` делит `c`; заключи, что `a` делит `c`. Lean это уже знает — упражнение в том, чтобы найти название.',
    },
    hint: {
      en: 'Look in the `Nat` namespace: transitivity lemmas are named after the relation. Or prove it by hand — `a ∣ b` unfolds to `∃ k, b = a * k`, and `obtain` will take it apart.',
      ru: 'Смотри в пространстве имён `Nat`: леммы о транзитивности называются по отношению. Или докажи руками — `a ∣ b` разворачивается в `∃ k, b = a * k`, а `obtain` это разберёт.',
    },
  },
  {
    slug: 'linear-iff',
    imports: ['Mathlib.Analysis.SpecialFunctions.Pow.Real', 'Mathlib.Tactic.Linarith'],
    region: 'linear-iff',
    difficulty: 'core',
    chapter: 'iff-vs-implies',
    tactics: ['constructor', 'linarith', 'norm_num'],
    title: { en: 'An equation and its root', ru: 'Уравнение и его корень' },
    brief: {
      en: '`3x − 6 = 0` exactly when `x = 2`. Two separate claims: that the root satisfies the equation, and that nothing else does.',
      ru: '`3x − 6 = 0` тогда и только тогда, когда `x = 2`. Это два разных утверждения: что корень подходит и что других нет.',
    },
    hint: {
      en: '`constructor` splits an `↔` into two implications. They are proved differently: one is a substitution, the other is arithmetic.',
      ru: '`constructor` разбивает `↔` на две импликации. Доказываются они по-разному: одна — подстановкой, другая — арифметикой.',
    },
  },
  {
    slug: 'sum-formula',
    imports: ['Mathlib.Tactic.Ring'],
    region: 'sum-formula',
    difficulty: 'tough',
    chapter: 'induction',
    tactics: ['induction', 'rw', 'ring'],
    title: { en: "Gauss's sum", ru: 'Сумма Гаусса' },
    brief: {
      en: 'Twice the sum of the first `n` positive integers is `n(n+1)`. Stated with a doubling so that it stays inside the natural numbers, where subtraction and division would not behave.',
      ru: 'Удвоенная сумма первых `n` натуральных чисел равна `n(n+1)`. Удвоение здесь для того, чтобы остаться в натуральных, где вычитание и деление вели бы себя не так.',
    },
    hint: {
      en: 'Induction on `n`. In the step, unfold `sumTo` once, then rewrite with the induction hypothesis before letting `ring` finish.',
      ru: 'Индукция по `n`. В шаге раскрой `sumTo` один раз, перепиши по гипотезе индукции — и только потом отдай остаток `ring`.',
    },
    needs: ['prelude-sums'],
  },
  {
    slug: 'odd-squares',
    imports: ['Mathlib.Tactic.Ring'],
    region: 'odd-squares',
    difficulty: 'tough',
    chapter: 'induction',
    tactics: ['induction', 'simp', 'ring'],
    title: { en: 'Sum of odd numbers', ru: 'Сумма нечётных' },
    brief: {
      en: 'The first `n` odd numbers add up to `n²`. The classic picture proof — squares growing by an L-shaped border — as a formal induction.',
      ru: 'Первые `n` нечётных чисел в сумме дают `n²`. Классическое доказательство картинкой — квадрат растёт уголком — записанное как формальная индукция.',
    },
    hint: {
      en: 'The same shape as the previous kata, and shorter: after unfolding, the induction hypothesis can be used as a rewrite inside `simp only`.',
      ru: 'Та же форма, что и в предыдущей задаче, только короче: после раскрытия гипотезу индукции можно передать прямо в `simp only`.',
    },
    needs: ['prelude-sums'],
  },
  {
    slug: 'two-squares',
    imports: ['Mathlib.Analysis.SpecialFunctions.Pow.Real', 'Mathlib.Tactic.Linarith'],
    region: 'two-squares',
    difficulty: 'tough',
    chapter: 'inequalities',
    tactics: ['nlinarith', 'sq_nonneg'],
    title: { en: 'AM–GM for two squares', ru: 'Неравенство о двух квадратах' },
    brief: {
      en: '`a² + b² ≥ 2ab` for all reals. Non-linear, so the linear solver will not touch it — but the whole proof is one square you have to name.',
      ru: '`a² + b² ≥ 2ab` для любых вещественных. Нелинейно, поэтому линейный решатель за это не возьмётся, — но всё доказательство держится на одном квадрате, который надо назвать.',
    },
    hint: {
      en: 'The difference is a perfect square. Hand the solver `sq_nonneg (a - b)` and it has everything it needs.',
      ru: 'Разность — полный квадрат. Передай решателю `sq_nonneg (a - b)`, и у него будет всё необходимое.',
    },
  },
]);

export const difficulties: readonly Difficulty[] = ['intro', 'core', 'tough'];

export function kataBySlug(slug: string): Kata | undefined {
  return katas.find((kata) => kata.slug === slug);
}

/**
 * The catalogue in one language. Hrefs are built here, on the server, because
 * the published site lives under a sub-path the island knows nothing about.
 * Backticks are dropped: the list shows plain text, not markup.
 */
export function kataItems(lang: Lang): KataItem[] {
  const prefix = lang === 'ru' ? '/ru' : '';
  return katas.map((kata) => ({
    slug: kata.slug,
    href: withBase(`${prefix}/practice/${kata.slug}/`),
    title: kata.title[lang],
    brief: kata.brief[lang].replace(/`/g, ''),
    difficulty: kata.difficulty,
    tactics: kata.tactics,
  }));
}
