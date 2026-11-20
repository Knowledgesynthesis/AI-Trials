import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('multiplicity'),
  objectives: [
    'Choose primary and key secondary endpoints that match the clinical question.',
    'Judge when a surrogate endpoint can be trusted, using examples where surrogates failed.',
    'Interpret composite endpoints and know when the win ratio helps.',
    'Apply Bonferroni, Holm, Hochberg and fixed-sequence procedures and know their assumptions.',
    'Assess the credibility of a subgroup claim.',
  ],
  sections: [
    {
      id: 'endpoints',
      title: 'Choosing endpoints',
      blocks: [
        text(md`
          The **primary endpoint** answers the main question, drives the sample size and carries the claim. It should be clinically meaningful to patients, measurable reliably in every participant, and as objective as the question allows. **Key secondary endpoints** that may support labelling claims belong inside the error-controlled testing strategy; other secondaries and exploratory endpoints are descriptive.

          Patient-relevant outcomes — how patients feel, function or survive — are preferred. Where many trials in a field measure different things, **core outcome sets** (COMET initiative) make results comparable.
        `),
      ],
    },
    {
      id: 'surrogates',
      title: 'Surrogate endpoints',
      blocks: [
        text(md`
          A surrogate (blood pressure, HbA1c, tumour response, viral load) is measured sooner or more cheaply than the clinical outcome it stands in for. Correlation between surrogate and outcome *in patients* is not enough; a valid surrogate must capture the treatment's effect on the outcome **at the trial level**, for the class of intervention in question (Fleming & DeMets 1996).
        `),
        callout(
          'evidence',
          'When surrogates misled',
          md`
            - **CAST** (*NEJM* 1989/1991): encainide and flecainide suppressed ventricular ectopy after MI — and more than doubled mortality versus placebo (7.7% vs 3.0%).
            - **ILLUMINATE** (*NEJM* 2007): torcetrapib raised HDL cholesterol by ~72% and increased all-cause mortality (HR 1.58).

            Both drugs moved the surrogate in the "right" direction via mechanisms that also caused harm.
          `,
        ),
        text(md`
          Regulators accept surrogates as a basis for full approval when validated, and as a basis for **accelerated approval** when "reasonably likely to predict clinical benefit" — with confirmatory trials on clinical endpoints required.
        `),
      ],
    },
    {
      id: 'composites',
      title: 'Composite endpoints',
      blocks: [
        text(md`
          Combining events (e.g. "cardiovascular death, MI or stroke") raises the event rate and power, and avoids choosing one component arbitrarily. Interpretation is safe only if the components are of **similar importance** and the treatment affects them in the **same direction**. A composite driven by the softest, most frequent component (e.g. "urgent revascularisation") can make a treatment look as if it prevents deaths when it does not.

          Always report every component separately. Hierarchical approaches such as the **win ratio** (Pocock et al. 2012) compare patients pairwise on the most important outcome first (death), then the next (hospitalisation), and so on — respecting clinical priority rather than counting all events equally.
        `),
      ],
    },
    {
      id: 'fwer',
      title: 'Multiplicity: controlling the familywise error rate',
      blocks: [
        text(md`
          With $m$ independent tests of true nulls at level α, the chance of at least one false positive is $1-(1-\alpha)^m$: 23% for 5 tests and 64% for 20. Multiplicity arises from endpoints, arms, doses, time points, analysis populations, interim looks and subgroups.

          | Procedure | Rule (m hypotheses, ordered p-values $p_{(1)} \le \dots \le p_{(m)}$) | Assumptions |
          |---|---|---|
          | **Bonferroni** | Reject if $p \le \alpha/m$ | None |
          | **Holm** (step-down) | Reject $p_{(1)}$ if $\le \alpha/m$, then $p_{(2)}$ if $\le \alpha/(m-1)$, …; stop at first failure | None; always ≥ Bonferroni |
          | **Hochberg** (step-up) | From the largest: reject all $p_{(j)}$, $j \le k$, for the largest $k$ with $p_{(k)} \le \alpha/(m-k+1)$ | Independence or positive dependence |
          | **Fixed sequence** | Test in pre-specified order at full α; stop at first non-significant | Order fixed in advance |
          | **Gatekeeping / graphical** | Recycle α from rejected hypotheses along a pre-specified graph (Bretz et al. 2009) | Graph fixed in advance |

          FDA's *Multiple Endpoints in Clinical Trials* guidance (final, 2022) expects strong control of the familywise error rate for all endpoints intended to support claims.
        `),
        lab('/labs/multiplicity', 'Multiplicity & subgroups lab', 'Paste your own p-values, compare procedures, and run a subgroup "lottery" under a uniform true effect.'),
        check(
          q(
            'mu-c1',
            'Four key endpoints have p = 0.010, 0.015, 0.020, 0.030 (α = 0.05). How many are rejected by Holm?',
            [
              right('All four.', 'Holm: 0.010 ≤ 0.0125, 0.015 ≤ 0.0167, 0.020 ≤ 0.025, 0.030 ≤ 0.05 — all pass in sequence.'),
              wrong('One.', 'That is Bonferroni (only 0.010 ≤ 0.0125).'),
              wrong('None.', 'The smallest p is below α/4 = 0.0125.'),
              wrong('Two.', 'Holm continues while each step passes.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'subgroups',
      title: 'Subgroups: the most abused analysis',
      blocks: [
        text(md`
          Most treatments have roughly consistent relative effects across subgroups. With 20 subgroups, chance alone will produce apparent differences — some subgroups "significant", some not, some apparently harmed.

          **Rules for reading subgroup claims**
          - Compare subgroups with a **test of interaction**, never by noting that one subgroup's p-value is < 0.05 and another's is not.
          - Credibility rises when the subgroup was **pre-specified with a direction**, is one of few tested, has biological rationale, and replicates (ICEMAN, Schandelmaier et al. 2020).
          - Treat unexpected findings as hypotheses for the next trial.
        `),
        callout(
          'evidence',
          'ISIS-2: aspirin and the zodiac',
          'Among 17,187 patients with suspected MI, aspirin reduced vascular mortality. Split by star sign, patients born under Gemini or Libra showed a slightly adverse (non-significant) effect, while all others showed a 28% reduction (2p < 0.00001) (*Lancet* 1988). The authors included the analysis precisely to show how persuasive chance subgroup findings can look.',
        ),
      ],
    },
  ],
  quiz: [
    q('mu-q1', 'Ten independent true-null endpoints are each tested at α = 0.05. The probability of at least one false positive is about…', [
      right('40%', '1 − 0.95¹⁰ = 0.401.'),
      wrong('5%', 'That is the per-test rate.'),
      wrong('50%', '10 × 0.05 = 0.5 is the expected number of false positives, not the probability of at least one.'),
      wrong('10%', 'There is no such shortcut.'),
    ]),
    q('mu-q2', 'Which procedure is uniformly at least as powerful as Bonferroni and valid under any dependence?', [
      right('Holm', 'Holm step-down dominates Bonferroni without extra assumptions.'),
      wrong('Hochberg', 'More powerful still, but requires independence or positive dependence.'),
      wrong('Unadjusted testing', 'Unadjusted testing does not control the familywise error rate at all.'),
      wrong('Fixed sequence', 'Powerful when the order is right, but not uniformly more powerful than Bonferroni.'),
    ]),
    q('mu-q3', 'A trial tests endpoints in a fixed sequence A → B → C at α = 0.05: p_A = 0.01, p_B = 0.20, p_C = 0.001. Which claims are supported?', [
      right('A only.', 'Testing stops at B; C cannot be claimed, however small its p-value.'),
      wrong('A and C.', 'Skipping B breaks the procedure and FWER control.'),
      wrong('All three, since two are very small.', 'B was not significant, so the sequence stops; small p-values later in the sequence cannot be claimed.'),
      wrong('None, because B failed.', 'A was tested first and passed.'),
    ]),
    q('mu-q4', 'In CAST, encainide and flecainide suppressed ventricular ectopy after MI. What happened to mortality?', [
      right('It increased compared with placebo.', 'About 7.7% vs 3.0% — a textbook surrogate failure.'),
      wrong('It fell in line with ectopy suppression.', 'That was the expectation that proved wrong.'),
      wrong('It was unchanged.', 'Mortality rose and the arms were stopped early.'),
      wrong('It was not measured.', 'Mortality was the reason the trial stopped.'),
    ]),
    q('mu-q5', 'A composite of "death, MI or urgent revascularisation" shows a 20% reduction, driven almost entirely by revascularisation. How should it be read?', [
      right('The benefit is mainly on the least serious component; do not infer an effect on death or MI.', 'Components must be inspected separately.'),
      wrong('The treatment reduces death by about 20%.', 'The composite effect does not transfer to each component.'),
      wrong('Composite endpoints are invalid and the result should be ignored.', 'Composites are legitimate when interpreted carefully.'),
      wrong('The composite proves the components are equally affected.', 'It proves nothing about individual components.'),
    ]),
    q('mu-q6', 'Subgroup A: HR 0.70, p = 0.01. Subgroup B: HR 0.85, p = 0.30. Interaction p = 0.45. What should you conclude?', [
      right('No credible evidence that the effect differs between subgroups.', 'The correct comparison is the interaction test.'),
      wrong('The treatment works only in subgroup A.', 'Comparing subgroup p-values is a classic error.'),
      wrong('The treatment harms subgroup B.', 'HR 0.85 points toward benefit.'),
      wrong('The overall result is invalid.', 'Subgroup noise does not invalidate the overall comparison.'),
    ]),
    q('mu-q7', 'Which subgroup finding is most credible?', [
      right('Pre-specified with a stated direction and rationale, one of three tested, interaction p = 0.002, replicated in a second trial.', 'This meets most ICEMAN credibility criteria.'),
      wrong('Discovered post hoc among 30 subgroups, interaction p = 0.04.', 'Expected by chance among 30 tests.'),
      wrong('The subgroup p-value is 0.001 but the interaction was not tested.', 'Within-subgroup significance is not evidence of effect modification.'),
      wrong('The subgroup effect is large and the authors find it biologically plausible after seeing it.', 'Post-hoc rationales are easy to construct.'),
    ]),
    q('mu-q8', 'Why does FDA require multiplicity control for key secondary endpoints but not exploratory ones?', [
      right('Key secondaries may support labelling claims, so false positives have regulatory consequences; exploratory results are descriptive.', 'Error control is tied to claims.'),
      wrong('Exploratory endpoints are always non-significant.', 'They may be significant; they simply carry no confirmatory claim.'),
      wrong('Secondary endpoints have more power.', 'Unrelated to the rationale.'),
      wrong('Exploratory endpoints are not analysed.', 'They are analysed and reported descriptively.'),
    ]),
  ],
  sources: ['fda-multiple', 'bretz2009', 'echt1991', 'illuminate2007', 'fleming1996', 'pocock2012', 'isis2', 'iceman'],
}

export default m
