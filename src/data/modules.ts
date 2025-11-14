import { Module, AssessmentItem } from '@/types'

export const modules: Module[] = [
  {
    id: 'foundations',
    title: 'Foundations of Clinical Trials',
    description:
      'Master the essential concepts of clinical trial design, including randomization, blinding, endpoints, and statistical power.',
    prerequisites: ['Basic probability', 'Introductory statistics'],
    learnerLevels: ['MS3', 'MS4', 'Resident', 'Fellow', 'Coordinator'],
    bloomLevel: 'Understand',
    estimatedTime: 45,
    topics: [
      {
        id: 'randomization-basics',
        title: 'Randomization and Allocation',
        content: `Randomization is the cornerstone of clinical trials, ensuring unbiased treatment assignment and enabling causal inference.

**Why Randomize?**
- Eliminates selection bias
- Balances known and unknown confounders
- Provides basis for statistical inference
- Maintains ethical equipoise

**Types of Randomization:**
1. **Simple Randomization:** Like flipping a coin for each patient
2. **Block Randomization:** Ensures balance within blocks of patients
3. **Stratified Randomization:** Balances important prognostic factors
4. **Response-Adaptive:** Allocation probabilities change based on outcomes (covered in Adaptive Designs module)`,
        examples: [
          {
            id: 'simple-random-example',
            title: 'Simple Randomization Example',
            description:
              'In a trial comparing Drug A vs Placebo, each patient has 50% chance of either treatment, independent of all other assignments.',
          },
        ],
        keyTakeaways: [
          'Randomization eliminates selection bias',
          'Different randomization schemes serve different purposes',
          'Stratification helps balance important prognostic factors',
        ],
      },
      {
        id: 'endpoints',
        title: 'Trial Endpoints',
        content: `Trial endpoints are the outcomes measured to assess treatment efficacy and safety.

**Primary Endpoint:**
- The main outcome the trial is designed to assess
- Sample size is calculated to detect differences in this endpoint
- Only one primary endpoint (or a single composite)

**Secondary Endpoints:**
- Additional outcomes of interest
- Not used for primary hypothesis testing
- Can provide supportive evidence

**Composite Endpoints:**
- Combine multiple outcomes into a single measure
- e.g., "Death, MI, or stroke"
- Can increase event rates and statistical power
- Must be clinically meaningful as a whole

**Endpoint Characteristics:**
- **Binary:** Event yes/no (e.g., response, survival at 1 year)
- **Continuous:** Measured on a scale (e.g., blood pressure, tumor size)
- **Time-to-Event:** Time until an event occurs (survival analysis)
- **Ordinal:** Ordered categories (e.g., disease severity grades)`,
        examples: [],
        keyTakeaways: [
          'Primary endpoint drives trial design and sample size',
          'Endpoints must be clinically meaningful and measurable',
          'Composite endpoints can increase power but require careful interpretation',
        ],
      },
      {
        id: 'power-errors',
        title: 'Statistical Power and Error Types',
        content: `Understanding statistical power and error types is crucial for trial design and interpretation.

**Type I Error (α):**
- False positive: Concluding treatment works when it doesn't
- Usually set at 0.05 (5% risk)
- Multiple testing increases Type I error risk

**Type II Error (β):**
- False negative: Missing a true treatment effect
- Related to power: Power = 1 - β
- Typically set β = 0.20 (80% power) or β = 0.10 (90% power)

**Statistical Power:**
- Probability of detecting a true effect
- Depends on:
  - Sample size
  - True effect size
  - Variability
  - Significance level (α)

**Sample Size Calculation:**
Requires specifying:
- Minimum clinically meaningful difference
- Expected variability (standard deviation)
- Desired α and power
- Expected loss to follow-up`,
        examples: [],
        keyTakeaways: [
          'Type I error is false positive; Type II error is false negative',
          'Power = 1 - β (probability of detecting true effect)',
          'Adequate sample size is crucial for reliable conclusions',
          'Multiple testing requires α adjustment',
        ],
      },
    ],
    interactives: [
      {
        id: 'randomization-simulator',
        type: 'Trial-Designer',
        title: 'Randomization Simulator',
        description:
          'Explore how different randomization schemes affect balance and allocation',
        inputs: [
          {
            id: 'sample-size',
            label: 'Sample Size',
            type: 'slider',
            min: 20,
            max: 200,
            step: 10,
            defaultValue: 100,
            tooltip: 'Total number of patients to randomize',
          },
          {
            id: 'randomization-type',
            label: 'Randomization Method',
            type: 'select',
            options: [
              { value: 'simple', label: 'Simple' },
              { value: 'block', label: 'Block (size 4)' },
              { value: 'stratified', label: 'Stratified by Risk' },
            ],
            defaultValue: 'simple',
          },
          {
            id: 'allocation-ratio',
            label: 'Allocation Ratio',
            type: 'select',
            options: [
              { value: '1:1', label: '1:1' },
              { value: '2:1', label: '2:1' },
              { value: '3:1', label: '3:1' },
            ],
            defaultValue: '1:1',
          },
        ],
        outputs: [
          {
            id: 'allocation-chart',
            label: 'Allocation Over Time',
            type: 'chart',
          },
          {
            id: 'balance-metrics',
            label: 'Balance Metrics',
            type: 'table',
          },
        ],
        presets: [
          {
            id: 'preset-simple',
            name: 'Simple 1:1',
            description: 'Basic coin-flip randomization',
            values: {
              'sample-size': 100,
              'randomization-type': 'simple',
              'allocation-ratio': '1:1',
            },
          },
        ],
      },
    ],
    assessmentItems: [],
  },
  {
    id: 'adaptive-designs',
    title: 'Adaptive Trial Designs',
    description:
      'Learn how adaptive designs allow trials to modify based on accumulating data while maintaining statistical validity.',
    prerequisites: ['Foundations of Clinical Trials'],
    learnerLevels: ['Resident', 'Fellow', 'Attending', 'Researcher'],
    bloomLevel: 'Apply',
    estimatedTime: 60,
    topics: [
      {
        id: 'what-is-adaptive',
        title: 'What Makes a Trial Adaptive?',
        content: `Adaptive designs allow pre-planned modifications to trial conduct based on accumulating data, without undermining validity or integrity.

**Key Principle:** Adaptations must be:
- Pre-specified in the protocol
- Based on appropriate statistical methods
- Preserve Type I error control
- Maintain trial blinding when necessary

**Types of Adaptations:**
1. **Sample Size Re-estimation:** Adjust N based on observed variability or effect size
2. **Response-Adaptive Randomization:** Change allocation ratios favoring better arms
3. **Arm Dropping:** Drop futile or inferior arms in multi-arm trials
4. **Population Enrichment:** Focus enrollment on responsive subgroups
5. **Dose Selection:** Identify optimal dose(s) for later phases

**Regulatory Considerations:**
- FDA Guidance on Adaptive Designs (2019)
- ICH E9(R1) on estimands
- Requires careful planning and DMC oversight`,
        examples: [],
        keyTakeaways: [
          'Adaptive designs increase efficiency and flexibility',
          'All adaptations must be pre-specified',
          'Type I error control is paramount',
          'Regulatory engagement is essential',
        ],
      },
      {
        id: 'response-adaptive-randomization',
        title: 'Response-Adaptive Randomization',
        content: `Response-adaptive randomization (RAR) adjusts allocation probabilities as outcome data accumulate, potentially allocating more patients to better-performing arms.

**Bayesian RAR Example:**
- Start with equal allocation (50:50)
- After each outcome, update posterior probabilities
- Adjust randomization probability proportional to P(treatment better)
- Balance ethics (more to better arm) with information (need data from both)

**Considerations:**
- **Time lag:** Outcomes may not be immediately available
- **Variability:** Early randomness can lead to imbalanced allocation
- **Power:** Can maintain or slightly reduce power vs fixed allocation
- **Interpretation:** Treatment comparisons remain valid with proper analysis

**When to Use RAR:**
- Rapid-onset endpoints (weeks, not years)
- Rare diseases where minimizing exposure to inferior treatment is critical
- Multi-arm trials with potential for early arm dropping

**When NOT to Use RAR:**
- Long-term endpoints (survival outcomes)
- When blinding is essential and frequent updates impossible
- Concerns about operational complexity`,
        examples: [],
        keyTakeaways: [
          'RAR can reduce patient exposure to inferior treatments',
          'Requires timely outcome data',
          'Statistical validity maintained with proper design',
          'Complexity and time lag are important practical considerations',
        ],
      },
    ],
    interactives: [
      {
        id: 'adaptive-randomization-lab',
        type: 'Adaptive-Randomizer',
        title: 'Adaptive Randomization Laboratory',
        description:
          'Simulate response-adaptive randomization and see allocation probabilities update in real-time',
        inputs: [
          {
            id: 'control-rate',
            label: 'Control Response Rate',
            type: 'slider',
            min: 0.1,
            max: 0.9,
            step: 0.05,
            defaultValue: 0.4,
            unit: '',
            tooltip: 'True response rate in control arm',
          },
          {
            id: 'treatment-rate',
            label: 'Treatment Response Rate',
            type: 'slider',
            min: 0.1,
            max: 0.9,
            step: 0.05,
            defaultValue: 0.6,
            unit: '',
            tooltip: 'True response rate in treatment arm',
          },
          {
            id: 'total-n',
            label: 'Total Sample Size',
            type: 'number',
            min: 50,
            max: 500,
            defaultValue: 200,
          },
        ],
        outputs: [
          {
            id: 'allocation-over-time',
            label: 'Allocation Probability Over Time',
            type: 'chart',
          },
          {
            id: 'final-allocation',
            label: 'Final Allocation',
            type: 'table',
          },
        ],
        presets: [
          {
            id: 'large-effect',
            name: 'Large Treatment Benefit',
            description: '60% vs 30% response rates',
            values: {
              'control-rate': 0.3,
              'treatment-rate': 0.6,
              'total-n': 200,
            },
          },
          {
            id: 'small-effect',
            name: 'Small Treatment Benefit',
            description: '45% vs 55% response rates',
            values: {
              'control-rate': 0.45,
              'treatment-rate': 0.55,
              'total-n': 200,
            },
          },
        ],
      },
    ],
    assessmentItems: [],
  },
  {
    id: 'bayesian-methods',
    title: 'Bayesian Methods in Clinical Trials',
    description:
      'Master Bayesian approaches to trial design and analysis, including prior selection, posterior updating, and credible intervals.',
    prerequisites: ['Foundations of Clinical Trials', 'Basic probability'],
    learnerLevels: ['Fellow', 'Attending', 'Researcher'],
    bloomLevel: 'Apply',
    estimatedTime: 75,
    topics: [
      {
        id: 'bayesian-fundamentals',
        title: 'Bayesian Fundamentals',
        content: `Bayesian methods provide a natural framework for updating beliefs as data accumulate—ideal for adaptive trials and decision-making.

**Bayes' Theorem:**
Posterior ∝ Prior × Likelihood

**Components:**
1. **Prior Distribution:** Represents existing knowledge before seeing data
2. **Likelihood:** Probability of observed data given parameters
3. **Posterior Distribution:** Updated beliefs after observing data

**Prior Selection:**
- **Non-informative/Weakly informative:** Minimal influence (e.g., Uniform, Jeffreys prior)
- **Informative:** Based on historical data or expert opinion
- **Skeptical:** Centers on null effect
- **Enthusiastic:** Centers on beneficial effect

**Justification Required:**
All priors must be justified and pre-specified. Sensitivity analyses with alternative priors strengthen conclusions.`,
        examples: [],
        keyTakeaways: [
          "Bayesian updating follows Bayes' theorem naturally",
          'Prior choice must be justified and pre-specified',
          'Posterior provides complete inference about parameters',
          'Credible intervals have intuitive probability interpretation',
        ],
      },
      {
        id: 'credible-vs-confidence',
        title: 'Credible vs Confidence Intervals',
        content: `A common source of confusion: credible intervals and confidence intervals have fundamentally different interpretations.

**Credible Interval (Bayesian):**
- 95% credible interval: "There is a 95% probability the parameter lies in this interval"
- Direct probability statement about the parameter
- Accounts for prior information
- Natural for decision-making

**Confidence Interval (Frequentist):**
- 95% confidence interval: "If we repeated this study infinitely, 95% of such intervals would contain the true parameter"
- Statement about the procedure, not this specific interval
- The parameter is fixed (but unknown); the interval is random
- No probability statement about where the parameter actually is

**Example:**
- 95% credible interval for treatment effect: [0.1, 0.5]
  → "There's a 95% probability the effect is between 0.1 and 0.5"
- 95% confidence interval for treatment effect: [0.1, 0.5]
  → "95% of such intervals would contain the true effect" (NOT "95% probability it's in this interval")

**Clinical Implications:**
Bayesian credible intervals align with how clinicians naturally think: "What's the probability this treatment works?"`,
        examples: [],
        keyTakeaways: [
          'Credible intervals: probability parameter in interval',
          'Confidence intervals: long-run frequency of coverage',
          'Bayesian interpretation more intuitive for clinical decisions',
          'Both valid—serve different inferential frameworks',
        ],
      },
    ],
    interactives: [
      {
        id: 'bayesian-updater',
        type: 'Bayesian-Updater',
        title: 'Bayesian Updating Visualizer',
        description:
          'See how posterior distributions update as data accumulate, and explore the impact of different priors',
        inputs: [
          {
            id: 'prior-type',
            label: 'Prior Distribution',
            type: 'select',
            options: [
              { value: 'uniform', label: 'Uniform (Non-informative)' },
              { value: 'weak', label: 'Weakly Informative' },
              { value: 'informative', label: 'Informative' },
              { value: 'skeptical', label: 'Skeptical' },
            ],
            defaultValue: 'uniform',
          },
          {
            id: 'n-control',
            label: 'Control Sample Size',
            type: 'slider',
            min: 10,
            max: 200,
            step: 10,
            defaultValue: 50,
          },
          {
            id: 'n-treatment',
            label: 'Treatment Sample Size',
            type: 'slider',
            min: 10,
            max: 200,
            step: 10,
            defaultValue: 50,
          },
          {
            id: 'response-control',
            label: 'Control Responses',
            type: 'slider',
            min: 0,
            max: 200,
            step: 1,
            defaultValue: 20,
          },
          {
            id: 'response-treatment',
            label: 'Treatment Responses',
            type: 'slider',
            min: 0,
            max: 200,
            step: 1,
            defaultValue: 35,
          },
        ],
        outputs: [
          {
            id: 'posterior-plot',
            label: 'Posterior Distribution',
            type: 'distribution',
          },
          {
            id: 'credible-interval',
            label: '95% Credible Interval',
            type: 'text',
          },
          {
            id: 'probability-superiority',
            label: 'P(Treatment > Control)',
            type: 'number',
            format: 'percentage',
          },
        ],
        presets: [
          {
            id: 'strong-evidence',
            name: 'Strong Evidence',
            description: 'Clear treatment benefit',
            values: {
              'prior-type': 'uniform',
              'n-control': 100,
              'n-treatment': 100,
              'response-control': 40,
              'response-treatment': 70,
            },
          },
        ],
      },
    ],
    assessmentItems: [],
  },
  {
    id: 'interim-analysis',
    title: 'Interim Analyses and Monitoring',
    description:
      'Learn how to plan and conduct interim analyses, control Type I error with alpha spending, and use stopping boundaries.',
    prerequisites: ['Foundations of Clinical Trials'],
    learnerLevels: ['Fellow', 'Attending', 'Researcher'],
    bloomLevel: 'Analyze',
    estimatedTime: 60,
    topics: [
      {
        id: 'why-interim',
        title: 'Why Conduct Interim Analyses?',
        content: `Interim analyses allow trials to stop early for efficacy, futility, or safety—protecting patients and conserving resources.

**Ethical Imperative:**
- Stop early if treatment clearly superior (efficacy)
- Stop early if treatment clearly won't work (futility)
- Protect patients from harmful treatments (safety)

**Challenges:**
- **Multiple Testing:** Each analysis increases Type I error risk
- **Data Maturity:** Early data may be unreliable
- **Operational Bias:** Knowledge of results could affect conduct

**Solution: Group Sequential Designs**
Pre-specify:
- Number and timing of analyses
- Stopping boundaries (efficacy and/or futility)
- Alpha spending function
- Decision rules

**Data Monitoring Committee (DMC):**
Independent group that reviews interim data and makes recommendations to continue, modify, or stop the trial.`,
        examples: [],
        keyTakeaways: [
          'Interim analyses can stop trials early for efficacy or futility',
          'Must control Type I error with alpha spending',
          'Pre-specification is essential',
          'DMCs provide independent oversight',
        ],
      },
    ],
    interactives: [],
    assessmentItems: [],
  },
  {
    id: 'ml-in-trials',
    title: 'Machine Learning in Clinical Trials (Conceptual)',
    description:
      'Understand how ML can enhance trial design through stratification and predictive enrichment, with awareness of fairness and bias concerns.',
    prerequisites: ['Foundations of Clinical Trials'],
    learnerLevels: ['Fellow', 'Attending', 'Researcher'],
    bloomLevel: 'Evaluate',
    estimatedTime: 50,
    topics: [
      {
        id: 'ml-stratification-intro',
        title: 'ML-Based Patient Stratification',
        content: `Machine learning can identify patient subgroups likely to benefit from treatment, but must be applied carefully to avoid bias.

**Potential Applications:**
1. **Risk Stratification:** Cluster patients by baseline risk
2. **Predictive Enrichment:** Identify likely responders
3. **Prognostic Modeling:** Adjust for patient heterogeneity

**Methods:**
- Unsupervised clustering (k-means, hierarchical)
- Supervised prediction models (random forests, neural nets)
- Dimensionality reduction (PCA, t-SNE)

**Critical Considerations:**
- **Validation:** Models must be validated in independent data
- **Fairness:** Avoid disparities by race, gender, SES
- **Transparency:** Clinicians must understand the stratification
- **Prospective vs Retrospective:** Post-hoc subgroups are hypothesis-generating only

**Regulatory Landscape:**
FDA is actively developing guidance for AI/ML in drug development.`,
        examples: [],
        keyTakeaways: [
          'ML can identify patient subgroups for targeted enrollment',
          'Fairness and bias mitigation are paramount',
          'Prospective validation required',
          'Regulatory guidance evolving',
        ],
      },
    ],
    interactives: [],
    assessmentItems: [],
  },
  {
    id: 'ethics-regulatory',
    title: 'Ethics, Fairness, and Regulatory Considerations',
    description:
      'Explore the ethical frameworks governing clinical trials, regulatory requirements, and special considerations for AI-enhanced designs.',
    prerequisites: [],
    learnerLevels: ['MS4', 'Resident', 'Fellow', 'Attending', 'Coordinator'],
    bloomLevel: 'Evaluate',
    estimatedTime: 45,
    topics: [
      {
        id: 'equipoise-ethics',
        title: 'Clinical Equipoise and Informed Consent',
        content: `Clinical equipoise—genuine uncertainty about treatment superiority—is the ethical foundation for randomization.

**Equipoise:**
- Expert community is truly uncertain which treatment is better
- Justifies randomly assigning patients
- If equipoise is lost (e.g., interim results show clear benefit), trial should stop

**Informed Consent:**
Patients must understand:
- The trial purpose and procedures
- Risks and potential benefits
- Randomization process
- Right to withdraw
- How data will be used

**Adaptive Designs and Equipoise:**
- Response-adaptive randomization preserves equipoise while favoring better arms
- Must maintain blinding when appropriate
- Early stopping rules protect patients and preserve equipoise`,
        examples: [],
        keyTakeaways: [
          'Equipoise is the ethical basis for randomization',
          'Informed consent must be clear and comprehensive',
          'Adaptive designs can enhance ethics by reducing exposure to inferior treatments',
        ],
      },
    ],
    interactives: [],
    assessmentItems: [],
  },
]

