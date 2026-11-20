/**
 * Rule-based methodological review of a trial plan. Each rule encodes a mainstream,
 * citable expectation (ICH E9/E9(R1), FDA/EMA guidance, CONSORT/SPIRIT 2025, empirical
 * meta-research). Severity: critical = likely invalidates the main conclusion;
 * major = needs fixing before the protocol is final; minor = improve; good = done well.
 */

export interface TrialPlan {
  phase: 'I' | 'II' | 'III' | 'IV'
  objective: 'superiority' | 'non-inferiority' | 'equivalence'
  design: 'parallel' | 'crossover' | 'factorial' | 'cluster'
  stableCondition: boolean
  endpointType: 'binary' | 'continuous' | 'time-to-event' | 'ordinal'
  irreversibleOutcome: boolean
  subjectiveEndpoint: boolean
  surrogate: 'no' | 'validated' | 'unvalidated'
  primaryEndpoints: number
  keySecondaries: number
  multiplicity: 'none' | 'hierarchical' | 'holm' | 'graphical'
  blinding: 'open' | 'probe' | 'participant-clinician' | 'full'
  concealment: 'central' | 'envelopes' | 'none'
  randomization: 'simple' | 'fixed-blocks' | 'random-blocks' | 'stratified' | 'minimization' | 'rar'
  nPerArm: number
  arms: number
  effectSource: 'mcid' | 'pilot' | 'literature' | 'budget'
  interim: 'none' | 'planned-spending' | 'unplanned'
  dmc: 'independent' | 'sponsor' | 'none'
  adaptations: Array<'ssr-blinded' | 'ssr-unblinded' | 'enrichment' | 'arm-dropping' | 'rar'>
  simulationReport: boolean
  outcomeLagWeeks: number
  accrualMonths: number
  bayesian: boolean
  informativePrior: boolean
  priorEssStated: boolean
  aiRole: 'none' | 'eligibility' | 'intervention' | 'covariate' | 'endpoint'
  aiExternallyValidated: boolean
  aiSubgroupPerformance: boolean
  aiLocked: boolean
  estimandSpecified: boolean
  niMarginJustified: boolean
  registeredBeforeEnrolment: boolean
  sapBeforeUnblinding: boolean
  clusterIccUsed: boolean
}

export type Severity = 'critical' | 'major' | 'minor' | 'good'

export interface Finding {
  id: string
  severity: Severity
  title: string
  detail: string
  source: string
}

export const strongPlan: TrialPlan = {
  phase: 'III',
  objective: 'superiority',
  design: 'parallel',
  stableCondition: false,
  endpointType: 'time-to-event',
  irreversibleOutcome: true,
  subjectiveEndpoint: false,
  surrogate: 'no',
  primaryEndpoints: 1,
  keySecondaries: 3,
  multiplicity: 'hierarchical',
  blinding: 'full',
  concealment: 'central',
  randomization: 'stratified',
  nPerArm: 1800,
  arms: 2,
  effectSource: 'mcid',
  interim: 'planned-spending',
  dmc: 'independent',
  adaptations: [],
  simulationReport: false,
  outcomeLagWeeks: 52,
  accrualMonths: 24,
  bayesian: false,
  informativePrior: false,
  priorEssStated: false,
  aiRole: 'covariate',
  aiExternallyValidated: true,
  aiSubgroupPerformance: true,
  aiLocked: true,
  estimandSpecified: true,
  niMarginJustified: false,
  registeredBeforeEnrolment: true,
  sapBeforeUnblinding: true,
  clusterIccUsed: false,
}

export const flawedPlan: TrialPlan = {
  phase: 'II',
  objective: 'superiority',
  design: 'parallel',
  stableCondition: false,
  endpointType: 'continuous',
  irreversibleOutcome: false,
  subjectiveEndpoint: true,
  surrogate: 'unvalidated',
  primaryEndpoints: 3,
  keySecondaries: 6,
  multiplicity: 'none',
  blinding: 'open',
  concealment: 'envelopes',
  randomization: 'rar',
  nPerArm: 40,
  arms: 2,
  effectSource: 'pilot',
  interim: 'unplanned',
  dmc: 'sponsor',
  adaptations: ['rar', 'ssr-unblinded'],
  simulationReport: false,
  outcomeLagWeeks: 26,
  accrualMonths: 12,
  bayesian: true,
  informativePrior: true,
  priorEssStated: false,
  aiRole: 'eligibility',
  aiExternallyValidated: false,
  aiSubgroupPerformance: false,
  aiLocked: false,
  estimandSpecified: false,
  niMarginJustified: false,
  registeredBeforeEnrolment: false,
  sapBeforeUnblinding: false,
  clusterIccUsed: false,
}

