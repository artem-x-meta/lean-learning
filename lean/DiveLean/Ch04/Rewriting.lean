import Mathlib.Tactic.Ring
import Mathlib.Tactic.Linarith

/-!
# Chapter 1.4 — Rewriting equalities

`rw`, `calc` chains and `ring`, plus the line between identity and equation.
-/

-- BEGIN: rw-basic
theorem substitute_once (a b : Nat) (h : a = b) : a + 1 = b + 1 := by
  rw [h]
-- END: rw-basic

-- BEGIN: rw-closes
theorem substitute_twice (x y z : Nat) (h1 : x = y) (h2 : y = z) : x = z := by
  rw [h1, h2]
-- END: rw-closes

-- BEGIN: rw-direction
theorem substitute_back (a b : Nat) (h : a = b) : b + 1 = a + 1 := by
  rw [← h]
-- END: rw-direction

-- BEGIN: calc-chain
theorem chain_example (a b c : Nat) (h1 : a = b) (h2 : b = c) : a + 0 = c := by
  calc a + 0 = a := by rw [Nat.add_zero]
    _ = b := by rw [h1]
    _ = c := by rw [h2]
-- END: calc-chain

-- BEGIN: ring-square
theorem square_of_sum (a b : ℤ) : (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  ring
-- END: ring-square

-- BEGIN: ring-difference
theorem difference_of_squares (a b : ℤ) : (a + b) * (a - b) = a ^ 2 - b ^ 2 := by
  ring
-- END: ring-difference

-- BEGIN: calc-by-hand
theorem square_of_sum_by_hand (a b : ℤ) :
    (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  calc (a + b) ^ 2 = (a + b) * (a + b) := by ring
    _ = a * a + a * b + b * a + b * b := by ring
    _ = a ^ 2 + 2 * a * b + b ^ 2 := by ring
-- END: calc-by-hand

-- BEGIN: ring-limits
theorem uses_hypothesis (x : ℤ) (h : x + 3 = 10) : x = 7 := by
  linarith
-- END: ring-limits

-- BEGIN: exercise-cube
theorem cube_of_sum (a b : ℤ) :
    (a + b) ^ 3 = a ^ 3 + 3 * a ^ 2 * b + 3 * a * b ^ 2 + b ^ 3 := by
  ring
-- END: exercise-cube
