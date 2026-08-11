import Mathlib.Tactic.Linarith
import Mathlib.Tactic.Positivity
import Mathlib.Data.Real.Basic

/-!
# Chapter 1.7 — Inequalities

`linarith`, `nlinarith` with a hint, and `positivity`.
-/

-- BEGIN: linarith-basic
example (x : ℝ) (h : x > 3) : x + 1 > 4 := by linarith

example (a b : ℝ) (h1 : a ≤ b) (h2 : b ≤ 5) : a ≤ 5 := by linarith
-- END: linarith-basic

-- BEGIN: linarith-combination
example (x y : ℝ) (h1 : 2 * x + y = 7) (h2 : x - y = 2) : x = 3 := by linarith
-- END: linarith-combination

-- BEGIN: linarith-fails
example (x : ℝ) : x ^ 2 ≥ 0 := by positivity
-- END: linarith-fails

-- BEGIN: nlinarith
theorem sq_sum_ge_two_mul (a b : ℝ) : a ^ 2 + b ^ 2 ≥ 2 * a * b := by
  nlinarith [sq_nonneg (a - b)]
-- END: nlinarith

-- BEGIN: nlinarith-hint
theorem am_gm_two (a b : ℝ) : a * b ≤ (a ^ 2 + b ^ 2) / 2 := by
  nlinarith [sq_nonneg (a - b)]
-- END: nlinarith-hint

-- BEGIN: transitivity-chain
theorem chain_of_bounds (x : ℝ) : x ^ 2 - 4 * x + 5 ≥ 1 := by
  nlinarith [sq_nonneg (x - 2)]
-- END: transitivity-chain

-- BEGIN: exercise-square-nonneg
theorem sum_of_squares_nonneg (a b : ℝ) : a ^ 2 + b ^ 2 ≥ 0 := by positivity
-- END: exercise-square-nonneg
