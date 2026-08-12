import DiveLean.Practice.Statements

/-!
# Reference solutions

Every kata proved. This file must compile **cleanly** — no `sorry`, no errors —
and that is the point of it: a kata whose reference solution does not compile is
a kata nobody can solve, and `lake build` refuses to let one ship.

The statements are repeated verbatim from `Statements.lean` and live in a
separate namespace, so the two files can coexist in one library.
-/

namespace Practice.Solutions

open Practice

-- BEGIN: identity
theorem identity (A : Prop) : A → A := by
  intro h
  exact h
-- END: identity

-- BEGIN: constant
theorem const_left (A B : Prop) : A → B → A := by
  intro a _
  exact a
-- END: constant

-- BEGIN: and-swap
theorem and_swap (A B : Prop) (h : A ∧ B) : B ∧ A := by
  exact ⟨h.2, h.1⟩
-- END: and-swap

-- BEGIN: or-swap
theorem or_swap (A B : Prop) (h : A ∨ B) : B ∨ A := by
  cases h with
  | inl a => exact Or.inr a
  | inr b => exact Or.inl b
-- END: or-swap

-- BEGIN: contrapositive
theorem contrapositive (A B : Prop) (h : A → B) : ¬B → ¬A := by
  intro hb ha
  exact hb (h ha)
-- END: contrapositive

-- BEGIN: forall-swap
theorem forall_swap (P : Nat → Nat → Prop) (h : ∀ a b, P a b) : ∀ b a, P a b := by
  intro b a
  exact h a b
-- END: forall-swap

-- BEGIN: exists-shift
theorem exists_shift (P Q : Nat → Prop) (h : ∃ n, P n) (step : ∀ n, P n → Q n) :
    ∃ n, Q n := by
  obtain ⟨n, hn⟩ := h
  exact ⟨n, step n hn⟩
-- END: exists-shift

-- BEGIN: square-of-sum
theorem square_of_sum (a b : ℤ) : (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  ring
-- END: square-of-sum

-- BEGIN: even-plus-even
theorem even_plus_even (a b : Nat) (ha : a % 2 = 0) (hb : b % 2 = 0) :
    (a + b) % 2 = 0 := by
  omega
-- END: even-plus-even

-- BEGIN: divides-trans
-- `hab.trans hbc` also works, but only once Mathlib is imported: without it
-- `a ∣ b` shows its definition, `∃ c, b = a * c`, and dot notation looks for
-- `Exists.trans`. The kata is core Lean, so it names the core lemma.
theorem divides_trans (a b c : Nat) (hab : a ∣ b) (hbc : b ∣ c) : a ∣ c := by
  exact Nat.dvd_trans hab hbc
-- END: divides-trans

-- BEGIN: sum-formula
theorem sum_formula (n : Nat) : 2 * sumTo n = n * (n + 1) := by
  induction n with
  | zero => rfl
  | succ k ih =>
    simp only [sumTo]
    rw [Nat.mul_add, ih]
    ring
-- END: sum-formula

-- BEGIN: odd-squares
theorem odd_squares (n : Nat) : sumOdd n = n * n := by
  induction n with
  | zero => rfl
  | succ k ih =>
    simp only [sumOdd, ih]
    ring
-- END: odd-squares

-- BEGIN: two-squares
theorem two_squares (a b : ℝ) : a ^ 2 + b ^ 2 ≥ 2 * a * b := by
  nlinarith [sq_nonneg (a - b)]
-- END: two-squares

-- BEGIN: linear-iff
theorem linear_iff (x : ℝ) : 3 * x - 6 = 0 ↔ x = 2 := by
  constructor
  · intro h
    linarith
  · intro h
    rw [h]
    norm_num
-- END: linear-iff

-- BEGIN: compose
theorem compose (A B C : Prop) (f : A → B) (g : B → C) : A → C := by
  intro a
  exact g (f a)
-- END: compose

-- BEGIN: not-not
theorem not_not_intro (A : Prop) (h : A) : ¬¬A := by
  intro na
  exact na h
-- END: not-not

-- BEGIN: or-elim
theorem or_elim (A B C : Prop) (h : A ∨ B) (ha : A → C) (hb : B → C) : C := by
  cases h with
  | inl a => exact ha a
  | inr b => exact hb b
-- END: or-elim

-- BEGIN: exists-witness
theorem exists_witness : ∃ n : Nat, n * n = 49 := by
  exact ⟨7, rfl⟩
-- END: exists-witness

-- BEGIN: counterexample
theorem not_square_fixed : ¬ ∀ n : Nat, n * n = n := by
  intro h
  have two := h 2
  omega
-- END: counterexample

-- BEGIN: rewrite-twice
theorem rewrite_twice (a b : Nat) (h : a = b) : a + a = b + b := by
  rw [h]
-- END: rewrite-twice

-- BEGIN: diff-of-squares
theorem diff_of_squares (a b : ℤ) : (a - b) * (a + b) = a ^ 2 - b ^ 2 := by
  ring
-- END: diff-of-squares

-- BEGIN: remainders
theorem remainders (n : Nat) : n % 2 = 0 ∨ n % 2 = 1 := by
  omega
-- END: remainders

-- BEGIN: power-beats-linear
theorem power_beats_linear (n : Nat) : n + 1 ≤ 2 ^ n := by
  induction n with
  | zero => decide
  | succ k ih =>
    -- `omega` treats `2 ^ k` as an unknown; this says how the next one relates.
    have step : 2 ^ (k + 1) = 2 ^ k * 2 := Nat.pow_succ 2 k
    omega
-- END: power-beats-linear

-- BEGIN: product-zero
theorem product_zero (x : ℝ) : (x - 1) * (x - 2) = 0 ↔ x = 1 ∨ x = 2 := by
  rw [mul_eq_zero, sub_eq_zero, sub_eq_zero]
-- END: product-zero

-- BEGIN: no-largest
theorem no_largest : ¬ ∃ m : Nat, ∀ n : Nat, n ≤ m := by
  intro ⟨m, h⟩
  have bigger := h (m + 1)
  omega
-- END: no-largest

-- BEGIN: nothing-between
theorem nothing_between : ¬ ∃ n : Nat, 3 < n ∧ n < 4 := by
  intro ⟨n, low, high⟩
  omega
-- END: nothing-between

end Practice.Solutions
