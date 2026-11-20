import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('estimands'),
  objectives: [
    'State the five attributes of an estimand and write one for a real trial.',
    'Identify intercurrent events and choose among the five ICH E9(R1) strategies.',
    'Distinguish intercurrent events from missing data.',
    'Check that estimator, missing-data handling and sensitivity analyses target the same estimand.',
  ],
  sections: [
    {
      id: 'ambiguity',
      title: '"The treatment effect" is ambiguous',
      blocks: [
        text(md`
          A diabetes trial compares a new drug with placebo on HbA1c at week 26. During follow-up, 25% of placebo patients and 8% of drug patients start **rescue medication** because glucose is too high. What is "the effect of the drug"?

          1. The effect of *being assigned* the drug, whatever else happens (rescue included)?
          2. The effect if rescue medication had *not been available*?
          3. The effect on a composite: "HbA1c < 7% **without** needing rescue"?
          4. The effect while patients were on randomized treatment only?

          These are four different numbers answering four different questions. Before ICH E9(R1), trials often chose one implicitly via the analysis (e.g. "last observation carried forward" or "censor at rescue") and readers could not tell which.
        `),
        callout(
          'regulatory',
          'ICH E9(R1), 2019',
          md`An **estimand** is "a precise description of the treatment effect reflecting the clinical question posed by the trial objective". It has five attributes:
          1. **Population** — patients targeted by the question
          2. **Treatment** conditions compared (including any background or rescue therapy that is part of the strategy)
          3. **Variable** (endpoint) for each patient
          4. **Intercurrent events** and how each is handled
          5. **Population-level summary** (difference in means, risk ratio, hazard ratio…)`,
        ),
      ],
    },
    {
      id: 'strategies',
      title: 'Intercurrent events and the five strategies',
      blocks: [
        text(md`
          **Intercurrent events (ICEs)** occur after treatment starts and affect either the interpretation or the existence of the measurements: discontinuation, switching, rescue medication, death.

          | Strategy | The question it answers | Example |
          |---|---|---|
          | **Treatment policy** | Effect of the treatment *strategy*, whatever happens after the ICE | HbA1c at week 26 regardless of rescue |
          | **Hypothetical** | Effect in a clearly defined scenario where the ICE would not occur | HbA1c if rescue had not been available |
          | **Composite variable** | ICE is informative about outcome and becomes part of the endpoint | "Responder" = HbA1c < 7% *and* no rescue |
          | **While on treatment** | Response before the ICE | Symptom score while on drug; outcome while alive |
          | **Principal stratum** | Effect in the subpopulation in which the ICE would not occur | Patients who would tolerate either drug |
        `),
        callout(
          'pitfall',
          'Death is special',
          'There is no outcome after death, so "treatment policy" cannot apply to a quality-of-life score, and "what if patients had not died" is rarely a meaningful scenario. Use a composite (e.g. death = worst rank, days alive and free of hospital) or a while-alive strategy — and make sure the arms\' mortality is reported alongside.',
        ),
        check(
          q(
            'e-c1',
            'In a depression trial, which estimand matches the regulator\'s question "how much better off are patients who are *prescribed* this drug, including those who stop it?"',
            [
              right('Treatment policy for discontinuation, with outcome data collected after patients stop the drug.', 'Prescribing decisions are about strategies; the effect includes whatever follows discontinuation.'),
              wrong('Hypothetical strategy assuming everyone stayed on drug.', 'That answers an efficacy question under perfect adherence, not the effect of prescribing.'),
              wrong('Principal stratum of patients who would adhere to either drug.', 'That subpopulation cannot be identified in practice.'),
              wrong('While-on-treatment average of scores before discontinuation.', 'That ignores what happens to patients who stop — the very patients the question includes.'),
            ],
          ),
        ),
        lab('/labs/estimands', 'Estimand builder', 'Pick a scenario, choose a strategy for each intercurrent event, and see the estimand statement plus the data and analysis it requires.'),
      ],
    },
    {
      id: 'estimators',
      title: 'From estimand to estimator and sensitivity analysis',
      blocks: [
        text(md`
          The estimand dictates the analysis, not the other way round:

          - **Treatment policy** needs outcome data *after* discontinuation. The design implication — keep following patients who stop treatment — is the most important consequence of E9(R1). Remaining missing data are imputed under assumptions consistent with the strategy (e.g. based on retrieved drop-outs or the reference arm), not by assuming patients stayed on drug.
          - **Hypothetical** strategies are usually estimated with mixed models or multiple imputation under *missing at random* given observed history — an untestable assumption.
          - **Composite** strategies use responder analyses, ranks (win ratio) or composite time-to-event endpoints.

          **Missing data are not intercurrent events.** A missed visit is a gap in data that *should* exist for the estimand; an intercurrent event changes what the data mean. Decide the ICE strategy first, then handle genuinely missing data.
        `),
        callout(
          'key',
          'Sensitivity vs supplementary analyses',
          md`
            - A **sensitivity analysis** targets the *same* estimand under different assumptions (e.g. tipping-point or δ-adjusted imputation showing how far missing outcomes would have to deviate to overturn the conclusion).
            - A **supplementary analysis** targets a *different* estimand (e.g. a per-protocol or hypothetical analysis alongside a treatment-policy primary). Useful, but it is not a test of robustness.
          `,
        ),
        check(
          q(
            'e-c2',
            'The primary estimand uses a treatment-policy strategy for discontinuation. The analysis is a mixed model fitted only to on-treatment data under MAR. What is the problem?',
            [
              right('The analysis implicitly targets a hypothetical "had they stayed on treatment" effect, not the stated estimand.', 'MAR on on-treatment data assumes discontinued patients behave like similar patients who stayed on drug — a hypothetical strategy.'),
              wrong('None; mixed models are unbiased under any missing-data mechanism.', 'Mixed models are valid under MAR, and here MAR imposes the wrong scenario.'),
              wrong('Mixed models cannot handle continuous endpoints.', 'They routinely do.'),
              wrong('The trial should switch to last-observation-carried-forward.', 'LOCF rests on implausible assumptions and does not target a clearly defined estimand.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'tte',
      title: 'Estimands with time-to-event and ordinal outcomes',
      blocks: [
        text(md`
          In oncology, crossover to the experimental drug after progression is an intercurrent event for overall survival. A **treatment-policy** OS estimand ("the effect of starting with drug X, allowing subsequent therapy as in practice") is the usual primary; a hypothetical "no switching" estimand requires methods such as inverse-probability-of-censoring weighting or rank-preserving structural failure time models, with strong assumptions.

          The **summary measure** is part of the estimand. Hazard ratios average over follow-up and are non-collapsible; when hazards are not proportional, a single HR does not describe "the" effect and has no simple causal interpretation (Hernán 2010). The difference in **restricted mean survival time** (RMST) or in survival at a clinically relevant landmark is an interpretable complement (Royston & Parmar 2013).
        `),
        callout(
          'example',
          'A complete estimand statement',
          '*In adults hospitalised with COVID-19 pneumonia requiring oxygen, the difference in mean days alive and free of respiratory support up to day 28 between usual care plus drug Z and usual care alone, where death before day 28 is incorporated in the variable as zero free days (composite strategy) and use of additional therapies is part of usual care (treatment policy).*',
        ),
      ],
    },
  ],
  quiz: [
    q('e-q1', 'Which attribute of an estimand specifies what to do about patients who start rescue medication?', [
      right('Intercurrent events and the strategy for each.', 'Rescue medication is a classic intercurrent event.'),
      wrong('Population.', 'The population describes who is studied, not post-randomization events.'),
      wrong('Population-level summary.', 'That is the summary measure (e.g. difference in means).'),
      wrong('Variable.', 'The variable can change under a composite strategy, but the decision itself belongs to attribute 4.'),
    ]),
    q('e-q2', 'What is the main *design* consequence of choosing a treatment-policy strategy for discontinuation?', [
      right('Continue collecting outcomes from patients after they stop randomized treatment.', 'Without post-discontinuation data the treatment-policy effect can only be estimated through strong assumptions.'),
      wrong('Withdraw patients from the study when they stop treatment.', 'That creates exactly the missing data the strategy cannot tolerate.'),
      wrong('Increase the sample size by the discontinuation rate and analyse completers.', 'Completers analysis targets a different, biased question.'),
      wrong('Impute discontinued patients\' outcomes as if they stayed on drug.', 'That targets a hypothetical estimand.'),
    ]),
    q('e-q3', 'A heart-failure trial measures quality of life at 12 months; 15% of patients die before then. Which handling is most defensible?', [
      right('A composite or while-alive strategy, reported together with mortality.', 'Death must be incorporated into the variable or the question restricted to time alive, with mortality shown so readers see the full picture.'),
      wrong('Hypothetical: quality of life had the patients not died.', 'Rarely clinically meaningful and impossible to verify.'),
      wrong('Treatment policy: use the 12-month score regardless.', 'There is no 12-month score for patients who died.'),
      wrong('Exclude patients who died.', 'Post-randomization exclusion breaks comparability and can hide harm.'),
    ]),
    q('e-q4', 'Which strategy changes the definition of the endpoint itself?', [
      right('Composite variable.', 'The intercurrent event becomes part of the outcome definition.'),
      wrong('Treatment policy.', 'The variable stays the same; the ICE is simply ignored for the analysis.'),
      wrong('Hypothetical.', 'The variable stays the same under a counterfactual scenario.'),
      wrong('Principal stratum.', 'This changes the population, not the variable.'),
    ]),
    q('e-q5', 'What is the key limitation of a principal-stratum estimand ("patients who would tolerate either drug")?', [
      right('Stratum membership is never observed, so estimation needs strong untestable assumptions and the population cannot be identified in practice.', 'We only see how a patient responds to the treatment they received.'),
      wrong('It requires twice the sample size.', 'The issue is identifiability, not size.'),
      wrong('It cannot be used with continuous outcomes.', 'It can, in principle, with any outcome type.'),
      wrong('It is forbidden by ICH E9(R1).', 'It is one of the five strategies described.'),
    ]),
    q('e-q6', 'A patient misses the week-12 visit but is still taking study drug. In estimand terms this is…', [
      right('Missing data — the value exists for the estimand but was not observed.', 'No intercurrent event has changed the meaning of the outcome.'),
      wrong('An intercurrent event requiring a hypothetical strategy.', 'A missed visit does not alter treatment or the meaning of the outcome.'),
      wrong('A reason to exclude the patient.', 'Excluding patients with missing visits risks bias.'),
      wrong('A protocol deviation that invalidates the trial.', 'Missing visits are expected and handled in the analysis.'),
    ]),
    q('e-q7', 'What distinguishes a sensitivity analysis from a supplementary analysis?', [
      right('A sensitivity analysis targets the same estimand under different assumptions; a supplementary analysis targets a different estimand.', 'This is the ICH E9(R1) distinction.'),
      wrong('Sensitivity analyses are pre-specified; supplementary ones are not.', 'Both should be pre-specified.'),
      wrong('They are synonyms.', 'E9(R1) separates them deliberately.'),
      wrong('Supplementary analyses are used only for safety.', 'Supplementary analyses are used for efficacy too.'),
    ]),
    q('e-q8', 'Why can a single hazard ratio be a problematic summary measure?', [
      right('Under non-proportional hazards it averages a changing effect, and hazard ratios are non-collapsible, complicating causal interpretation.', 'RMST or landmark differences are interpretable complements.'),
      wrong('Hazard ratios cannot be estimated with censoring.', 'Cox models handle censoring routinely.'),
      wrong('Regulators no longer accept hazard ratios.', 'HRs remain standard; the point is to interpret them correctly.'),
      wrong('Hazard ratios ignore the number of events.', 'Their precision depends directly on the number of events.'),
    ]),
  ],
  sources: ['ich-e9r1', 'hernan2010', 'royston2013', 'spirit2025', 'consort2025'],
}

export default m
