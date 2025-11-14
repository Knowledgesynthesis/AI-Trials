import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  conditionalPower,
  obrienFlemingBound,
  pocockBound,
  generateBinaryOutcomes,
} from '@/lib/statistics'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
} from 'recharts'
import { Activity, AlertTriangle, Play, TrendingUp } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

interface InterimData {
  analysis: number
  informationFraction: number
  enrolled: number
  controlEvents: number
  treatmentEvents: number
  zStatistic: number
  conditionalPower: number
  alphaSpent: number
  efficacyBound: number
  futilityBound: number
}

export function InterimDashboard() {
  const { updateInteractiveCompletion } = useAppStore()
  const [targetN, setTargetN] = useState(400)
  const [numberOfAnalyses, setNumberOfAnalyses] = useState(3)
  const [controlRate, setControlRate] = useState(0.3)
  const [treatmentRate, setTreatmentRate] = useState(0.45)
  const [boundaryType, setBoundaryType] = useState<"O'Brien-Fleming" | 'Pocock'>('O\'Brien-Fleming')
  const [interimData, setInterimData] = useState<InterimData[] | null>(null)

  const runSimulation = () => {
    updateInteractiveCompletion('interim-dashboard')

    const data: InterimData[] = []
    let cumulativeAlphaSpent = 0

    for (let i = 1; i <= numberOfAnalyses; i++) {
      const infoFraction = i / numberOfAnalyses
      const currentN = Math.floor(targetN * infoFraction)
      const nPerArm = Math.floor(currentN / 2)

      // Generate synthetic outcomes
      const controlOutcome = generateBinaryOutcomes(nPerArm, controlRate)
      const treatmentOutcome = generateBinaryOutcomes(nPerArm, treatmentRate)

      const p1 = controlOutcome.successes / nPerArm
      const p2 = treatmentOutcome.successes / nPerArm
      const pPooled = (controlOutcome.successes + treatmentOutcome.successes) / currentN
      const se = Math.sqrt(pPooled * (1 - pPooled) * (2 / nPerArm))

      const zStat = se > 0 ? (p2 - p1) / se : 0

      // Calculate bounds
      const efficacyBound =
        boundaryType === "O'Brien-Fleming"
          ? obrienFlemingBound(infoFraction)
          : pocockBound(numberOfAnalyses)

      const futilityBound = 0 // Simplified: stop if z < 0

      // Calculate conditional power
      const condPower = conditionalPower(zStat, infoFraction, 1.96, 'current-trend')

      // Approximate alpha spending (simplified)
      const alphaSpentThis =
        boundaryType === "O'Brien-Fleming"
          ? 0.025 * Math.sqrt(infoFraction) // Approximation
          : 0.025 / numberOfAnalyses

      cumulativeAlphaSpent += alphaSpentThis

      data.push({
        analysis: i,
        informationFraction: infoFraction,
        enrolled: currentN,
        controlEvents: controlOutcome.successes,
        treatmentEvents: treatmentOutcome.successes,
        zStatistic: zStat,
        conditionalPower: condPower,
        alphaSpent: cumulativeAlphaSpent,
        efficacyBound,
        futilityBound,
      })
    }

    setInterimData(data)
  }

  const currentAnalysis = interimData?.[interimData.length - 1]

  const recommendation = useMemo(() => {
    if (!currentAnalysis) return null

    if (currentAnalysis.zStatistic > currentAnalysis.efficacyBound) {
      return {
        action: 'Stop for Efficacy',
        reason: 'Z-statistic exceeds efficacy boundary',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
      }
    } else if (currentAnalysis.zStatistic < currentAnalysis.futilityBound) {
      return {
        action: 'Stop for Futility',
        reason: 'Z-statistic below futility boundary',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
      }
    } else if (currentAnalysis.conditionalPower < 0.2) {
      return {
        action: 'Consider Futility',
        reason: 'Low conditional power (<20%)',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
      }
    } else {
      return {
        action: 'Continue Trial',
        reason: 'Within continuation region',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
      }
    }
  }, [currentAnalysis])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interim Analysis Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor synthetic trial data with stopping boundaries and conditional power
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Activity className="mt-0.5 h-5 w-5 text-primary" />
            <div className="space-y-2 text-sm">
              <p>
                <strong>Interim Monitoring:</strong> Group sequential designs allow early stopping for
                efficacy or futility while controlling Type I error through alpha spending functions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Trial Configuration</CardTitle>
            <CardDescription>Set parameters and run simulation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Target Sample Size: {targetN}
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={targetN}
                onChange={(e) => setTargetN(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Number of Interim Analyses: {numberOfAnalyses}
              </label>
              <input
                type="range"
                min="2"
                max="5"
                step="1"
                value={numberOfAnalyses}
                onChange={(e) => setNumberOfAnalyses(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Control Event Rate: {(controlRate * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={controlRate}
                onChange={(e) => setControlRate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Treatment Event Rate: {(treatmentRate * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={treatmentRate}
                onChange={(e) => setTreatmentRate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Boundary Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBoundaryType("O'Brien-Fleming")}
                  className={`rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors ${
                    boundaryType === "O'Brien-Fleming"
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  O'Brien-Fleming
                </button>
                <button
                  onClick={() => setBoundaryType('Pocock')}
                  className={`rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors ${
                    boundaryType === 'Pocock'
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  Pocock
                </button>
              </div>
            </div>

            <Button onClick={runSimulation} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Analysis Status</CardTitle>
            <CardDescription>Latest interim results</CardDescription>
          </CardHeader>
          <CardContent>
            {currentAnalysis && recommendation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Enrolled</p>
                    <p className="text-2xl font-bold">{currentAnalysis.enrolled}</p>
                    <p className="text-xs text-muted-foreground">
                      {(currentAnalysis.informationFraction * 100).toFixed(0)}% of target
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Z-Statistic</p>
                    <p className="text-2xl font-bold">{currentAnalysis.zStatistic.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Conditional Power</p>
                    <p className="text-2xl font-bold">
                      {(currentAnalysis.conditionalPower * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-lg border p-4 ${recommendation.bgColor} ${recommendation.borderColor}`}
                >
                  <div className="flex items-start space-x-3">
                    {recommendation.action.includes('Stop for Efficacy') ? (
                      <TrendingUp className={`mt-0.5 h-6 w-6 ${recommendation.color}`} />
                    ) : (
                      <AlertTriangle className={`mt-0.5 h-6 w-6 ${recommendation.color}`} />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${recommendation.color}`}>
                        {recommendation.action}
                      </h3>
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-sm font-medium">Control Events</p>
                    <p className="text-xl font-semibold">
                      {currentAnalysis.controlEvents} /{' '}
                      {Math.floor(currentAnalysis.enrolled / 2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((currentAnalysis.controlEvents / (currentAnalysis.enrolled / 2)) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-sm font-medium">Treatment Events</p>
                    <p className="text-xl font-semibold">
                      {currentAnalysis.treatmentEvents} /{' '}
                      {Math.floor(currentAnalysis.enrolled / 2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((currentAnalysis.treatmentEvents / (currentAnalysis.enrolled / 2)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                Run a simulation to see interim analysis results
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visualizations */}
      {interimData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Stopping Boundaries</CardTitle>
              <CardDescription>
                Z-statistic trajectory with {boundaryType} boundaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="informationFraction"
                    type="number"
                    domain={[0, 1]}
                    label={{ value: 'Information Fraction', position: 'insideBottom', offset: -5 }}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    label={{ value: 'Z-Statistic', angle: -90, position: 'insideLeft' }}
                    domain={[-1, 'auto']}
                  />
                  <Tooltip
                    formatter={(value: number) => value.toFixed(2)}
                    labelFormatter={(label) => `Info: ${(Number(label) * 100).toFixed(0)}%`}
                  />
                  <Legend />
                  <ReferenceLine y={1.96} stroke="#10b981" strokeDasharray="5 5" label="Final" />
                  <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="5 5" label="Null" />
                  <Line
                    data={interimData}
                    dataKey="efficacyBound"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Efficacy Bound"
                    dot={false}
                  />
                  <Line
                    data={interimData}
                    dataKey="futilityBound"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Futility Bound"
                    dot={false}
                  />
                  <Scatter
                    data={interimData}
                    dataKey="zStatistic"
                    fill="#3b82f6"
                    name="Observed Z"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conditional Power Over Time</CardTitle>
              <CardDescription>
                Probability of ultimate success given current data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={interimData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="analysis"
                    label={{ value: 'Analysis Number', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Conditional Power', angle: -90, position: 'insideLeft' }}
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                    labelFormatter={(label) => `Analysis ${label}`}
                  />
                  <Legend />
                  <ReferenceLine y={0.8} stroke="#10b981" strokeDasharray="5 5" label="80%" />
                  <ReferenceLine y={0.2} stroke="#ef4444" strokeDasharray="5 5" label="20%" />
                  <Line
                    type="monotone"
                    dataKey="conditionalPower"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Conditional Power"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Educational Content */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Stopping Boundaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold">O'Brien-Fleming Boundaries</h4>
            <p className="text-muted-foreground">
              Conservative early, liberal late. Requires strong evidence to stop early but approaches
              standard thresholds at final analysis. Preferred when early stopping for efficacy is
              unlikely but possible.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Pocock Boundaries</h4>
            <p className="text-muted-foreground">
              Constant boundaries across analyses. Easier to stop early but requires higher final
              threshold. Uses more alpha early, making it harder to declare significance at the end.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Conditional Power</h4>
            <p className="text-muted-foreground">
              The probability of ultimately rejecting H₀ at trial end, given current data. Low
              conditional power ({'<'}20%) suggests futility; high power ({'>'}80%) indicates likely success.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