// Assessment items
export const assessmentItems: AssessmentItem[] = [
  {
    id: 'q1',
    type: 'MCQ',
    question:
      'What is the primary purpose of randomization in a clinical trial?',
    options: [
      'To ensure equal numbers in each treatment arm',
      'To eliminate selection bias and balance confounders',
      'To blind participants to treatment assignment',
      'To increase statistical power',
    ],
    correctAnswer: 'To eliminate selection bias and balance confounders',
    rationale:
      'Randomization eliminates selection bias and tends to balance both known and unknown confounders between treatment arms, providing the foundation for causal inference.',
    difficulty: 'Easy',
    bloomLevel: 'Understand',
    tags: ['randomization', 'foundations'],
  },
  {
    id: 'q2',
    type: 'MCQ',
    question:
      'A 95% credible interval for treatment effect is [0.2, 0.8]. How should this be interpreted?',
    options: [
      'If we repeated the study many times, 95% of intervals would contain the true effect',
      'There is a 95% probability the true effect is between 0.2 and 0.8',
      'The p-value is 0.05',
      'We are 95% confident the effect is positive',
    ],
    correctAnswer:
      'There is a 95% probability the true effect is between 0.2 and 0.8',
    rationale:
      'A credible interval is a Bayesian construct that provides a direct probability statement: there is a 95% probability the parameter lies within the interval, given the observed data and prior.',
    difficulty: 'Medium',
    bloomLevel: 'Understand',
    tags: ['bayesian', 'credible-interval'],
  },
  {
    id: 'q3',
    type: 'MCQ',
    question:
      'At an interim analysis, the conditional power is calculated to be 12% under the current trend. What does this suggest?',
    options: [
      'The trial is highly likely to succeed',
      'The trial should stop for efficacy',
      'The trial may be futile and should be considered for early termination',
      'The Type I error has been exceeded',
    ],
    correctAnswer:
      'The trial may be futile and should be considered for early termination',
    rationale:
      'Low conditional power (typically <20%) suggests that even if the trial continues to completion, there is a low probability of ultimately rejecting the null hypothesis, indicating potential futility.',
    difficulty: 'Medium',
    bloomLevel: 'Analyze',
    tags: ['interim-analysis', 'conditional-power', 'futility'],
  },
  {
    id: 'q4',
    type: 'True-False',
    question:
      'Response-adaptive randomization always increases the statistical power of a trial compared to fixed 1:1 allocation.',
    correctAnswer: 'False',
    rationale:
      'Response-adaptive randomization may maintain or slightly reduce power compared to fixed allocation. The primary benefits are ethical (fewer patients to inferior treatment) and flexibility, not necessarily increased power.',
    difficulty: 'Medium',
    bloomLevel: 'Understand',
    tags: ['adaptive-design', 'response-adaptive-randomization'],
  },
  {
    id: 'q5',
    type: 'Scenario',
    question: `You are designing a Phase II trial in a rare disease with rapid-onset endpoints (response within 4 weeks).
    The trial compares three experimental doses vs control. Which adaptive features would be most appropriate?`,
    options: [
      'Response-adaptive randomization and interim dose selection',
      'Sample size re-estimation only',
      'Group sequential design with futility stopping only',
      'No adaptive features—use traditional fixed design',
    ],
    correctAnswer: 'Response-adaptive randomization and interim dose selection',
    rationale:
      'Given the rapid-onset endpoints, response-adaptive randomization is feasible and ethical. Interim dose selection allows dropping futile doses early. This is ideal for rare diseases where minimizing patient exposure to ineffective treatments is critical.',
    difficulty: 'Hard',
    bloomLevel: 'Apply',
    tags: ['adaptive-design', 'dose-selection', 'rare-disease'],
  },
]
