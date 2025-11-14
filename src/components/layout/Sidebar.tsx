import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  FlaskConical,
  BarChart3,
  Brain,
  Shield,
  TestTube,
  CheckCircle,
  BookMarked,
  Settings,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Modules', href: '/modules', icon: BookOpen },
  { name: 'Trial Designer', href: '/trial-designer', icon: FlaskConical },
  { name: 'Adaptive Lab', href: '/adaptive-lab', icon: BarChart3 },
  { name: 'Bayesian Lab', href: '/bayesian-lab', icon: Brain },
  { name: 'Interim Dashboard', href: '/interim-dashboard', icon: TestTube },
  { name: 'Ethics Center', href: '/ethics', icon: Shield },
  { name: 'Assessment', href: '/assessment', icon: CheckCircle },
  { name: 'Glossary', href: '/glossary', icon: BookMarked },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="h-full overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
