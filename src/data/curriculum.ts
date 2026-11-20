import type { ModuleDef } from './types'

export type ModuleMeta = Pick<ModuleDef, 'id' | 'num' | 'title' | 'tagline' | 'minutes' | 'level' | 'prerequisites'>

export const curriculum: ModuleMeta[] = [
  {
    id: 'foundations',
    num: 1,
    title: 'Randomized trials: the logic of a fair comparison',
    tagline: 'Randomization, allocation concealment, blinding, ITT and the main design families.',
    minutes: 35,
    level: 'Core',
    prerequisites: [],
  },
  {
    id: 'estimands',
    num: 2,
    title: 'Estimands: asking the right question',
    tagline: 'ICH E9(R1): the five attributes, intercurrent events and the five strategies.',
    minutes: 30,
    level: 'Core',
    prerequisites: ['foundations'],
  },
  {
    id: 'power',
    num: 3,
    title: 'Error, power and sample size',
    tagline: 'What p-values and CIs mean, the four levers of power, and sample-size formulas you can verify.',
    minutes: 40,
    level: 'Core',
    prerequisites: ['foundations'],
  },
  {
    id: 'multiplicity',
    num: 4,
    title: 'Endpoints, multiplicity and subgroups',
    tagline: 'Choosing endpoints, surrogates, composites; controlling familywise error; reading subgroups.',
    minutes: 35,
    level: 'Core',
    prerequisites: ['power'],
  },
  {
    id: 'non-inferiority',
    num: 5,
    title: 'Non-inferiority and equivalence',
    tagline: 'Margins (M1/M2), constancy, assay sensitivity and how to read the confidence interval.',
    minutes: 25,
    level: 'Intermediate',
    prerequisites: ['power'],
  },
  {
    id: 'group-sequential',
    num: 6,
    title: 'Interim monitoring and group-sequential designs',
    tagline: 'Why peeking inflates error, α-spending, futility, conditional power, DMCs and early-stopping bias.',
    minutes: 40,
    level: 'Intermediate',
    prerequisites: ['power'],
  },
  {
    id: 'adaptive',
    num: 7,
    title: 'Adaptive designs and master protocols',
    tagline: 'Sample-size re-estimation, enrichment, MAMS, seamless designs, platform trials and the RAR debate.',
    minutes: 45,
    level: 'Advanced',
    prerequisites: ['group-sequential'],
  },
  {
    id: 'bayesian',
    num: 8,
    title: 'Bayesian methods in trials',
    tagline: 'Priors, posteriors, decision rules, borrowing, predictive probability and operating characteristics.',
    minutes: 45,
    level: 'Advanced',
    prerequisites: ['power'],
  },
  {
    id: 'ai-ml',
    num: 9,
    title: 'AI and machine learning in trials',
    tagline: 'Where AI legitimately helps, how to validate it, fairness, and what regulators expect.',
    minutes: 45,
    level: 'Advanced',
    prerequisites: ['foundations', 'power'],
  },
  {
    id: 'ethics',
    num: 10,
    title: 'Ethics, oversight and regulation',
    tagline: 'Equipoise, consent in adaptive trials, DMC independence, GCP E6(R3), transparency and reporting.',
    minutes: 30,
    level: 'Core',
    prerequisites: [],
  },
  {
    id: 'appraisal',
    num: 11,
    title: 'Capstone: appraising a modern trial',
    tagline: 'A structured checklist and a full worked appraisal of an adaptive, Bayesian, AI-enriched trial.',
    minutes: 30,
    level: 'Advanced',
    prerequisites: ['group-sequential', 'adaptive', 'bayesian', 'ai-ml'],
  },
]

export const moduleLoaders: Record<string, () => Promise<{ default: ModuleDef }>> = {
  foundations: () => import('./modules/foundations'),
  estimands: () => import('./modules/estimands'),
  power: () => import('./modules/power'),
  multiplicity: () => import('./modules/multiplicity'),
  'non-inferiority': () => import('./modules/nonInferiority'),
  'group-sequential': () => import('./modules/groupSequential'),
  adaptive: () => import('./modules/adaptive'),
  bayesian: () => import('./modules/bayesian'),
  'ai-ml': () => import('./modules/aiml'),
  ethics: () => import('./modules/ethics'),
  appraisal: () => import('./modules/appraisal'),
}

export function metaFor(id: string): ModuleMeta {
  const m = curriculum.find((x) => x.id === id)
  if (!m) throw new Error(`Unknown module ${id}`)
  return m
}
