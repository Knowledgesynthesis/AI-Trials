# AI Trials: Data Science in Clinical Research

An interactive, evidence-based educational platform that teaches clinicians and researchers how machine learning and modern data science principles interface with clinical trial design, monitoring, and interpretation.

## Overview

AI Trials is a mobile-first, offline-capable educational app designed to help medical students, residents, fellows, attendings, and research coordinators master:

- **Clinical Trial Fundamentals**: Randomization, blinding, endpoints, and statistical power
- **Adaptive Trial Designs**: Response-adaptive randomization, sample size re-estimation, interim analyses
- **Bayesian Methods**: Prior distributions, posterior updating, credible intervals, and decision-making
- **ML in Clinical Trials**: Stratification, predictive enrichment, and fairness considerations (conceptual)
- **Ethics & Regulatory**: Equipoise, informed consent, FDA/ICH guidance

## Features

### Interactive Learning Modules
- **Foundations of Clinical Trials**: Randomization, endpoints, power, and error types
- **Adaptive Trial Designs**: Understanding how trials can modify based on accumulating data
- **Bayesian Methods**: Hands-on exploration of Bayesian statistics in trials
- **Interim Analyses**: Alpha spending, stopping boundaries, and conditional power
- **Machine Learning in Trials**: Conceptual understanding of ML-enhanced trial strategies
- **Ethics & Regulatory**: Navigate the ethical and regulatory landscape

### Interactive Laboratories

#### Bayesian Updating Laboratory
- Explore how posterior distributions evolve as data accumulate
- Adjust priors (uniform, weakly informative, informative, skeptical)
- Visualize credible intervals and probability of treatment superiority
- Compare Bayesian vs frequentist interpretations

#### Adaptive Design Simulator
- Simulate response-adaptive randomization in real-time
- Observe allocation probabilities shift toward better-performing arms
- Adjust tuning parameters to balance ethics and statistical efficiency
- Visualize cumulative allocation and final response rates

### Additional Features
- **Comprehensive Glossary**: 18+ essential terms with examples and cross-references
- **Assessment Hub**: Scenario-based questions testing your understanding
- **Dark Mode**: Full dark mode support for comfortable learning
- **Offline Capable**: Progressive Web App with offline functionality
- **Mobile First**: Responsive design optimized for all devices
- **Progress Tracking**: Monitor your learning journey

## Technical Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom components following shadcn/ui patterns
- **Charts**: Recharts for interactive visualizations
- **State Management**: Zustand with persistence
- **Routing**: React Router v6
- **Offline**: Vite PWA plugin with Workbox
- **Statistics**: Custom implementation of Bayesian and adaptive design algorithms

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── modules/        # Module-specific components
├── data/               # Static data (modules, glossary)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and algorithms
│   ├── statistics.ts   # Bayesian and adaptive design engines
│   └── utils.ts        # General utilities
├── pages/              # Route pages
├── store/              # Zustand state management
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## Educational Principles

### Evidence-Based
- Aligned with **FDA Adaptive Design Guidance (2019)**
- Follows **ICH E9/E9(R1)** statistical principles
- Consistent with **CONSORT** and **SPIRIT-AI** reporting standards
- References peer-reviewed literature and regulatory guidance

### Statistically Rigorous
- All formulas are standard, validated statistical methods
- Beta distributions for binary Bayesian updating
- Proper alpha spending functions (O'Brien-Fleming, Pocock)
- Conditional power calculations
- Monte Carlo simulation for complex probabilities

### Ethically Sound
- **Synthetic data only** - no real patient information
- Conceptual ML integration - not for clinical predictions
- Emphasis on clinical equipoise and informed consent
- Regulatory compliance and ethical oversight

### Pedagogically Designed
- Bloom's Taxonomy alignment (Remember → Create)
- Progressive difficulty (MS3 → Researcher)
- Interactive simulations for active learning
- Immediate feedback and rationales
- Scenario-based assessments

## Key Concepts Covered

### Bayesian Statistics
- Prior, likelihood, and posterior distributions
- Credible intervals vs confidence intervals
- Bayesian decision rules
- Prior selection and sensitivity analysis

### Adaptive Designs
- Response-adaptive randomization
- Sample size re-estimation
- Interim analyses and stopping rules
- Group sequential designs
- Alpha spending functions

### Statistical Inference
- Type I and Type II errors
- Statistical power and sample size
- Multiple testing adjustments
- Conditional power and futility

### Machine Learning (Conceptual)
- Patient stratification and risk scoring
- Predictive enrichment
- Algorithmic fairness and bias
- Validation requirements

## Learning Objectives

By completing this curriculum, learners will be able to:

1. **Explain** the fundamentals of randomized trial design
2. **Interpret** Bayesian posterior distributions and credible intervals
3. **Apply** response-adaptive randomization concepts
4. **Analyze** interim analysis results using stopping boundaries
5. **Evaluate** the role of ML in trial stratification
6. **Assess** ethical considerations in adaptive and ML-enhanced trials

## Accessibility

- **WCAG 2.2 AA** compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast modes
- Responsive text sizing

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

This is an educational platform developed following the master prompt in `plan.md`. The design emphasizes:
- **Clinical intuition** paired with statistical rigor
- **Pathoma-like clarity** for trial science
- **Evidence-based** alignment with regulatory norms
- **No algorithmic hallucinations** - all methods are validated

## License

MIT License - This is an educational tool for non-commercial use.

## Acknowledgments

- FDA Adaptive Design Guidance
- ICH E9/E9(R1) Statistical Principles
- CONSORT and SPIRIT-AI Extensions
- Clinical trials methodology literature
- Bayesian statistics community

## Disclaimer

**Educational Use Only**: This application is designed for educational purposes only. It uses synthetic data and conceptual simulations. It is not intended for:
- Real clinical decision-making
- Actual trial design or analysis
- Patient care or treatment decisions
- Regulatory submissions

Always consult with biostatisticians, clinical trialists, and regulatory experts for real trial design and analysis.

## Contact & Support

For questions, feedback, or issues, please refer to the project documentation or consult with clinical trial methodology experts.

---

**Version**: 1.0.0
**Last Updated**: 2025
**Platform**: Web (Progressive Web App)
