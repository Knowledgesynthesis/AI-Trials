import { describe, expect, it } from 'vitest'
import { md } from './helpers'

describe('md template tag', () => {
  it('dedents block content and keeps LaTeX backslashes', () => {
    const out = md`
      Line one with $\frac{a}{b}$ and \times
        - nested
      Line three
    `
    expect(out).toBe('Line one with $\\frac{a}{b}$ and \\times\n  - nested\nLine three')
  })
  it('keeps the first line intact when text starts right after the backtick', () => {
    const out = md`**Bold start** here
      second line
      - item`
    expect(out).toBe('**Bold start** here\nsecond line\n- item')
  })
})
