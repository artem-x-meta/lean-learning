import Mathlib.Tactic.Ring

/-!
# Chapter 1.6 — Induction

Recursive definitions and induction as one construction seen from two sides.
-/

-- BEGIN: recursive-def
def sumTo : Nat → Nat
  | 0 => 0
  | n + 1 => (n + 1) + sumTo n
-- END: recursive-def

-- BEGIN: compute-sum
example : sumTo 5 = 15 := rfl
example : sumTo 10 = 55 := rfl
-- END: compute-sum

-- BEGIN: induction-shape
theorem sum_formula (n : Nat) : 2 * sumTo n = n * (n + 1) := by
  induction n with
  | zero => rfl
  | succ k ih =>
    change 2 * ((k + 1) + sumTo k) = (k + 1) * (k + 2)
    calc 2 * ((k + 1) + sumTo k) = 2 * (k + 1) + 2 * sumTo k := by ring
      _ = 2 * (k + 1) + k * (k + 1) := by rw [ih]
      _ = (k + 1) * (k + 2) := by ring
-- END: induction-shape

-- BEGIN: induction-simple
theorem sum_double (n : Nat) : sumTo n + sumTo n = n * (n + 1) := by
  induction n with
  | zero => rfl
  | succ k ih =>
    change ((k + 1) + sumTo k) + ((k + 1) + sumTo k) = (k + 1) * (k + 2)
    calc ((k + 1) + sumTo k) + ((k + 1) + sumTo k)
        = 2 * (k + 1) + (sumTo k + sumTo k) := by ring
      _ = 2 * (k + 1) + k * (k + 1) := by rw [ih]
      _ = (k + 1) * (k + 2) := by ring
-- END: induction-simple

-- BEGIN: power-def
def doubled : Nat → Nat
  | 0 => 1
  | n + 1 => 2 * doubled n
-- END: power-def

-- BEGIN: power-grows
theorem doubled_gt (n : Nat) : n + 1 ≤ doubled n := by
  induction n with
  | zero => decide
  | succ k ih =>
    change k + 2 ≤ 2 * doubled k
    omega
-- END: power-grows

-- BEGIN: exercise-odd-sum
def sumOdd : Nat → Nat
  | 0 => 0
  | n + 1 => (2 * n + 1) + sumOdd n

theorem sum_odd_is_square (n : Nat) : sumOdd n = n * n := by
  induction n with
  | zero => rfl
  | succ k ih =>
    change (2 * k + 1) + sumOdd k = (k + 1) * (k + 1)
    rw [ih]
    ring
-- END: exercise-odd-sum
