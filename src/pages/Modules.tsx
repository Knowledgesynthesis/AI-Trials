import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { modules } from '@/data/modules'
import { useAppStore } from '@/store/appStore'
import { CheckCircle, Clock, BookOpen } from 'lucide-react'

export function Modules() {
  const { userProgress } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Modules</h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive curriculum on clinical trials, adaptive designs, and Bayesian methods
        </p>
      </div>

      <div className="space-y-4">
        {modules.map((module, index) => {
          const isCompleted = userProgress.completedModules.includes(module.id)

          return (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">Module {index + 1}</Badge>
                      {isCompleted && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-2">{module.title}</CardTitle>
                    <CardDescription className="mt-2">{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1.5 h-4 w-4" />
                      {module.estimatedTime} min
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="mr-1.5 h-4 w-4" />
                      {module.topics.length} topics
                    </div>
                    <Badge variant="secondary">{module.bloomLevel}</Badge>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Topics Covered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {module.topics.map((topic) => (
                        <Badge key={topic.id} variant="outline">
                          {topic.title}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {module.prerequisites.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Prerequisites:</h4>
                      <p className="text-sm text-muted-foreground">
                        {module.prerequisites.join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-wrap gap-2">
                      {module.learnerLevels.slice(0, 3).map((level) => (
                        <Badge key={level} variant="secondary">
                          {level}
                        </Badge>
                      ))}
                      {module.learnerLevels.length > 3 && (
                        <Badge variant="secondary">+{module.learnerLevels.length - 3}</Badge>
                      )}
                    </div>
                    <Button asChild>
                      <Link to={`/module/${module.id}`}>
                        {isCompleted ? 'Review' : 'Start Module'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
