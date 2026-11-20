/// <reference lib="webworker" />
import {
  computeBoundaries,
  driftForPower,
  fixedDrift,
  futilityBounds,
  naiveRepeatedTestingAlpha,
  equalTiming,
  operatingCharacteristics,
  type BoundarySpec,
  type FutilityRule,
} from '@/lib/stats/groupSequential'
import { simulateRar, type RarParams } from '@/lib/stats/rar'
import { simulateRandomization, type RandomizationParams } from '@/lib/stats/randomization'
import { bayesMonitoringOC, simulateStoppingBias } from '@/lib/stats/simulate'

export interface GsdRequest {
  timing: number[]
  alpha: number
  power: number
  spec: BoundarySpec
  futility: FutilityRule
}

export interface GsdResponse {
  timing: number[]
  upper: number[]
  lower: number[]
  nominalP: number[]
  cumulativeAlpha: number[]
  drift: number
  inflation: number
  ocH0: ReturnType<typeof operatingCharacteristics>
  ocH1: ReturnType<typeof operatingCharacteristics>
  ocHalf: ReturnType<typeof operatingCharacteristics>
  typeIWithFutility: number
  peeking: Array<{ K: number; alpha: number }>
}

function gsd(req: GsdRequest): GsdResponse {
  const d = computeBoundaries({ timing: req.timing, alpha: req.alpha, sides: 1, spec: req.spec })
  const fixed = fixedDrift(req.alpha, req.power)
  // Max information is sized for power with futility ignored (non-binding), the conservative convention.
  const drift = driftForPower(req.timing, d.upper, req.power)
  const lower = futilityBounds(req.timing, d.upper, req.futility, drift)
  const ocH0 = operatingCharacteristics(req.timing, d.upper, lower, 0)
  const ocH1 = operatingCharacteristics(req.timing, d.upper, lower, drift)
  const ocHalf = operatingCharacteristics(req.timing, d.upper, lower, drift / 2)
  const typeIWithFutility = ocH0.power
  const zc = 1.959963984540054
  const peeking = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((K) => ({
    K,
    alpha: K === 1 ? 0.025 : naiveRepeatedTestingAlpha(equalTiming(K), zc, 1),
  }))
  return {
    timing: req.timing,
    upper: d.upper,
    lower,
    nominalP: d.nominalP,
    cumulativeAlpha: d.cumulativeAlpha,
    drift,
    inflation: (drift / fixed) ** 2,
    ocH0,
    ocH1,
    ocHalf,
    typeIWithFutility,
    peeking,
  }
}

export type WorkerRequest =
  | { id: number; kind: 'gsd'; payload: GsdRequest }
  | { id: number; kind: 'rar'; payload: RarParams }
  | { id: number; kind: 'randomization'; payload: RandomizationParams }
  | { id: number; kind: 'stoppingBias'; payload: { timing: number[]; upper: number[]; theta: number; reps: number; seed: number } }
  | {
      id: number
      kind: 'bayesOC'
      payload: { pControl: number; pTreatment: number; nPerArm: number; looks: number[]; threshold: number; reps: number; seed: number }
    }

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data
  try {
    let result: unknown
    switch (msg.kind) {
      case 'gsd':
        result = gsd(msg.payload)
        break
      case 'rar':
        result = simulateRar(msg.payload, (f) => self.postMessage({ id: msg.id, progress: f }))
        break
      case 'randomization':
        result = simulateRandomization(msg.payload)
        break
      case 'stoppingBias':
        result = simulateStoppingBias(msg.payload.timing, msg.payload.upper, msg.payload.theta, msg.payload.reps, msg.payload.seed)
        break
      case 'bayesOC': {
        const { looks, ...rest } = msg.payload
        result = looks.map((K) => ({ K, ...bayesMonitoringOC({ ...rest, looks: K }) }))
        break
      }
    }
    self.postMessage({ id: msg.id, result })
  } catch (err) {
    self.postMessage({ id: msg.id, error: err instanceof Error ? err.message : String(err) })
  }
}
