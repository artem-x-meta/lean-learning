import Mathlib.Tactic.NormNum
import Mathlib.Tactic.NormNum.Prime
import Mathlib.Data.Rat.Defs

/-!
# Chapter 1.5 — Numbers and solvers

`decide`, `norm_num` and `omega`, and divisibility as an existence claim.
-/

-- BEGIN: decide-basic
example : (7 : Nat) % 2 = 1 := by decide
example : ¬((5 : Nat) ∣ 12) := by decide
-- END: decide-basic

-- BEGIN: decide-limits
example : (2 : Nat) ^ 10 = 1024 := by decide
-- END: decide-limits

-- BEGIN: norm-num
example : (2 : ℚ) / 4 + 1 / 4 = 3 / 4 := by norm_num
example : (17 : ℤ) * 3 - 20 > 30 := by norm_num
-- END: norm-num

-- BEGIN: norm-num-prime
example : Nat.Prime 97 := by norm_num
-- END: norm-num-prime

-- BEGIN: omega
example (n : Nat) (h : n + 3 = 10) : n = 7 := by omega
example (a b : Int) (h1 : a ≤ b) (h2 : b ≤ a) : a = b := by omega
-- END: omega

-- BEGIN: omega-parity
theorem even_plus_even (a b : Nat) (ha : a % 2 = 0) (hb : b % 2 = 0) :
    (a + b) % 2 = 0 := by
  omega
-- END: omega-parity

-- BEGIN: divides
theorem three_divides_twelve : (3 : Nat) ∣ 12 := ⟨4, rfl⟩
-- END: divides

-- BEGIN: divides-trans
theorem divides_trans (a b c : Nat) (hab : a ∣ b) (hbc : b ∣ c) : a ∣ c := by
  cases hab with
  | intro x hx =>
    cases hbc with
    | intro y hy =>
      exact ⟨x * y, by rw [hy, hx, Nat.mul_assoc]⟩
-- END: divides-trans

-- BEGIN: exercise-odd
theorem odd_plus_odd (a b : Nat) (ha : a % 2 = 1) (hb : b % 2 = 1) :
    (a + b) % 2 = 0 := by
  omega
-- END: exercise-odd
