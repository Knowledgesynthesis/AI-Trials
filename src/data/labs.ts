export interface LabMeta {
  id: string
  path: string
  title: string
  blurb: string
  module: string
}

export const labs: LabMeta[] = [
  {
    id: 'sample-size',
    path: '/labs/sample-size',
    title: 'Sample size & power studio',
    blurb: 'Continuous, binary and time-to-event endpoints; superiority or non-inferiority; formulas shown and verified by simulation.',
    module: 'power',
  },
  {
    id: 'randomization',
    path: '/labs/randomization',
    title: 'Randomization lab',
    blurb: 'Simple, blocked, stratified and minimisation schemes compared on balance and predictability.',
    module: 'foundations',
  },
  {
    id: 'estimands',
    path: '/labs/estimands',
    title: 'Estimand builder',
    blurb: 'Specify the five attributes and a strategy for each intercurrent event; get the estimand statement and its consequences.',
    module: 'estimands',
  },
  {
    id: 'multiplicity',
    path: '/labs/multiplicity',
    title: 'Multiplicity & subgroups lab',
    blurb: 'Bonferroni, Holm, Hochberg and fixed-sequence on your own p-values, plus a subgroup “lottery” under the null.',
    module: 'multiplicity',
  },
  {
    id: 'non-inferiority',
    path: '/labs/non-inferiority',
    title: 'Non-inferiority margin lab',
    blurb: 'Derive M1 and M2 from historical evidence, then classify a trial result against the margin.',
    module: 'non-inferiority',
  },
  {
    id: 'group-sequential',
    path: '/labs/group-sequential',
    title: 'Group-sequential monitor',
    blurb: 'Exact α-spending boundaries, futility, expected sample size, a DMC simulator and early-stopping bias.',
    module: 'group-sequential',
  },
  {
    id: 'adaptive-randomization',
    path: '/labs/adaptive-randomization',
    title: 'Response-adaptive randomization simulator',
    blurb: 'Thall–Wathen RAR versus 1:1 across thousands of trials: allocation variability, power, time-trend bias.',
    module: 'adaptive',
  },
  {
    id: 'bayesian',
    path: '/labs/bayesian',
    title: 'Bayesian analysis lab',
    blurb: 'Prior × likelihood → posterior, two-arm decisions, prior sensitivity, and the Type I error of Bayesian monitoring.',
    module: 'bayesian',
  },
  {
    id: 'enrichment',
    path: '/labs/enrichment',
    title: 'AI enrichment & fairness lab',
    blurb: 'Use a risk model to enrich enrolment and see sample size, screening burden, representation and calibration move together.',
    module: 'ai-ml',
  },
  {
    id: 'design-review',
    path: '/labs/design-review',
    title: 'Protocol design review',
    blurb: 'Describe a trial; get an itemised methodological review with the reasoning and sources behind each flag.',
    module: 'appraisal',
  },
]
