import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('appraisal'),
  objectives: [
    'Apply a 12-question appraisal checklist to any modern trial report.',
    'Identify design, analysis and reporting flaws in an adaptive, Bayesian, AI-enriched trial.',
    'Translate relative effects into absolute effects and judge applicability to your patients.',
    'Write a proportionate conclusion that matches the evidence.',
  ],
  sections: [
    {
      id: 'checklist',
      title: 'Twelve questions for any trial',
      blocks: [
        text(md`
          | # | Question | Where it was taught |
          |---|---|---|
          | 1 | Is the **estimand** clear — population, treatments, endpoint, intercurrent events, summary? | Module 2 |
          | 2 | Was allocation **random and concealed**? | Module 1 |
          | 3 | Who was **blinded**, and is the primary endpoint objective or adjudicated? | Module 1 |
          | 4 | Is the primary endpoint **patient-relevant**? If a surrogate or composite, is it valid and are components reported? | Module 4 |
          | 5 | Was the **sample size** justified by a clinically important effect and realistic assumptions? | Module 3 |
          | 6 | Is **multiplicity** controlled for every claimed endpoint, arm and look? | Module 4 |
          | 7 | Were **interim analyses / adaptations** pre-specified, with an independent DMC and simulated operating characteristics? | Modules 6–7 |
          | 8 | If **Bayesian**: is the prior justified, its ESS stated, the result robust to a sceptical prior, the threshold calibrated? | Module 8 |
          | 9 | If **AI** selects, measures or treats: is it externally validated, calibrated by subgroup, locked? | Module 9 |
          | 10 | Were all randomized participants analysed, and how were **missing data** handled? | Modules 1–2 |
          | 11 | What are the **absolute** effects with CIs, for benefits and harms? | Module 3 |
          | 12 | Was the trial **registered** prospectively, and do the reported outcomes match the registration? | Module 10 |
        `),
        lab('/labs/design-review', 'Protocol design review', 'The same logic run in reverse: describe a planned trial and get an itemised review with sources.'),
      ],
    },
    {
      id: 'worked',
      title: 'Worked appraisal: VECTOR-HF (fictional)',
      blocks: [
        callout(
          'example',
          'Abstract (fictional, constructed for training)',
          md`**VECTOR-HF** — open-label, phase III, Bayesian adaptive trial of drug V vs usual care in heart failure with reduced ejection fraction.

          **Selection:** an ML model (gradient boosting on records from one health system; cross-validated AUC 0.84) enrolled patients with predicted 12-month risk > 20%. Women were 30% of screened patients and 14% of those enrolled.

          **Design:** 1:1 for the first 100 patients, then response-adaptive randomization. Informative prior for the hazard ratio derived from a 180-patient phase II trial. Primary endpoint: composite of cardiovascular death, HF hospitalisation, or ≥ 5-point worsening of the patient-reported KCCQ score. Up to 4 interim analyses; stop for efficacy if P(HR < 1 | data) > 0.99.

          **Results:** stopped at the 2nd interim (38% of planned events); 610 patients (402 drug, 208 usual care). Composite HR 0.62 (95% CrI 0.48–0.80). Components: CV death HR 0.97 (0.70–1.36); HF hospitalisation HR 0.88 (0.66–1.17); KCCQ worsening HR 0.49 (0.36–0.66). "Benefit was confined to patients under 65" (HR 0.45 vs 0.91).

          **Conclusion:** "Drug V reduces cardiovascular death and hospitalisation and should become standard of care."`,
        ),
        check(
          q(
            'ap-c1',
            'Which feature of the primary endpoint most threatens validity?',
            [
              right('An unblinded, patient-reported component (KCCQ worsening) drives the composite.', 'Detection and performance bias are largest for subjective outcomes in open-label trials, and this component carries almost all of the effect.'),
              wrong('Composites are never acceptable.', 'They are acceptable with similar-importance components and transparent reporting.'),
              wrong('Heart-failure hospitalisation is a surrogate.', 'It is a clinical event, though less objective than death.'),
              wrong('The endpoint has too few components.', 'The issue is which component drives the result.'),
            ],
          ),
        ),
        check(
          q(
            'ap-c2',
            'The trial stopped at 38% of planned events with HR 0.62 when the design assumed a more modest effect. What follows?',
            [
              right('The effect estimate is likely exaggerated; early-stopped trials overestimate effects, especially with few events.', 'Bassler et al. (2010).'),
              wrong('The effect is more reliable because it was large enough to stop early.', 'Selection on crossing a boundary inflates estimates.'),
              wrong('Early stopping invalidates the trial entirely.', 'Pre-specified stopping is legitimate; the estimate needs caution.'),
              wrong('The trial should be re-analysed with a frequentist test to remove bias.', 'The bias arises from stopping, in either framework.'),
            ],
          ),
        ),
        check(
          q(
            'ap-c3',
            'Which is the most important question about the Bayesian design?',
            [
              right('How many "virtual patients" the phase II prior contributes, whether the result holds under a sceptical prior, and whether the 0.99 threshold with 4 looks was calibrated by simulation.', 'A 180-patient prior can be substantial relative to 38% of the information.'),
              wrong('Whether a Bayesian analysis is allowed in phase III.', 'It is; FDA\'s 2026 draft guidance addresses it.'),
              wrong('Whether the credible interval equals the confidence interval.', 'They need not coincide; the prior\'s influence is the issue.'),
              wrong('Whether the posterior was computed by MCMC.', 'Computation method is secondary.'),
            ],
          ),
        ),
        check(
          q(
            'ap-c4',
            'What do the AI-selection details suggest?',
            [
              right('A model validated only internally in one health system may be miscalibrated for women, who were under-enrolled relative to screening; generalisability is limited.', 'Representation falling from 30% to 14% is a red flag for subgroup miscalibration.'),
              wrong('Nothing; AUC 0.84 shows the model is fair.', 'AUC says nothing about calibration by subgroup.'),
              wrong('The randomized comparison is biased by the model.', 'Selection affects who is studied, not the internal validity of randomization.'),
              wrong('Women do not benefit from drug V.', 'No such inference can be made from enrolment patterns.'),
            ],
          ),
        ),
        text(md`
          **Further problems:** two-arm RAR produced a 402 vs 208 split, reducing efficiency and inviting time-trend bias; the age "subgroup effect" is reported without an interaction test and was not pre-specified; and the conclusion claims an effect on cardiovascular death that the component analysis does not support (HR 0.97, CrI 0.70–1.36).

          **A proportionate conclusion:** *In high-risk patients selected by an internally validated model, drug V reduced a composite endpoint driven by unblinded patient-reported worsening. Effects on cardiovascular death and HF hospitalisation were uncertain. The early stop, informative prior and open-label design make the magnitude of benefit uncertain; a blinded trial with hard endpoints in a broader population is needed.*
        `),
      ],
    },
    {
      id: 'practice',
      title: 'From result to patient',
      blocks: [
        text(md`
          - **Absolute effect** = baseline risk × relative effect. A 20% relative reduction means 4 fewer events per 100 if your patient's risk is 20%, but 0.4 per 100 if it is 2%. Use the trial's control-arm risk only if your patients resemble the trial's.
          - **Harms** in absolute terms as well — number needed to harm.
          - **Applicability**: were patients like yours eligible and enrolled (age, sex, comorbidity, setting)? Were co-interventions and follow-up like your practice?
          - **Certainty**: GRADE rates certainty of evidence down for risk of bias, imprecision, inconsistency, indirectness and publication bias — the same issues this course has trained you to spot.
        `),
        callout(
          'practice',
          'The one-paragraph summary to aim for',
          'Population and setting → intervention and comparator → primary result as an absolute and relative effect with its interval → key harms → main threats to validity → who the result applies to → how certain we are.',
        ),
      ],
    },
  ],
  quiz: [
    q('ap-q1', 'A trial reports "significant benefit" on a composite driven by revascularisations, with no difference in death or MI. The abstract says the drug "prevents heart attacks". What is the main error?', [
      right('The conclusion attributes the composite effect to a component that showed no effect.', 'Components must be read separately.'),
      wrong('Composites should never be primary endpoints.', 'They can be appropriate.'),
      wrong('The p-value is too small to be credible.', 'Not the issue.'),
      wrong('Revascularisation is not a clinical event.', 'It is, but less important than death or MI.'),
    ]),
    q('ap-q2', 'Relative risk 0.80 for stroke. Your patient\'s 5-year risk is 5%. What is the absolute benefit over 5 years?', [
      right('1 percentage point (NNT 100).', '5% × 0.20 = 1%.'),
      wrong('20 percentage points.', 'That confuses relative and absolute reductions.'),
      wrong('4 percentage points.', '5% − 4% = 1%, not 4%.'),
      wrong('Cannot be estimated.', 'Absolute benefit = baseline risk × relative reduction, if the relative effect transfers.'),
    ]),
    q('ap-q3', 'Which registered-versus-published discrepancy is most concerning?', [
      right('The registered primary outcome is reported as secondary and a different, significant outcome is presented as primary.', 'Outcome switching is a major source of bias.'),
      wrong('The publication adds exploratory analyses clearly labelled as such.', 'Acceptable if labelled.'),
      wrong('The sample size was slightly larger than planned due to over-recruitment.', 'Minor, if explained.'),
      wrong('The trial name changed.', 'Irrelevant.'),
    ]),
    q('ap-q4', 'An open-label trial with all-cause mortality as primary endpoint. How worried should you be about lack of blinding?', [
      right('Relatively little for the primary endpoint, which is objective; more for subjective secondary endpoints.', 'Wood et al. (2008) found little bias for mortality.'),
      wrong('Very; open-label trials cannot be trusted.', 'Objective endpoints are robust to lack of blinding.'),
      wrong('Not at all for any endpoint.', 'Subjective endpoints remain vulnerable.'),
      wrong('Only if the trial is small.', 'Bias from unblinding is not about size.'),
    ]),
    q('ap-q5', 'A Bayesian trial reports P(benefit) = 0.995 using an informative prior with ESS 300 and 250 trial patients. What should you check first?', [
      right('The result under a sceptical or non-informative prior — the prior contributes more information than the trial.', 'Prior dominance must be shown not to drive the conclusion.'),
      wrong('Whether the posterior mean is positive.', 'Already implied.'),
      wrong('Whether a p-value was reported.', 'Secondary to prior influence.'),
      wrong('Nothing; 0.995 is decisive.', 'Its meaning depends on the prior.'),
    ]),
    q('ap-q6', 'Which subgroup statement in a discussion section is appropriate?', [
      right('"Effects were consistent across pre-specified subgroups (all interaction p > 0.1)."', 'Consistency is the expected pattern and is correctly assessed by interaction tests.'),
      wrong('"The drug did not work in women (p = 0.12)."', 'A non-significant subgroup result is not evidence of no effect.'),
      wrong('"Benefit was confined to diabetics (p = 0.01 vs p = 0.20 in non-diabetics)."', 'Comparing p-values is not an interaction test.'),
      wrong('"Younger patients benefited most, so the drug should be restricted to them."', 'Unwarranted without a credible interaction.'),
    ]),
    q('ap-q7', 'A trial enrolled patients selected by a risk model; 90% were men. What is the main implication?', [
      right('Applicability to women is uncertain; check whether the model under-scored women and whether effects were estimated with any precision in them.', 'Selection shapes who the evidence describes.'),
      wrong('The result is internally invalid.', 'Randomization still protects internal validity.'),
      wrong('The drug does not work in women.', 'Absence of evidence, not evidence of absence.'),
      wrong('Nothing; sex is rarely relevant.', 'Sex differences in risk and response are common.'),
    ]),
    q('ap-q8', 'What best describes a proportionate conclusion for a trial stopped early on a surrogate-driven composite?', [
      right('Benefit on the composite is likely but its size is uncertain; effects on hard outcomes are unproven; confirmation is needed.', 'Matches the strength of evidence.'),
      wrong('The drug should become standard of care.', 'Overreach.'),
      wrong('The trial is worthless.', 'Underreach; it provides useful evidence.'),
      wrong('The drug works but only in the subgroup with the largest effect.', 'Subgroup over-interpretation.'),
    ]),
  ],
  sources: ['consort2025', 'spirit2025', 'bassler2010', 'wood2008', 'iceman', 'fda-bayes', 'tripod-ai'],
}

export default m
