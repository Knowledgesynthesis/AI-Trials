import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import {
  BookMarked,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  GraduationCap,
  Home,
  Library,
  Menu,
  Monitor,
  Moon,
  Sun,
  TrendingUp,
  X,
} from 'lucide-react'
import { curriculum } from '@/data/curriculum'
import { labs } from '@/data/labs'
import { applyTheme, MASTERY_THRESHOLD, useProgress, type Theme } from '@/store/progress'
import { cn } from '@/lib/utils'

function ThemeSwitch() {
  const theme = useProgress((s) => s.theme)
  const setTheme = useProgress((s) => s.setTheme)
  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = () => applyTheme('system')
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [theme])
  const opts: Array<{ t: Theme; icon: typeof Sun; label: string }> = [
    { t: 'light', icon: Sun, label: 'Light theme' },
    { t: 'system', icon: Monitor, label: 'System theme' },
    { t: 'dark', icon: Moon, label: 'Dark theme' },
  ]
  return (
    <div className="flex rounded-lg border border-line bg-surface-2 p-0.5" role="radiogroup" aria-label="Theme">
      {opts.map(({ t, icon: Icon, label }) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={theme === t}
          aria-label={label}
          title={label}
          onClick={() => setTheme(t)}
          className={cn(
            'grid h-7 w-7 place-items-center rounded-md transition-colors',
            theme === t ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}

function NavItem({ to, icon: Icon, children, end, onNavigate }: { to: string; icon?: typeof Home; children: React.ReactNode; end?: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
          isActive ? 'bg-accent-soft font-medium text-accent-text' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        )
      }
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
      <span className="min-w-0 truncate">{children}</span>
    </NavLink>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 mb-1.5 px-2.5 text-[11px] font-semibold tracking-wider text-muted uppercase">{children}</div>
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const modules = useProgress((s) => s.modules)
  return (
    <nav aria-label="Main" className="flex h-full flex-col overflow-y-auto px-3 pt-3 pb-8">
      <NavItem onNavigate={onNavigate} to="/" icon={Home} end>
        Home
      </NavItem>
      <NavItem onNavigate={onNavigate} to="/progress" icon={TrendingUp}>
        My progress
      </NavItem>

      <SectionLabel>Course</SectionLabel>
      <NavItem onNavigate={onNavigate} to="/learn" icon={GraduationCap} end>
        Curriculum map
      </NavItem>
      <ol className="mt-1 space-y-0.5">
        {curriculum.map((m) => {
          const mastered = (modules[m.id]?.quizBest ?? 0) >= MASTERY_THRESHOLD
          return (
            <li key={m.id}>
              <NavLink
                onClick={onNavigate}
                to={`/learn/${m.id}`}
                className={({ isActive }) =>
                  cn(
                    'flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-[13px] leading-snug transition-colors',
                    isActive ? 'bg-accent-soft font-medium text-accent-text' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                  )
                }
              >
                <span className="mt-px w-4 shrink-0 text-right font-mono text-[11px] text-muted tabular">{m.num}</span>
                <span className="min-w-0 flex-1">{m.title.split(':')[0]}</span>
                {mastered && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-good" aria-label="Mastered" />}
              </NavLink>
            </li>
          )
        })}
      </ol>

      <SectionLabel>Labs</SectionLabel>
      <NavItem onNavigate={onNavigate} to="/labs" icon={FlaskConical} end>
        All labs
      </NavItem>
      <ul className="mt-1 space-y-0.5">
        {labs.map((l) => (
          <li key={l.id}>
            <NavLink
              onClick={onNavigate}
              to={l.path}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg py-1.5 pr-2.5 pl-8.5 text-[13px] leading-snug transition-colors',
                  isActive ? 'bg-accent-soft font-medium text-accent-text' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                )
              }
            >
              {l.title}
            </NavLink>
          </li>
        ))}
      </ul>

      <SectionLabel>Practice</SectionLabel>
      <NavItem onNavigate={onNavigate} to="/cases" icon={Briefcase}>
        Landmark trials
      </NavItem>
      <NavItem onNavigate={onNavigate} to="/ethics" icon={BookOpen}>
        Ethics casebook
      </NavItem>
      <NavItem onNavigate={onNavigate} to="/exam" icon={ClipboardCheck}>
        Final exam
      </NavItem>

      <SectionLabel>Reference</SectionLabel>
      <NavItem onNavigate={onNavigate} to="/glossary" icon={BookMarked}>
        Glossary
      </NavItem>
      <NavItem onNavigate={onNavigate} to="/sources" icon={Library}>
        Sources & guidance
      </NavItem>
    </nav>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur supports-[backdrop-filter]:bg-page/75">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-5">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-tight">AI Trials</span>
              <span className="hidden text-[11px] text-muted sm:block">Modern clinical trial methods</span>
            </span>
          </Link>
          <div className="ml-auto">
            <ThemeSwitch />
          </div>
        </div>
      </header>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside
        className={cn(
          'fixed top-14 bottom-0 left-0 z-30 w-72 border-r border-line bg-page transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>

      <main id="main" className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<div className="py-20 text-center text-sm text-muted">Loading…</div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
