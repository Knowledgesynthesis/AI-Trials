import { useEffect } from 'react'
import { ButtonLink } from '@/components/ui/primitives'

export default function NotFound() {
  useEffect(() => {
    document.title = 'Not found · AI Trials'
  }, [])
  return (
    <div className="py-20 text-center">
      <p className="text-sm font-semibold text-accent-text">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">This page doesn’t exist.</h1>
      <p className="mt-2 text-ink-2">It may have moved in the course redesign.</p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink to="/">Home</ButtonLink>
        <ButtonLink to="/learn" variant="secondary">
          Curriculum
        </ButtonLink>
      </div>
    </div>
  )
}
