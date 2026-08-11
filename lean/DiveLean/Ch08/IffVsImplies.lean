import Mathlib.Tactic.Linarith
import Mathlib.Tactic.NormNum
import Mathlib.Data.Real.Basic
import Mathlib.Analysis.SpecialFunctions.Sqrt

/-!
# Chapter 1.8 — Equivalence and consequence

Where extraneous roots come from: squaring gives an arrow forward only.
-/

-- BEGIN: iff-intro
theorem double_iff (x : ℝ) : 2 * x = 6 ↔ x = 3 := by
  constructor
  · intro h
    linarith
  · intro h
    rw [h]
    norm_num
-- END: iff-intro

-- BEGIN: iff-is-and
theorem forward_part (x : ℝ) (h : 2 * x = 6) : x = 3 := (double_iff x).mp h
theorem backward_part (x : ℝ) (h : x = 3) : 2 * x = 6 := (double_iff x).mpr h
-- END: iff-is-and

-- BEGIN: squaring-loses
theorem squaring_is_only_forward (x : ℝ) (h : x = 3) : x ^ 2 = 9 := by
  rw [h]; norm_num
-- END: squaring-loses

-- BEGIN: squaring-counterexample
theorem squaring_not_reversible : ¬(∀ x : ℝ, x ^ 2 = 9 → x = 3) := by
  intro h
  have h3 : (-3 : ℝ) = 3 := h (-3) (by norm_num)
  norm_num at h3
-- END: squaring-counterexample

-- BEGIN: honest-equivalence
theorem square_iff (x : ℝ) : x ^ 2 = 9 ↔ (x = 3 ∨ x = -3) := by
  constructor
  · intro h
    have factored : (x - 3) * (x + 3) = 0 := by nlinarith [h]
    rcases mul_eq_zero.mp factored with h1 | h2
    · left; linarith
    · right; linarith
  · intro h
    rcases h with h1 | h2
    · rw [h1]; norm_num
    · rw [h2]; norm_num
-- END: honest-equivalence

-- BEGIN: extraneous-root
theorem two_is_extraneous : ((2 : ℝ) - 5) < 0 := by norm_num

theorem nine_survives : Real.sqrt (9 + 7) = 9 - 5 := by
  rw [show (9 : ℝ) + 7 = 16 by norm_num]
  rw [show (16 : ℝ) = 4 ^ 2 by norm_num]
  rw [Real.sqrt_sq (by norm_num : (0 : ℝ) ≤ 4)]
  norm_num
-- END: extraneous-root

-- BEGIN: exercise-iff
theorem shift_iff (x : ℝ) : x + 4 = 10 ↔ x = 6 := by
  constructor
  · intro h; linarith
  · intro h; linarith
-- END: exercise-iff
