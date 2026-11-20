import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronRight, RotateCcw, XCircle } from 'lucide-react'
import type { QuizItem } from '@/data/types'
import { cn } from '@/lib/utils'
import { createRng, shuffle } from '@/lib/stats/rng'
import { Button } from './ui/primitives'
import { InlineMarkdown, Markdown } from './Markdown'

/** A single multiple-choice item with feedback on every option, not just the right one. */
export function QuestionCard({
  item,
  onAnswered,
  seed = 1,
  compact,
  index,
  total,
}: {
  item: QuizItem
  onAnswered?: (correct: boolean) => void
  seed?: number
  compact?: boolean
  index?: number
  total?: number
}) {
  const order = useMemo(() => shuffle(createRng(seed), item.options.map((_, i) => i)), [item, seed])
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const correctIdx = item.options.findIndex((o) => o.correct)

  return (
    <div className={cn('rounded-xl border border-line bg-surface', compact ? 'p-4' : 'p-5')}>
      {index !== undefined && total !== undefined && (
        <div className="mb-2 text-xs font-medium text-muted tabular">
          Question {index + 1} of {total}
        </div>
      )}
      <Markdown compact className="font-medium">
        {item.stem}
      </Markdown>
      <div className="mt-3 space-y-2" role="radiogroup">
        {order.map((i, pos) => {
          const o = item.options[i]
          const isPicked = picked === i
          const show = answered && (isPicked || o.correct)
          return (
            <div key={i}>
              <button
                type="button"
                role="radio"
                aria-checked={isPicked}
                disabled={answered}
                onClick={() => {
                  setPicked(i)
                  onAnswered?.(!!o.correct)
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                  !answered && 'border-line-strong hover:border-accent hover:bg-accent-soft',
                  answered && o.correct && 'border-good bg-good-soft',
                  answered && isPicked && !o.correct && 'border-bad bg-bad-soft',
                  answered && !show && 'border-line opacity-70',
                )}
              >
                <span className="mt-px font-mono text-xs text-muted">{String.fromCharCode(65 + pos)}</span>
                <span className="flex-1">
                  <InlineMarkdown>{o.text}</InlineMarkdown>
                </span>
                {answered && o.correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-good" aria-label="Correct answer" />}
                {answered && isPicked && !o.correct && <XCircle className="h-4 w-4 shrink-0 text-bad" aria-label="Your answer" />}
              </button>
              {answered && (isPicked || o.correct || !compact) && (
                <p
                  className={cn(
                    'mt-1 ml-7 text-sm',
                    o.correct ? 'text-ink' : isPicked ? 'text-ink' : 'text-ink-2',
                  )}
                >
                  <InlineMarkdown>{o.why}</InlineMarkdown>
                </p>
              )}
            </div>
          )
        })}
      </div>
      {answered && item.explanation && (
        <div className="mt-4 rounded-lg bg-surface-2 p-3">
          <Markdown compact>{item.explanation}</Markdown>
        </div>
      )}
      {answered && (
        <div className="sr-only" aria-live="polite">
          {picked === correctIdx ? 'Correct.' : 'Incorrect.'}
        </div>
      )}
    </div>
  )
}

export function QuizRunner({
  items,
  onFinish,
  title = 'Mastery check',
  passMark = 0.8,
}: {
  items: QuizItem[]
  onFinish?: (score: number, perItem: boolean[]) => void
  title?: string
  passMark?: number
}) {
  const [attempt, setAttempt] = useState(0)
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const order = useMemo(() => shuffle(createRng(attempt * 31 + 7), items.map((_, i) => i)), [items, attempt])
  const done = idx >= items.length
  const answeredCurrent = results.length > idx
  const score = results.filter(Boolean).length

  if (done) {
    const s = score / items.length
    const pass = s >= passMark
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center">
        <div className={cn('text-4xl font-bold tabular', pass ? 'text-good' : 'text-warn')}>
          {score}/{items.length}
        </div>
        <p className="mt-2 font-medium">{pass ? 'Mastered — well done.' : `Not yet: mastery needs ${Math.round(passMark * 100)}%.`}</p>
        {!pass && (
          <p className="mt-1 text-sm text-ink-2">Re-read the sections behind the questions you missed, then retry — questions and options reshuffle.</p>
        )}
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => {
            setAttempt((a) => a + 1)
            setIdx(0)
            setResults([])
          }}
        >
          <RotateCcw className="h-4 w-4" /> Retake
        </Button>
      </div>
    )
  }

  const item = items[order[idx]]
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-1" aria-hidden>
          {items.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 w-5 rounded-full',
                i < results.length ? (results[i] ? 'bg-good' : 'bg-bad') : i === idx ? 'bg-accent' : 'bg-surface-3',
              )}
            />
          ))}
        </div>
      </div>
      <QuestionCard
        key={`${attempt}-${idx}`}
        item={item}
        seed={attempt * 101 + idx}
        index={idx}
        total={items.length}
        onAnswered={(c) => setResults((r) => [...r, c])}
      />
      <div className="mt-3 flex justify-end">
        <Button
          disabled={!answeredCurrent}
          onClick={() => {
            const next = idx + 1
            setIdx(next)
            if (next >= items.length) {
              // report correctness in the original item order (questions were shuffled)
              const byItem = items.map((_, i) => results[order.indexOf(i)] ?? false)
              onFinish?.(results.filter(Boolean).length / items.length, byItem)
            }
          }}
        >
          {idx + 1 === items.length ? 'See result' : 'Next'} <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
