import type { QuizItem } from './types'
import { q, right, wrong } from './modules/helpers'

export interface EthicsCase {
  id: string
  title: string
  category: 'Monitoring' | 'Fairness' | 'Consent' | 'Transparency' | 'Safety' | 'Equipoise'
  scenario: string
  decision: QuizItem
  considerations: string[]
  guidance: string[]
}

export const ethicsCases: EthicsCase[] = [
  {
    id: 'unplanned-look',
    title: 'The investigator who peeked',
    category: 'Monitoring',
    scenario:
      'A phase III oncology trial has enrolled 200 of 500 patients. The principal investigator, who has access to the database, runs an unplanned comparison: overall survival favours the new drug, p = 0.01. She wants to stop the trial and submit to a journal.',
    decision: q('eth-1', 'What should happen?', [
      right('Refer the matter to the independent DMC; do not stop on an unplanned look; review data-access controls.', 'Unplanned looks inflate error and compromise integrity; the DMC applies the pre-specified boundaries.'),
      wrong('Stop and publish; p = 0.01 is convincing.', 'A nominal p at an unplanned look does not account for multiplicity, and early estimates are inflated.'),
      wrong('Continue but tell all investigators the interim result.', 'Disclosing interim results damages equipoise and trial conduct.'),
      wrong('Switch the primary endpoint to the one with the smallest p-value.', 'Outcome switching invalidates the trial.'),
    ]),
    considerations: [
      'Repeated testing at nominal p-values inflates Type I error (≈ 14% with 5 looks).',
      'Early, truncated results overestimate effects (Bassler 2010).',
      'Investigator access to unblinded comparative data is itself an integrity breach.',
      'Safety must still be monitored continuously by the DMC.',
    ],
    guidance: ['ich-e9', 'fda-dmc', 'bassler2010'],
  },
  {
    id: 'biased-model',
    title: 'The enrolment model that scores some patients low',
    category: 'Fairness',
    scenario:
      'A sponsor will enrol only patients with an ML-predicted response probability > 0.7. An audit finds Black and Hispanic patients receive lower scores than White patients with the same disease stage; the model was trained on past trials that under-enrolled these groups.',
    decision: q('eth-2', 'What is the most appropriate response?', [
      right('Do not use the model for eligibility until it is re-validated with subgroup calibration; consider covariate adjustment or broader eligibility instead.', 'A biased selection rule excludes groups from potential benefit and from the evidence base.'),
      wrong('Use it; selection does not affect randomized comparisons.', 'Internal validity is preserved, but justice and generalisability are not.'),
      wrong('Lower the threshold only for minority patients without validation.', 'Ad hoc fixes without validation can create new errors.'),
      wrong('Remove race from the inputs and proceed.', 'Bias can persist through proxies and labels.'),
    ]),
    considerations: [
      'Training data from unrepresentative trials encode historical exclusion.',
      'Calibration by subgroup, not overall AUC, reveals the problem.',
      'Justice (Belmont) requires fair distribution of research burdens and benefits.',
      'Efficiency can often be gained without exclusion via prognostic covariate adjustment.',
    ],
    guidance: ['obermeyer2019', 'fda-enrichment', 'fda-ema-ai', 'belmont'],
  },
  {
    id: 'rar-consent',
    title: '"You have a 50:50 chance"',
    category: 'Consent',
    scenario:
      'A trial uses response-adaptive randomization; by month 9, 75% of new patients go to the experimental arm. The consent form, unchanged since launch, says allocation is "like tossing a coin". Some participants complain they were misled.',
    decision: q('eth-3', 'What was the ethical failure, and the fix?', [
      right('The consent misdescribed allocation from the start; it should explain that chances change with accumulating results, and the form should be corrected now.', 'Pre-specified adaptations must be disclosed at enrolment.'),
      wrong('None; allocation ratios are technical details.', 'Allocation probability is material to participants.'),
      wrong('Re-consent is needed every time the ratio changes.', 'Disclosing the adaptive mechanism up front avoids repeated re-consent.'),
      wrong('Stop RAR and switch to 1:1 without telling participants.', 'Undisclosed design changes compound the problem.'),
    ]),
    considerations: [
      'Accuracy at the time of enrolment is the standard.',
      'RAR can reinforce therapeutic misconception.',
      'Plain-language explanations of adaptive allocation are feasible and should be tested.',
    ],
    guidance: ['hey2015', 'fda-adaptive', 'helsinki'],
  },
  {
    id: 'black-box',
    title: 'A proprietary dosing algorithm',
    category: 'Transparency',
    scenario:
      'A biotech uses a proprietary ML model to adjust doses during an adaptive phase II trial. It refuses to disclose the model, training data or decision rules to the ethics committee and regulators, citing trade secrets.',
    decision: q('eth-4', 'What is the central problem?', [
      right('Without the decision rules, neither the ethics committee nor regulators can assess participant safety or the scientific validity of the design.', 'Adaptive rules must be pre-specified and reviewable.'),
      wrong('The company may lose patent protection.', 'Not an ethical or regulatory concern of the trial.'),
      wrong('ML models are not allowed in dose-finding.', 'They are allowed with adequate credibility evidence.'),
      wrong('The trial will be too slow.', 'Speed is not the ethical issue; reviewability of the dosing rules is.'),
    ]),
    considerations: [
      'Confidential disclosure to regulators and ethics committees protects IP while permitting review.',
      'FDA\'s 2025 draft framework scales credibility evidence to model influence × decision consequence — dosing decisions are high risk.',
      'Pre-specified, simulated dose-finding rules (CRM, BOIN) are the transparent alternative.',
    ],
    guidance: ['fda-ai', 'fda-adaptive', 'boin2015'],
  },
  {
    id: 'safety-bug',
    title: 'The safety algorithm that failed silently',
    category: 'Safety',
    scenario:
      'A Bayesian trial uses an automated rule to pause enrolment if the posterior probability of a serious adverse-event rate above 15% exceeds 0.9. A coding error prevents alerts; by the next DMC meeting, 50 more patients have enrolled and 12 have had the event.',
    decision: q('eth-5', 'Which safeguard would most likely have caught this?', [
      right('Independent validation and testing of the algorithm before use, plus DMC review of raw safety data rather than reliance on automated flags alone.', 'Automation supplements, not replaces, human oversight.'),
      wrong('A more complex Bayesian model.', 'Complexity does not prevent coding errors.'),
      wrong('Fewer DMC meetings to reduce workload.', 'Fewer reviews would have delayed detection further.'),
      wrong('Removing the safety rule.', 'The rule was sound; its implementation was not.'),
    ]),
    considerations: [
      'Validate code with test cases and independent programming.',
      'Report the deviation to regulators and ethics committees; inform affected participants.',
      'ICH E6(R3) emphasises quality by design for critical processes such as safety monitoring.',
    ],
    guidance: ['ich-e6r3', 'fda-dmc'],
  },
  {
    id: 'evolving-soc',
    title: 'When standard of care changes mid-trial',
    category: 'Equipoise',
    scenario:
      'A placebo-controlled platform trial began when no COVID-19 therapy was proven. Two years in, one agent is approved and recommended by guidelines. The statisticians want to keep the original placebo control for consistency.',
    decision: q('eth-6', 'What should the platform do?', [
      right('Make the proven therapy part of background care (or the control), update consent, and analyse with concurrent controls.', 'Withholding proven therapy is unethical; concurrent controls handle the change statistically.'),
      wrong('Keep placebo for statistical consistency.', 'Statistical convenience does not justify withholding proven care.'),
      wrong('Close the platform.', 'Other questions may remain valid.'),
      wrong('Compare new arms with all historical placebo patients.', 'Non-concurrent controls are biased by time trends.'),
    ]),
    considerations: [
      'Declaration of Helsinki ¶33 on use of placebo.',
      'Equipoise for remaining questions is assessed against the new standard.',
      'Time trends make non-concurrent comparisons unreliable.',
    ],
    guidance: ['helsinki', 'ich-e10', 'fda-master'],
  },
  {
    id: 'older-adults',
    title: 'Enrichment that excludes older adults',
    category: 'Fairness',
    scenario:
      'A heart-failure trial enrols only patients with a high predicted event rate. The model gives patients over 75 lower predicted rates because they more often die of non-cardiac causes, so few are enrolled — although they are the largest group of patients with the condition.',
    decision: q('eth-7', 'What is the strongest objection?', [
      right('The evidence will not cover the population most likely to receive the drug, leaving benefit and harm in older adults unknown at approval.', 'Generalisability is part of a trial\'s social value.'),
      wrong('Older adults must always be included in equal proportions.', 'Proportions should reflect the target population, not a fixed rule.'),
      wrong('The model is inaccurate.', 'It may be accurate; the issue is what it optimises for.'),
      wrong('Enrichment is never acceptable.', 'It is acceptable with characterised and justified exclusions.'),
    ]),
    considerations: [
      'Competing risks reduce the event rate for the cause-specific endpoint — a correct but consequential prediction.',
      'Options: cap enrichment, enrol a pre-specified older cohort, or use covariate adjustment.',
      'ICH E7 asks for adequate representation of older patients.',
    ],
    guidance: ['fda-enrichment', 'belmont'],
  },
  {
    id: 'sponsor-peek',
    title: 'The sponsor wants an interim peek',
    category: 'Monitoring',
    scenario:
      'Midway through a confirmatory trial, the sponsor asks the DMC for the interim efficacy results to decide whether to start building a manufacturing plant.',
    decision: q('eth-8', 'How should the DMC respond?', [
      right('Decline to share comparative results; if a business decision needs input, it must be pre-specified in the charter with a firewalled process that limits what is learned.', 'Sponsor knowledge of interim results threatens integrity.'),
      wrong('Share them; the sponsor owns the trial.', 'Ownership does not justify compromising integrity.'),
      wrong('Share them only verbally.', 'The medium does not change the problem.'),
      wrong('Stop the trial so results can be shared.', 'Stopping for business reasons undermines the trial.'),
    ]),
    considerations: [
      'Interim results known to the sponsor can influence enrolment, endpoints and analysis decisions.',
      'Some adaptive designs pre-specify limited sponsor involvement through firewalled committees.',
    ],
    guidance: ['fda-dmc', 'ellenberg2019', 'fda-adaptive'],
  },
]
