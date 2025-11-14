import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  betaMean,
  betaCredibleInterval,
  probabilityTreatmentBetter,
  generateBinaryOutcomes,
} from '@/lib/statistics'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Info } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

type PriorType = 'uniform' | 'weak' | 'informative' | 'skeptical'

const priorConfigs = {
  uniform: { alpha: 1, beta: 1, label: 'Uniform (Non-informative)' },
  weak: { alpha: 2, beta: 2, label: 'Weakly Informative' },
  informative: { alpha: 10, beta: 10, label: 'Informative (50% response)' },
  skeptical: { alpha: 5, beta: 15, label: 'Skeptical (25% response)' },
}

export function BayesianLab() {
  const { updateInteractiveCompletion } = useAppStore()
  const [priorType, setPriorType] = useState<PriorType>('uniform')
  const [nControl, setNControl] = useState(50)
  const [nTreatment, setNTreatment] = useState(50)
  const [responsesControl, setResponsesControl] = useState(20)
  const [responsesTreatment, setResponsesTreatment] = useState(35)

  const priorConfig = priorConfigs[priorType]

  // Calculate posterior parameters
  const posteriorControl = {
    alpha: priorConfig.alpha + responsesControl,
    beta: priorConfig.beta + (nControl - responsesControl),
  }

  const posteriorTreatment = {
    alpha: priorConfig.alpha + responsesTreatment,
    beta: priorConfig.beta + (nTreatment - responsesTreatment),
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const controlMean = betaMean(posteriorControl.alpha, posteriorControl.beta)
    const treatmentMean = betaMean(posteriorTreatment.alpha, posteriorTreatment.beta)
    const controlCI = betaCredibleInterval(posteriorControl.alpha, posteriorControl.beta, 0.95)
    const treatmentCI = betaCredibleInterval(posteriorTreatment.alpha, posteriorTreatment.beta, 0.95)
    const probBetter = probabilityTreatmentBetter(
      posteriorControl.alpha,
      posteriorControl.beta,
      posteriorTreatment.alpha,
      posteriorTreatment.beta
    )

    return {
      controlMean,
      treatmentMean,
      controlCI,
      treatmentCI,
      probBetter,
      absoluteDifference: treatmentMean - controlMean,
    }
  }, [posteriorControl, posteriorTreatment])

  // Generate distribution curves for visualization
  const distributionData = useMemo(() => {
    const points: Array<{ x: number; control: number; treatment: number }> = []
    const steps = 100

    for (let i = 0; i <= steps; i++) {
      const x = i / steps

      // Beta PDF approximation using normal approximation for visualization
      const controlPDF = betaPDF(x, posteriorControl.alpha, posteriorControl.beta)
      const treatmentPDF = betaPDF(x, posteriorTreatment.alpha, posteriorTreatment.beta)

      points.push({
        x,
        control: controlPDF,
        treatment: treatmentPDF,
      })
    }

    return points
  }, [posteriorControl, posteriorTreatment])

  // Simple beta PDF approximation
  function betaPDF(x: number, alpha: number, beta: number): number {
    if (x <= 0 || x >= 1) return 0
    // Simplified approximation using log-gamma
    const logBeta = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta)
    return Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta)
  }

  function logGamma(x: number): number {
    // Stirling's approximation
    if (x < 1) return 0
    return (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI)
  }

  const handleSimulate = () => {
    const controlData = generateBinaryOutcomes(nControl, 0.4)
    const treatmentData = generateBinaryOutcomes(nTreatment, 0.6)

    setResponsesControl(controlData.successes)
    setResponsesTreatment(treatmentData.successes)

    updateInteractiveCompletion('bayesian-updater')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bayesian Updating Laboratory</h1>
        <p className="mt-2 text-muted-foreground">
          Explore how posterior distributions update as data accumulate
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="mt-0.5 h-5 w-5 text-primary" />
            <div className="space-y-2 text-sm">
              <p>
                <strong>Bayesian Updating:</strong> As data accumulate, the posterior distribution
                combines your prior beliefs with the observed evidence.
              </p>
              <p>
                Posterior ∝ Prior × Likelihood
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Adjust prior and data parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prior Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prior Distribution</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(priorConfigs) as PriorType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPriorType(type)}
                      className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        priorType === type
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      {priorConfigs[type].label.split('(')[0]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Beta({priorConfig.alpha}, {priorConfig.beta})
                </p>
              </div>

              {/* Control Arm */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Control Arm</h3>
                <div className="space-y-2">
                  <label className="text-sm">Sample Size: {nControl}</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={nControl}
                    onChange={(e) => setNControl(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Responses: {responsesControl}</label>
                  <input
                    type="range"
                    min="0"
                    max={nControl}
                    step="1"
                    value={Math.min(responsesControl, nControl)}
                    onChange={(e) => setResponsesControl(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Treatment Arm */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Treatment Arm</h3>
                <div className="space-y-2">
                  <label className="text-sm">Sample Size: {nTreatment}</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={nTreatment}
                    onChange={(e) => setNTreatment(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Responses: {responsesTreatment}</label>
                  <input
                    type="range"
                    min="0"
                    max={nTreatment}
                    step="1"
                    value={Math.min(responsesTreatment, nTreatment)}
                    onChange={(e) => setResponsesTreatment(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <Button onClick={handleSimulate} className="w-full">
                Simulate New Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Posterior Statistics</CardTitle>
              <CardDescription>Updated beliefs after observing data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Control Response Rate</p>
                  <p className="text-2xl font-bold">{(stats.controlMean * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">
                    95% CI: [{(stats.controlCI[0] * 100).toFixed(1)}%, {(stats.controlCI[1] * 100).toFixed(1)}%]
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Treatment Response Rate</p>
                  <p className="text-2xl font-bold">{(stats.treatmentMean * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">
                    95% CI: [{(stats.treatmentCI[0] * 100).toFixed(1)}%, {(stats.treatmentCI[1] * 100).toFixed(1)}%]
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">Absolute Difference</p>
                <p className="text-2xl font-bold">
                  {(stats.absoluteDifference * 100).toFixed(1)}%
                </p>
              </div>

              <div className="rounded-lg border bg-primary/10 p-4">
                <p className="text-sm font-medium">P(Treatment {'>'}Control)</p>
                <p className="text-3xl font-bold text-primary">
                  {(stats.probBetter * 100).toFixed(1)}%
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Bayesian probability that treatment response rate exceeds control
                </p>
              </div>

              {stats.probBetter > 0.95 && (
                <Badge className="w-full justify-center">Strong Evidence for Treatment</Badge>
              )}
              {stats.probBetter < 0.05 && (
                <Badge variant="destructive" className="w-full justify-center">
                  Strong Evidence Against Treatment
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Posterior Distributions</CardTitle>
          <CardDescription>
            Probability density functions for response rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                label={{ value: 'Response Rate', position: 'insideBottom', offset: -5 }}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <YAxis label={{ value: 'Density', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value: number) => value.toFixed(3)}
                labelFormatter={(label) => `Rate: ${(Number(label) * 100).toFixed(1)}%`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="control"
                name="Control"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="treatment"
                name="Treatment"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Educational Content */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Credible Intervals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Bayesian Credible Interval:</strong> A 95% credible interval means "there is a
            95% probability the true parameter lies within this interval" given the observed data
            and prior.
          </p>
          <p>
            <strong>Contrast with Confidence Intervals:</strong> A frequentist 95% confidence
            interval means "if we repeated this study infinitely, 95% of such intervals would
            contain the true parameter." It does NOT mean there's a 95% probability the parameter
            is in this specific interval.
          </p>
          <p>
            <strong>Clinical Interpretation:</strong> Bayesian credible intervals align with how
            clinicians naturally think: "What's the probability this treatment works?"
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
