import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ethicsCases } from '@/data/ethics'
import { Shield, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

export function EthicsCenter() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const categoryColors: Record<string, string> = {
    'Equipoise': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Informed-Consent': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Fairness': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Transparency': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Safety': 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  const selectedCaseData = selectedCase
    ? ethicsCases.find((c) => c.id === selectedCase)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ethics Center</h1>
        <p className="mt-2 text-muted-foreground">
          Explore ethical considerations in adaptive designs, ML-enhanced trials, and regulatory compliance
        </p>
      </div>

      {/* Introduction */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="mt-0.5 h-6 w-6 text-primary" />
            <div className="space-y-2 text-sm">
              <p>
                <strong>Clinical Equipoise:</strong> The ethical foundation of randomized trials—genuine
                uncertainty in the expert community about which treatment is superior.
              </p>
              <p>
                Modern adaptive and ML-enhanced trials introduce new ethical considerations around
                fairness, transparency, informed consent, and safety monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Selection */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Ethical Case Studies</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ethicsCases.map((ethicsCase) => (
            <Card
              key={ethicsCase.id}
              className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                selectedCase === ethicsCase.id ? 'border-primary shadow-md' : ''
              }`}
              onClick={() => setSelectedCase(ethicsCase.id)}
            >
              <CardHeader>
                <Badge
                  variant="outline"
                  className={`mb-2 w-fit ${categoryColors[ethicsCase.category]}`}
                >
                  {ethicsCase.category.replace('-', ' ')}
                </Badge>
                <CardTitle className="text-lg">{ethicsCase.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {ethicsCase.scenario.substring(0, 150)}...
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Case Details */}
      {selectedCaseData && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge
                  variant="outline"
                  className={`mb-2 ${categoryColors[selectedCaseData.category]}`}
                >
                  {selectedCaseData.category.replace('-', ' ')}
                </Badge>
                <CardTitle className="text-2xl">{selectedCaseData.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scenario */}
            <div>
              <h3 className="mb-3 flex items-center text-lg font-semibold">
                <BookOpen className="mr-2 h-5 w-5" />
                Scenario
              </h3>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="leading-relaxed text-sm">{selectedCaseData.scenario}</p>
              </div>
            </div>

            {/* Ethical Considerations */}
            <div>
              <button
                onClick={() => toggleSection('considerations')}
                className="mb-3 flex w-full items-center justify-between text-lg font-semibold hover:text-primary"
              >
                <span>Ethical Considerations</span>
                {expandedSections['considerations'] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections['considerations'] && (
                <ul className="space-y-2">
                  {selectedCaseData.considerations.map((consideration, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{consideration}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Regulatory Guidance */}
            <div>
              <button
                onClick={() => toggleSection('regulatory')}
                className="mb-3 flex w-full items-center justify-between text-lg font-semibold hover:text-primary"
              >
                <span>Regulatory Guidance</span>
                {expandedSections['regulatory'] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections['regulatory'] && (
                <div className="space-y-2">
                  {selectedCaseData.regulatoryGuidance.map((guidance, idx) => (
                    <div key={idx} className="rounded border-l-4 border-primary bg-primary/5 p-3">
                      <p className="text-sm">{guidance}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discussion Points */}
            <div>
              <button
                onClick={() => toggleSection('discussion')}
                className="mb-3 flex w-full items-center justify-between text-lg font-semibold hover:text-primary"
              >
                <span>Discussion Points</span>
                {expandedSections['discussion'] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections['discussion'] && (
                <ul className="space-y-3">
                  {selectedCaseData.discussionPoints.map((point, idx) => (
                    <li key={idx} className="rounded-lg border bg-muted/30 p-3">
                      <p className="font-medium text-sm">{point}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setExpandedSections({
                    considerations: true,
                    regulatory: true,
                    discussion: true,
                  })
                }}
              >
                Expand All Sections
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ethical Principles Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Core Ethical Principles in Clinical Trials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 font-semibold">Respect for Persons</h4>
            <p className="text-sm text-muted-foreground">
              Individuals should be treated as autonomous agents, and persons with diminished autonomy
              are entitled to protection. Informed consent is the practical expression of this principle.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Beneficence</h4>
            <p className="text-sm text-muted-foreground">
              Maximize benefits and minimize harms. Trials should be designed to answer important
              questions with minimal risk to participants.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Justice</h4>
            <p className="text-sm text-muted-foreground">
              Fair distribution of benefits and burdens. Vulnerable populations should not be
              disproportionately enrolled, and trial benefits should be accessible to diverse groups.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Clinical Equipoise</h4>
            <p className="text-sm text-muted-foreground">
              Genuine uncertainty in the expert medical community about the relative therapeutic merits
              of treatments being compared. Loss of equipoise may require early trial termination.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
