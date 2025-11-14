import { useParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { modules } from '@/data/modules'
import { useAppStore } from '@/store/appStore'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const { completeModule, userProgress } = useAppStore()

  const module = modules.find((m) => m.id === moduleId)

  if (!module) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Module not found</h1>
        <Button asChild className="mt-4">
          <Link to="/modules">Back to Modules</Link>
        </Button>
      </div>
    )
  }

  const isCompleted = userProgress.completedModules.includes(module.id)

  const handleComplete = () => {
    completeModule(module.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/modules">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{module.title}</h1>
            <p className="mt-2 text-muted-foreground">{module.description}</p>
          </div>
          {isCompleted && (
            <Badge className="bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      {module.topics.map((topic, index) => (
        <Card key={topic.id}>
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              Topic {index + 1}
            </Badge>
            <CardTitle className="mt-2">{topic.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {topic.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {topic.keyTakeaways.length > 0 && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="mb-3 font-semibold">Key Takeaways:</h4>
                <ul className="space-y-2">
                  {topic.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {!isCompleted && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleComplete} className="w-full" size="lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Mark Module as Complete
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
