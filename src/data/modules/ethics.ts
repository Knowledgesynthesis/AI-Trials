import type { ModuleDef } from '../types'
import { metaFor } from '../curriculum'
import { callout, check, md, q, right, text, wrong } from './helpers'

const m: ModuleDef = {
  ...metaFor('ethics'),
  objectives: [
    'Apply the Belmont principles and the 2024 Declaration of Helsinki to trial decisions.',
    'Explain clinical equipoise, its critiques, and how it interacts with interim data and evolving standards of care.',
    'Design consent processes for adaptive and response-adaptive trials.',
    'Describe the oversight system: ethics committees, DMCs, GCP (ICH E6(R3)) and regulation.',
    'Explain registration, results reporting, data sharing and representation duties.',
  ],
  sections: [
    {
      id: 'principles',
      title: 'Principles',
      blocks: [
        text(md`
          **The Belmont Report (1979)**: *respect for persons* (autonomy, informed consent, protection of those with diminished autonomy), *beneficence* (maximise benefits, minimise harms — including through sound design: an underpowered or biased trial exposes participants to risk without producing knowledge), and *justice* (fair distribution of burdens and benefits of research).

          **The Declaration of Helsinki** was revised in October 2024 (WMA 75th General Assembly). Changes include consistently referring to **participants** rather than subjects, calling for meaningful engagement with participants and communities before, during and after research, and adding guidance for research during public-health emergencies. The placebo paragraph (now ¶33) retains the balanced position: placebo or no intervention is acceptable when no proven intervention exists, or when compelling scientific reasons make it necessary and participants will not be subject to additional risks of serious or irreversible harm.
        `),
      ],
    },
    {
      id: 'equipoise',
      title: 'Equipoise and its limits',
      blocks: [
        text(md`
          **Clinical equipoise** (Freedman 1987): randomization is ethical when there is honest, professional disagreement in the expert community about the preferred treatment — not merely individual uncertainty. Equipoise is a property of the evidence, not of any one clinician's hunch.

          - **Interim data.** Emerging results are seen only by the DMC precisely so that equipoise in the community is not disturbed by noisy, partial data. When accumulating evidence becomes convincing (a boundary is crossed and the totality of evidence agrees), equipoise is lost and the DMC recommends stopping.
          - **Evolving standards of care.** In long or platform trials, an arm may become standard of care elsewhere. RECOVERY's "usual care" control incorporated dexamethasone once it was shown to work; placebo or no-treatment controls must be reconsidered when an effective therapy emerges.
          - **Critiques.** Equipoise can be hard to operationalise; some argue the ethical test should be whether the trial is a reasonable, consented choice for participants given the uncertainty and the social value of the answer.
        `),
        check(
          q(
            'et-c1',
            'Two years into a placebo-controlled platform trial, another trial shows one of its active agents reduces mortality and guidelines adopt it. What should happen to the control arm?',
            [
              right('Add the new standard to background care for all arms (or replace the placebo control) and update consent.', 'Continuing to withhold a proven therapy violates beneficence and Helsinki ¶33.'),
              wrong('Keep the original placebo control to preserve statistical consistency.', 'Statistical convenience does not justify withholding proven treatment.'),
              wrong('Stop the whole platform.', 'Other questions may remain valid with an updated control.'),
              wrong('Let each investigator decide case by case.', 'The change must be protocol-wide and ethically reviewed.'),
            ],
          ),
        ),
      ],
    },
    {
      id: 'consent',
      title: 'Consent in adaptive and response-adaptive trials',
      blocks: [
        text(md`
          Consent must describe what a participant actually faces at enrolment. For adaptive designs, that includes:
          - that arms may be added or dropped, doses changed, or the trial stopped early;
          - for **RAR**, that the chance of receiving each treatment will change during the trial and may favour treatments performing better so far — rather than stating a fixed "50:50" that becomes untrue;
          - what happens to participants on an arm that is dropped.

          Guard against the **therapeutic misconception**: participants assuming that allocation is made in their personal best interest. RAR can reinforce it, because "the computer sends you to the better arm" sounds like individualised care; it is not (Hey & Kimmelman 2015). Re-consent is needed when new information might affect willingness to continue — e.g. new safety findings — not for pre-specified, already-disclosed adaptations.
        `),
        callout(
          'pitfall',
          undefined,
          'A consent form stating "you have an equal chance of receiving either treatment" in a trial using response-adaptive randomization is inaccurate from day one. Describe the adaptive allocation in plain language at the outset.',
        ),
      ],
    },
    {
      id: 'oversight',
      title: 'Oversight and good clinical practice',
      blocks: [
        text(md`
          - **Ethics committees / IRBs** approve protocols and amendments, consent documents and safety reporting arrangements.
          - **DMCs** protect participants within the trial (Module 6).
          - **ICH E6(R3)** (Step 4 January 2025; in effect in the EU since July 2025; Annex 2 on decentralised and pragmatic elements from January 2027) moves GCP toward **quality by design** and **risk proportionality**: identify factors critical to quality (those that affect participant safety and the reliability of results), focus monitoring there, and accept fit-for-purpose approaches including decentralised elements and routinely collected data.
          - **Regulation**: in the EU, the Clinical Trials Regulation (536/2014) is fully applicable since January 2025; in the US, IND regulations, 21 CFR Parts 50/56 and the Common Rule.
        `),
      ],
    },
    {
      id: 'transparency',
      title: 'Transparency and representation',
      blocks: [
        text(md`
          - **Prospective registration** before the first participant is enrolled (ICMJE since 2005; Declaration of Helsinki; FDAAA 801 for applicable US trials) prevents silent changes to outcomes and hidden trials.
          - **Results reporting** on registries within statutory timelines, and **publication regardless of result**.
          - **Data sharing statements** are required by ICMJE journals (since 2018 for reports; plans in registration since 2019).
          - **Protocols and reports** follow **SPIRIT 2025** (34 items) and **CONSORT 2025** (30 items), plus relevant extensions (cluster, NI, adaptive ACE, AI).
          - **Representation**: trials should enrol the people who will use the treatment — older adults, women, racial and ethnic groups, people with comorbidities (ICH E7 for geriatrics; ICH E17 for multiregional trials). In the US, FDORA (2022) requires diversity action plans for most phase 3 trials, with implementation dependent on FDA's final guidance; check FDA's current position, which changed during 2025.
        `),
        callout(
          'key',
          'Bad science is an ethical problem',
          'An unregistered, underpowered or unreported trial exposes participants to risk without producing reliable knowledge. Methodological rigour is part of research ethics, not separate from it.',
        ),
      ],
    },
  ],
  quiz: [
    q('et-q1', 'Clinical equipoise refers to…', [
      right('Honest professional disagreement in the expert community about which treatment is better.', 'Freedman\'s (1987) clinical equipoise: uncertainty at the level of the expert community, not the individual.'),
      wrong('The individual investigator being exactly 50:50 in belief.', 'That is "theoretical equipoise", which Freedman argued is too fragile.'),
      wrong('Equal numbers of patients in each arm.', 'Unrelated to allocation ratios.'),
      wrong('Equal side-effect profiles of the treatments.', 'Equipoise concerns uncertainty about overall net benefit, not equal side effects.'),
    ]),
    q('et-q2', 'Why are interim efficacy results confined to the DMC?', [
      right('Partial, noisy results could erode community equipoise and alter conduct, compromising both ethics and validity.', 'Confidentiality protects the trial until the evidence is convincing.'),
      wrong('Because investigators are not trusted with data.', 'It is about avoiding influence, not trust.'),
      wrong('Because regulators require secrecy about all trial data.', 'Blinded safety data are shared with the sponsor.'),
      wrong('To reduce costs.', 'Cost is not the reason; protecting equipoise and trial integrity is.'),
    ]),
    q('et-q3', 'What should a consent form say about response-adaptive randomization?', [
      right('That the chance of receiving each treatment will change during the trial based on accumulating results.', 'Accurate disclosure at enrolment avoids misleading participants.'),
      wrong('That allocation is 50:50.', 'That becomes untrue as allocation adapts.'),
      wrong('Nothing; allocation methods are technical details.', 'Allocation probability is material information.'),
      wrong('That participants will receive the best treatment.', 'This fosters therapeutic misconception.'),
    ]),
    q('et-q4', 'What is the "therapeutic misconception"?', [
      right('Participants believing research procedures (like allocation) are chosen for their individual benefit.', 'It undermines informed consent.'),
      wrong('Researchers believing the experimental treatment works.', 'That is investigator optimism bias, a different problem.'),
      wrong('Patients misunderstanding drug doses.', 'Dose misunderstanding is a comprehension problem, not the therapeutic misconception.'),
      wrong('Placebo effects in the control arm.', 'Placebo effects are physiological or psychological responses, not a misconception about research.'),
    ]),
    q('et-q5', 'Which statement best captures ICH E6(R3)?', [
      right('Quality by design and risk-proportionate oversight focused on factors critical to participant safety and result reliability.', 'A shift from uniform, checklist monitoring.'),
      wrong('100% source-data verification at every site.', 'E6(R3) encourages risk-based approaches instead.'),
      wrong('It applies only to device trials.', 'It applies to interventional trials of medicinal products.'),
      wrong('It replaces the need for ethics committees.', 'Ethics review remains required.'),
    ]),
    q('et-q6', 'Why is prospective trial registration required?', [
      right('It makes trials and their pre-specified outcomes public, preventing selective reporting and outcome switching.', 'ICMJE, Helsinki and FDAAA all require it.'),
      wrong('To advertise the trial to patients.', 'A side benefit, not the purpose.'),
      wrong('It is optional for phase III trials.', 'It is required for applicable trials.'),
      wrong('Only to obtain funding.', 'Funders may require it, but the purpose is transparency against selective reporting.'),
    ]),
    q('et-q7', 'Which 2024 change to the Declaration of Helsinki is correct?', [
      right('It refers to "participants" rather than "subjects" and calls for engagement with participants and communities.', 'Among the headline changes.'),
      wrong('It abolished all placebo-controlled trials.', 'The balanced placebo paragraph was retained.'),
      wrong('It removed the requirement for informed consent.', 'Consent remains central.'),
      wrong('It banned AI in research.', 'The 2024 revision contains no such provision; commentators noted it says little about AI.'),
    ]),
  ],
  sources: ['belmont', 'helsinki', 'freedman1987', 'hey2015', 'ich-e6r3', 'eu-ctr', 'icmje-reg', 'icmje-sharing', 'spirit2025', 'consort2025', 'fdora-dap', 'recovery2021'],
}

export default m
