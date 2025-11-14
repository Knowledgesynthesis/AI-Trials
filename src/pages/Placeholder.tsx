import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Construction } from 'lucide-react'

interface PlaceholderProps {
  title: string
  description: string
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Construction className="h-16 w-16 text-muted-foreground" />
          <CardTitle className="mt-4">Coming Soon</CardTitle>
          <CardDescription className="mt-2 text-center">
            This feature is currently under development and will be available in a future update.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
