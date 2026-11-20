import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('adaptive'),
  objectives: [
    'Define an adaptive design and state the three conditions regulators require.',
    'Distinguish blinded from unblinded sample-size re-estimation and explain how α is preserved.',
    'Describe arm-dropping (MAMS), seamless, enrichment and model-based dose-finding designs.',
    'Explain basket, umbrella and platform trials, with the lessons of RECOVERY, I-SPY 2 and STAMPEDE.',
    'Weigh the evidence for and against response-adaptive randomization.',
  ],
  sections: [
    {
      id: 'what',
      title: 'What makes a design adaptive — and acceptable',
      blocks: [
        text(md`
          FDA (2019) defines an adaptive design as one that allows **prospectively planned modifications** to one or more aspects of the trial based on accumulating data from subjects in the trial. Group-sequential designs (Module 6) are the simplest example.

          Three conditions run through FDA's guidance and the ICH E20 draft (2025):
          1. **Control of erroneous conclusions** — Type I error (and, for Bayesian designs, the relevant operating characteristics) must be controlled across the adaptation, shown analytically or by simulation.
          2. **Reliable estimation** — adaptation can bias naive estimates; plan bias-adjusted estimates or show the bias is small.
          3. **Trial integrity** — limit who sees interim results; pre-specify the rules; firewall the sponsor.
        `),
        callout(
          'myth',
          undefined,
          '"Adaptive" means we can change the design if things look bad. **Unplanned** data-driven changes are not adaptive designs; they are protocol amendments with unknown error properties. Adaptations must be specified — what can change, when, according to which rule — before the data are seen.',
        ),
      ],
    },
    {
      id: 'ssr',
      title: 'Sample-size re-estimation',
      blocks: [
        text(md`
          **Blinded SSR** re-estimates a nuisance parameter (pooled SD, overall event rate) without unblinding treatment groups and recalculates N. It has negligible effect on Type I error and is widely accepted.

          **Unblinded SSR** uses the interim treatment effect, so naive final tests can inflate α. Valid approaches pre-specify a combination rule. The **Cui–Hung–Wang** weighted statistic uses fixed weights based on the *planned* information split $t$:
          $$Z = \sqrt{t}\,Z_1 + \sqrt{1-t}\,Z_2$$
          where $Z_2$ uses only post-interim patients — preserving α whatever N becomes. The **promising-zone** approach (Mehta & Pocock 2011) increases N only when conditional power falls in a pre-specified intermediate range.

          Trade-off: increasing N when the interim effect is modest buys power for smaller effects, at the cost of revealing information about the interim result through the size change. Keep the rule confidential to the DMC and independent statisticians.
        `),
      ],
    },
    {
      id: 'selection',
      title: 'Selection designs: arms, doses and populations',
      blocks: [
        text(md`
          - **Multi-arm multi-stage (MAMS)** — several experimental arms share one control; arms are dropped at interim analyses for lack of benefit. STAMPEDE (prostate cancer) added and dropped arms over more than a decade; docetaxel added to hormone therapy improved overall survival (HR 0.78; median 81 vs 71 months), zoledronic acid did not (*Lancet* 2016).
          - **Seamless phase II/III** — dose selection at an interim, with patients from both stages in the final analysis (with α control, e.g. closed testing with combination tests).
          - **Adaptive enrichment** — start broad; restrict to a biomarker-positive subgroup if interim data show benefit concentrated there. Requires a pre-specified subgroup and a credible biomarker.
          - **Model-based dose-finding** — CRM or BOIN rather than "3+3". The 3+3 rule treats many patients at sub-therapeutic doses and identifies the maximum tolerated dose poorly; model-based designs estimate it more accurately with similar safety (Le Tourneau et al. 2009; Liu & Yuan 2015).
        `),
      ],
    },
    {
      id: 'master',
      title: 'Master protocols: basket, umbrella, platform',
      blocks: [
        text(md`
          | Type | Structure | Example |
          |---|---|---|
          | **Basket** | One drug, many diseases sharing a biomarker | A targeted agent across tumour types with the same mutation |
          | **Umbrella** | One disease, many drugs matched to biomarker subtypes | Lung cancer sub-studies by molecular alteration |
          | **Platform** | One disease, arms enter and leave over time under a single protocol | RECOVERY, REMAP-CAP, I-SPY 2, STAMPEDE |

          Platforms share infrastructure and controls, so new questions start fast. Their main statistical hazard is **non-concurrent control**: comparing a new arm with control patients enrolled before the arm opened confounds treatment with calendar time (changes in standard of care, case mix, variants). Prefer concurrent controls or model time explicitly (FDA master protocols draft guidance; Woodcock & LaVange 2017).
        `),
        callout(
          'evidence',
          'RECOVERY: simple, large, adaptive',
          'Randomizing hospitalised COVID-19 patients across most UK hospitals with a short protocol and routine-data follow-up, RECOVERY showed dexamethasone reduced 28-day mortality (22.9% vs 25.7%; rate ratio 0.83, 95% CI 0.75–0.93), with benefit in patients on oxygen or ventilation and none without respiratory support (*NEJM* 2021). It also showed hydroxychloroquine and lopinavir–ritonavir did not help — within months, with thousands of patients each.',
        ),
        callout(
          'evidence',
          'I-SPY 2 and the BrighTNess lesson',
          'I-SPY 2 used Bayesian adaptive randomization within biomarker signatures and "graduated" veliparib + carboplatin in triple-negative breast cancer (estimated pCR 51% vs 26%; predicted phase 3 success 88%; *NEJM* 2016). The confirmatory BrighTNess trial randomized the components separately: pCR 53% with veliparib + carboplatin + paclitaxel, 58% with carboplatin + paclitaxel, 31% with paclitaxel alone (*Lancet Oncol* 2018). The benefit came from **carboplatin**; veliparib added nothing. Adaptive screening of combinations needs factorial confirmation.',
        ),
        check(
          q(
            'ad-c1',
            'A platform trial adds arm D in year 3 and compares it with all control patients enrolled since year 1. What is the main concern?',
            [
              right('Non-concurrent controls: changes over time in care or case mix are confounded with treatment.', 'Only concurrently randomized controls share the same calendar-time conditions.'),
              wrong('Too few control patients.', 'Using more controls is the motivation; the problem is bias.'),
              wrong('Arm D must use a different endpoint.', 'Unrelated.'),
              wrong('Type I error cannot be computed for platform trials.', 'It can, by analysis or simulation.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'rar',
      title: 'The response-adaptive randomization debate',
      blocks: [
        text(md`
          RAR shifts allocation toward arms performing better so far, typically with probabilities based on $P(\text{arm best} \mid \text{data})$ raised to a tuning power (Thall & Wathen 2007).

          **For:** fewer patients on inferior arms in multi-arm settings; attractive to patients; can speed selection among many arms (I-SPY 2, BATTLE).

          **Against, especially in two-arm trials:** lower power for the same N; highly variable allocation (a real chance of *more* patients on the inferior arm); bias and Type I error inflation when patient characteristics or outcomes drift over time; operational complexity; and an ethical question — if investigators believe the arms are in equipoise, skewed allocation sends a mixed message (Korn & Freidlin 2011; Thall, Fox & Wathen 2015; Hey & Kimmelman 2015; Proschan & Evans 2020). Robertson et al. (2023) give a balanced review: RAR can be reasonable in multi-arm trials with a protected control allocation, burn-in, clipping and short outcome lags.
        `),
        lab('/labs/adaptive-randomization', 'RAR simulator', 'Compare Thall–Wathen RAR with 1:1 across thousands of trials, then add a time trend and watch the Type I error.'),
      ],
    },
    {
      id: 'operations',
      title: 'Running and reporting an adaptive trial',
      blocks: [
        text(md`
          - **Simulation report** before the trial: operating characteristics (Type I error, power, sample-size distribution, bias) across plausible scenarios, with code (FDA 2019).
          - **Firewalls**: an independent statistical centre and DMC implement adaptations; the sponsor sees only what the rule requires.
          - **Pre-specified decision rules** in the protocol and charter.
          - **Reporting**: the CONSORT Adaptive designs extension (ACE, 2020) asks for the planned adaptations, which were made, when, why, and their effect on estimates.
        `),
      ],
    },
  ],
  quiz: [
    q('ad-q1', 'Which change qualifies as an adaptive design feature?', [
      right('A pre-specified rule to drop arms whose conditional power falls below 10% at the interim.', 'Prospectively planned and rule-based.'),
      wrong('Changing the primary endpoint after a disappointing interim look.', 'Unplanned, data-driven changes are not adaptive designs.'),
      wrong('Extending recruitment because of slow enrolment.', 'An operational change, not based on outcome data.'),
      wrong('Adding a subgroup analysis after unblinding.', 'Post hoc analyses are exploratory.'),
    ]),
    q('ad-q2', 'Why does blinded sample-size re-estimation hardly affect Type I error?', [
      right('It uses only pooled nuisance information (e.g. overall variance), not the treatment comparison.', 'Without the effect estimate, the decision carries almost no information about the test statistic.'),
      wrong('Because the sample size can only decrease.', 'It can increase or decrease.'),
      wrong('Because the DMC does it.', 'Who does it matters for integrity, but the key is that it is blinded.'),
      wrong('It does affect Type I error substantially.', 'Simulation studies show negligible impact.'),
    ]),
    q('ad-q3', 'What does the Cui–Hung–Wang method achieve?', [
      right('Preserves Type I error after unblinded sample-size increase by combining stage-wise Z statistics with pre-fixed weights.', 'Weights depend on the planned, not actual, information split.'),
      wrong('It removes the need for interim analyses.', 'It is a method for interim adaptations.'),
      wrong('It produces unbiased estimates automatically.', 'Estimation needs separate attention.'),
      wrong('It allows choosing weights after seeing the data.', 'Weights must be pre-specified.'),
    ]),
    q('ad-q4', 'In I-SPY 2, veliparib + carboplatin graduated in triple-negative breast cancer. What did BrighTNess show?', [
      right('The benefit was attributable to carboplatin; adding veliparib did not improve pCR.', 'pCR 53% vs 58% vs 31%.'),
      wrong('Veliparib was the active component.', 'The opposite was found.'),
      wrong('Neither drug had any effect.', 'Carboplatin clearly increased pCR versus paclitaxel alone.'),
      wrong('The I-SPY 2 result was a statistical error.', 'The combination did work — because of carboplatin.'),
    ]),
    q('ad-q5', 'What was RECOVERY\'s main finding for dexamethasone?', [
      right('Lower 28-day mortality overall (rate ratio 0.83), with benefit in patients receiving oxygen or ventilation and none in those without respiratory support.', 'Effects varied by respiratory support at randomization.'),
      wrong('Benefit in all patients regardless of severity.', 'No benefit was seen in patients without respiratory support.'),
      wrong('No mortality effect.', 'Mortality fell significantly.'),
      wrong('Harm in ventilated patients.', 'The largest benefit was in ventilated patients.'),
    ]),
    q('ad-q6', 'Which is the strongest argument against RAR in a two-arm confirmatory trial?', [
      right('It typically lowers power for a given N, makes allocation highly variable and is biased by time trends.', 'Documented by Korn & Freidlin and Thall et al.'),
      wrong('It is illegal under FDA rules.', 'FDA discusses RAR; it is not prohibited.'),
      wrong('It always puts more patients on the inferior arm.', 'On average it puts more on the better arm; the issue is variability and efficiency.'),
      wrong('It cannot be simulated.', 'It can and must be.'),
    ]),
    q('ad-q7', 'Why are "3+3" dose-escalation designs criticised?', [
      right('They treat many patients at sub-therapeutic doses and estimate the maximum tolerated dose poorly compared with model-based designs.', 'CRM and BOIN perform better.'),
      wrong('They are too complex to run.', 'They are simple — that is their appeal.'),
      wrong('They require Bayesian software.', '3+3 needs none.'),
      wrong('They cannot stop for toxicity.', 'They stop based on toxicity counts.'),
    ]),
    q('ad-q8', 'Which document guides reporting of adaptive trials?', [
      right('The CONSORT Adaptive designs Extension (ACE, 2020).', 'It covers planned and actual adaptations.'),
      wrong('CONSORT-AI.', 'That is for interventions involving AI.'),
      wrong('TRIPOD+AI.', 'That is for prediction-model studies.'),
      wrong('No guidance exists.', 'ACE has been available since 2020.'),
    ]),
  ],
  sources: ['fda-adaptive', 'ich-e20', 'pallmann2018', 'mehta2011', 'cui1999', 'stampede2016', 'letourneau2009', 'boin2015', 'woodcock2017', 'fda-master', 'recovery2021', 'ispy2-veliparib', 'ispy2-neratinib', 'brightness2018', 'thallwathen2007', 'korn2011', 'thall2015', 'hey2015', 'proschan2020', 'robertson2023', 'ace'],
}

export default m
