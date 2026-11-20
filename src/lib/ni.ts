export type NiVerdict = 'superior' | 'non-inferior' | 'ni-but-worse' | 'inconclusive' | 'inferior'

export function classifyNI(lo: number, hi: number, margin: number): NiVerdict {
  if (lo > 0) return 'superior'
  if (hi < -margin) return 'inferior'
  if (lo > -margin) return hi < 0 ? 'ni-but-worse' : 'non-inferior'
  return 'inconclusive'
}

export const VERDICT: Record<NiVerdict, { label: string; tone: 'good' | 'warn' | 'bad' | 'info'; text: string }> = {
  superior: { label: 'Superior (and non-inferior)', tone: 'good', text: 'The whole CI lies above 0. Superiority can be claimed after showing NI without multiplicity penalty, if the switch was pre-specified.' },
  'non-inferior': { label: 'Non-inferior', tone: 'good', text: 'The lower limit is above −M. The new treatment is not worse by more than the margin.' },
  'ni-but-worse': {
    label: 'Non-inferior, yet statistically worse',
    tone: 'warn',
    text: 'The CI excludes 0 on the harmful side but stays within the margin: worse than control, but by less than the pre-agreed acceptable amount. Report both facts.',
  },
  inconclusive: { label: 'Inconclusive', tone: 'info', text: 'The CI crosses −M. Neither non-inferiority nor inferiority is shown — usually a sign of an underpowered trial.' },
  inferior: { label: 'Inferior', tone: 'bad', text: 'The whole CI lies below −M: the new treatment is worse by more than the margin.' },
}

