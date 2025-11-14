import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  BookOpen,
  Brain,
  BarChart3,
  FlaskConical,
  Shield,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'

export function Home() {
  const { userProgress } = useAppStore()
  const completedCount = userProgress.completedModules.length

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Modules',
      description: 'Learn clinical trial fundamentals, adaptive designs, and Bayesian methods',
      href: '/modules',
      color: 'text-blue-500',
    },
    {
      icon: Brain,
      title: 'Bayesian Laboratory',
      description: 'Explore prior distributions, posterior updating, and credible intervals',
      href: '/bayesian-lab',
      color: 'text-purple-500',
    },
    {
      icon: BarChart3,
      title: 'Adaptive Design Simulator',
      description: 'Simulate response-adaptive randomization and see allocation probabilities evolve',
      href: '/adaptive-lab',
      color: 'text-green-500',
    },
    {
      icon: FlaskConical,
      title: 'Trial Designer',
      description: 'Design synthetic trials with different randomization schemes and endpoints',
      href: '/trial-designer',
      color: 'text-orange-500',
    },
    {
      icon: Shield,
      title: 'Ethics Center',
      description: 'Understand equipoise, fairness, and regulatory considerations',
      href: '/ethics',
      color: 'text-red-500',
    },
    {
      icon: CheckCircle,
      title: 'Assessment Hub',
      description: 'Test your knowledge with scenario-based questions and case studies',
      href: '/assessment',
      color: 'text-indigo-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12">
        <div className="relative z-10">
          <Badge className="mb-4">Educational Platform</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            AI Trials
          </h1>
          <p className="mt-4 text-xl text-muted-foreground md:text-2xl">
            Data Science in Clinical Research
          </p>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Master adaptive designs, Bayesian methods, and ML-enhanced trial strategies through
            interactive simulations and evidence-based curriculum.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/modules">Start Learning</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/glossary">Browse Glossary</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      {completedCount > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Keep up the great work!</CardDescription>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Modules Completed</span>
                <span className="font-medium">{completedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Interactive Simulations</span>
                <span className="font-medium">
                  {Object.keys(userProgress.interactiveCompletions).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Assessments Taken</span>
                <span className="font-medium">
                  {Object.keys(userProgress.assessmentScores).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Grid */}
      <div>
        <h2 className="mb-6 text-2xl font-bold">Explore Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.title} to={feature.href}>
                <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                  <CardHeader>
                    <Icon className={`h-10 w-10 ${feature.color}`} />
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle>Designed for All Levels</CardTitle>
          <CardDescription>
            From medical students to clinical researchers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold">Medical Students & Residents</h3>
              <p className="text-sm text-muted-foreground">
                Build foundational understanding of trial design, randomization, and statistical concepts
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Fellows & Attendings</h3>
              <p className="text-sm text-muted-foreground">
                Master adaptive designs, Bayesian methods, and critical appraisal of ML-enhanced trials
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Research Coordinators</h3>
              <p className="text-sm text-muted-foreground">
                Understand trial monitoring, interim analyses, and regulatory requirements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Principles */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence-Based Learning</CardTitle>
          <CardDescription>
            Built on regulatory guidance and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
              <span>Aligned with FDA and ICH E9 guidance on adaptive designs</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
              <span>Synthetic data only—no real patient information</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
              <span>Conceptual ML integration focused on education, not clinical prediction</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
              <span>Offline-capable and mobile-first for learning anywhere</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