export function reviewPlan(p: TrialPlan): Finding[] {
  const f: Finding[] = []
  const add = (id: string, severity: Severity, title: string, detail: string, source: string) => f.push({ id, severity, title, detail, source })

  // --- Question & estimand
  if (!p.estimandSpecified)
    add('estimand', 'major', 'No estimand specified', 'Define population, treatments, variable, intercurrent-event strategies and summary measure; then align the estimator and sensitivity analyses to it.', 'ICH E9(R1); SPIRIT 2025')
  else add('estimand-ok', 'good', 'Estimand specified', 'The treatment effect of interest is defined before choosing the analysis.', 'ICH E9(R1)')

  // --- Design family
  if (p.design === 'crossover' && (p.irreversibleOutcome || !p.stableCondition || p.endpointType === 'time-to-event'))
    add('crossover', 'critical', 'Crossover design is unsuitable', 'Crossover requires a stable, chronic condition, a reversible effect, an adequate washout and an outcome measurable in each period. Mortality or irreversible outcomes make period 2 impossible or biased by carry-over.', 'ICH E9 §3.2; Senn, Cross-over Trials (2002)')
  if (p.design === 'factorial')
    add('factorial', 'minor', 'Factorial: check the no-interaction assumption', 'Efficiency relies on little interaction between treatments. Power the trial for the interaction if it is plausible and report both margins and the interaction.', 'Montgomery, Peters & Little, BMC Med Res Methodol 2003')
  if (p.design === 'cluster' && !p.clusterIccUsed)
    add('cluster', 'critical', 'Cluster design without design effect', 'Sample size must be inflated by 1 + (m − 1)·ICC and the analysis must account for clustering; otherwise the trial is underpowered and its p-values too small.', 'CONSORT extension for cluster trials (2012)')

  // --- Bias protection
  if (p.concealment === 'none')
    add('conceal', 'critical', 'No allocation concealment', 'Without concealment, recruiters can steer patients to arms. Trials with inadequate concealment exaggerate effects by roughly 30–40% on average.', 'Schulz et al., JAMA 1995')
  else if (p.concealment === 'envelopes')
    add('conceal-env', 'major', 'Envelope-based concealment', 'Sealed envelopes can be opened or held to the light. Use a central web/IVRS system, or at minimum sequentially numbered, opaque, sealed envelopes with audit.', 'CONSORT 2025 item on concealment')
  else add('conceal-ok', 'good', 'Central allocation concealment', 'The sequence is protected until assignment.', 'Schulz et al., JAMA 1995')

  if (p.blinding === 'open' && p.subjectiveEndpoint)
    add('blind', 'critical', 'Open-label with a subjective endpoint', 'Detection and performance bias inflate effects mainly for subjective outcomes. Blind participants and assessors, or switch to blinded outcome assessment (PROBE) with an objective or centrally adjudicated endpoint.', 'Wood et al., BMJ 2008; Savović et al., Ann Intern Med 2012')
  else if (p.blinding === 'open')
    add('blind-open', 'minor', 'Open-label', 'Acceptable for objective endpoints (e.g. all-cause mortality); still blind outcome adjudicators and the analysis team where possible, and report who was blinded.', 'CONSORT 2025')
  if (p.randomization === 'fixed-blocks' && (p.blinding === 'open' || p.blinding === 'probe'))
    add('blocks', 'major', 'Fixed block size in an unblinded trial', 'The last assignments of each block are predictable. Use random block sizes and do not disclose them to sites.', 'Schulz & Grimes, Lancet 2002')
  if (p.randomization === 'simple' && p.nPerArm * p.arms < 200)
    add('simple-small', 'minor', 'Simple randomization in a small trial', 'Chance imbalance in size and prognostic factors is likely below ~200 patients. Consider stratified blocks or minimisation.', 'ICH E9 §2.3')

  // --- Endpoints & multiplicity
  if (p.surrogate === 'unvalidated' && (p.phase === 'III' || p.phase === 'IV'))
    add('surrogate', 'critical', 'Unvalidated surrogate as a confirmatory endpoint', 'Surrogates can move in the right direction while patient outcomes worsen (e.g. CAST: anti-arrhythmics suppressed ectopy but increased mortality). Use a clinical endpoint or a surrogate validated at trial level for this drug class.', 'Echt et al., NEJM 1991; Fleming & DeMets, Ann Intern Med 1996')
  else if (p.surrogate === 'unvalidated')
    add('surrogate-ii', 'minor', 'Unvalidated surrogate', 'Fine for phase II decision-making, but do not let it substitute for a clinical endpoint in the confirmatory trial.', 'Fleming & DeMets 1996')
  const tests = p.primaryEndpoints + p.keySecondaries
  if (tests > 1 && p.multiplicity === 'none')
    add('multiplicity', p.primaryEndpoints > 1 ? 'critical' : 'major', `${tests} confirmatory tests without multiplicity control`, `The chance of at least one false positive across ${tests} independent true-null tests at α = 0.05 is ${Math.round((1 - 0.95 ** tests) * 100)}%. Pre-specify a hierarchy, Holm, or a graphical procedure covering every claim intended for the label.`, 'FDA Multiple Endpoints guidance (2022); ICH E9')
  else if (tests > 1) add('multiplicity-ok', 'good', 'Familywise error controlled', 'All confirmatory claims are covered by a pre-specified procedure.', 'FDA Multiple Endpoints guidance (2022)')

  // --- NI
  if (p.objective !== 'superiority' && !p.niMarginJustified)
    add('ni', 'critical', 'Margin not justified from historical evidence', 'Derive M1 from the control-vs-placebo effect (conservative bound, discounted for constancy doubts) and set M2 as a clinically acceptable fraction. Without this, "non-inferior" has no meaning.', 'FDA Non-Inferiority guidance (2016); CONSORT NI extension (2012)')

  // --- Sample size
  if (p.effectSource === 'pilot')
    add('pilot', 'major', 'Effect size taken from a pilot study', 'Pilot estimates are imprecise and, after selection, inflated; trials sized on them are often underpowered. Use the minimal clinically important difference.', 'Kraemer et al., Arch Gen Psychiatry 2006')
  if (p.effectSource === 'budget')
    add('budget', 'major', 'Effect size chosen to fit the budget', 'Reverse-engineering Δ from the affordable N ("sample size samba") gives a trial powered for an implausible effect. State the effect that matters and the power you actually have for it.', 'Schulz & Grimes, Lancet 2005')
  if (p.nPerArm < 30 && (p.phase === 'III' || p.phase === 'IV'))
    add('tiny', 'critical', 'Very small confirmatory trial', 'Fewer than 30 patients per arm can only detect very large effects; any "significant" result will overestimate the effect (winner\'s curse).', 'Button et al., Nat Rev Neurosci 2013; Gelman & Carlin 2014')

  // --- Interim monitoring
  if (p.interim === 'unplanned')
    add('interim', 'critical', 'Unplanned interim looks', 'Data-driven looks at nominal significance inflate Type I error (≈ 14% two-sided with 5 looks) and invite operational bias. Pre-specify timing and α-spending boundaries.', 'Armitage et al. 1969; ICH E9 §4.5')
  if (p.interim !== 'none' && p.dmc !== 'independent')
    add('dmc', p.dmc === 'none' ? 'critical' : 'major', 'Interim comparative data not handled by an independent DMC', 'Sponsor access to unblinded interim results compromises trial integrity. Use an independent DMC with a charter and a firewalled statistician.', 'FDA DMC draft guidance (2024); ICH E9')
  if (p.interim === 'planned-spending' && p.dmc === 'independent')
    add('interim-ok', 'good', 'Pre-specified interim analyses with an independent DMC', 'Boundaries control error and the sponsor stays blind.', 'FDA DMC draft guidance (2024)')

  // --- Adaptive
  const adaptive = p.adaptations.length > 0
  if (adaptive && !p.simulationReport)
    add('sim', 'major', 'Adaptive design without simulated operating characteristics', 'Report Type I error, power, sample-size distribution and bias across plausible scenarios, with the code, before the trial starts.', 'FDA Adaptive Designs guidance (2019); ICH E20 draft (2025)')
  if (p.adaptations.includes('ssr-unblinded') && p.dmc !== 'independent')
    add('ssr', 'major', 'Unblinded sample-size re-estimation outside an independent body', 'Unblinded SSR reveals the interim effect; it must be done by an independent party with a pre-specified rule and an α-preserving analysis (e.g. CHW weighting or promising-zone conditions).', 'Mehta & Pocock, Stat Med 2011; FDA 2019')
  if (p.randomization === 'rar' || p.adaptations.includes('rar')) {
    if (p.arms === 2)
      add('rar2', 'major', 'Response-adaptive randomization in a two-arm trial', 'In two-arm trials RAR usually lowers power, makes allocation highly variable and is biased by time trends, for small gains to trial patients. Prefer fixed allocation or group-sequential stopping.', 'Korn & Freidlin, JCO 2011; Thall et al., Ann Oncol 2015')
    const accrualWeeks = p.accrualMonths * 4.35
    if (p.outcomeLagWeeks > accrualWeeks / 4)
      add('rarlag', 'major', 'Outcome too slow for adaptive allocation', `With a ${p.outcomeLagWeeks}-week lag against ${p.accrualMonths} months of accrual, most patients will be randomized before their predecessors' outcomes are known.`, 'FDA Adaptive Designs guidance (2019)')
  }

  // --- Bayesian
  if (p.bayesian) {
    if (p.informativePrior && !p.priorEssStated)
      add('prior', 'major', 'Informative prior without quantified influence', 'Justify the prior from the source data, state its effective sample size, plan dynamic or robust borrowing, and show results under a sceptical prior.', 'FDA draft Bayesian guidance (Jan 2026); Morita et al. 2008')
    if (!p.simulationReport)
      add('bayes-oc', 'major', 'Bayesian decision rules without frequentist operating characteristics', 'Simulate Type I error and power of the posterior-probability thresholds, including all interim looks.', 'FDA draft Bayesian guidance (Jan 2026)')
  }

  // --- AI/ML
  if (p.aiRole !== 'none') {
    if (!p.aiExternallyValidated)
      add('ai-val', p.aiRole === 'eligibility' || p.aiRole === 'endpoint' ? 'critical' : 'major', 'AI model not externally validated', 'Internal cross-validation overstates performance; models degrade across sites and over time (e.g. the Epic Sepsis Model: reported AUC ~0.76–0.83, external AUC 0.63). Validate in the target population, including calibration.', 'Wong et al., JAMA Intern Med 2021; TRIPOD+AI (2024)')
    if (!p.aiSubgroupPerformance && (p.aiRole === 'eligibility' || p.aiRole === 'endpoint'))
      add('ai-fair', 'major', 'No subgroup performance for a model that selects or measures patients', 'Report discrimination and calibration by sex, age, race/ethnicity and site; check whether the training label is a biased proxy.', 'Obermeyer et al., Science 2019; FDA–EMA AI principles (Jan 2026)')
    if (!p.aiLocked)
      add('ai-lock', 'major', 'Model not locked before use', 'A model that changes during the trial changes the population or endpoint mid-stream. Lock and version it; pre-specify any planned updates.', 'FDA draft AI guidance (Jan 2025)')
    if (p.aiRole === 'intervention')
      add('ai-int', 'minor', 'AI as the intervention: use the AI reporting extensions', 'Describe the algorithm version, input data, human–AI interaction, error analysis and how failures were handled.', 'SPIRIT-AI & CONSORT-AI (2020)')
    if (p.aiRole === 'covariate')
      add('ai-cov', 'good', 'AI used for prognostic covariate adjustment', 'A pre-specified prognostic score as a baseline covariate gains precision without excluding patients and without threatening Type I error.', 'FDA covariate adjustment guidance (2023); EMA PROCOVA qualification (2022)')
  }

  // --- Transparency
  if (!p.registeredBeforeEnrolment)
    add('reg', 'critical', 'Not registered before the first participant', 'Prospective registration is required by ICMJE journals, FDAAA 801 for applicable trials, and the Declaration of Helsinki. Retrospective registration permits outcome switching.', 'ICMJE (2005); WHO ICTRP; Declaration of Helsinki (2024)')
  if (!p.sapBeforeUnblinding)
    add('sap', 'major', 'SAP not finalised before unblinding', 'Analysis choices made after seeing data (outcome definitions, covariates, populations) create forking paths. Finalise and date the SAP before database lock and unblinding.', 'ICH E9 §5.1; SPIRIT 2025')

  const order: Record<Severity, number> = { critical: 0, major: 1, minor: 2, good: 3 }
  return f.sort((a, b) => order[a.severity] - order[b.severity])
}

export function reviewToMarkdown(p: TrialPlan, findings: Finding[]): string {
  const lines = [
    '# Protocol design review',
    '',
    `Phase ${p.phase} · ${p.objective} · ${p.design} · ${p.arms} arms × ${p.nPerArm} · ${p.endpointType} primary endpoint`,
    '',
  ]
  for (const sev of ['critical', 'major', 'minor', 'good'] as Severity[]) {
    const items = findings.filter((x) => x.severity === sev)
    if (!items.length) continue
    lines.push(`## ${sev[0].toUpperCase() + sev.slice(1)} (${items.length})`, '')
    for (const it of items) lines.push(`- **${it.title}.** ${it.detail} _(${it.source})_`)
    lines.push('')
  }
  lines.push('Generated with AI Trials (rule-based review). Rules encode mainstream guidance; they do not replace a statistician or regulator.')
  return lines.join('\n')
}
