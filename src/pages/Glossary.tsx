import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { glossaryTerms } from '@/data/glossary'
import { Search } from 'lucide-react'

export function Glossary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats = new Set(glossaryTerms.map((term) => term.category))
    return Array.from(cats).sort()
  }, [])

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((term) => {
      const matchesSearch =
        searchTerm === '' ||
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === null || term.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const categoryColors: Record<string, string> = {
    'Bayesian': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Statistics': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Adaptive-Design': 'bg-green-500/10 text-green-500 border-green-500/20',
    'ML': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Ethics': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Regulatory': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Glossary</h1>
        <p className="mt-2 text-muted-foreground">
          Essential terminology for clinical trials, Bayesian statistics, and adaptive designs
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTerms.length} of {glossaryTerms.length} terms
      </div>

      {/* Terms list */}
      <div className="space-y-4">
        {filteredTerms.map((term) => (
          <Card key={term.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{term.term}</CardTitle>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={categoryColors[term.category] || 'bg-muted'}
                    >
                      {term.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{term.definition}</p>

              {term.examples && term.examples.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Examples:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {term.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {term.relatedTerms.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Related Terms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {term.relatedTerms.map((relatedId) => {
                      const relatedTerm = glossaryTerms.find((t) => t.id === relatedId)
                      return relatedTerm ? (
                        <Badge key={relatedId} variant="secondary">
                          {relatedTerm.term}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No terms found matching your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
