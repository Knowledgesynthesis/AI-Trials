# **AI TRIALS — OPTIMIZED MASTER PROMPT FOR EDUCATIONAL APP GENERATION**  
A clinically rigorous, evidence-based master prompt for generating a **mobile-first, offline-capable, dark-mode educational app** that teaches residents, fellows, and clinical researchers how machine learning and modern data science principles interface with **clinical trial design, monitoring, and interpretation**—without performing real patient-specific predictions.

---

# **MASTER PROMPT — AI Trials Educational App Generator (SPECIALIZED VERSION)**

## **Role & Mission**
You are a cross-functional product team (PM + Staff Engineer + Senior Instructional Designer + Biostatistics SME + Clinical Trial Methods SME + AI/ML-in-Medicine SME + Research Ethics SME + UX Writer + QA).  
Your mission: design an **interactive, evidence-based educational platform** that teaches:

**AI Trials: Data Science in Clinical Research**  
—A dynamic learning environment explaining how adaptive, data-driven, and ML-augmented methods fit into the workflow of modern clinical trials, from design → monitoring → interim analysis → ethics → interpretation.

This app must:
- Support **all learner levels:** MS3 → MS4 → residents → fellows → attendings → research coordinators  
- Cover **all research contexts:** feasibility analysis, protocol design, interim monitoring, Bayesian updating, AI-assisted decision rules, ethical constraints  
- Maintain complete **statistical rigor** with no fabricated formulas or nonstandard methods  
- Use **synthetic trial data only**; never real patient data  
- Be mobile-first, offline-capable, and safe for educational use  
- Provide **interactive and static visualizations** to make foundational concepts intuitive  

Your output must be scientifically accurate, logically consistent, and tightly aligned with biostatistics, regulatory guidance, and research ethics.

---

## **Inputs (Fill These)**
- **Primary Topic(s):**  
  Always centered on **AI-enhanced clinical trials**, including:  
  - Trial phases and designs (Phase I–IV; superiority, non-inferiority, equivalence)  
  - Adaptive designs (response-adaptive randomization, sample-size re-estimation)  
  - Bayesian trial methods (credible intervals, posterior distributions, prior choices)  
  - ML for patient stratification (conceptual, synthetic only)  
  - Interim analyses (stopping for futility/effectiveness)  
  - Error control (Type I/II error, alpha spending, Bayesian decision rules)  
  - Synthetic data monitoring dashboards  
  - Ethical considerations & regulatory expectations (FDA, EMA, CONSORT extensions)  
  - ML fairness, transparency, and limitations in trials  
- **Target Learner Levels:** {{LEVELS}}  
  - e.g., “Residents, fellows, clinicians, research scientists, trial coordinators”
- **Learner Context:** {{CONTEXT}}  
  - e.g., “Trial design, protocol development, statistical monitoring, reading ML-enhanced trial literature”
- **Learning Outcomes (SMART + Bloom):** {{LEARNING_OBJECTIVES}}  
  - e.g., “Explain adaptive randomization; perform conceptual Bayesian updating; interpret interim analysis dashboards; identify ethical boundaries; understand ML-assisted stratification”
- **Constraints/Preferences:**  
  Always include:  
  - *Mobile-first, dark mode, offline-ready, synthetic data only, conceptual ML integration only, no real clinical decision support*  
- **References/Standards:** {{REFERENCES}}  
  - e.g., “FDA Adaptive Design Guidance, ICH E9/R1, CONSORT, SPIRIT-AI, AI/ML in Drug Development guidelines”
- **Brand/Voice:** {{VOICE_TONE}}  
  - e.g., “Clinically intuitive, methodologically rigorous, visually engaging”
- **Localization/Regional Regulatory Needs:** {{LOCALE}}

---

# **Required Deliverables (Produce All)**

---

## **1. Executive Summary**
- Explain why clinicians struggle with integrating ML concepts into trial design & monitoring.  
- Introduce AI Trials as the **Adaptive Trial Simulator + Bayesian Visualizer + Interim Monitoring Dashboard**.  
- Provide 2–3 possible name variants + crisp value propositions.

---

## **2. Learner Personas & Use Cases**
Examples:
- Resident learning how adaptive designs work  
- Fellow evaluating modern ML-enhanced trial protocols  
- Clinician interpreting trial results using Bayesian rules  
- Research coordinator monitoring interim analyses  
Use cases: exam prep, trial design, IRB protocol development, journal club, simulation-based reasoning.

---

## **3. Curriculum Map & Knowledge Graph**
Everything must connect **Biostatistics ↔ Clinical Research ↔ ML Concepts ↔ Ethics**.

### **Prerequisites**
- Basic probability & classical statistics  
- Clinical trial phases & terminology  
- Understanding of endpoints, power, randomization  
- Intro to Bayesian reasoning  

### **Modules**
1. **Foundations of Clinical Trials**  
   - Randomization, blinding, allocation  
   - Endpoints: primary, secondary, composite  
   - Statistical power, Type I/II error  

2. **Adaptive Trial Designs**  
   - What makes a trial adaptive?  
   - Response-adaptive randomization  
   - Sample-size re-estimation  
   - Group sequential designs  

3. **Bayesian Methods in Trials**  
   - Priors, likelihood, posterior distributions  
   - Credible intervals vs confidence intervals  
   - Bayesian stopping rules  
   - Bayesian decision-making flows  

4. **Interim Analyses & Dashboards**  
   - Futility/early effectiveness boundaries  
   - Alpha spending  
   - Safety monitoring boards  
   - Visual pipelines for interim analysis  

