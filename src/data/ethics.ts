import { EthicsCase } from '@/types'

export const ethicsCases: EthicsCase[] = [
  {
    id: 'equipoise-1',
    title: 'Early Stopping for Overwhelming Benefit',
    scenario: `A Phase III trial comparing a new immunotherapy to standard chemotherapy in metastatic lung cancer
    has enrolled 200 of the planned 500 patients. An unplanned interim analysis conducted by an investigator
    (not the DMC) shows a statistically significant survival benefit (p=0.01) favoring the immunotherapy.
    The investigator wants to stop the trial immediately and publish the results.`,
    considerations: [
      'Type I error inflation from unplanned interim analysis',
      'Lack of independent DMC oversight',
      'Potential for early results to be misleading (regression to the mean)',
      'Ethical obligation to continue collecting safety data',
      'Risk of overestimating treatment effect with small sample',
      'Impact on statistical validity and regulatory acceptance',
    ],
    regulatoryGuidance: [
      'FDA Guidance: Interim analyses should be pre-specified and conducted by independent DMC',
      'ICH E9: Adjustments for multiple testing required to preserve Type I error',
      'CONSORT: Requires reporting of all planned and unplanned interim analyses',
    ],
    discussionPoints: [
      'Should the trial continue as planned despite the early signal?',
      'What is the appropriate role of the DMC in this situation?',
      'How does unplanned analysis affect the validity of the findings?',
      'What are the ethical obligations to current and future patients?',
    ],
    category: 'Equipoise',
  },
  {
    id: 'fairness-1',
    title: 'ML-Based Enrollment Criteria and Demographic Bias',
    scenario: `A pharmaceutical company develops an ML algorithm to identify patients most likely to respond
    to their new oncology drug. The algorithm, trained on historical trial data, assigns "response probability scores"
    to potential participants. The trial protocol specifies enrolling only patients with scores >0.7.
    Post-hoc analysis reveals the algorithm systematically assigns lower scores to Black and Hispanic patients,
    even after controlling for disease stage and other clinical factors.`,
    considerations: [
      'Algorithmic bias perpetuating historical healthcare disparities',
      'Exclusion of underrepresented populations from potentially beneficial treatment',
      'Generalizability of trial results to diverse populations',
      'Regulatory requirements for diverse trial enrollment (FDA Diversity Action Plans)',
      'Scientific validity compromised by restricted population',
      'Potential violation of Title VI of Civil Rights Act',
    ],
    regulatoryGuidance: [
      'FDA Guidance on Enhancing Diversity in Clinical Trials',
      'ICH E17: Multi-Regional Clinical Trials - considerations for diversity',
      'FDA AI/ML Guidance: Validation of algorithms for bias and fairness',
    ],
    discussionPoints: [
      'Should the ML algorithm be used for enrollment decisions?',
      'How can the algorithm be audited and corrected for bias?',
      'What are the long-term consequences of excluding diverse populations?',
      'How should benefit-risk be balanced with equity concerns?',
    ],
    category: 'Fairness',
  },
  {
    id: 'informed-consent-1',
    title: 'Adaptive Randomization and Patient Understanding',
    scenario: `A trial uses response-adaptive randomization (RAR) where allocation probabilities change based
    on interim results. The informed consent form states "you have a 50-50 chance of receiving the experimental
    treatment or placebo." However, as the trial progresses, the allocation shifts to 75% experimental and 25% placebo.
    Later-enrolled patients are not re-consented or informed of the changed probabilities. Some patients later
    complain they were misled about their chances of receiving the experimental treatment.`,
    considerations: [
      'Accuracy of consent information at time of enrollment',
      'Complexity of explaining adaptive designs to participants',
      'Potential for therapeutic misconception',
      'Obligation to update consent as trial design evolves',
      'Impact on patient autonomy and decision-making',
      'Difference between initial and current allocation probabilities',
    ],
    regulatoryGuidance: [
      'FDA Guidance: Informed consent must accurately describe procedures',
      'Common Rule: Consent must include description of foreseeable risks and benefits',
      'FDA Adaptive Design Guidance: Special considerations for explaining adaptive features',
    ],
    discussionPoints: [
      'Should the consent form describe adaptive allocation in detail?',
      'Is re-consent required when allocation probabilities change substantially?',
      'How can complex statistical concepts be communicated effectively?',
      'What level of detail is necessary for truly informed consent?',
    ],
    category: 'Informed-Consent',
  },
  {
    id: 'transparency-1',
    title: 'Proprietary ML Model in Trial Design',
    scenario: `A biotech company uses a proprietary "black box" ML model to identify optimal dosing regimens
    in an adaptive Phase II trial. The model continuously adjusts doses based on safety and efficacy signals.
    The company refuses to disclose the model's architecture, training data, or decision rules, citing trade secrets.
    The IRB and FDA request transparency about how dosing decisions are made, but the company provides only
    high-level descriptions. The trial shows promising results, but reviewers cannot evaluate the scientific
    validity of the adaptive algorithm.`,
    considerations: [
      'Balance between intellectual property protection and scientific transparency',
      'Ability of IRB and regulators to ensure patient safety',
      'Reproducibility and validation of trial results',
      'Trust in trial conduct and findings',
      'Precedent for future trials using proprietary algorithms',
      'Ethical obligation to disclose decision-making processes',
    ],
    regulatoryGuidance: [
      'FDA Guidance: Adaptive designs require clear specification of decision rules',
      'ICH E9: Trial methodology must be clearly described',
      'FDA AI/ML Guidance: Transparency expectations for AI-enabled devices (analogous)',
    ],
    discussionPoints: [
      'Should proprietary algorithms be allowed in trial designs?',
      'What level of disclosure is sufficient for regulatory approval?',
      'How can innovation be balanced with transparency requirements?',
      'What are the implications for peer review and replication?',
    ],
    category: 'Transparency',
  },
  {
    id: 'safety-1',
    title: 'Delayed Safety Signal Detection in Bayesian Trial',
    scenario: `A Bayesian adaptive trial uses continuous monitoring with a safety algorithm that triggers alerts
    when the posterior probability of a serious adverse event exceeds 15%. Due to a coding error, the algorithm
    incorrectly calculates probabilities, failing to trigger alerts. By the time the error is discovered at a
    scheduled DMC meeting, 50 additional patients have been enrolled and 12 have experienced the serious adverse
    event that should have triggered a pause in enrollment.`,
    considerations: [
      'System failures in safety monitoring',
      'Responsibility for algorithm validation and quality control',
      'Obligations to enrolled patients who experienced harm',
      'Need for independent safety oversight beyond automated systems',
      'Regulatory reporting requirements for protocol deviations',
      'Impact on trial continuation and data integrity',
    ],
    regulatoryGuidance: [
      'FDA Safety Reporting Requirements (IND Safety Reports)',
      'ICH E2A: Clinical Safety Data Management',
      'FDA Guidance: Safety monitoring in clinical trials',
    ],
    discussionPoints: [
      'Who is responsible for the algorithm error and patient harm?',
      'Should automated safety algorithms replace human DMC review?',
      'What validation procedures should be required for safety algorithms?',
      'How should affected patients and the trial be managed?',
    ],
    category: 'Safety',
  },
  {
    id: 'equipoise-2',
    title: 'Platform Trial with Emerging Standard of Care',
    scenario: `A platform trial for COVID-19 treatments began when no effective therapies existed (clinical equipoise).
    The trial uses a shared control arm and adds/drops experimental arms adaptively. Two years into the trial,
    one of the experimental arms (monoclonal antibody) becomes FDA-approved and the new standard of care.
    The trial continues randomizing new patients to the original control arm (no active treatment) to maintain
    statistical efficiency for evaluating new experimental arms.`,
    considerations: [
      'Loss of equipoise when effective treatment becomes available',
      'Ethical obligation to provide standard of care to control patients',
      'Statistical efficiency vs. patient welfare',
      'Informed consent implications when control is no longer standard',
      'Regulatory expectations for using active controls',
      'Impact on trial validity and generalizability',
    ],
    regulatoryGuidance: [
      'Declaration of Helsinki: Patients should receive best proven treatment',
      'FDA Guidance: Choice of control group should reflect current standard of care',
      'ICH E10: Choice of Control Group in Clinical Trials',
    ],
    discussionPoints: [
      'Should the control arm be updated to the new standard of care?',
      'Can equipoise be maintained with an outdated control?',
      'How should ongoing trials adapt to changing standards of care?',
      'What are the obligations to patients randomized to inferior control?',
    ],
    category: 'Equipoise',
  },
  {
    id: 'fairness-2',
    title: 'Predictive Enrichment Excluding Elderly Patients',
    scenario: `A trial for heart failure treatment uses a validated prognostic model to enroll only patients
    predicted to have high event rates (to improve statistical power). The model, while clinically accurate,
    assigns lower event probabilities to patients >75 years due to competing risks of death from other causes.
    This results in systematic exclusion of elderly patients. The sponsor argues this is scientifically justified
    for trial efficiency, not age discrimination.`,
    considerations: [
      'Scientific validity of enrichment strategy',
      'Exclusion of elderly population who may benefit from treatment',
      'Generalizability of results to broader patient population',
      'Regulatory requirements for age-diverse enrollment',
      'Distinction between scientifically justified exclusion and discrimination',
      'Post-market uncertainty about treatment effects in elderly',
    ],
    regulatoryGuidance: [
      'FDA Guidance: Inclusion of Older Adults in Cancer Trials',
      'ICH E7: Studies in Support of Special Populations - Geriatrics',
      'FDA Diversity Action Plans',
    ],
    discussionPoints: [
      'Is this enrichment strategy ethically acceptable?',
      'How should efficiency be balanced with inclusivity?',
      'What post-market studies might be needed?',
      'Should regulatory approval include age-based restrictions?',
    ],
    category: 'Fairness',
  },
]
