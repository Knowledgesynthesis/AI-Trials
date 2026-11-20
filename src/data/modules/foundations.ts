import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, widget, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('foundations'),
  objectives: [
    'Explain what randomization guarantees — and what it does not.',
    'Distinguish sequence generation, allocation concealment and blinding, and the bias each one prevents.',
    'Choose between simple, blocked, stratified and minimisation schemes for a given trial.',
    'Explain why intention-to-treat protects the comparison and why per-protocol and as-treated analyses can mislead.',
    'Match parallel, crossover, factorial and cluster designs to the questions they can answer.',
  ],
  sections: [
    {
      id: 'why-randomize',
      title: 'Why randomize?',
      blocks: [
        text(md`
          Observational comparisons of treated and untreated patients are distorted by **confounding by indication**: clinicians give treatments to patients for reasons — severity, frailty, preference — that also affect outcome. Statistical adjustment can only remove confounders that were measured, measured well, and modelled correctly.

          Random allocation breaks the link between patient characteristics and treatment. Before any data are collected, the arms are **exchangeable**: the same distribution of every prognostic factor, measured or not, *in expectation*. Any difference in outcome is then due to treatment or to chance — and chance is exactly what the p-value and confidence interval quantify.
        `),
        callout(
          'key',
          'What randomization does and does not do',
          md`
            - **Does:** removes selection bias at the point of allocation; makes unmeasured confounders balanced in expectation; provides the probability model that justifies the test.
            - **Does not:** guarantee balance in *this* trial (small trials are often imbalanced by chance); protect against bias introduced *after* allocation (differential care, assessment, drop-out); make results generalisable to patients unlike those enrolled.
          `,
        ),
        callout(
          'myth',
          undefined,
          md`"Table 1 shows a significant difference in age (p = 0.03), so randomization failed." Testing baseline differences tests a null hypothesis known to be true — 1 in 20 such tests will be "significant" by design. CONSORT advises against these tests. What matters is whether a factor is **prognostic**; strong prognostic factors should be pre-specified for adjustment in the analysis, whatever Table 1 shows.`,
        ),
        check(
          q(
            'f-c1',
            'A 60-patient trial randomizes by coin flip. By chance, 21 of 30 patients in the treatment arm have mild disease versus 12 of 30 in control. What is the best response?',
            [
              right('Report it; rely on pre-specified adjustment for disease severity, which is strongly prognostic.', 'Chance imbalance does not make the trial invalid, but adjusting for a pre-specified strong prognostic factor restores precision and addresses the imbalance transparently.'),
              wrong('Re-randomize the trial to achieve balance.', 'Re-randomizing after seeing baseline data destroys the randomization guarantee and is not acceptable.'),
              wrong('Declare that randomization failed and analyse as an observational study.', 'Randomization did not "fail" — chance imbalance is an expected property of small randomized trials and is reflected in the uncertainty.'),
              wrong('Drop the 9 excess mild patients from the treatment arm.', 'Post-randomization exclusion based on characteristics re-introduces selection bias.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'concealment-blinding',
      title: 'Sequence, concealment and blinding: three different protections',
      blocks: [
        text(md`
          | Safeguard | Protects | When | Failure looks like |
          |---|---|---|---|
          | **Random sequence generation** | Against systematic allocation | Before enrolment | Alternation, date of birth, clinician choice |
          | **Allocation concealment** | Against *selection bias*: steering patients into arms | Up to the moment of assignment | Open lists, translucent envelopes, predictable blocks |
          | **Blinding (masking)** | Against *performance* and *detection* bias | After assignment | Unblinded assessors of subjective outcomes; differential co-interventions |

          Concealment is **always possible**, even when blinding is not (surgery vs medicine, behavioural interventions). Use a central web- or phone-based system that reveals the assignment only after the patient is irrevocably enrolled.
        `),
        callout(
          'evidence',
          'How much bias?',
          md`
            - Across 250 trials in 33 meta-analyses, **inadequate concealment** was associated with odds ratios exaggerated by ~41% (unclear concealment: ~30%) (Schulz et al., *JAMA* 1995).
            - Lack of blinding and inadequate concealment exaggerate effects mainly for **subjective outcomes**; for all-cause mortality the bias was negligible (Wood et al., *BMJ* 2008; confirmed by Savović et al., *Ann Intern Med* 2012).
          `,
        ),
        text(md`
          **Say who was blinded.** "Double-blind" is used inconsistently; CONSORT 2025 asks trials to state which groups were masked — participants, care providers, outcome assessors, data analysts. When participants and clinicians cannot be blinded, a **PROBE** design (prospective, randomized, open, blinded end-point) with centrally adjudicated, objective endpoints recovers much of the protection.
        `),
        lab('/labs/randomization', 'Randomization lab', 'See why fixed blocks of 4 let an unblinded recruiter guess two-thirds of assignments, and what random block sizes and minimisation change.'),
      ],
    },
    {
      id: 'schemes',
      title: 'Choosing a randomization scheme',
      blocks: [
        text(md`
          - **Simple randomization** — each patient independently 1:1. Unpredictable. With $n$ patients the imbalance $|n_A - n_B|$ has SD $\approx \sqrt{n}$: about ±10 at $n = 100$, trivial at $n = 1000$.
          - **Permuted blocks** — within each block of size $2b$, exactly $b$ to each arm. Guarantees near-equal numbers throughout (important for interim analyses and seasonal effects) but the last assignments of each block are predictable. **Vary block size randomly** and keep sizes from sites.
          - **Stratified permuted blocks** — separate block sequences within strata (centre, disease stage). Balances the stratification factors. With many factors the number of strata explodes and many remain half-filled; limit to centre plus 1–3 strong prognostic factors.
          - **Minimisation** (Pocock–Simon) — assigns each patient to the arm that minimises overall imbalance across several factors, with a random element (e.g. probability 0.8). Excellent balance in small trials; accepted by ICH E9 and EMA, ideally run centrally because it is more predictable.
          - **Response-adaptive randomization** — changes probabilities based on outcomes; a different tool with different trade-offs (Module 7).
        `),
        callout('practice', undefined, 'Whatever scheme you use, **analyse with the stratification or minimisation factors as covariates**. Ignoring them makes standard errors too large and tests conservative (EMA 2015; FDA 2023).'),
        check(
          q(
            'f-c2',
            'A 120-patient, open-label, multicentre surgical trial must balance centre, age group and diabetes. Which allocation approach is most defensible?',
            [
              right('Central minimisation on centre, age group and diabetes with a random element.', 'Minimisation balances several factors well in a small trial; central administration and a random element limit predictability in an open-label setting.'),
              wrong('Simple randomization; it is the most unpredictable.', 'Unpredictable, but with 120 patients and three factors, chance imbalance is likely.'),
              wrong('Permuted blocks of fixed size 4 at each site.', 'Fixed blocks are predictable when the trial is open-label, inviting selection bias.'),
              wrong('Alternate assignment by order of enrolment.', 'Alternation is not random and is fully predictable.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'itt',
      title: 'Analyse as randomized',
      blocks: [
        text(md`
          **Intention-to-treat (ITT)**: analyse every randomized patient in the arm to which they were assigned. It preserves the comparability that randomization created and answers the question "what happens when we decide to use this treatment?".

          **Per-protocol** analyses keep only adherent patients; **as-treated** analyses regroup patients by what they actually received. Both compare groups that are no longer randomized: people who adhere differ from those who do not in ways that affect outcome.
        `),
        callout(
          'evidence',
          'The healthy-adherer effect',
          'In the Coronary Drug Project, men who took ≥ 80% of their **placebo** had 5-year mortality of 15.1% versus 28.2% in poor adherers to placebo (*NEJM* 1980). Adherence predicts outcome even when the pill is inert — so per-protocol comparisons can manufacture or hide effects.',
        ),
        text(md`
          In practice ITT is threatened by missing outcome data, and "modified ITT" is used for many inconsistent definitions. ICH E9(R1) reframes the issue: decide what to do about treatment discontinuation, rescue medication and death **as part of the question** (the estimand), then choose an analysis and missing-data strategy consistent with it. Module 2 covers this.
        `),
      ],
    },
    {
      id: 'designs',
      title: 'Design families and phases',
      blocks: [
        text(md`
          | Design | Use when | Key requirement | Typical pitfall |
          |---|---|---|---|
          | **Parallel group** | Most questions | — | — |
          | **Crossover** | Chronic, stable condition; rapid, reversible effect | Washout; no carry-over; outcome measurable each period | Used for curable or fatal conditions; drop-outs lose both periods |
          | **Factorial (2×2)** | Two treatments, little expected interaction | Interaction plausibly small | Power lost if interaction exists; report both margins and the interaction |
          | **Cluster** | Intervention delivered to groups; contamination risk | Inflate by design effect $1 + (m-1)\,\text{ICC}$; account for clustering in analysis | Too few clusters; recruitment bias after cluster allocation |
          | **Pragmatic vs explanatory** | Effectiveness in practice vs efficacy under ideal conditions | Match design choices to the purpose (PRECIS-2) | Explanatory design claimed to show real-world effectiveness |

          **Phases** describe purpose, not design: phase I (safety, dose), II (activity, dose selection), III (confirmatory effectiveness and safety), IV (post-marketing). Seamless and platform designs blur these boundaries (Module 7).
        `),
        widget('design-effect'),
      ],
    },
  ],
  quiz: [
    q('f-q1', 'What does randomization guarantee?', [
      right('That known and unknown prognostic factors are balanced in expectation, so outcome differences reflect treatment or chance.', 'This is the core guarantee. It is probabilistic, not a promise of balance in every trial.'),
      wrong('That every prognostic factor is balanced in this trial.', 'Chance imbalance is common in small trials; randomization balances in expectation only.'),
      wrong('That the results apply to all patients with the condition.', 'Generalisability depends on who was enrolled, not on random allocation.'),
      wrong('That blinding is unnecessary.', 'Randomization protects allocation; blinding protects against bias after allocation. They are complementary.'),
    ]),
    q('f-q2', 'In a surgery-versus-physiotherapy trial, surgeons and patients cannot be blinded. Which protection against bias is still fully achievable?', [
      right('Allocation concealment until the patient is enrolled, plus blinded outcome assessment.', 'Concealment is always possible and prevents selection bias; independent blinded assessors reduce detection bias.'),
      wrong('None; open-label trials are inherently biased and uninterpretable.', 'Open-label trials can be highly informative, especially with objective or blinded-assessed outcomes.'),
      wrong('Double-blinding by using sham surgery in all cases.', 'Sham surgery is sometimes possible but raises ethical issues and is not the general answer.'),
      wrong('Allowing surgeons to choose suitable patients for each arm.', 'That is selection bias — the very thing concealment prevents.'),
    ]),
    q('f-q3', 'An open-label trial uses permuted blocks of fixed size 4 at each site. What is the main threat?', [
      right('Recruiters can predict upcoming assignments and selectively enrol patients.', 'At least every 4th assignment is fully determined; often the 3rd too. Random block sizes reduce this.'),
      wrong('The arms may become unequal in size.', 'Fixed blocks guarantee near-equal sizes — that is their strength.'),
      wrong('Type I error is inflated.', 'Predictability causes selection bias, not a direct error-rate problem.'),
      wrong('The analysis cannot adjust for site.', 'Site can and should be adjusted for.'),
    ]),
    q('f-q4', 'Why can a per-protocol analysis mislead in a superiority trial?', [
      right('Adherent and non-adherent patients differ prognostically, so excluding non-adherers breaks randomized comparability.', 'The Coronary Drug Project showed adherence to placebo itself predicted much lower mortality.'),
      wrong('It always underestimates the treatment effect.', 'The bias can go in either direction.'),
      wrong('It has lower power than ITT, but is otherwise unbiased.', 'The problem is bias, not only power.'),
      wrong('Regulators forbid it.', 'Per-protocol analyses are often requested as supportive analyses; the issue is interpretation.'),
    ]),
    q('f-q5', 'Which question suits a crossover design?', [
      right('Does drug A lower blood pressure more than drug B in stable hypertension, measured after 4 weeks on each?', 'Chronic stable condition, quick reversible effect, outcome measurable in each period.'),
      wrong('Does drug A reduce 1-year mortality after myocardial infarction?', 'Death is irreversible; there is no second period.'),
      wrong('Does a 7-day antibiotic course cure pneumonia more often than a 5-day course?', 'Cure is not reversible, so the condition differs in period 2.'),
      wrong('Does a school-based programme reduce childhood obesity?', 'Group-delivered interventions with contamination suggest a cluster design.'),
    ]),
    q('f-q6', 'A cluster trial will enrol 50 patients per practice; the ICC is 0.02. Compared with an individually randomized trial, roughly how many patients are needed?', [
      right('About twice as many (design effect ≈ 1.98).', '1 + (50 − 1) × 0.02 = 1.98.'),
      wrong('About the same; an ICC of 0.02 is negligible.', 'Small ICCs matter when clusters are large.'),
      wrong('About 50 times as many.', 'That would be the case only if ICC = 1.'),
      wrong('Fewer, because clustering reduces variability.', 'Clustering increases the variance of the treatment effect estimate.'),
    ]),
    q('f-q7', 'A 2×2 factorial trial tests drug A and drug B. When is its efficiency (two questions for the price of one) real?', [
      right('When the effect of A does not depend on whether B is given (little interaction).', 'Each margin then uses all patients. With interaction, the margins answer an averaged question and power for each comparison drops.'),
      wrong('When A and B are given at the same time of day.', 'Timing is irrelevant to the statistical efficiency argument.'),
      wrong('Always; factorial trials are always more efficient.', 'Interaction undermines the efficiency and interpretation.'),
      wrong('Only when the outcome is binary.', 'Outcome type does not determine factorial efficiency.'),
    ]),
    q('f-q8', 'Which statement about "double-blind" is most accurate under CONSORT 2025?', [
      right('Trials should report which groups were blinded (participants, care providers, outcome assessors, analysts) rather than rely on the label.', 'The term is used inconsistently; explicit reporting is required.'),
      wrong('Double-blind always means participants and outcome assessors.', 'Surveys show the term is interpreted in many different ways.'),
      wrong('Blinding status need not be reported if randomization was concealed.', 'Concealment and blinding are separate and both must be reported.'),
      wrong('Only triple-blind trials are acceptable for publication.', 'There is no such requirement.'),
    ]),
  ],
  sources: ['schulz1995', 'wood2008', 'savovic2012', 'schulzgrimes2002', 'cdp1980', 'ich-e9', 'ich-e9r1', 'ema-covariates', 'fda-covariates', 'consort2025', 'consort-cluster', 'senn2002', 'precis2'],
}

export default m
