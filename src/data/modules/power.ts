import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, widget, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('power'),
  objectives: [
    'State correctly what a p-value and a confidence interval mean — and the common misreadings.',
    'Explain Type I and II error and the four levers of power.',
    'Compute and sanity-check sample sizes for continuous, binary and time-to-event endpoints.',
    'Interpret absolute and relative effect measures, including NNT, odds ratios and hazard ratios.',
    'Explain why underpowered trials exaggerate effects and why "not significant" is not "no effect".',
  ],
  sections: [
    {
      id: 'p-and-ci',
      title: 'What p-values and confidence intervals say',
      blocks: [
        text(md`
          A **p-value** is the probability, *computed assuming the null hypothesis and all model assumptions are true*, of data at least as extreme as those observed. It is not the probability that the null hypothesis is true, nor the probability the result occurred "by chance".

          A **95% confidence interval** is produced by a procedure that captures the true value in 95% of repeated trials. Practically, it is the range of effect sizes reasonably compatible with the data and model. Its width shows precision; where it sits relative to clinically important thresholds shows what the data can and cannot rule out.
        `),
        callout(
          'regulatory',
          'ASA statement (2016) — six principles, abridged',
          md`
            1. P-values indicate how incompatible the data are with a specified model.
            2. They do not measure the probability that the hypothesis is true, or that data arose by chance alone.
            3. Conclusions should not rest only on whether p crosses a threshold.
            4. Proper inference requires full reporting and transparency.
            5. A p-value does not measure the size or importance of an effect.
            6. By itself, a p-value is not a good measure of evidence.
          `,
        ),
        widget('pvalue-dance'),
        callout(
          'myth',
          undefined,
          '"p = 0.12, so the treatment has no effect." A non-significant result with a wide confidence interval (say, risk ratio 0.70 to 1.05) is *compatible with a 30% reduction* as well as a small harm. Absence of evidence is not evidence of absence; report the interval and, if needed, test equivalence or non-inferiority explicitly.',
        ),
      ],
    },
    {
      id: 'errors',
      title: 'Error rates and the four levers of power',
      blocks: [
        text(md`
          | | H₀ true (no effect) | H₁ true (effect = Δ) |
          |---|---|---|
          | **Reject H₀** | Type I error, probability α | Correct: power = 1 − β |
          | **Do not reject** | Correct | Type II error, probability β |

          Power is the probability of rejecting H₀ *if the true effect equals the effect you designed for*. It depends on four levers:

          1. **Effect size Δ** — power rises steeply with Δ; required N scales with $1/\Delta^2$.
          2. **Variability σ** (or event rate for binary outcomes; number of events for time-to-event).
          3. **Significance level α** — lowering α costs power.
          4. **Sample size n** — the only lever usually under your control.

          Confirmatory trials conventionally use two-sided α = 0.05 (equivalently one-sided 0.025) with 80–90% power.
        `),
        callout(
          'pitfall',
          'Post-hoc power',
          '"Observed power" computed from the trial\'s own estimate is a one-to-one transformation of the p-value and adds no information (Hoenig & Heisey 2001). After the trial, report the confidence interval; it already shows which effects are and are not ruled out.',
        ),
      ],
    },
    {
      id: 'sample-size',
      title: 'Sample size you can verify',
      blocks: [
        text(md`
          **Continuous outcome**, two arms 1:1, difference Δ, SD σ:
          $$n \text{ per arm} = \frac{2\sigma^2\,(z_{1-\alpha/2}+z_{1-\beta})^2}{\Delta^2}$$
          Δ = 5 mmHg, σ = 12, α = 0.05, power 80%: $2 \times 144 \times (1.960+0.842)^2 / 25 = 90.4$ → **91 per arm**.

          **Binary outcome**, risks $p_C$ and $p_E$, with $\bar p$ the average:
          $$n = \frac{\left[z_{1-\alpha/2}\sqrt{2\bar p(1-\bar p)} + z_{1-\beta}\sqrt{p_C(1-p_C)+p_E(1-p_E)}\right]^2}{(p_E-p_C)^2}$$
          40% vs 60%, α = 0.05, 80% power → **97 per arm** (107 with continuity correction).

          **Time-to-event**: power depends on the **number of events** $d$ (Schoenfeld 1983):
          $$d = \frac{4\,(z_{1-\alpha/2}+z_{1-\beta})^2}{(\ln \text{HR})^2}$$
          HR 0.75, α = 0.05, 90% power → **508 events**. Patients needed = events ÷ probability of an event during follow-up.

          Then inflate for loss to follow-up: $N/(1-\text{loss})$.
        `),
        callout(
          'practice',
          'Where the inputs come from',
          md`
            - **Δ**: the minimal clinically important difference (MCID) or the smallest effect that would change practice — not the effect you hope for, and not a pilot estimate (Kraemer 2006).
            - **σ / control event rate**: from recent comparable trials or registries; consider the upper confidence limit, since underestimating variability is the commonest cause of underpowered trials.
            - **Choosing Δ to fit the budget** ("sample size samba", Schulz & Grimes 2005) produces trials powered for implausible effects.
            - **Unequal allocation** costs efficiency: 2:1 needs ~12.5% more patients than 1:1 for the same power.
          `,
        ),
        lab('/labs/sample-size', 'Sample size & power studio', 'All three endpoint types, superiority and non-inferiority, with the formula filled in and a one-click simulation check.'),
        check(
          q(
            'p-c1',
            'A team planned 300 patients to detect a 10-point difference. A new MCID says 5 points matters. Keeping α and power fixed, roughly how many patients are needed?',
            [
              right('About 1,200.', 'N scales with 1/Δ²; halving Δ quadruples N.'),
              wrong('About 600.', 'N does not scale linearly with 1/Δ.'),
              wrong('About 300; the MCID does not change the sample size.', 'The design effect size directly drives N.'),
              wrong('About 425.', 'That would be scaling by √2.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'effect-measures',
      title: 'Absolute and relative effects',
      blocks: [
        text(md`
          A drug cuts 5-year stroke risk from 4% to 3%:

          | Measure | Value | Reads as |
          |---|---|---|
          | Absolute risk reduction | 1 percentage point | 1 fewer stroke per 100 treated |
          | Number needed to treat | 100 | Treat 100 people for 5 years to prevent one stroke |
          | Relative risk | 0.75 | 25% relative reduction |
          | Odds ratio | 0.74 | Close to RR because the outcome is rare |

          Relative effects tend to be more stable across baseline risks; **absolute effects drive decisions**, because benefit must be weighed against absolute harms and costs. Report both (CONSORT 2025).

          **Odds ratios exaggerate** relative effects when outcomes are common: 40% vs 30% is RR 0.75 but OR 0.64. Hazard ratios compare instantaneous event rates over time; see Module 2 on their interpretation.
        `),
      ],
    },
    {
      id: 'underpowered',
      title: 'Why underpowered trials mislead',
      blocks: [
        text(md`
          When power is low, the trials that happen to reach significance are those where chance inflated the estimate. Gelman & Carlin (2014) call this a **Type M (magnitude) error**; with very low power, even the sign can be wrong (**Type S**). Across neuroscience, median power was estimated at ~20% (Button et al. 2013), implying many published effects are exaggerated.

          Consequences for reading trials:
          - A small trial with a large, "significant" effect deserves scepticism, especially if early stopping or selective reporting is possible.
          - A small "negative" trial is usually **inconclusive**; look at the confidence interval.
          - Meta-analyses of adequately powered, prospectively registered trials are more reliable than any single small trial.
        `),
        check(
          q(
            'p-c2',
            'A 60-patient trial reports a 45% relative reduction in a symptom score, p = 0.04. The plausible effect from mechanism and prior trials is about 15%. What is the most likely explanation?',
            [
              right('The estimate is exaggerated by chance (a Type M error), typical of significant results from low-powered trials.', 'Conditional on significance, low-powered trials overestimate effects.'),
              wrong('The prior evidence was wrong; small trials are more precise.', 'Small trials are less precise, not more.'),
              wrong('The p-value proves the true effect is about 45%.', 'The p-value says nothing about effect size.'),
              wrong('The result must be a Type I error.', 'It may be a true effect overestimated; Type I error is not the only possibility.'),
            ],
          ),
        ),
      ],
    },
  ],
  quiz: [
    q('p-q1', 'A trial reports p = 0.03 for the primary endpoint. Which interpretation is correct?', [
      right('If there were no true difference and the model assumptions held, data at least this extreme would arise about 3% of the time.', 'This is the definition of the p-value.'),
      wrong('There is a 3% probability the null hypothesis is true.', 'p-values are computed assuming H₀; they cannot give its probability.'),
      wrong('There is a 97% probability the treatment works.', 'That would be a Bayesian posterior probability, which needs a prior.'),
      wrong('The effect is large and clinically important.', 'p-values do not measure effect size.'),
    ]),
    q('p-q2', 'A trial finds HR 0.86 (95% CI 0.70 to 1.05). What can you conclude?', [
      right('The data are compatible with anything from a 30% reduction to a 5% increase in hazard; the trial is inconclusive.', 'The interval spans clinically important benefit and small harm.'),
      wrong('The treatment has no effect.', 'The CI includes substantial benefit; this is absence of evidence.'),
      wrong('The treatment reduces risk by 14%.', 'That is the point estimate; the uncertainty is wide.'),
      wrong('The trial proves the treatment is non-inferior.', 'Non-inferiority needs a pre-specified margin and appropriate design.'),
    ]),
    q('p-q3', 'In a time-to-event trial, what primarily determines power?', [
      right('The number of events observed.', 'Schoenfeld: d = 4(z₁₋α/₂ + z₁₋β)² / (ln HR)² for 1:1 allocation.'),
      wrong('The number of patients enrolled, regardless of events.', 'Patients without events contribute little information about the HR.'),
      wrong('The length of the trial in months.', 'Follow-up matters only through the events it yields.'),
      wrong('The number of centres.', 'Centres affect logistics and generalisability, not power directly.'),
    ]),
    q('p-q4', 'After a non-significant trial, a reviewer asks for the "observed power". What is the best response?', [
      right('Observed power is a function of the p-value and adds nothing; report the confidence interval instead.', 'Hoenig & Heisey (2001) showed post-hoc power is uninformative.'),
      wrong('Compute it; if it is low, the null hypothesis is supported.', 'Low observed power follows automatically from a non-significant p-value.'),
      wrong('Compute it; if it is high, the treatment is ineffective.', 'Observed power is never high when p is large.'),
      wrong('Re-run the trial with the observed effect as Δ.', 'Using the observed effect for design repeats the pilot-study error.'),
    ]),
    q('p-q5', 'Mortality is 40% in the control arm and 30% in the treatment arm. Which statement is correct?', [
      right('RR = 0.75 and OR ≈ 0.64; the OR overstates the relative risk reduction because the outcome is common.', 'OR = (0.3/0.7)/(0.4/0.6) = 0.643.'),
      wrong('RR and OR are both 0.75.', 'They coincide only for rare outcomes.'),
      wrong('NNT = 30.', 'NNT = 1/0.10 = 10.'),
      wrong('The absolute risk reduction is 25%.', 'The ARR is 10 percentage points; 25% is the relative reduction.'),
    ]),
    q('p-q6', 'With total N fixed, how does 2:1 allocation compare with 1:1?', [
      right('Lower power: 2:1 needs about 12.5% more patients for the same power.', 'Variance factor (1+k)²/(4k) = 9/8 for k = 2.'),
      wrong('Higher power, because more patients get the active drug.', 'Power depends on the precision of the difference, maximised by equal allocation.'),
      wrong('Identical power.', 'Unequal allocation always loses some efficiency.'),
      wrong('It doubles the required sample size.', 'The loss is about 12.5%, not 100%.'),
    ]),
    q('p-q7', 'Which choice of Δ for a confirmatory trial is most defensible?', [
      right('The smallest effect that would change clinical practice (MCID), justified from evidence.', 'This protects against designing for unrealistically large effects.'),
      wrong('The effect observed in a 30-patient pilot.', 'Pilot estimates are imprecise and often inflated.'),
      wrong('Whatever effect makes the affordable N give 80% power.', 'This is the "sample size samba".'),
      wrong('Twice the MCID, to be safe.', 'Designing for a larger effect makes the trial too small for the MCID.'),
    ]),
    q('p-q8', 'Why are statistically significant results from underpowered trials often misleading?', [
      right('Conditional on significance, estimates are systematically too large (Type M error).', 'Only the lucky overestimates cross the threshold.'),
      wrong('Because significance is impossible with low power.', 'It is possible, just less likely — and then exaggerated.'),
      wrong('Because the p-value is always wrong in small trials.', 'p-values are valid; the selection of significant results causes the bias.'),
      wrong('Because small trials violate randomization.', 'Randomization is independent of sample size.'),
    ]),
  ],
  sources: ['asa2016', 'greenland2016', 'hoenig2001', 'schoenfeld1983', 'kraemer2006', 'schulz2005samba', 'gelman2014', 'button2013', 'consort2025'],
}

export default m
