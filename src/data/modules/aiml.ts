import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, widget, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('ai-ml'),
  objectives: [
    'Map where AI enters the trial lifecycle and what it cannot replace.',
    'Evaluate a prediction model: discrimination, calibration, external validation, leakage and dataset shift.',
    'Compare prognostic enrichment with prognostic covariate adjustment, including their fairness implications.',
    'Explain label bias and why fairness criteria conflict.',
    'Apply the FDA risk-based credibility framework, the FDA–EMA principles and the AI reporting guidelines.',
  ],
  sections: [
    {
      id: 'map',
      title: 'Where AI enters a trial',
      blocks: [
        text(md`
          | Stage | Use | Risk if wrong |
          |---|---|---|
          | Design & feasibility | Site selection, eligibility simulation on real-world data | Slow recruitment; unrepresentative sites |
          | Recruitment | Matching patients to trials from records (e.g. LLM-based TrialGPT, *Nat Commun* 2024) | Missed or inequitably identified candidates |
          | **Selection** | Prognostic/predictive enrichment with a risk model | Wrong population; exclusion of groups the model scores poorly |
          | **Analysis** | Prognostic score as a covariate ("digital twins", PROCOVA) | Little — if pre-specified and built on external data |
          | **Measurement** | AI-read imaging, digital biomarkers from wearables | Biased or noisy endpoints |
          | Safety | Signal detection in adverse-event text | Missed signals |
          | **Intervention** | The AI tool is what is being tested | Needs SPIRIT-AI / CONSORT-AI reporting |

          **What AI cannot do** is make an unrandomized comparison trustworthy. "Synthetic" or external control arms built with ML remain observational comparisons, vulnerable to confounding and differences in measurement (FDA externally controlled trials draft guidance, 2023). Target-trial emulation (Hernán & Robins 2016) makes observational analyses more rigorous; it does not turn them into randomized evidence.
        `),
      ],
    },
    {
      id: 'validation',
      title: 'Evaluating a model',
      blocks: [
        text(md`
          - **Discrimination** — does the model rank patients correctly? (AUC / C-statistic).
          - **Calibration** — do predicted risks match observed risks? Calibration-in-the-large and calibration slope. A model can have a good AUC and still systematically over- or under-predict, which matters whenever an absolute risk threshold drives a decision (Van Calster et al. 2019).
          - **Clinical utility** — does using it improve decisions? (decision-curve analysis; Vickers & Elkin 2006).
          - **External validation** — performance in new sites, periods and populations, not just cross-validation in the development data.
          - **Leakage** — features that encode the outcome (recorded after it, or proxies for treatment decisions), duplicate patients across train/test splits, or tuning on the test set produce spectacular and false performance.
          - **Dataset shift** — coding practices, case mix, devices and care pathways change; monitor performance after deployment.
        `),
        callout(
          'evidence',
          'The Epic Sepsis Model',
          'A proprietary sepsis model deployed in hundreds of hospitals reported AUCs of 0.76–0.83. External validation in 27,697 patients at Michigan Medicine found AUC 0.63; it missed 67% of sepsis cases while alerting on 18% of all hospitalised patients (Wong et al., *JAMA Intern Med* 2021).',
        ),
        callout(
          'regulatory',
          'Reporting and appraisal tools',
          '**TRIPOD+AI** (2024) for reporting prediction-model studies; **PROBAST+AI** (2025) for appraising their risk of bias; **DECIDE-AI** (2022) for early clinical evaluation of AI decision support; **SPIRIT-AI / CONSORT-AI** (2020) for trials where AI is the intervention.',
        ),
      ],
    },
    {
      id: 'efficiency',
      title: 'Efficiency: enrichment versus covariate adjustment',
      blocks: [
        text(md`
          **Prognostic enrichment** enrols only patients the model predicts to be high-risk. Event rates rise and the required sample size falls — but screening grows, generalisability narrows, and if the model is miscalibrated for a group, that group is excluded disproportionately (FDA Enrichment Strategies guidance, 2019).

          **Prognostic covariate adjustment** keeps everyone and adjusts the primary analysis for a model-derived prognostic score (or any strong baseline predictor). With a continuous outcome, variance falls by the factor $1-\rho^2$, where $\rho$ is the correlation between score and outcome — so the trial can be smaller **without excluding anyone and without inflating Type I error**, because the score is a pre-specified baseline covariate. EMA qualified this approach (PROCOVA) in 2022; FDA's 2023 covariate-adjustment guidance supports pre-specified adjustment for prognostic covariates.
        `),
        widget('covariate-adjustment'),
        lab('/labs/enrichment', 'AI enrichment & fairness lab', 'Vary the model\'s noise and its bias against one group and watch sample size, screening burden, representation and calibration move together.'),
      ],
    },
    {
      id: 'fairness',
      title: 'Fairness: where bias comes from',
      blocks: [
        text(md`
          Removing race or sex from the features does not remove bias. The commonest source is the **label**: what the model was trained to predict.
        `),
        callout(
          'evidence',
          'Obermeyer et al., Science 2019',
          'A widely used algorithm predicted healthcare **cost** as a proxy for **need**. Because less money was spent on Black patients with the same burden of illness, Black patients at a given risk score were considerably sicker than White patients. Re-labelling to health need would have increased the share of Black patients flagged for extra care from 17.7% to 46.5%.',
        ),
        text(md`
          **Fairness criteria conflict.** When outcome prevalence differs between groups, an imperfect model cannot simultaneously be calibrated within each group and have equal false-positive and false-negative rates across groups (Kleinberg et al. 2016; Chouldechova 2017). Choose the criterion that fits the decision. For trial selection, two are usually central: **calibration within groups** (a predicted 20% means 20% in every group) and **equal opportunity** (patients with the same true risk have the same chance of being enrolled). Report performance by sex, age, race/ethnicity and site.
        `),
        check(
          q(
            'ai-c1',
            'A risk model for trial enrichment has AUC 0.80 in both men and women, but predicts 10% average risk for women whose observed risk is 16%. With a fixed enrolment threshold, what happens?',
            [
              right('High-risk women are under-enrolled, because the model under-predicts their risk despite good ranking.', 'Good discrimination within a group does not imply calibration across groups.'),
              wrong('Nothing; equal AUCs prove the model is fair.', 'AUC is insensitive to systematic over- or under-prediction.'),
              wrong('Women are over-enrolled.', 'Under-prediction lowers their scores below the threshold.'),
              wrong('The trial will have inflated Type I error.', 'Enrolment criteria affect who is studied, not the validity of randomized comparisons.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'regulation',
      title: 'What regulators expect',
      blocks: [
        text(md`
          **FDA draft guidance (January 2025)** on AI used to support regulatory decisions for drugs and biologics proposes a 7-step, **risk-based credibility assessment**:
          1. Define the question of interest.
          2. Define the **context of use** (what the model does and how its output is used).
          3. Assess **model risk** = *model influence* (how much the decision rests on the model) × *decision consequence* (harm if wrong).
          4. Develop a credibility assessment plan.
          5. Execute it.
          6. Document results and deviations.
          7. Decide whether credibility is adequate for the context of use.

          **FDA and EMA (January 2026)** issued ten shared guiding principles of good AI practice in drug development: human-centric design, a risk-based approach, adherence to standards, clear context of use, multidisciplinary expertise, data governance and documentation, sound model design and development, risk-based performance assessment, life-cycle management, and clear essential information.

          **EMA's reflection paper (2024)** covers AI across the medicinal-product lifecycle, emphasising that models used to generate evidence for a marketing authorisation fall under the sponsor's GxP responsibility. In the **EU AI Act**, obligations for high-risk systems were deferred by the 2026 Digital Omnibus amendment (to December 2027 for Annex III systems; August 2028 for AI in regulated products such as medical devices).
        `),
        callout(
          'practice',
          'If AI is the intervention',
          'Report the algorithm version and how it was locked, input data and pre-processing, the human–AI interaction (who sees what, who decides), how errors and malfunctions were handled, and performance by subgroup (SPIRIT-AI / CONSORT-AI). For AI-enabled medical devices, FDA\'s predetermined change control plan (PCCP) framework defines in advance which model updates are allowed without a new submission.',
        ),
      ],
    },
  ],
  quiz: [
    q('ai-q1', 'An ML model is used to build a "synthetic control arm" from electronic health records for a single-arm trial. What is the central limitation?', [
      right('The comparison is still observational: unmeasured confounding and measurement differences are not removed by ML.', 'Randomization, not modelling, removes unmeasured confounding.'),
      wrong('ML models cannot use health records.', 'They can; the issue is causal validity.'),
      wrong('It is prohibited by FDA.', 'FDA has draft guidance on externally controlled trials; they are allowed in specific contexts.'),
      wrong('It always overestimates benefit by exactly the model error.', 'The bias has no fixed size or direction.'),
    ]),
    q('ai-q2', 'A model has AUC 0.85 but predicts twice the observed risk across the board. This is a problem of…', [
      right('Calibration.', 'Ranking is good; absolute predictions are wrong.'),
      wrong('Discrimination.', 'AUC 0.85 indicates good discrimination.'),
      wrong('Overfitting only.', 'Overfitting can cause miscalibration, but the observed problem is calibration.'),
      wrong('Nothing — AUC is what matters.', 'Absolute risk thresholds depend on calibration.'),
    ]),
    q('ai-q3', 'Which use of AI improves trial efficiency without excluding patients or threatening Type I error?', [
      right('A pre-specified prognostic score, built on external data, used as a covariate in the primary analysis.', 'Variance falls by about 1 − ρ².'),
      wrong('Enrolling only patients the model predicts will respond.', 'That excludes patients and narrows generalisability.'),
      wrong('Changing the primary endpoint to an AI-derived one mid-trial.', 'Mid-trial endpoint changes threaten validity.'),
      wrong('Using AI to decide which patients to analyse after unblinding.', 'Post-hoc selection introduces bias.'),
    ]),
    q('ai-q4', 'What was the main cause of bias in the algorithm studied by Obermeyer et al.?', [
      right('Using healthcare cost as the label for health need.', 'Unequal spending at equal need made cost a biased proxy.'),
      wrong('Including race as a predictor.', 'Race was not an input; the label caused the bias.'),
      wrong('Too little training data.', 'The data set covered millions of patients; the bias came from the label, not the amount of data.'),
      wrong('A coding error.', 'The bias was structural, not a bug.'),
    ]),
    q('ai-q5', 'Why can a model not, in general, satisfy calibration within groups and equal false-positive and false-negative rates at the same time?', [
      right('When outcome prevalence differs between groups, these criteria are mathematically incompatible for any imperfect model.', 'Kleinberg et al. 2016; Chouldechova 2017.'),
      wrong('Because no model is ever calibrated.', 'Many models are well calibrated.'),
      wrong('Because regulators forbid it.', 'It is a mathematical, not regulatory, result.'),
      wrong('It can, with enough data.', 'More data does not remove the incompatibility.'),
    ]),
    q('ai-q6', 'In FDA\'s 2025 draft framework, model risk is assessed from…', [
      right('Model influence and decision consequence.', 'High influence on a high-consequence decision demands the most credibility evidence.'),
      wrong('Number of parameters and training time.', 'Technical size is not the risk criterion.'),
      wrong('The AUC alone.', 'Performance is evidence for credibility, not the risk classification.'),
      wrong('Whether the model is open source.', 'Openness can help scrutiny, but risk is defined by model influence and decision consequence.'),
    ]),
    q('ai-q7', 'The Epic Sepsis Model performed far worse on external validation than reported. What general lesson applies to trials using AI to select or measure patients?', [
      right('Require external validation in the target population and monitor performance; development-site metrics overstate real-world performance.', 'Transportability cannot be assumed.'),
      wrong('Proprietary models are always wrong.', 'The lesson is about validation, not ownership.'),
      wrong('AUC below 0.9 is unacceptable.', 'Acceptable performance depends on use.'),
      wrong('Sepsis cannot be predicted.', 'Too broad a conclusion.'),
    ]),
    q('ai-q8', 'Which guideline should a trial report follow when the intervention is an AI system?', [
      right('CONSORT-AI (with SPIRIT-AI for the protocol).', 'They extend CONSORT/SPIRIT with AI-specific items.'),
      wrong('TRIPOD+AI.', 'TRIPOD+AI is for prediction-model development/validation studies.'),
      wrong('CONSORT ACE.', 'ACE covers adaptive designs.'),
      wrong('PRISMA.', 'PRISMA is for systematic reviews.'),
    ]),
  ],
  sources: ['fda-ai', 'fda-ema-ai', 'ema-ai', 'eu-ai-act', 'fda-external', 'hernan2016', 'vancalster2019', 'vickers2006', 'wong2021', 'tripod-ai', 'probast-ai', 'decide-ai', 'spirit-ai', 'consort-ai', 'fda-enrichment', 'fda-covariates', 'ema-procova', 'schuler2022', 'obermeyer2019', 'kleinberg2016', 'chouldechova2017', 'jin2024'],
}

export default m
