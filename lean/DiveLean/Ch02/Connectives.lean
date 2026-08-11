/-!
# Chapter 1.2 — Connectives

Conjunction as a pair, disjunction as a choice, negation as `A → False`.
-/

-- BEGIN: and-intro
theorem and_both (A B : Prop) (hA : A) (hB : B) : A ∧ B := ⟨hA, hB⟩
-- END: and-intro

-- BEGIN: and-tactic
theorem and_both' (A B : Prop) (hA : A) (hB : B) : A ∧ B := by
  constructor
  · exact hA
  · exact hB
-- END: and-tactic

-- BEGIN: and-elim
theorem and_left_part (A B : Prop) (h : A ∧ B) : A := h.1
theorem and_right_part (A B : Prop) (h : A ∧ B) : B := h.2
-- END: and-elim

-- BEGIN: and-comm
theorem and_swap (A B : Prop) (h : A ∧ B) : B ∧ A := ⟨h.2, h.1⟩
-- END: and-comm

-- BEGIN: or-intro
theorem or_from_left (A B : Prop) (hA : A) : A ∨ B := Or.inl hA
theorem or_from_right (A B : Prop) (hB : B) : A ∨ B := Or.inr hB
-- END: or-intro

-- BEGIN: or-tactic
theorem or_from_left' (A B : Prop) (hA : A) : A ∨ B := by
  left
  exact hA
-- END: or-tactic

-- BEGIN: or-elim
theorem or_swap (A B : Prop) (h : A ∨ B) : B ∨ A := by
  cases h with
  | inl hA => exact Or.inr hA
  | inr hB => exact Or.inl hB
-- END: or-elim

-- BEGIN: not-def
example (A : Prop) : ¬A ↔ (A → False) := Iff.rfl
-- END: not-def

-- BEGIN: not-use
theorem no_self_contradiction (A : Prop) : ¬(A ∧ ¬A) := by
  intro h
  exact h.2 h.1
-- END: not-use

-- BEGIN: contradiction
theorem anything_from_false (A B : Prop) (hA : A) (hnA : ¬A) : B :=
  False.elim (hnA hA)
-- END: contradiction

-- BEGIN: de-morgan
theorem not_or_gives_and (A B : Prop) (h : ¬(A ∨ B)) : ¬A ∧ ¬B := by
  constructor
  · intro hA
    exact h (Or.inl hA)
  · intro hB
    exact h (Or.inr hB)
-- END: de-morgan

-- BEGIN: exercise-distrib
theorem and_or_distrib (A B C : Prop) (h : A ∧ (B ∨ C)) : (A ∧ B) ∨ (A ∧ C) := by
  cases h.2 with
  | inl hB => exact Or.inl ⟨h.1, hB⟩
  | inr hC => exact Or.inr ⟨h.1, hC⟩
-- END: exercise-distrib
