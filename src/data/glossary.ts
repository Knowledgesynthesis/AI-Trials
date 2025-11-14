import { GlossaryTerm } from '@/types'

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'prior-distribution',
    term: 'Prior Distribution',
    definition:
      'In Bayesian statistics, the prior distribution represents existing knowledge or beliefs about a parameter before observing new data. It is combined with the likelihood to produce the posterior distribution.',
    category: 'Bayesian',
    relatedTerms: ['posterior-distribution', 'likelihood', 'bayesian-updating'],
    examples: [
      'A beta(2,2) prior for response rate based on historical trials',
      'A non-informative uniform prior when little is known about the parameter',
    ],
  },
  {
    id: 'posterior-distribution',
    term: 'Posterior Distribution',
    definition:
      "The posterior distribution represents updated beliefs about a parameter after observing data. It is proportional to the prior distribution multiplied by the likelihood function, following Bayes' theorem.",
    category: 'Bayesian',
    relatedTerms: ['prior-distribution', 'credible-interval', 'bayesian-updating'],
    examples: [
      'After observing 10 responses out of 50 patients, the posterior beta distribution updates from beta(2,2) to beta(12,42)',
    ],
  },
  {
    id: 'credible-interval',
    term: 'Credible Interval',
    definition:
      'A Bayesian alternative to confidence intervals. A 95% credible interval is interpreted as: "there is a 95% probability that the true parameter lies within this interval" given the observed data and prior.',
    category: 'Bayesian',
    relatedTerms: ['posterior-distribution', 'confidence-interval'],
    examples: ['A 95% credible interval for treatment effect: [0.12, 0.45]'],
  },
  {
    id: 'confidence-interval',
    term: 'Confidence Interval',
    definition:
      'A frequentist interval estimate. A 95% confidence interval means: if we repeated the study many times, 95% of such intervals would contain the true parameter. It does NOT mean there is a 95% probability the parameter is in this specific interval.',
    category: 'Statistics',
    relatedTerms: ['credible-interval', 'p-value', 'hypothesis-testing'],
    examples: ['95% CI for mean difference: [2.3, 5.7] units'],
  },
  {
    id: 'adaptive-randomization',
    term: 'Response-Adaptive Randomization',
    definition:
      'A randomization scheme where allocation probabilities change during the trial based on accumulating outcome data, potentially assigning more patients to better-performing arms while maintaining trial validity.',
    category: 'Adaptive-Design',
    relatedTerms: ['bayesian-adaptive-design', 'allocation-ratio', 'equipoise'],
    examples: [
      'Initially 1:1 randomization shifts to 2:1 favoring the treatment arm showing better interim results',
    ],
  },
  {
    id: 'interim-analysis',
    term: 'Interim Analysis',
    definition:
      'A planned analysis conducted before the trial completes enrollment to assess efficacy, futility, or safety. Must account for multiple testing to control Type I error.',
    category: 'Adaptive-Design',
    relatedTerms: ['alpha-spending', 'stopping-boundary', 'conditional-power'],
    examples: [
      'Planned interim analysis at 50% information time to assess futility',
    ],
  },
  {
    id: 'alpha-spending',
    term: 'Alpha Spending Function',
    definition:
      'A method to allocate the overall Type I error (alpha) across multiple interim analyses and the final analysis, controlling the family-wise error rate.',
    category: 'Statistics',
    relatedTerms: ['interim-analysis', 'type-i-error', 'stopping-boundary'],
    examples: [
      "O'Brien-Fleming spending function: spends little alpha early, more at later analyses",
    ],
  },
  {
    id: 'conditional-power',
    term: 'Conditional Power',
    definition:
      'The probability of ultimately rejecting the null hypothesis at the end of the trial, given the current observed data and assumptions about future data.',
    category: 'Statistics',
    relatedTerms: ['interim-analysis', 'futility', 'power'],
    examples: [
      'At interim analysis, conditional power is 15% under current trend, suggesting futility',
    ],
  },
  {
    id: 'type-i-error',
    term: 'Type I Error',
    definition:
      'The probability of rejecting the null hypothesis when it is actually true (false positive). Conventionally controlled at alpha = 0.05 or 5%.',
    category: 'Statistics',
    relatedTerms: ['type-ii-error', 'alpha-spending', 'p-value'],
  },
  {
    id: 'type-ii-error',
    term: 'Type II Error',
    definition:
      'The probability of failing to reject the null hypothesis when it is actually false (false negative). Related to statistical power by: Power = 1 - beta, where beta is the Type II error rate.',
    category: 'Statistics',
    relatedTerms: ['type-i-error', 'power', 'sample-size'],
  },
  {
    id: 'equipoise',
    term: 'Clinical Equipoise',
    definition:
      'A state of genuine uncertainty in the expert medical community about the relative therapeutic merits of treatments being compared. Essential ethical justification for randomized trials.',
    category: 'Ethics',
    relatedTerms: ['randomization', 'informed-consent', 'adaptive-randomization'],
  },
  {
    id: 'stratification',
    term: 'Stratification',
    definition:
      'Dividing the patient population into subgroups (strata) based on prognostic factors before randomization to ensure balance across treatment arms.',
    category: 'Statistics',
    relatedTerms: ['randomization', 'covariate', 'ml-stratification'],
    examples: [
      'Stratifying by disease stage (I/II vs III/IV) and age (<60 vs ≥60)',
    ],
  },
  {
    id: 'ml-stratification',
    term: 'ML-Based Stratification',
    definition:
      'Using machine learning algorithms to identify patient subgroups or risk strata based on baseline features. Must be done carefully to maintain fairness and avoid bias.',
    category: 'ML',
    relatedTerms: ['stratification', 'predictive-enrichment', 'fairness'],
    examples: [
      'Clustering patients into risk groups using unsupervised learning on baseline biomarkers',
    ],
  },
  {
    id: 'stopping-boundary',
    term: 'Stopping Boundary',
    definition:
      'A pre-specified threshold for a test statistic at interim analyses that, if crossed, triggers stopping the trial for efficacy or futility.',
    category: 'Adaptive-Design',
    relatedTerms: ['interim-analysis', 'alpha-spending', 'group-sequential'],
    examples: [
      "O'Brien-Fleming efficacy boundary: Z > 4.33 at first interim (25% information)",
    ],
  },
  {
    id: 'predictive-enrichment',
    term: 'Predictive Enrichment',
    definition:
      'Selecting patients most likely to respond to treatment based on biomarkers or other characteristics to increase trial efficiency and effect size.',
    category: 'Adaptive-Design',
    relatedTerms: ['ml-stratification', 'biomarker', 'targeted-therapy'],
    examples: [
      'Enrolling only patients with specific genetic mutation shown to predict treatment response',
    ],
  },
  {
    id: 'fairness',
    term: 'Algorithmic Fairness',
    definition:
      'In ML-enhanced trials, ensuring that algorithms do not systematically disadvantage patients based on protected characteristics like race, gender, or socioeconomic status.',
    category: 'ML',
    relatedTerms: ['ml-stratification', 'bias', 'equity'],
  },
  {
    id: 'consort',
    term: 'CONSORT',
    definition:
      'Consolidated Standards of Reporting Trials - an evidence-based set of recommendations for reporting randomized trials to improve transparency and completeness.',
    category: 'Regulatory',
    relatedTerms: ['spirit', 'ich-e9', 'reporting-standards'],
  },
  {
    id: 'ich-e9',
    term: 'ICH E9',
    definition:
      'International Council for Harmonisation guideline on Statistical Principles for Clinical Trials. E9(R1) addendum addresses estimands and sensitivity analyses.',
    category: 'Regulatory',
    relatedTerms: ['consort', 'estimand', 'regulatory-guidance'],
  },
]
