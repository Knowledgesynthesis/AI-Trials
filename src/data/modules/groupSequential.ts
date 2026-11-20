import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, widget, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('group-sequential'),
  objectives: [
    'Explain quantitatively why repeated testing inflates Type I error.',
    'Compare Pocock, O\'Brien–Fleming, Haybittle–Peto and Lan–DeMets spending boundaries.',
    'Design binding versus non-binding futility rules and interpret conditional and predictive power.',
    'Describe the role, independence and decision process of a data monitoring committee.',
    'Explain why trials stopped early for benefit overestimate effects and how to report them.',
  ],
  sections: [
    {
      id: 'peeking',
      title: 'The peeking problem',
      blocks: [
        text(md`
          Interim analyses are ethically necessary — patients should not keep receiving an inferior or harmful treatment once the answer is clear — and economically sensible. But every look is another chance for random noise to cross a threshold. Testing at nominal two-sided p < 0.05 at 5 equally spaced looks gives an overall false-positive rate of about **14%**; at 10 looks, about **19%** (Armitage, McPherson & Rowe 1969).

          **Group-sequential designs** fix this by pre-specifying when you will look and how extreme the result must be at each look, so that the *overall* Type I error stays at α.
        `),
        lab('/labs/group-sequential', 'Group-sequential monitor', 'Exact boundaries for any number of looks, the peeking inflation curve, a step-by-step DMC simulation and the early-stopping bias.'),
      ],
    },
    {
      id: 'boundaries',
      title: 'Boundary families and α-spending',
      blocks: [
        text(md`
          Statistics at look $k$ are standardised on the Z scale with **information fraction** $t_k$ (share of total information: patients for continuous/binary endpoints, **events** for time-to-event).

          | Boundary | Shape | 4 equally spaced looks, two-sided 0.05 | Character |
          |---|---|---|---|
          | **Pocock** (1977) | Constant | 2.361 at every look | Stops early more easily; final critical value much above 1.96; max N +18% or more |
          | **O'Brien–Fleming** (1979) | $c/\sqrt{t_k}$ | 4.048, 2.862, 2.337, 2.024 | Very strict early, close to 1.96 at the end; almost no N inflation |
          | **Haybittle–Peto** | Fixed interim Z ≈ 3 | 3, 3, 3, ≈ 1.98 | Simple; final test almost unaffected |
          | **Lan–DeMets OBF-type spending** | $\alpha(t)=2-2\Phi\!\left(z_{1-\alpha/2}/\sqrt{t}\right)$ (one-sided α) | 4.333, 2.963, 2.359, 2.014 | Flexible number/timing of looks |

          A **spending function** $\alpha(t)$ specifies how much of the total α has been "used" by information fraction $t$. At each actual look, the boundary is chosen so that the probability of first crossing it equals $\alpha(t_k) - \alpha(t_{k-1})$. Looks can then be added, dropped or moved without breaking error control — provided timing is not chosen based on the observed trend.
        `),
        callout(
          'practice',
          'Default for confirmatory trials',
          'An O\'Brien–Fleming-type spending function with 1–3 interim analyses: early stopping only for overwhelming evidence, near-nominal final test, maximum sample size inflated by only 1–3%. Use events, not calendar time, to schedule time-to-event looks.',
        ),
        check(
          q(
            'gs-c1',
            'Why do most phase III trials prefer O\'Brien–Fleming-type boundaries to Pocock boundaries?',
            [
              right('They rarely stop on early, noisy data and leave the final analysis close to the fixed-design critical value.', 'Strict early thresholds protect credibility; the final test barely changes.'),
              wrong('They spend more α early.', 'They spend very little α early.'),
              wrong('They maximise the chance of early stopping.', 'Pocock boundaries do that.'),
              wrong('They do not require pre-specification.', 'All boundaries must be pre-specified.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'futility',
      title: 'Futility, conditional power and predictive power',
      blocks: [
        text(md`
          Stopping for **futility** protects patients and resources when success has become unlikely. Futility rules can be:

          - **Binding** — must be followed; efficacy boundaries can be relaxed slightly to reclaim α. Rarely used because DMCs need discretion.
          - **Non-binding** — efficacy boundaries are computed as if futility did not exist, so Type I error is controlled even if the DMC continues. This is the regulatory default.

          Futility is often framed with the Brownian-motion ("B-value") formulation (Lan & Wittes 1988). At information fraction $t$ with interim $Z_t$ and final critical value $c$:

          $$\text{CP}_\theta = \Phi\!\left(\frac{Z_t\sqrt{t} + \theta(1-t) - c}{\sqrt{1-t}}\right) \qquad \text{PP} = \Phi\!\left(\frac{Z_t - c\sqrt{t}}{\sqrt{1-t}}\right)$$

          where $\theta$ is the assumed drift for the rest of the trial: the **design effect**, or the **current trend** $\hat\theta = Z_t/\sqrt{t}$. **Predictive power** (PP) averages CP over the uncertainty in $\theta$ (flat prior).
        `),
        widget('cp-explainer'),
        callout(
          'pitfall',
          undefined,
          'Conditional power under the current trend treats an imprecise interim estimate as the truth and is very volatile early; under the design effect it ignores the data. A common, defensible rule is "consider stopping if CP under the design effect < 10–20%" — written into the charter as non-binding guidance.',
        ),
      ],
    },
    {
      id: 'dmc',
      title: 'Data monitoring committees',
      blocks: [
        text(md`
          An independent **DMC** (clinicians, a biostatistician, often an ethicist) reviews unblinded comparative data at pre-specified times and recommends continuing, modifying or stopping the trial. Essentials (FDA DMC draft guidance 2024; Ellenberg, Fleming & DeMets 2019):

          - **Independence** from sponsor and investigators; no financial conflicts.
          - A **charter** fixed before the first look: membership, meeting schedule, boundaries, voting, communication.
          - **Confidentiality**: interim comparative results go only to the DMC and an independent statistical group. If the sponsor sees emerging results, decisions about recruitment, endpoints or analysis can no longer be assumed independent of the data.
          - **Judgement**: boundaries are guidelines. DMCs weigh consistency across endpoints, safety, external evidence and data maturity — stopping requires more than one number crossing a line.
        `),
        callout(
          'evidence',
          'Stopping for harm: WHI 2002',
          'The Women\'s Health Initiative estrogen-plus-progestin trial (16,608 women) was stopped after a mean 5.2 years when invasive breast cancer crossed its monitoring boundary (HR 1.26) and a global index showed risks exceeding benefits (*JAMA* 2002). Safety monitoring is continuous and not bound by efficacy boundaries.',
        ),
      ],
    },
    {
      id: 'after-stopping',
      title: 'After stopping: estimates and reporting',
      blocks: [
        text(md`
          A trial that stops at a look because $Z$ crossed a high boundary has, by selection, caught an estimate on its high side. Truncated trials therefore **overestimate** effects, more so the earlier they stop: in a systematic comparison, trials stopped early for benefit showed relative risks about 29% more extreme than comparable non-truncated trials (ratio of RRs 0.71), especially with fewer than 500 events (Bassler et al., *JAMA* 2010).

          **Report** the planned and actual information fractions, the boundary crossed, the naive estimate and, where available, bias-adjusted estimates and stage-wise confidence intervals (CONSORT ACE extension for adaptive designs, 2020).
        `),
        check(
          q(
            'gs-c2',
            'A trial stops at 30% information with HR 0.45, crossing an O\'Brien–Fleming boundary. The design assumed HR 0.75. How should you interpret the HR?',
            [
              right('The benefit is likely real, but its size is probably overestimated; expect a smaller effect in later trials and practice.', 'Early stopping selects for random highs.'),
              wrong('The true HR is 0.45 because the boundary was very strict.', 'Strict boundaries reduce false positives but not the upward bias of the estimate.'),
              wrong('The result is a false positive.', 'Crossing a strict boundary is strong evidence of some benefit.'),
              wrong('The trial should have continued until HR 0.75 was confirmed.', 'Continuing after crossing is an ethical and practical judgement for the DMC, not a rule.'),
            ],
          ),
        ),
      ],
    },
  ],
  quiz: [
    q('gs-q1', 'Testing accumulating data at nominal two-sided p < 0.05 at 5 equally spaced looks gives an overall Type I error of about…', [
      right('14%', 'Armitage, McPherson & Rowe (1969).'),
      wrong('5%', 'That would require adjusted boundaries.'),
      wrong('25%', 'Too high for 5 looks; correlation between looks limits inflation.'),
      wrong('1%', 'Repeated testing increases, not decreases, error.'),
    ]),
    q('gs-q2', 'What is the main advantage of a Lan–DeMets spending function over classical fixed boundaries?', [
      right('The number and timing of looks can change during the trial while Type I error stays controlled.', 'Boundaries are computed from actual information fractions.'),
      wrong('It removes the need for a DMC.', 'DMCs are still needed for unblinded review.'),
      wrong('It always gives more power.', 'Power depends on the spending shape.'),
      wrong('It allows choosing looks after seeing the data trend.', 'Timing must not depend on observed results.'),
    ]),
    q('gs-q3', 'Why are futility rules usually non-binding?', [
      right('DMCs need discretion; non-binding rules keep Type I error controlled even if the DMC continues.', 'Efficacy boundaries are calculated ignoring futility.'),
      wrong('Binding futility rules inflate Type I error.', 'Binding rules lower Type I error if followed; the issue is flexibility.'),
      wrong('Regulators forbid futility stopping.', 'Futility stopping is common and accepted.'),
      wrong('Futility can only be judged at the final analysis.', 'Futility is assessed at interim analyses.'),
    ]),
    q('gs-q4', 'At 50% information, Z = −0.2 and the design drift is 3.24 (90% power). Conditional power under the design effect is about 25%; under the current trend about 0.1%. What is the best interpretation?', [
      right('The trend is unpromising; the two numbers bracket the uncertainty, and the charter\'s pre-specified rule should guide the DMC.', 'Different CP assumptions answer different questions.'),
      wrong('The trial must stop immediately.', 'Not unless a binding rule says so.'),
      wrong('The trial is certain to fail.', 'CP under the design effect is still non-trivial.'),
      wrong('Conditional power is meaningless at 50% information.', 'It is commonly used at mid-trial.'),
    ]),
    q('gs-q5', 'Why must interim comparative results be withheld from the sponsor?', [
      right('Knowledge of emerging results can influence trial conduct and decisions, compromising integrity.', 'Confidentiality protects the trial\'s credibility.'),
      wrong('Sponsors are not allowed to know about adverse events.', 'Sponsors receive blinded safety reports; comparative efficacy data are withheld.'),
      wrong('It reduces the sample size.', 'Unrelated.'),
      wrong('It is required only for Bayesian trials.', 'It applies to all monitored trials.'),
    ]),
    q('gs-q6', 'Trials stopped early for benefit tend to…', [
      right('Overestimate the treatment effect, especially when the number of events is small.', 'Bassler et al. (2010).'),
      wrong('Underestimate the treatment effect.', 'Selection on crossing a high boundary biases upward.'),
      wrong('Give unbiased estimates if boundaries are strict.', 'Strictness reduces but does not remove the bias.'),
      wrong('Have inflated Type I error regardless of boundaries.', 'Proper boundaries control Type I error.'),
    ]),
    q('gs-q7', 'In a time-to-event trial, how is the information fraction at an interim analysis usually defined?', [
      right('Observed events divided by the planned total number of events.', 'Information is driven by events.'),
      wrong('Calendar time elapsed divided by planned duration.', 'Calendar time can diverge greatly from information.'),
      wrong('Patients enrolled divided by planned enrolment.', 'Enrolment ignores how many events have accrued.'),
      wrong('Number of sites activated.', 'Unrelated to statistical information.'),
    ]),
    q('gs-q8', 'Which design inflates the maximum sample size the most for the same power?', [
      right('Pocock boundaries with several looks.', 'About 20% inflation with 5 looks (two-sided 0.05, 90% power).'),
      wrong("O'Brien–Fleming boundaries.", 'Inflation is typically only 1–3%.'),
      wrong('Haybittle–Peto.', 'The final boundary is close to 1.96, so inflation is minimal.'),
      wrong('A fixed design with no interim looks.', 'That is the reference with no inflation.'),
    ]),
  ],
  sources: ['armitage1969', 'pocock1977', 'obf1979', 'landemets1983', 'jennison2000', 'lanwittes1988', 'fda-dmc', 'ellenberg2019', 'whi2002', 'bassler2010', 'ace', 'ich-e9'],
}

export default m
