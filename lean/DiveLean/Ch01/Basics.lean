/-!
# Chapter 1.1 — A proof is an object

Propositions as types, proofs as values, implication as a function.
-/

-- BEGIN: check-prop
#check (2 + 2 = 4 : Prop)
#check (2 + 2 = 5 : Prop)
-- END: check-prop

-- BEGIN: first-proof
theorem two_plus_two : 2 + 2 = 4 := rfl
-- END: first-proof

-- BEGIN: check-proof
#check two_plus_two
-- END: check-proof

-- BEGIN: rfl-fails
-- theorem two_plus_two_wrong : 2 + 2 = 5 := rfl
-- END: rfl-fails

-- BEGIN: implication
theorem id_impl (A : Prop) : A → A := fun hA => hA
-- END: implication

-- BEGIN: implication-tactic
theorem id_impl' (A : Prop) : A → A := by
  intro hA
  exact hA
-- END: implication-tactic

-- BEGIN: transitivity
theorem impl_trans (A B C : Prop) (hAB : A → B) (hBC : B → C) : A → C := by
  intro hA
  exact hBC (hAB hA)
-- END: transitivity

-- BEGIN: exercise-swap
theorem swap_args (A B C : Prop) (h : A → B → C) : B → A → C := by
  intro hB hA
  exact h hA hB
-- END: exercise-swap
