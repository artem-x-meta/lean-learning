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

end Practice.Solutions
