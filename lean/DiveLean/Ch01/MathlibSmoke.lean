import Mathlib.Data.Real.Basic
import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
# Mathlib smoke test

Not used by any chapter page: it exists so a broken dependency
surfaces here rather than in a chapter that needs Mathlib.
-/

example (a b : ℤ) : (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by ring

example (x : ℝ) (h : x > 3) : x + 1 > 4 := by linarith
