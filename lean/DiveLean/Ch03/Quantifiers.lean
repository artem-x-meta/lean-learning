/-!
# Chapter 1.3 — Quantifiers

`∀` as a function, `∃` as a witness, refutation by counterexample.
-/

-- BEGIN: forall-is-function
theorem every_number_equals_itself : ∀ n : Nat, n = n := fun n => Eq.refl n
-- END: forall-is-function

-- BEGIN: forall-tactic
theorem every_number_equals_itself' : ∀ n : Nat, n = n := by
  intro n
  rfl
-- END: forall-tactic

-- BEGIN: forall-apply
theorem apply_universal (P : Nat → Prop) (h : ∀ n, P n) : P 7 := h 7
-- END: forall-apply

-- BEGIN: exists-intro
theorem some_number_adds_to_five : ∃ n : Nat, n + 2 = 5 := ⟨3, rfl⟩
-- END: exists-intro

-- BEGIN: exists-tactic
theorem some_number_adds_to_five' : ∃ n : Nat, n + 2 = 5 := by
  exists 3
-- END: exists-tactic

-- BEGIN: exists-elim
theorem shift_witness (P : Nat → Prop) (h : ∃ n, P n) : ∃ m, P m := by
  cases h with
  | intro n hn => exact ⟨n, hn⟩
-- END: exists-elim

-- BEGIN: quantifier-symmetry
theorem universal_gives_example (P : Nat → Prop) (h : ∀ n, P n) : ∃ n, P n :=
  ⟨0, h 0⟩
-- END: quantifier-symmetry

-- BEGIN: counterexample
theorem not_all_are_even : ¬(∀ n : Nat, n % 2 = 0) := by
  intro h
  have h3 : (3 : Nat) % 2 = 0 := h 3
  exact absurd h3 (by decide)
-- END: counterexample

-- BEGIN: exists-not-to-not-forall
theorem exists_not_gives_not_forall (P : Nat → Prop) (h : ∃ n, ¬P n) :
    ¬(∀ n, P n) := by
  intro hall
  cases h with
  | intro n hn => exact hn (hall n)
-- END: exists-not-to-not-forall

-- BEGIN: exercise-swap-forall
theorem swap_foralls (P : Nat → Nat → Prop) (h : ∀ a b, P a b) : ∀ b a, P a b := by
  intro b a
  exact h a b
-- END: exercise-swap-forall
