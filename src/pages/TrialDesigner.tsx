import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TrialPhase, TrialDesign, BlindingType, RandomizationType } from '@/types'
import { FlaskConical, Plus, Trash2, Download } from 'lucide-react'

interface Endpoint {
  name: string
  type: 'Primary' | 'Secondary' | 'Safety'
  measurementType: 'Continuous' | 'Binary' | 'Time-to-Event'
}

export function TrialDesigner() {
  const [trialName, setTrialName] = useState('My Trial Design')
  const [phase, setPhase] = useState<TrialPhase>('Phase II')
  const [design, setDesign] = useState<TrialDesign>('Parallel')
  const [blinding, setBlinding] = useState<BlindingType>('Double-Blind')
  const [randomization, setRandomization] = useState<RandomizationType>('Block')
  const [numberOfArms, setNumberOfArms] = useState(2)
  const [sampleSize, setSampleSize] = useState(100)
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { name: 'Overall Response Rate', type: 'Primary', measurementType: 'Binary' },
  ])
  const [isAdaptive, setIsAdaptive] = useState(false)

  const addEndpoint = () => {
    setEndpoints([
      ...endpoints,
      { name: 'New Endpoint', type: 'Secondary', measurementType: 'Continuous' },
    ])
  }

  const removeEndpoint = (index: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== index))
  }

  const updateEndpoint = (index: number, field: keyof Endpoint, value: string) => {
    const updated = [...endpoints]
    updated[index] = { ...updated[index], [field]: value }
    setEndpoints(updated)
  }

  const generateSchema = () => {
    const schema = {
      trialName,
      phase,
      design,
      blinding,
      randomization,
      numberOfArms,
      targetSampleSize: sampleSize,
      endpoints,
      adaptiveFeatures: isAdaptive
        ? ['Response-adaptive randomization', 'Interim futility analysis']
        : [],
      createdAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trialName.replace(/\s+/g, '_')}_schema.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trial Designer</h1>
        <p className="mt-2 text-muted-foreground">
          Design synthetic trials with different configurations and export schemas
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <FlaskConical className="mt-0.5 h-5 w-5 text-primary" />
            <div className="space-y-2 text-sm">
              <p>
                <strong>Trial Design Flow:</strong> Configure your trial parameters, endpoints, and
                adaptive features. The system generates a structured schema you can export.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>Set fundamental trial parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Trial Name</label>
                <input
                  type="text"
                  value={trialName}
                  onChange={(e) => setTrialName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Trial Phase</label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as TrialPhase)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Phase I">Phase I</option>
                  <option value="Phase II">Phase II</option>
                  <option value="Phase III">Phase III</option>
                  <option value="Phase IV">Phase IV</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Trial Design</label>
                <select
                  value={design}
                  onChange={(e) => setDesign(e.target.value as TrialDesign)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Parallel">Parallel</option>
                  <option value="Crossover">Crossover</option>
                  <option value="Factorial">Factorial</option>
                  <option value="Adaptive">Adaptive</option>
                  <option value="Sequential">Sequential</option>
                  <option value="Non-Inferiority">Non-Inferiority</option>
                  <option value="Superiority">Superiority</option>
                  <option value="Equivalence">Equivalence</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Blinding</label>
                <select
                  value={blinding}
                  onChange={(e) => setBlinding(e.target.value as BlindingType)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Open-Label">Open-Label</option>
                  <option value="Single-Blind">Single-Blind</option>
                  <option value="Double-Blind">Double-Blind</option>
                  <option value="Triple-Blind">Triple-Blind</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Randomization</label>
                <select
                  value={randomization}
                  onChange={(e) => setRandomization(e.target.value as RandomizationType)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Simple">Simple</option>
                  <option value="Block">Block</option>
                  <option value="Stratified">Stratified</option>
                  <option value="Response-Adaptive">Response-Adaptive</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Number of Arms: {numberOfArms}
                </label>
                <input
                  type="range"
                  min="2"
                  max="5"
                  value={numberOfArms}
                  onChange={(e) => setNumberOfArms(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target Sample Size: {sampleSize}
                </label>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="20"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Adaptive Features</p>
                  <p className="text-xs text-muted-foreground">
                    Include adaptive randomization and interim analyses
                  </p>
                </div>
                <button
                  onClick={() => setIsAdaptive(!isAdaptive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAdaptive ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAdaptive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Endpoints</CardTitle>
                  <CardDescription>Define trial outcomes</CardDescription>
                </div>
                <Button onClick={addEndpoint} size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={endpoint.type === 'Primary' ? 'default' : 'secondary'}>
                      {endpoint.type}
                    </Badge>
                    {endpoints.length > 1 && (
                      <button
                        onClick={() => removeEndpoint(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={endpoint.name}
                    onChange={(e) => updateEndpoint(index, 'name', e.target.value)}
                    className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                    placeholder="Endpoint name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={endpoint.type}
                      onChange={(e) => updateEndpoint(index, 'type', e.target.value)}
                      className="rounded border border-input bg-background px-2 py-1 text-sm"
                    >
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Safety">Safety</option>
                    </select>
                    <select
                      value={endpoint.measurementType}
                      onChange={(e) => updateEndpoint(index, 'measurementType', e.target.value)}
                      className="rounded border border-input bg-background px-2 py-1 text-sm"
                    >
                      <option value="Binary">Binary</option>
                      <option value="Continuous">Continuous</option>
                      <option value="Time-to-Event">Time-to-Event</option>
                    </select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trial Schema Preview</CardTitle>
              <CardDescription>Overview of your trial design</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold">{trialName}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>{phase}</Badge>
                  <Badge variant="outline">{design}</Badge>
                  <Badge variant="outline">{blinding}</Badge>
                  {isAdaptive && <Badge className="bg-green-500">Adaptive</Badge>}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Randomization</p>
                    <p className="font-medium">{randomization}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Number of Arms</p>
                    <p className="font-medium">{numberOfArms}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sample Size</p>
                    <p className="font-medium">{sampleSize}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Endpoints</p>
                    <p className="font-medium">{endpoints.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Endpoints</h4>
                <ul className="space-y-2">
                  {endpoints.map((endpoint, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Badge
                        variant={endpoint.type === 'Primary' ? 'default' : 'secondary'}
                        className="mr-2"
                      >
                        {endpoint.type.charAt(0)}
                      </Badge>
                      <span className="flex-1">{endpoint.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {endpoint.measurementType}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {isAdaptive && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <h4 className="mb-2 font-semibold text-sm">Adaptive Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center">
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      Response-adaptive randomization
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      Interim futility analysis
                    </li>
                  </ul>
                </div>
              )}

              <div className="pt-4">
                <Button onClick={generateSchema} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Trial Schema (JSON)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visual Representation */}
          <Card>
            <CardHeader>
              <CardTitle>Trial Flow Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Enrollment */}
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 text-center">
                  <p className="font-semibold">Enrollment</p>
                  <p className="text-sm text-muted-foreground">N = {sampleSize}</p>
                </div>

                {/* Randomization */}
                <div className="flex items-center justify-center">
                  <div className="h-8 w-0.5 bg-border" />
                </div>
                <div className="rounded-lg border-2 bg-muted/50 p-3 text-center">
                  <p className="font-semibold">{randomization} Randomization</p>
                  <p className="text-xs text-muted-foreground">{blinding}</p>
                </div>

                {/* Arms */}
                <div className="flex items-center justify-center">
                  <div className="h-8 w-0.5 bg-border" />
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${numberOfArms}, 1fr)` }}>
                  {Array.from({ length: numberOfArms }).map((_, i) => (
                    <div key={i} className="rounded-lg border-2 bg-background p-3 text-center">
                      <p className="text-sm font-semibold">
                        Arm {String.fromCharCode(65 + i)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        n ≈ {Math.floor(sampleSize / numberOfArms)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Follow-up */}
                {Array.from({ length: numberOfArms }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <div className="h-6 w-0.5 bg-border" />
                  </div>
                ))[0]}
                <div className="rounded-lg border-2 border-green-500 bg-green-500/5 p-3 text-center">
                  <p className="font-semibold">Primary Analysis</p>
                  <p className="text-xs text-muted-foreground">
                    {endpoints.find((e) => e.type === 'Primary')?.name || 'Primary Endpoint'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
