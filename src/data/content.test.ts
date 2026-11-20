import { describe, expect, it } from 'vitest'
import { curriculum, moduleLoaders } from './curriculum'
import { references } from './references'
import { glossary } from './glossary'
import { labs } from './labs'
import { cases } from './cases'
import { ethicsCases } from './ethicsCases'
import type { ModuleDef, QuizItem } from './types'
import { flawedPlan, reviewPlan, strongPlan } from '@/lib/designReview'

const refIds = new Set(references.map((r) => r.id))
const moduleIds = new Set(curriculum.map((m) => m.id))
const labPaths = new Set(labs.map((l) => l.path))

async function loadAll(): Promise<ModuleDef[]> {
  return Promise.all(curriculum.map((m) => moduleLoaders[m.id]().then((x) => x.default)))
}

function checkItem(item: QuizItem) {
  expect(item.options.filter((o) => o.correct).length, `${item.id} must have exactly one correct option`).toBe(1)
  expect(item.options.length, item.id).toBeGreaterThanOrEqual(3)
  for (const o of item.options) expect(o.why.length, `${item.id}: every option needs a real explanation`).toBeGreaterThan(20)
}

describe('curriculum content integrity', () => {
  it('every module loads, matches its metadata, and has a full quiz', async () => {
    const mods = await loadAll()
    mods.forEach((m, i) => {
      expect(m.id).toBe(curriculum[i].id)
      expect(m.objectives.length).toBeGreaterThanOrEqual(3)
      expect(m.sections.length).toBeGreaterThanOrEqual(3)
      expect(m.quiz.length).toBeGreaterThanOrEqual(7)
      m.quiz.forEach(checkItem)
    })
  })

  it('all quiz and inline-check ids are unique', async () => {
    const mods = await loadAll()
    const ids: string[] = []
    for (const m of mods) {
      m.quiz.forEach((q) => ids.push(q.id))
      for (const s of m.sections) for (const b of s.blocks) if (b.kind === 'check') { checkItem(b.item); ids.push(b.item.id) }
    }
    cases.forEach((c) => ids.push(c.check.id))
    ethicsCases.forEach((c) => ids.push(c.decision.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every cited source exists', async () => {
    const mods = await loadAll()
    for (const m of mods) for (const s of m.sources) expect(refIds.has(s), `${m.id} cites unknown ${s}`).toBe(true)
    for (const c of cases) for (const r of c.refs) expect(refIds.has(r), `case ${c.id} cites ${r}`).toBe(true)
    for (const c of ethicsCases) for (const r of c.guidance) expect(refIds.has(r), `ethics ${c.id} cites ${r}`).toBe(true)
  })

  it('internal links point to real routes', async () => {
    const mods = await loadAll()
    for (const m of mods)
      for (const s of m.sections)
        for (const b of s.blocks) if (b.kind === 'lab') expect(labPaths.has(b.to), `${m.id} links to ${b.to}`).toBe(true)
    for (const l of labs) expect(moduleIds.has(l.module)).toBe(true)
    for (const g of glossary) if (g.module) expect(moduleIds.has(g.module), g.term).toBe(true)
    for (const c of cases) expect(moduleIds.has(c.module)).toBe(true)
    for (const m of curriculum) for (const p of m.prerequisites) expect(moduleIds.has(p)).toBe(true)
  })

  it('references have unique ids and URLs where expected', () => {
    expect(new Set(references.map((r) => r.id)).size).toBe(references.length)
    for (const r of references) if (r.kind !== 'book') expect(r.url, r.id).toMatch(/^https:\/\//)
  })

  it('glossary terms are unique', () => {
    expect(new Set(glossary.map((g) => g.term)).size).toBe(glossary.length)
  })
})

describe('protocol design review rules', () => {
  it('flags the flawed plan with several critical problems', () => {
    const f = reviewPlan(flawedPlan)
    expect(f.filter((x) => x.severity === 'critical').length).toBeGreaterThanOrEqual(4)
    expect(f.some((x) => x.id === 'rar2')).toBe(true)
  })
  it('finds no critical problems in the solid plan', () => {
    const f = reviewPlan(strongPlan)
    expect(f.filter((x) => x.severity === 'critical')).toEqual([])
    expect(f.filter((x) => x.severity === 'good').length).toBeGreaterThanOrEqual(4)
  })
  it('catches a crossover design with a mortality endpoint', () => {
    const f = reviewPlan({ ...strongPlan, design: 'crossover' })
    expect(f.find((x) => x.id === 'crossover')?.severity).toBe('critical')
  })
})
