# Lean, step by step

**Read the course: [artem-x-meta.github.io/lean-learning](https://artem-x-meta.github.io/lean-learning/)** · [по-русски](https://artem-x-meta.github.io/lean-learning/ru/)

A Lean 4 course for people who can do the mathematics but have never proved anything to a machine. Nine chapters, from "a proof is an object" to the irrationality of √2.

The mathematics is **familiar ground, not the subject**. Every statement is chosen so that you already believe it, which frees your attention for the real question: how do I explain this to Lean?

## What makes it different

Every snippet on the site is a fragment of a real file from `lean/` — a genuine Lake project with Mathlib — pulled in at build time by the `LeanSnippet` component. An example that does not compile cannot reach the site, because `lake build` fails first.

That is not a theoretical guarantee. While the course was written, the build caught a non-existent Mathlib module, two theorem names already taken by the core library, a missing import for `Real.sqrt`, and `omega` being handed a non-linear goal. In a tutorial where the code is only prose, those survive for years.

## The ladder

The order comes from the language, not from mathematics. Each chapter introduces one technique and drills it on statements that technique can reach.

| Chapter | Technique | Familiar ground |
|---|---|---|
| 1.1 | propositions as types, `intro`, `exact` | arithmetic, implication |
| 1.2 | `∧`, `∨`, `¬`, case analysis | propositional logic |
| 1.3 | `∀`, `∃`, counterexamples | parity |
| 1.4 | `rw`, `calc`, `ring` | algebraic identities |
| 1.5 | `decide`, `norm_num`, `omega` | divisibility, remainders |
| 1.6 | recursion and `induction` | sums of series |
| 1.7 | `linarith`, `nlinarith` | inequality of means |
| 1.8 | `↔` versus `→` | extraneous roots |
| 1.9 | proof by contradiction | irrationality of √2 |

## Running it

```sh
npm install
npm run dev
```

The site is bilingual: English at the root, Russian under `/ru/`. Interface strings live in `src/lib/i18n.ts`; Astro components resolve the language from the URL, React islands take it as a prop.

## Two modes

**Published site.** Static, no Lean anywhere: each snippet links out to the playground. That is what GitHub Pages serves and it needs nothing from the reader.

**Your own machine.** Run the checker alongside the site and the same pages gain an editor that compiles with *your* Lean and *your* Mathlib:

```sh
npm run dev    # the site
npm run lean   # the checker, in a second terminal
```

The page pings the checker on load. If it does not answer — which is the normal case on the published site — nothing appears and the playground link stays. So both modes are the same pages, with no separate build.

A proof containing `sorry` is reported as unsolved, not as compiling. That distinction is what makes the local mode a check rather than a convenience.

> The checker executes arbitrary Lean code, and Lean can do IO. It binds to `127.0.0.1` deliberately. Do not put it on a network you do not control.

## Practice

Fourteen katas under [`/practice/`](https://artem-x-meta.github.io/lean-learning/practice/): a statement with its proof replaced by `sorry`, and the hole is yours to remove. Each is reachable from a chapter already read, and each names which one.

They are not markdown. A kata is an entry in `src/data/katas.ts` pointing at two regions of the same name — the statement in `lean/DiveLean/Practice/Statements.lean` and the reference proof in `Solutions.lean`. Both files are in the library root, so `lake build` compiles them: **a kata that cannot be proved fails CI before anyone is asked to prove it.**

What the library build does *not* cover is the code a reader is handed, which is reassembled from fragments with its own imports and namespace. That is what the live suite checks — for every kata, twice:

```sh
npm run lean            # in one terminal
npm run verify:katas    # in another
```

The untouched skeleton must be **rejected** for still holding a hole, and the same skeleton with the reference proof in it must be **accepted**. It is not part of `npm test`: it needs a real Lean, and a suite that quietly skips itself is worse than one you have to ask for.

Progress is a mark in the browser and nothing else. With the checker running, that mark is set by the machine when your proof compiles; without it, you set it yourself. The page also keeps the statement it gave you and says so if your draft no longer contains it — otherwise "it compiles" could be true of a question nobody asked.

## The Lean project

```sh
cd lean
lake exe cache get   # prebuilt .olean files — without this a build takes hours
lake build           # verify every chapter
```

Mathlib is a dependency pinned in `lake-manifest.json`, not vendored: the repository holds one line, not gigabytes. The build output goes to `lean/.lake/` and is gitignored.

**Every chapter file must be imported by `lean/DiveLean.lean`.** That module is what `lake build` builds, so a file missing from it is never compiled — and a snippet from an uncompiled file would be unverified. `tests/content.test.ts` checks this, along with the existence of every region a page references.

## Checks

```sh
npm run check   # types
npm test        # content and cross-references
npm run build   # full site
```

Two workflows run on push: the site is built and deployed only after types and tests pass, and `lean/` is rebuilt whenever it changes. The Lean workflow is separate because a Mathlib build takes minutes and should not delay the site.

## Licence

MIT.
