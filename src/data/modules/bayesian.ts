import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, lab, md, q, right, text, widget, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('bayesian'),
  objectives: [
    'Update a prior with trial data (Beta–binomial and normal–normal) and interpret the posterior.',
    'Explain prior types, effective sample size, prior–data conflict and dynamic borrowing.',
    'Write decision rules using posterior probabilities of clinically meaningful effects and predictive probabilities.',
    'Explain why Bayesian designs still need simulated frequentist operating characteristics, and what FDA\'s 2026 draft guidance asks for.',
    'Read a Bayesian trial result and a Bayesian re-analysis critically.',
  ],
  sections: [
    {
      id: 'mechanics',
      title: 'Posterior ∝ prior × likelihood',
      blocks: [
        text(md`
          Bayesian inference treats the unknown effect as uncertain and updates that uncertainty with data:
          $$p(\theta \mid \text{data}) \propto p(\text{data} \mid \theta)\, p(\theta)$$

          **Binary outcome.** With a Beta(a, b) prior on a response rate and x responders among n, the posterior is Beta(a + x, b + n − x). The prior behaves like $a + b$ previous patients — its **effective sample size** (ESS).

          **Treatment effect on a continuous scale** (e.g. log odds ratio). With a normal prior $N(\mu_0, \sigma_0^2)$ and an estimate $\hat\theta$ with standard error $s$, the posterior is normal with
          $$\text{mean} = \frac{\mu_0/\sigma_0^2 + \hat\theta/s^2}{1/\sigma_0^2 + 1/s^2}, \qquad \text{variance} = \frac{1}{1/\sigma_0^2 + 1/s^2}$$
          — a precision-weighted average. As data accumulate, $s$ shrinks and the data dominate.
        `),
        widget('mini-bayes'),
        callout(
          'key',
          'Credible versus confidence intervals',
          'A 95% **credible** interval contains the parameter with 95% probability *given the prior and the data*. A 95% **confidence** interval comes from a procedure with 95% long-run coverage. With flat priors and large samples they are numerically similar, and P(effect > 0 | data) ≈ 1 − one-sided p. They diverge when the prior carries real information — which is exactly when the prior must be justified.',
        ),
      ],
    },
    {
      id: 'priors',
      title: 'Choosing and defending priors',
      blocks: [
        text(md`
          | Prior | Purpose | Example |
          |---|---|---|
          | **Weakly informative / reference** | Let data dominate; regularise estimates | Beta(1, 1); N(0, 1²) on log OR |
          | **Sceptical** | Convince a sceptic: centred on no effect | N(0, σ²) with 5% probability of exceeding the hoped-for effect (Spiegelhalter et al. 1994) |
          | **Enthusiastic** | Test whether data dissuade an enthusiast | Centred on the hoped-for effect, 5% probability of harm |
          | **Informative / historical borrowing** | Reduce sample size using prior trials, adult data for children, historical controls | Power prior, commensurate prior, robust meta-analytic-predictive (MAP) prior |

          **Borrowing** rests on *exchangeability*: the historical data must be similar enough to the new trial. **Dynamic** methods discount automatically when they are not — e.g. a robust MAP prior mixes the historical component with a vague component, so a prior–data conflict shifts weight toward the new data (Schmidli et al. 2014). Always state the prior's **ESS** (Morita, Thall & Müller 2008) so readers can see how many "virtual patients" it contributes.
        `),
        callout(
          'regulatory',
          'FDA draft guidance, January 2026',
          'FDA\'s draft guidance on Bayesian methodology for drugs and biologics covers primary inference in trials intended to support effectiveness, including confirmatory trials with external-data borrowing. It describes success criteria either **calibrated to a Type I error rate** or based directly on **posterior probabilities of clinically meaningful benefit** when prior information is credibly justified; expects detailed prior justification, quantified prior influence (e.g. ESS) and simulated operating characteristics. (Draft; comment period closed March 2026.)',
        ),
      ],
    },
    {
      id: 'decisions',
      title: 'Decision rules that mean something',
      blocks: [
        text(md`
          - **Posterior probability of benefit**: declare success if $P(\theta > 0 \mid \text{data}) > \gamma$ (e.g. 0.975 or 0.99).
          - **Probability of a clinically meaningful effect**: $P(\theta > \delta_{\text{MCID}} \mid \text{data})$ — more informative than "any benefit". REMAP-CAP, for example, reported probabilities of efficacy and of futility defined on clinically relevant odds-ratio thresholds.
          - **Predictive probability of success**: the probability, averaging over the posterior, that the trial will succeed if continued to its maximum size. Natural for interim go/no-go and phase II decisions (Lee & Liu 2008).
          - **Probability of harm**: report it too.
        `),
        callout(
          'evidence',
          'REMAP-CAP: IL-6 receptor antagonists',
          'In critically ill COVID-19 patients, tocilizumab and sarilumab increased organ-support-free days (median 10 and 11 vs 0 days; adjusted cumulative OR 1.64 and 1.76) with posterior probabilities of superiority > 99.9% and 99.5%; in-hospital mortality was about 28%, 22% and 36% (*NEJM* 2021). The sarilumab arm was small (48 patients) — posterior probabilities can be high while estimates remain imprecise.',
        ),
        check(
          q(
            'b-c1',
            'A trial reports P(OR > 1 | data) = 0.97 and P(OR > 1.25 | data) = 0.40, where OR > 1.25 is the minimal important effect. How should this be read?',
            [
              right('Benefit is probable, but a clinically important benefit is about as likely as not.', 'Reporting probabilities at clinically relevant thresholds prevents over-interpreting "any benefit".'),
              wrong('The treatment has a clinically important effect with 97% probability.', 'That conflates any benefit with meaningful benefit.'),
              wrong('The treatment is ineffective, because 0.40 < 0.5.', '0.97 probability of some benefit is substantial evidence of an effect.'),
              wrong('The result equals p = 0.03.', 'Only with a flat prior is P(effect > 0) ≈ 1 − one-sided p; and the thresholds differ.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'oc',
      title: 'Operating characteristics: Bayesian designs still get simulated',
      blocks: [
        text(md`
          A posterior does not depend on how often you looked (the likelihood principle). But a **procedure** — "stop and declare success whenever $P(\theta>0)>0.975$" — has a frequentist false-positive rate, and it grows with the number of looks. Regulators approving many drugs care about that long-run rate, so Bayesian adaptive designs are calibrated by simulation: thresholds such as 0.98–0.995 with multiple looks keep the Type I error near 2.5%.

          Simulate across scenarios: null, design alternative, smaller effects, prior–data conflict (historical data wrong), drift over time. Report Type I error, power, expected sample size and bias.
        `),
        lab('/labs/bayesian', 'Bayesian analysis lab', 'Prior × likelihood → posterior; a two-arm decision with prior-sensitivity table; and the Type I error of monitoring a posterior probability at several looks.'),
      ],
    },
    {
      id: 'reading',
      title: 'Reading Bayesian results and re-analyses',
      blocks: [
        text(md`
          Ask: What prior was used, and why? What is its ESS relative to the trial? Is the conclusion robust to sceptical and flat priors? Is the decision threshold pre-specified and calibrated? Are posterior probabilities reported for clinically meaningful thresholds and for harm?
        `),
        callout(
          'evidence',
          'EOLIA, re-read',
          'EOLIA (ECMO for severe ARDS) missed its primary endpoint: 60-day mortality 35% vs 46%, RR 0.76 (95% CI 0.55–1.04), p = 0.09; enrolment was stopped for futility (*NEJM* 2018). A post-hoc Bayesian re-analysis found posterior probabilities of any mortality benefit between 88% and 99% across priors including sceptical ones (Goligher et al., *JAMA* 2018). Lesson: "not significant" did not mean "no effect" — but post-hoc re-analyses are hypothesis-generating and cannot replace pre-specified inference.',
        ),
      ],
    },
  ],
  quiz: [
    q('b-q1', 'Prior Beta(4, 16) for a response rate; 12 responses in 30 patients. What is the posterior?', [
      right('Beta(16, 34), mean 32%.', 'a + x = 16; b + n − x = 16 + 18 = 34; 16/50 = 0.32.'),
      wrong('Beta(12, 18), mean 40%.', 'That ignores the prior.'),
      wrong('Beta(16, 30), mean 35%.', 'b should increase by n − x = 18.'),
      wrong('Beta(4, 16), because the prior dominates.', 'Data always update the prior.'),
    ]),
    q('b-q2', 'What is the effective sample size of a Beta(10, 30) prior?', [
      right('40 patients.', 'ESS ≈ a + b for a Beta prior.'),
      wrong('10 patients.', 'That is the "prior responders" only.'),
      wrong('30 patients.', 'That is the "prior non-responders" only.'),
      wrong('Infinite, because it is informative.', 'Informative priors carry finite information.'),
    ]),
    q('b-q3', 'Why does a robust meta-analytic-predictive prior help when borrowing historical controls?', [
      right('Its vague mixture component lets the posterior discount the historical data automatically when they conflict with the new data.', 'This limits bias from non-exchangeable history.'),
      wrong('It guarantees the historical data are exchangeable.', 'Nothing can guarantee that; robustness mitigates violations.'),
      wrong('It removes the need for a control arm.', 'Borrowing can reduce, not eliminate, concurrent controls.'),
      wrong('It gives more weight to historical data as conflict increases.', 'The opposite: conflict shifts weight to the vague component, discounting the historical data.'),
    ]),
    q('b-q4', 'A Bayesian design stops for efficacy whenever P(T > C) > 0.975, checked at 10 looks. What happens to the frequentist Type I error?', [
      right('It rises well above 2.5%, so the threshold must be calibrated by simulation.', 'Multiple looks inflate the procedure\'s false-positive rate.'),
      wrong('It stays at 2.5% because posteriors ignore stopping rules.', 'The posterior does; the procedure\'s error rate does not.'),
      wrong('It falls, because Bayesian methods are conservative.', 'Not with repeated looks at a fixed threshold.'),
      wrong('It cannot be computed for Bayesian designs.', 'It can always be estimated by simulating the full procedure under the null.'),
    ]),
    q('b-q5', 'With a flat prior and a large trial, P(effect > 0 | data) = 0.99 corresponds approximately to…', [
      right('A one-sided p-value of 0.01.', 'The posterior probability ≈ 1 − one-sided p.'),
      wrong('A two-sided p-value of 0.99.', 'That inverts the relationship; a high posterior probability corresponds to a small p-value.'),
      wrong('A 99% probability that the effect is clinically important.', 'Only "greater than zero".'),
      wrong('Nothing; the two frameworks cannot be compared.', 'They coincide numerically in this setting.'),
    ]),
    q('b-q6', 'What is a predictive probability of success at an interim?', [
      right('The probability, averaged over the current posterior, that the trial will meet its success criterion at the final analysis.', 'It integrates uncertainty about the effect.'),
      wrong('The posterior probability that the treatment works now.', 'That is the current posterior probability.'),
      wrong('The power of the original design.', 'Power is a pre-trial quantity.'),
      wrong('The probability the DMC recommends continuing.', 'DMC recommendations weigh many factors; predictive probability is a statistical quantity about the final analysis.'),
    ]),
    q('b-q7', 'Which reporting practice best supports a Bayesian claim?', [
      right('Pre-specified prior with justification and ESS, results under sceptical and flat priors, and probabilities for clinically meaningful thresholds and harm.', 'This makes prior influence transparent.'),
      wrong('Reporting only the posterior mean.', 'Uncertainty and prior influence are missing.'),
      wrong('Choosing the prior after seeing the data to fit expert opinion.', 'Priors must be pre-specified.'),
      wrong('Reporting the posterior under the most favourable prior.', 'Choosing the most favourable prior is selective reporting and hides prior influence.'),
    ]),
    q('b-q8', 'What did the Bayesian re-analysis of EOLIA show?', [
      right('A high posterior probability (88–99%) of some mortality benefit from ECMO across a range of priors.', 'The frequentist p = 0.09 had been read by many as "no effect".'),
      wrong('That ECMO increased mortality.', 'The point estimate favoured ECMO.'),
      wrong('That the original analysis was miscalculated.', 'The re-analysis asked a different question.'),
      wrong('That ECMO is now proven beyond doubt.', 'Post-hoc re-analyses are hypothesis-generating.'),
    ]),
  ],
  sources: ['fda-bayes', 'spiegelhalter1994', 'schmidli2014', 'ibrahim2000', 'morita2008', 'leeliu2008', 'remapcap2021', 'eolia2018', 'goligher2018'],
}

export default m
