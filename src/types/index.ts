// Core types for AI Trials educational platform

export type LearnerLevel = 'MS3' | 'MS4' | 'Resident' | 'Fellow' | 'Attending' | 'Coordinator' | 'Researcher'

export type TrialPhase = 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV'

export type TrialDesign =
  | 'Parallel'
  | 'Crossover'
  | 'Factorial'
  | 'Adaptive'
  | 'Sequential'
  | 'Non-Inferiority'
  | 'Superiority'
  | 'Equivalence'

export type EndpointType = 'Primary' | 'Secondary' | 'Safety' | 'Composite'

export type BlindingType = 'Open-Label' | 'Single-Blind' | 'Double-Blind' | 'Triple-Blind'

export type RandomizationType = 'Simple' | 'Block' | 'Stratified' | 'Response-Adaptive'

// Trial Configuration
export interface TrialConfig {
  id: string
  name: string
  phase: TrialPhase
  design: TrialDesign
  blinding: BlindingType
  randomization: RandomizationType
  targetSampleSize: number
  numberOfArms: number
  endpoints: Endpoint[]
  adaptiveRules?: AdaptiveRule[]
  bayesianConfig?: BayesianConfig
  mlStratification?: MLStratificationConfig
  createdAt: Date
  updatedAt: Date
}

// Endpoint definition
export interface Endpoint {
  id: string
  name: string
  type: EndpointType
  description: string
  measurementType: 'Continuous' | 'Binary' | 'Time-to-Event' | 'Ordinal'
  unit?: string
  clinicallyMeaningfulDifference?: number
}

// Adaptive trial rules
export interface AdaptiveRule {
  id: string
  type: 'Sample-Size-Reestimation' | 'Response-Adaptive-Randomization' | 'Futility' | 'Efficacy' | 'Dose-Selection'
  description: string
  trigger: {
    analysisTime: 'Interim' | 'Continuous'
    condition: string
  }
  action: string
  parameters: Record<string, number | string>
}

// Bayesian analysis configuration
export interface BayesianConfig {
  priorDistribution: PriorDistribution
  likelihoodFunction: string
  credibleIntervalLevel: number // e.g., 0.95 for 95% credible interval
  decisionThreshold: number
  posteriorUpdateFrequency: 'Continuous' | 'Interim' | 'Final'
}

export interface PriorDistribution {
  type: 'Normal' | 'Beta' | 'Gamma' | 'Uniform' | 'Informative' | 'Non-Informative'
  parameters: {
    mean?: number
    sd?: number
    alpha?: number
    beta?: number
    min?: number
    max?: number
  }
  justification: string
}

export interface PosteriorDistribution {
  type: string
  parameters: Record<string, number>
  mean: number
  median: number
  credibleInterval: [number, number]
  probability: number
}

// ML Stratification
export interface MLStratificationConfig {
  enabled: boolean
  features: string[]
  algorithm: 'Clustering' | 'Risk-Score' | 'Predictive-Enrichment'
  numberOfStrata: number
  fairnessConstraints: FairnessConstraint[]
}

export interface FairnessConstraint {
  feature: string
  type: 'Demographic-Parity' | 'Equal-Opportunity' | 'Calibration'
  threshold: number
}

// Interim analysis
export interface InterimAnalysis {
  id: string
  trialId: string
  analysisNumber: number
  timing: number // Fraction of information or patients enrolled
  enrolledPatients: number
  primaryEndpointData: AnalysisData
  conditionalPower: number
  alphaSpent: number
  stoppingBoundary: StoppingBoundary
  recommendation: 'Continue' | 'Stop-Futility' | 'Stop-Efficacy' | 'Modify'
  performedAt: Date
}

export interface AnalysisData {
  control: ArmData
  treatment: ArmData
  effectSize: number
  standardError: number
  testStatistic: number
  pValue?: number
  bayesianProbability?: number
}

export interface ArmData {
  n: number
  events?: number
  mean?: number
  sd?: number
  median?: number
}

export interface StoppingBoundary {
  type: "O'Brien-Fleming" | 'Pocock' | 'Haybittle-Peto' | 'Custom'
  efficacyBound: number
  futilityBound: number
}

// Synthetic patient data
export interface SyntheticPatient {
  id: string
  arm: string
  age: number
  gender: 'M' | 'F' | 'Other'
  baseline: Record<string, number>
  outcomes: Record<string, number | boolean>
  enrollmentDate: Date
  stratum?: string
}

// Module content
export interface Module {
  id: string
  title: string
  description: string
  prerequisites: string[]
  learnerLevels: LearnerLevel[]
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'
  topics: Topic[]
  interactives: Interactive[]
  assessmentItems: AssessmentItem[]
  estimatedTime: number // minutes
}

export interface Topic {
  id: string
  title: string
  content: string
  examples: Example[]
  visualizations?: Visualization[]
  keyTakeaways: string[]
}

export interface Example {
  id: string
  title: string
  description: string
  syntheticData?: any
  code?: string
}

export interface Visualization {
  id: string
  type: 'Chart' | 'Diagram' | 'Animation' | 'Interactive'
  title: string
  data?: any
  config?: any
}

// Interactive simulations
export interface Interactive {
  id: string
  type: 'Bayesian-Updater' | 'Adaptive-Randomizer' | 'Interim-Dashboard' | 'Trial-Designer' | 'ML-Stratifier'
  title: string
  description: string
  inputs: InteractiveInput[]
  outputs: InteractiveOutput[]
  presets: Preset[]
}

export interface InteractiveInput {
  id: string
  label: string
  type: 'slider' | 'select' | 'number' | 'checkbox' | 'radio'
  min?: number
  max?: number
  step?: number
  options?: Array<{ value: string | number; label: string }>
  defaultValue: any
  unit?: string
  tooltip?: string
}

export interface InteractiveOutput {
  id: string
  label: string
  type: 'chart' | 'number' | 'text' | 'table' | 'distribution'
  format?: string
}

export interface Preset {
  id: string
  name: string
  description: string
  values: Record<string, any>
}

// Assessment
export interface AssessmentItem {
  id: string
  type: 'MCQ' | 'True-False' | 'Scenario' | 'Interpretation' | 'Design-Choice'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  rationale: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  bloomLevel: Module['bloomLevel']
  tags: string[]
}

export interface UserProgress {
  userId: string
  completedModules: string[]
  assessmentScores: Record<string, number>
  interactiveCompletions: Record<string, number>
  lastActive: Date
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  learnerLevel: LearnerLevel
  notifications: boolean
  offlineMode: boolean
}

// Glossary
export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  category: 'Statistics' | 'Bayesian' | 'Adaptive-Design' | 'ML' | 'Ethics' | 'Regulatory'
  relatedTerms: string[]
  examples?: string[]
}

// Ethics and Regulatory
export interface EthicsCase {
  id: string
  title: string
  scenario: string
  considerations: string[]
  regulatoryGuidance: string[]
  discussionPoints: string[]
  category: 'Equipoise' | 'Informed-Consent' | 'Fairness' | 'Transparency' | 'Safety'
}
