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

/** The chapters, in the order the course teaches them. */
export const chapterOrder: readonly string[] = [
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

const catalogue: Kata[] = [
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
  {
    slug: 'compose',
    region: 'compose',
    difficulty: 'intro',
    chapter: 'proof-as-object',
    tactics: ['intro', 'exact'],
    title: { en: 'Chaining two implications', ru: 'Цепочка из двух импликаций' },
    brief: {
      en: 'From `A` follows `B`, from `B` follows `C`; conclude that from `A` follows `C`. The step every argument in mathematics is made of.',
      ru: 'Из `A` следует `B`, из `B` следует `C`; заключи, что из `A` следует `C`. Шаг, из которых состоит любое рассуждение.',
    },
    hint: {
      en: 'An implication is a function, so `f a` is a proof of `B`. What do you do with it?',
      ru: 'Импликация — функция, поэтому `f a` есть доказательство `B`. Что с ним сделать дальше?',
    },
  },
  {
    slug: 'not-not',
    region: 'not-not',
    difficulty: 'core',
    chapter: 'connectives',
    tactics: ['intro', 'exact'],
    title: { en: 'Double negation, the easy half', ru: 'Двойное отрицание, лёгкая половина' },
    brief: {
      en: 'If `A` holds, then `¬¬A` holds. This direction is straightforward; the way back needs a principle this one does not, which is worth noticing.',
      ru: 'Если `A` верно, то верно и `¬¬A`. Это направление простое — а обратное требует принципа, который здесь не нужен, и это стоит заметить.',
    },
    hint: {
      en: '`¬¬A` unfolds to `(A → False) → False`. Introduce the refuter and give it what it asked for.',
      ru: '`¬¬A` разворачивается в `(A → False) → False`. Введи опровергателя и дай ему ровно то, чего он просит.',
    },
  },
  {
    slug: 'or-elim',
    region: 'or-elim',
    difficulty: 'core',
    chapter: 'connectives',
    tactics: ['cases', 'exact'],
    title: { en: 'Proof by cases', ru: 'Разбор случаев' },
    brief: {
      en: '`A` or `B` holds, and each of them leads to `C`. Conclude `C`. This is what "consider two cases" means, written so a machine accepts it.',
      ru: 'Верно `A` или `B`, и каждое из них ведёт к `C`. Заключи `C`. Это и есть «рассмотрим два случая», записанное так, чтобы машина приняла.',
    },
    hint: {
      en: 'Take the disjunction apart with `cases`. Each branch hands you one side and the matching way to reach `C`.',
      ru: 'Разбери дизъюнкцию через `cases`. В каждой ветке у тебя одна из сторон и подходящий к ней способ добраться до `C`.',
    },
  },
  {
    slug: 'exists-witness',
    region: 'exists-witness',
    difficulty: 'intro',
    chapter: 'quantifiers',
    tactics: ['exact', 'rfl'],
    title: { en: 'Naming a witness', ru: 'Предъявить свидетеля' },
    brief: {
      en: 'Some natural number squares to 49. Proving an existence statement means producing the thing — there is no other way.',
      ru: 'Какое-то натуральное число в квадрате даёт 49. Доказать существование — значит предъявить сам объект, иначе никак.',
    },
    hint: {
      en: '`⟨witness, proof⟩` builds an `∃`. Once the number is fixed, both sides are literals and the equality holds by computation.',
      ru: '`⟨свидетель, доказательство⟩` собирает `∃`. Когда число подставлено, обе части — литералы, и равенство верно по вычислению.',
    },
  },
  {
    slug: 'counterexample',
    region: 'counterexample',
    difficulty: 'core',
    chapter: 'quantifiers',
    tactics: ['intro', 'omega'],
    title: { en: 'One counterexample is enough', ru: 'Одного контрпримера достаточно' },
    brief: {
      en: 'It is not true that every natural number equals its own square. Refuting a `∀` costs exactly one number — the exercise is turning that into a proof.',
      ru: 'Неверно, что каждое натуральное число равно своему квадрату. Опровержение `∀` стоит ровно одного числа — упражнение в том, чтобы превратить это в доказательство.',
    },
    hint: {
      en: 'Assume the universal claim, then use it at a number where it fails. What you get is an arithmetic falsehood.',
      ru: 'Прими всеобщее утверждение, а затем применяй его к числу, на котором оно ломается. Получится арифметическая ложь.',
    },
  },
  {
    slug: 'rewrite-twice',
    region: 'rewrite-twice',
    difficulty: 'intro',
    chapter: 'rewriting',
    tactics: ['rw'],
    title: { en: 'Substituting equals', ru: 'Подстановка равного' },
    brief: {
      en: 'If `a = b`, then `a + a = b + b`. Equality lets you replace one by the other anywhere — and `rw` replaces every occurrence at once.',
      ru: 'Если `a = b`, то `a + a = b + b`. Равенство позволяет заменять одно другим где угодно — а `rw` заменяет сразу все вхождения.',
    },
    hint: {
      en: 'One rewrite is the whole proof: after it the two sides are literally the same, and `rw` closes such goals itself.',
      ru: 'Одно переписывание — и всё: после него обе части буквально совпадают, а такие цели `rw` закрывает сам.',
    },
  },
  {
    slug: 'diff-of-squares',
    imports: ['Mathlib.Tactic.Ring'],
    region: 'diff-of-squares',
    difficulty: 'core',
    chapter: 'rewriting',
    tactics: ['ring'],
    title: { en: 'Difference of squares', ru: 'Разность квадратов' },
    brief: {
      en: '`(a − b)(a + b) = a² − b²` over the integers. The companion to the square of a sum, and proof that one tactic really does cover the family.',
      ru: '`(a − b)(a + b) = a² − b²` над целыми. Пара к квадрату суммы — и подтверждение, что одна тактика действительно закрывает всё семейство.',
    },
    hint: {
      en: 'Same tactic as the square of a sum. That is the point of the kata.',
      ru: 'Та же тактика, что и в квадрате суммы. В этом и смысл задачи.',
    },
  },
  {
    slug: 'remainders',
    region: 'remainders',
    difficulty: 'intro',
    chapter: 'numbers',
    tactics: ['omega'],
    title: { en: 'Even or odd', ru: 'Чётное или нечётное' },
    brief: {
      en: 'Every natural number leaves remainder 0 or 1 on division by 2. There is nothing to think about here — the point is that the machine agrees without being led.',
      ru: 'Любое натуральное число даёт при делении на 2 остаток 0 или 1. Думать тут не над чем — смысл в том, что машина соглашается, и вести её за руку не нужно.',
    },
    hint: {
      en: 'The solver for linear arithmetic knows what a remainder is. One word.',
      ru: 'Решатель линейной арифметики знает, что такое остаток. Одно слово.',
    },
  },
  {
    slug: 'power-beats-linear',
    region: 'power-beats-linear',
    difficulty: 'tough',
    chapter: 'induction',
    tactics: ['induction', 'omega', 'Nat.pow_succ'],
    title: { en: 'Doubling outruns counting', ru: 'Удвоение обгоняет счёт' },
    brief: {
      en: '`n + 1 ≤ 2ⁿ` for every natural `n`. Obvious as a picture, and a good lesson in helping a solver that cannot see powers.',
      ru: '`n + 1 ≤ 2ⁿ` для любого натурального `n`. Очевидно на картинке — и хороший урок о том, как помочь решателю, который не видит степеней.',
    },
    hint: {
      en: '`omega` treats `2 ^ k` as an unknown quantity, not as a power. Give it a `have` saying how the next power relates to this one, and it can finish.',
      ru: '`omega` считает `2 ^ k` неизвестной величиной, а не степенью. Дай ему `have` о том, как следующая степень связана с текущей, — дальше он справится.',
    },
  },
  {
    slug: 'product-zero',
    imports: ['Mathlib.Data.Real.Basic'],
    region: 'product-zero',
    difficulty: 'core',
    chapter: 'iff-vs-implies',
    tactics: ['rw', 'mul_eq_zero', 'sub_eq_zero'],
    title: { en: 'A product is zero', ru: 'Произведение равно нулю' },
    brief: {
      en: '`(x − 1)(x − 2) = 0` exactly when `x = 1` or `x = 2`. The rule behind every factored equation you solved at school, and it is an equivalence in both directions.',
      ru: '`(x − 1)(x − 2) = 0` тогда и только тогда, когда `x = 1` или `x = 2`. Правило, по которому в школе решают разложенные на множители уравнения, — и это равносильность в обе стороны.',
    },
    hint: {
      en: 'Both steps are named lemmas, and both are equivalences — so the whole proof can be a chain of rewrites rather than a case split.',
      ru: 'Оба шага — именованные леммы, и обе равносильности, — так что всё доказательство можно свести к цепочке переписываний, без разбора случаев.',
    },
  },
  {
    slug: 'no-largest',
    region: 'no-largest',
    difficulty: 'core',
    chapter: 'sqrt-two',
    tactics: ['intro', 'omega'],
    title: { en: 'There is no largest number', ru: 'Наибольшего числа нет' },
    brief: {
      en: 'No natural number is greater than or equal to all of them. Euclid’s move, in miniature: assume there is one, then build something it fails on.',
      ru: 'Никакое натуральное число не больше или равно всем сразу. Ход Евклида в миниатюре: предположи, что такое есть, и построй то, на чём оно ломается.',
    },
    hint: {
      en: '`intro ⟨m, h⟩` assumes such an `m` and names the property. Then apply it to a number chosen to break it.',
      ru: '`intro ⟨m, h⟩` предполагает такое `m` и даёт имя свойству. Дальше примени его к числу, подобранному так, чтобы свойство не выдержало.',
    },
  },
  {
    slug: 'nothing-between',
    region: 'nothing-between',
    difficulty: 'intro',
    chapter: 'sqrt-two',
    tactics: ['intro', 'omega'],
    title: { en: 'Nothing between 3 and 4', ru: 'Между 3 и 4 ничего нет' },
    brief: {
      en: 'No natural number is strictly between 3 and 4. The shortest proof by contradiction there is: assume such a number, and the arithmetic refuses.',
      ru: 'Никакое натуральное число не лежит строго между 3 и 4. Самое короткое доказательство от противного: предположи такое число — и арифметика откажет.',
    },
    hint: {
      en: 'A negation is introduced like any implication, and an `∃ … ∧ …` can be taken apart right in the `intro` pattern.',
      ru: 'Отрицание вводится как любая импликация, а `∃ … ∧ …` можно разобрать прямо в образце у `intro`.',
    },
  },
];

/**
 * Sorted by chapter, so that inside a difficulty group the katas follow the
 * ladder: nothing asks for a chapter you have not read. The sort is stable,
 * so katas from one chapter keep the order they are written in above — which
 * is also where a new one should be added.
 */
export const katas: readonly Kata[] = Object.freeze(
  [...catalogue].sort(
    (a, b) => chapterOrder.indexOf(a.chapter) - chapterOrder.indexOf(b.chapter),
  ),
);

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
