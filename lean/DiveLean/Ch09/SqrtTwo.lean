import Mathlib.Data.Nat.Prime.Basic
import Mathlib.Analysis.SpecialFunctions.Sqrt
import Mathlib.NumberTheory.Real.Irrational

/-!
# Chapter 1.9 — Irrationality of √2

Proof by contradiction in full, with the parity lemma spelled out.
-/

-- BEGIN: parity-lemma
theorem even_of_even_sq (m : Nat) (h : m ^ 2 % 2 = 0) : m % 2 = 0 := by
  rcases Nat.even_or_odd m with he | ho
  · exact Nat.even_iff.mp he
  · exfalso
    obtain ⟨k, hk⟩ := ho
    subst hk
    have hsq : (2 * k + 1) ^ 2 = 2 * (2 * k ^ 2 + 2 * k) + 1 := by ring
    rw [hsq] at h
    omega
-- END: parity-lemma

-- BEGIN: no-fraction
theorem no_coprime_sqrt_two (m n : Nat)
    (hcop : Nat.Coprime m n) : m ^ 2 ≠ 2 * n ^ 2 := by
  intro heq
  have hm_even : m % 2 = 0 := even_of_even_sq m (by omega)
  obtain ⟨k, hk⟩ : ∃ k, m = 2 * k := ⟨m / 2, by omega⟩
  have h4 : m ^ 2 = 4 * k ^ 2 := by rw [hk]; ring
  have hn_sq : n ^ 2 = 2 * k ^ 2 := by omega
  have hn_even : n % 2 = 0 := even_of_even_sq n (by omega)
  have h2m : 2 ∣ m := Nat.dvd_of_mod_eq_zero hm_even
  have h2n : 2 ∣ n := Nat.dvd_of_mod_eq_zero hn_even
  have hg : (2 : Nat) ∣ Nat.gcd m n := Nat.dvd_gcd h2m h2n
  have hcop' : Nat.gcd m n = 1 := hcop
  rw [hcop'] at hg
  omega
-- END: no-fraction

-- BEGIN: mathlib-version
example : Irrational (Real.sqrt 2) := irrational_sqrt_two

example : Irrational (Real.sqrt 3) := (Nat.prime_three).irrational_sqrt
-- END: mathlib-version

-- BEGIN: sqrt-two-squared
example : Real.sqrt 2 ^ 2 = 2 := Real.sq_sqrt (by norm_num)
-- END: sqrt-two-squared
