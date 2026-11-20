import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, widget, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('non-inferiority'),
  objectives: [
    'Explain when a non-inferiority (NI) design is justified.',
    'Derive M1 and M2 from historical evidence and state the constancy and assay-sensitivity assumptions.',
    'Classify an NI result from its confidence interval, including the "non-inferior yet worse" case.',
    'Recognise NI-specific pitfalls: sloppiness bias, biocreep and scale choice; know how equivalence differs.',
  ],
  sections: [
    {
      id: 'why-ni',
      title: 'Why non-inferiority?',
      blocks: [
        text(md`
          When an effective treatment exists, a placebo-controlled trial is often unethical. A new treatment may still be valuable if it is **not unacceptably worse** on efficacy while being safer, simpler, cheaper or better tolerated. An NI trial tests

          $$H_0: \;\theta_{\text{new}} - \theta_{\text{control}} \le -M \quad\text{vs}\quad H_1: \;\theta_{\text{new}} - \theta_{\text{control}} > -M$$

          (higher = better), using the lower limit of a two-sided 95% CI (equivalently one-sided α = 0.025).

          The logic has a hidden third arm: the trial must convince you that the new drug **beats placebo**, although placebo was never randomized. That inference rests entirely on external evidence about the control.
        `),
      ],
    },
    {
      id: 'margin',
      title: 'Setting the margin',
      blocks: [
        text(md`
          FDA's 2016 guidance defines two margins:

          - **M1** — the effect of the active control versus placebo that can reliably be assumed *in this trial*. Usually the conservative limit of the 95% CI from a meta-analysis of historical placebo-controlled trials, **discounted** if populations, background care or endpoints have changed (the **constancy assumption**).
          - **M2** — the largest loss of the control's effect that is clinically acceptable; typically $M_2 = (1-f)\,M_1$ with $f \ge 0.5$ (preserve at least half of the effect).

          Showing NI against M1 implies the new drug is better than placebo; showing NI against M2 implies it retains a clinically acceptable fraction of the control's benefit.
        `),
        callout(
          'example',
          'From history to margin',
          md`A meta-analysis shows the active control cures 20 percentage points more patients than placebo (95% CI 12 to 28). Conservatively, M1 = 12 points. Preserving 50% gives M2 = 6 points. The new trial must show the lower 95% limit of (new − control) above −6 points.`,
        ),
        callout(
          'key',
          'Assay sensitivity',
          'An NI trial can "succeed" even if neither drug works in the trial setting — e.g. wrong population, low adherence, insensitive endpoint. Assay sensitivity cannot be checked within a two-arm NI trial; it is argued from the similarity to historical trials and from trial quality (ICH E10). Where ethical, a three-arm design with placebo settles it.',
        ),
        lab('/labs/non-inferiority', 'Non-inferiority margin lab', 'Derive M1 and M2 from historical evidence, add a constancy discount, and see how your trial result is classified — plus the synthesis-method cross-check.'),
      ],
    },
    {
      id: 'reading',
      title: 'Reading the confidence interval',
      blocks: [
        widget('ni-classifier'),
        text(md`
          - CI lower limit above −M → **non-inferior**.
          - Entire CI above 0 → **superior** as well. Switching from NI to superiority is acceptable if pre-specified in a hierarchy (test NI first, then superiority).
          - CI between −M and 0, excluding 0 → **non-inferior yet statistically worse**. Both statements are true; report both.
          - CI crossing −M → **inconclusive**. A failed *superiority* trial cannot be rescued post hoc by declaring NI with a margin chosen after seeing the data.
        `),
        check(
          q(
            'ni-c1',
            'M = 10 percentage points. The result is −4 points (95% CI −7.5 to −0.5). What do you conclude?',
            [
              right('Non-inferior, but statistically worse than control.', 'The lower limit −7.5 is above −10, and the upper limit −0.5 is below 0.'),
              wrong('Inferior.', 'Inferior would require the whole CI below −10.'),
              wrong('Inconclusive.', 'The CI does not cross −M.'),
              wrong('Equivalent.', 'Equivalence needs a two-sided margin and usually a 90% CI within ±M.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'pitfalls',
      title: 'NI-specific pitfalls',
      blocks: [
        text(md`
          - **Sloppiness bias.** Non-adherence, crossover, misclassification and poor measurement push both arms toward each other — toward *apparent* NI. Unlike superiority trials, an ITT-style analysis is not automatically conservative. Specify the estimand clearly, minimise intercurrent events, and check that conclusions agree across supportive analyses (CONSORT NI extension, 2012).
          - **Biocreep.** If drug B is shown NI to A, then C NI to B, and so on, each step can lose up to M of effect, drifting toward placebo.
          - **Scale.** A margin on the absolute scale (risk difference) and one on the relative scale (risk ratio) behave differently when the control event rate differs from what was assumed. State the scale and justify it; check robustness if event rates surprise you.
          - **Equivalence** (e.g. bioequivalence, biosimilars) needs both limits: two one-sided tests (TOST), i.e. the 90% CI lies within (−M, +M) for α = 0.05.
        `),
      ],
    },
  ],
  quiz: [
    q('ni-q1', 'What does M1 represent?', [
      right('The effect of the active control versus placebo that can reliably be assumed in the new trial.', 'It is the whole control effect, estimated conservatively from history.'),
      wrong('The largest clinically acceptable loss of effect.', 'That is M2.'),
      wrong('The minimal clinically important difference for superiority.', 'NI margins are derived differently.'),
      wrong('The expected difference between new and control drugs.', 'That is an input to the sample size, not the margin.'),
    ]),
    q('ni-q2', 'Why can poor adherence make an NI trial falsely positive?', [
      right('It dilutes differences between arms, pushing the estimate toward zero — toward apparent non-inferiority.', 'Sloppiness benefits the NI hypothesis.'),
      wrong('It reduces the sample size, so the CI is narrower.', 'Poor adherence does not narrow the CI.'),
      wrong('It increases the margin.', 'The margin is fixed in advance.'),
      wrong('It cannot; poor adherence always biases toward inferiority.', 'The opposite is the concern.'),
    ]),
    q('ni-q3', 'Margin 6 points. Result +1 point (95% CI −3 to +5). Classification?', [
      right('Non-inferior; superiority not shown.', 'Lower limit −3 > −6; the CI includes 0.'),
      wrong('Superior.', 'Superiority needs the whole CI above 0.'),
      wrong('Inconclusive.', 'The CI does not cross −6.'),
      wrong('Inferior.', 'Nothing supports inferiority.'),
    ]),
    q('ni-q4', 'What is the constancy assumption?', [
      right('That the control drug\'s effect versus placebo in the new trial equals its effect in the historical trials used to set M1.', 'Changes in population, care or endpoints undermine it.'),
      wrong('That both arms have the same variance.', 'Unrelated.'),
      wrong('That the new drug\'s effect is constant over time.', 'It concerns the control drug\'s effect.'),
      wrong('That the margin is the same in every trial.', 'Margins are trial-specific.'),
    ]),
    q('ni-q5', 'A superiority trial misses significance (difference −1%, 95% CI −6% to +4%). The authors now declare non-inferiority with a 7% margin. What is wrong?', [
      right('The margin was chosen after seeing the data and was never justified from historical evidence.', 'Post-hoc NI claims are not credible.'),
      wrong('Nothing; any trial can be reinterpreted as NI.', 'NI must be pre-specified with a justified margin and appropriate design.'),
      wrong('The CI is too narrow for NI.', 'Width is not the problem.'),
      wrong('NI trials need one-sided 5% α.', 'Standard is one-sided 2.5%.'),
    ]),
    q('ni-q6', 'What is "biocreep"?', [
      right('Successive NI trials, each against the previous NI drug, gradually eroding efficacy toward placebo.', 'Each step may lose up to M.'),
      wrong('Gradual increase in sample size during a trial.', 'That is sample-size re-estimation.'),
      wrong('Bias from biological variability.', 'Not the meaning.'),
      wrong('Drift in assay measurement over time.', 'Not the meaning.'),
    ]),
    q('ni-q7', 'How is equivalence typically demonstrated at α = 0.05?', [
      right('Two one-sided tests: the 90% CI must lie entirely within (−M, +M).', 'TOST at 5% each corresponds to a 90% CI.'),
      wrong('A non-significant superiority test.', 'Lack of significance is not equivalence.'),
      wrong('The 95% CI must include zero.', 'Including zero says nothing about closeness.'),
      wrong('The point estimate must be within ±M.', 'Uncertainty must be accounted for.'),
    ]),
  ],
  sources: ['fda-ni', 'consort-ni', 'ich-e10', 'ich-e9r1'],
}

export default m