5. **Machine Learning in Trials (Conceptual)**  
   - Stratification/risk groups via ML  
   - Synthetic clustering examples  
   - Predictive enrichment  
   - Feature selection & fairness pitfalls  

6. **Bias, Fairness & Ethical Oversight**  
   - Regulatory boundaries for ML in trials  
   - Transparency & explainability requirements  
   - Risks of algorithmic harm  
   - Clinical equipoise & participant protections  

7. **Integrated Trial Sandbox**  
   - Build a synthetic trial → choose design → add adaptive rules → visualize Bayesian updates → monitor interim dashboards  

Each module must include micro-concepts, Bloom level, prerequisites, and cross-links.

---

## **4. Interactives (AI Trials–Specific)**

### **Examples**
- **Adaptive Randomization Simulator**  
  - Change event rates → randomization probabilities update → visualize fairness vs efficiency tradeoffs  

- **Bayesian Updating Visualizer**  
  - Slider for prior → likelihood function → posterior distribution updates dynamically  
  - Show credible intervals & decision thresholds  

- **Interim Analysis Dashboard**  
  - Synthetic data stream → conditional power, alpha-spending curves, stopping boundary animations  

- **Stratification via ML (Conceptual)**  
  - Synthetic patient clusters → apply conceptual stratification rules → see trial impact  

- **Trial Design Flow Engine**  
  - Choose design, endpoints, adaptation rules → generate trial schema diagram  

For each interactive:
- purpose  
- inputs & controls  
- outputs  
- visuals (plots, curves, trees, diagrams)  
- preset synthetic cases  
- guardrails for statistical & ethical correctness  

---

## **5. Assessment & Mastery**
Item types:
- Identify appropriate adaptive designs  
- Interpret Bayesian posterior curves  
- Interim dashboard interpretation  
- Ethical scenario classification  
- Bias detection in ML-stratified trial examples  
Provide **10–20 items** with rationales.

---

## **6. Clinical Trial Reasoning Framework**
Teach stepwise reasoning:
1. Clarify research question & endpoints  
2. Select design & adaptation rules  
3. Understand inference framework (classical vs Bayesian)  
4. Plan interim monitoring & boundaries  
5. Add ML-based stratification (conceptual)  
6. Evaluate bias & fairness risks  
7. Interpret trial results responsibly  
8. Weigh ethical implications  

Include pitfalls:
- Misinterpreting posterior probability as frequentist p-value  
- Confusing adaptive randomization with unblinded allocation  
- Misusing ML stratification without fairness checks  
- Incorrectly applying Bayesian stopping rules  
- Violating equipoise  

---

## **7. Accessibility & Safety**
- WCAG 2.2 AA  
- Synthetic data only  
- No clinical predictions  
- Compliant with IRB-like educational constraints  
- No real-time AI or ML execution  
- Adhere strictly to regulatory boundaries  

---

## **8. Tech Architecture (Mobile-First, Offline)**
- React/TypeScript  
- Tailwind + shadcn/ui  
- Recharts/D3 for Bayesian & interim curves  
- IndexedDB + Service Worker for offline trials  
- State management via Zustand/Redux  
- Simulation engines for adaptive designs (JS-based)  

---

## **9. Data Schemas (JSON)**
Schemas for:
- synthetic trial arms  
- adaptive rules  
- Bayesian parameters  
- interim analysis meta  
- ML stratification categories  
- bias/ethics templates  
- glossary terms  
Provide representative examples.

---

## **10. Screen Specs & Text Wireframes**
Screens:
- Home  
- Trial Design Explorer  
- Adaptive Design Lab  
- Bayesian Updating Lab  
- Interim Dashboard  
- ML Stratification Module  
- Ethics Center  
- Integrated Trial Sandbox  
- Assessment Hub  
- Glossary  
- Settings  

Include text-based wireframes.

---

## **11. Copy & Content Kit**
Include:
- Microcopy (“credible vs confidence intervals”, “alpha spending explained”)  
- Glossary (prior, posterior, conditional power, adaptive rule)  
- Diagram labels  
- Two full example lessons + one complete synthetic trial case  

---

## **12. Analytics & A/B Plan**
UI-only:
- Bayesian visualization modes  
- Adaptive randomization flow styles  
- Dashboard layouts  
No experimental statistical A/B tests.

---

## **13. QA Checklist**
- Bayesian math checked for correctness  
- Adaptive design logic validated  
- No contradictions with ICH E9/R1, FDA guidance  
- ML components safe & conceptual  
- All definitions internally consistent  
- No fabricated statistical methods  

---

## **14. Roadmap**
Prototype → Pilot → Expanded Bayesian Toolkit → ML-Stratified Trial Library → Personalized Learning Paths  
Include milestones, risks, and acceptance criteria.

---

# **Style & Rigor Requirements**
- Clinically intuitive, statistically precise  
- Evidence-based & aligned with regulatory norms  
- No algorithmic hallucinations  
- Explain assumptions clearly  
- Provide Pathoma-like clarity but for trial science  

---

# **Acceptance Criteria**
- Learner can interpret adaptive designs, Bayesian updating, interim analysis, and conceptual ML-stratification  
- Outputs consistent with biostatistics, clinical research, & regulatory ethics  
- All modules reinforce a unified **AI Trials Systems Map**

---

# **Now Generate**
Using the inputs above, produce all deliverables in the required order.  
If any inputs are missing, make statistically & ethically sound assumptions and label them as defaults.
