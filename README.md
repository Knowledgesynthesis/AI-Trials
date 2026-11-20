# AI Trials — modern clinical trial methods, learned by doing

An interactive, evidence-based course and toolkit on how modern clinical trials are designed, monitored and read: randomization, estimands, power, multiplicity, non-inferiority, group-sequential and adaptive designs, Bayesian methods, and AI/ML in trials.

**Live:** https://ai-trials.vercel.app

## What's inside

**11 modules** (≈ 6.5 h), each with learning objectives, worked examples, misconceptions, real-trial evidence, inline retrieval checks, live widgets, and an 8-question mastery check (80% to pass) where *every* option explains why it is right or wrong.

| # | Module | Level |
|---|---|---|
| 1 | Randomized trials: the logic of a fair comparison | Core |
| 2 | Estimands (ICH E9(R1)) | Core |
| 3 | Error, power and sample size | Core |
| 4 | Endpoints, multiplicity and subgroups | Core |
| 5 | Non-inferiority and equivalence | Intermediate |
| 6 | Interim monitoring and group-sequential designs | Intermediate |
| 7 | Adaptive designs and master protocols | Advanced |
| 8 | Bayesian methods in trials | Advanced |
| 9 | AI and machine learning in trials | Advanced |
| 10 | Ethics, oversight and regulation | Core |
| 11 | Capstone: appraising a modern trial | Advanced |

**10 labs** — working tools, not illustrations:

- **Sample size & power studio** — continuous, binary, time-to-event; superiority and NI; formula with your numbers; verified by simulation.
- **Randomization lab** — simple, blocked, stratified and minimisation schemes on balance *and* predictability.
- **Estimand builder** — five attributes, a strategy per intercurrent event, and the consequences for data collection and analysis.
- **Multiplicity & subgroups** — Bonferroni/Holm/Hochberg/fixed-sequence on your p-values; a subgroup "lottery" under a uniform true effect.
- **Non-inferiority margin lab** — M1/M2 from historical evidence, classification of results, synthesis-method check.
- **Group-sequential monitor** — exact α-spending boundaries, futility, expected N, a step-through DMC simulator, early-stopping bias.
- **Response-adaptive randomization simulator** — RAR vs 1:1 over thousands of trials, including time-trend bias.
- **Bayesian analysis lab** — prior × likelihood → posterior, two-arm decisions with prior sensitivity, Type I error of Bayesian monitoring.
- **AI enrichment & fairness lab** — sample size vs screening vs representation vs calibration; covariate adjustment as the alternative.
- **Protocol design review** — describe a trial, get an itemised methodological review with sources; export as Markdown.

Plus 12 landmark-trial cases, an 8-case ethics casebook, a randomized final exam with per-module feedback, a 90-term glossary and a source registry with regulatory status.

## Accuracy

The statistics engine (`src/lib/stats`) is implemented from first principles and **tested against published reference values**:

- Normal, gamma, beta and incomplete-beta functions to ~1e-12 relative accuracy (checked against mpmath/scipy).
- Exact P(p_T > p_C) for Beta posteriors (closed form), validated by Monte Carlo.
- Group-sequential boundaries by recursive numerical integration, reproducing Pocock (1977) and O'Brien–Fleming (1979) constants, the Lan–DeMets OBF boundaries 4.333/2.963/2.359/2.014, Jennison & Turnbull inflation factors (1.207, 1.026), and Armitage's repeated-testing error rates (8.3%, 10.7%, 14.2%, 19.3%).
- Sample sizes matching textbook values (63/arm for δ = 0.5 SD; 97/107 per arm for 40% vs 60%; 508 events for HR 0.75).
- Content integrity tests: every question has exactly one correct option with an explanation for each option; every citation and internal link resolves.

Regulatory statements reflect guidance status as of **November 2026** (e.g. FDA Bayesian draft guidance Jan 2026; ICH E20 draft; ICH E6(R3); FDA–EMA AI principles Jan 2026; CONSORT/SPIRIT 2025). Drafts are labelled as drafts.

## Development

Requires Node ≥ 22.22.

```bash
npm install
npm run dev        # local dev server
npm test           # unit + content tests (Vitest)
npm run lint       # ESLint (flat config, React Compiler rules)
npm run typecheck  # TypeScript project references
npm run build      # production build + PWA service worker
```

Stack: React 19, React Router 8, Vite 8, TypeScript 6, Tailwind CSS 4, Recharts 3, Zustand 5 (progress persisted locally), KaTeX, Vitest 5, vite-plugin-pwa (offline). Heavy simulations run in a Web Worker. Deployed on Vercel with SPA rewrites (`vercel.json`).

```
src/
  lib/stats/        statistics engine + tests
  lib/designReview  protocol review rules
  workers/          off-main-thread simulations
  data/modules/     course content (one file per module)
  data/             curriculum, labs, references, glossary, cases, ethics cases
  pages/, pages/labs/
  components/       UI kit, charts, quiz, markdown/KaTeX renderer, widgets
```

## License

MIT. All patient data in the labs are synthetic.
