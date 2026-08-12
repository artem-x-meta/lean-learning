import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith
import Mathlib.Data.Real.Basic

/-!
# Practice statements

The skeletons handed to the reader: every proof is a `sorry`, so this file
compiles with warnings and never with errors. A broken statement — one that
does not even elaborate — fails the build here, before anyone sees it.

Each solvable version lives under the same region name in `Solutions.lean`.
That file must compile cleanly, which is what proves a kata is solvable at all.
-/

namespace Practice

-- BEGIN: prelude-sums
/-- Sum of the first `n` positive integers. -/
def sumTo : Nat → Nat
  | 0 => 0
  | n + 1 => (n + 1) + sumTo n

/-- Sum of the first `n` odd numbers. -/
def sumOdd : Nat → Nat
  | 0 => 0
  | n + 1 => (2 * n + 1) + sumOdd n
-- END: prelude-sums

-- BEGIN: identity
theorem identity (A : Prop) : A → A := by
  sorry
-- END: identity

-- BEGIN: constant
theorem const_left (A B : Prop) : A → B → A := by
  sorry
-- END: constant

-- BEGIN: and-swap
theorem and_swap (A B : Prop) (h : A ∧ B) : B ∧ A := by
  sorry
-- END: and-swap

-- BEGIN: or-swap
theorem or_swap (A B : Prop) (h : A ∨ B) : B ∨ A := by
  sorry
-- END: or-swap

-- BEGIN: contrapositive
theorem contrapositive (A B : Prop) (h : A → B) : ¬B → ¬A := by
  sorry
-- END: contrapositive

-- BEGIN: forall-swap
theorem forall_swap (P : Nat → Nat → Prop) (h : ∀ a b, P a b) : ∀ b a, P a b := by
  sorry
-- END: forall-swap

-- BEGIN: exists-shift
theorem exists_shift (P Q : Nat → Prop) (h : ∃ n, P n) (step : ∀ n, P n → Q n) :
    ∃ n, Q n := by
  sorry
-- END: exists-shift

-- BEGIN: square-of-sum
theorem square_of_sum (a b : ℤ) : (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  sorry
-- END: square-of-sum

-- BEGIN: even-plus-even
theorem even_plus_even (a b : Nat) (ha : a % 2 = 0) (hb : b % 2 = 0) :
    (a + b) % 2 = 0 := by
  sorry
-- END: even-plus-even

-- BEGIN: divides-trans
theorem divides_trans (a b c : Nat) (hab : a ∣ b) (hbc : b ∣ c) : a ∣ c := by
  sorry
-- END: divides-trans

-- BEGIN: sum-formula
theorem sum_formula (n : Nat) : 2 * sumTo n = n * (n + 1) := by
  sorry
-- END: sum-formula

-- BEGIN: odd-squares
theorem odd_squares (n : Nat) : sumOdd n = n * n := by
  sorry
-- END: odd-squares

-- BEGIN: two-squares
theorem two_squares (a b : ℝ) : a ^ 2 + b ^ 2 ≥ 2 * a * b := by
  sorry
-- END: two-squares

-- BEGIN: linear-iff
theorem linear_iff (x : ℝ) : 3 * x - 6 = 0 ↔ x = 2 := by
  sorry
-- END: linear-iff

-- BEGIN: compose
theorem compose (A B C : Prop) (f : A → B) (g : B → C) : A → C := by
  sorry
-- END: compose

-- BEGIN: not-not
theorem not_not_intro (A : Prop) (h : A) : ¬¬A := by
  sorry
-- END: not-not

-- BEGIN: or-elim
theorem or_elim (A B C : Prop) (h : A ∨ B) (ha : A → C) (hb : B → C) : C := by
  sorry
-- END: or-elim

-- BEGIN: exists-witness
theorem exists_witness : ∃ n : Nat, n * n = 49 := by
  sorry
-- END: exists-witness

-- BEGIN: counterexample
theorem not_square_fixed : ¬ ∀ n : Nat, n * n = n := by
  sorry
-- END: counterexample

-- BEGIN: rewrite-twice
theorem rewrite_twice (a b : Nat) (h : a = b) : a + a = b + b := by
  sorry
-- END: rewrite-twice

-- BEGIN: diff-of-squares
theorem diff_of_squares (a b : ℤ) : (a - b) * (a + b) = a ^ 2 - b ^ 2 := by
  sorry
-- END: diff-of-squares

-- BEGIN: remainders
theorem remainders (n : Nat) : n % 2 = 0 ∨ n % 2 = 1 := by
  sorry
-- END: remainders

-- BEGIN: power-beats-linear
theorem power_beats_linear (n : Nat) : n + 1 ≤ 2 ^ n := by
  sorry
-- END: power-beats-linear

-- BEGIN: product-zero
theorem product_zero (x : ℝ) : (x - 1) * (x - 2) = 0 ↔ x = 1 ∨ x = 2 := by
  sorry
-- END: product-zero

-- BEGIN: no-largest
theorem no_largest : ¬ ∃ m : Nat, ∀ n : Nat, n ≤ m := by
  sorry
-- END: no-largest

-- BEGIN: nothing-between
theorem nothing_between : ¬ ∃ n : Nat, 3 < n ∧ n < 4 := by
  sorry
-- END: nothing-between

end Practice
