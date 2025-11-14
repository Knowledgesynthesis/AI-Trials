import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  adaptiveAllocationProbability,
} from '@/lib/statistics'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Info, Play } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

export function AdaptiveLab() {
  const { updateInteractiveCompletion } = useAppStore()
  const [controlRate, setControlRate] = useState(0.4)
  const [treatmentRate, setTreatmentRate] = useState(0.6)
  const [totalN, setTotalN] = useState(200)
  const [tuningParameter, setTuningParameter] = useState(0.5)
  const [isRunning, setIsRunning] = useState(false)
  const [simulationData, setSimulationData] = useState<Array<{
    patient: number
    allocationProb: number
    controlN: number
    treatmentN: number
    controlResponses: number
    treatmentResponses: number
  }> | null>(null)

  const runSimulation = () => {
    setIsRunning(true)
    updateInteractiveCompletion('adaptive-randomization-lab')

    // Initial prior: Beta(1,1)
    let alphaControl = 1
    let betaControl = 1
    let alphaTreatment = 1
    let betaTreatment = 1

    let controlN = 0
    let treatmentN = 0
    let controlResponses = 0
    let treatmentResponses = 0

    const data: Array<{
      patient: number
      allocationProb: number
      controlN: number
      treatmentN: number
      controlResponses: number
      treatmentResponses: number
    }> = []

    for (let i = 1; i <= totalN; i++) {
      // Calculate allocation probability
      const treatmentProb = adaptiveAllocationProbability(
        alphaControl,
        betaControl,
        alphaTreatment,
        betaTreatment,
        tuningParameter
      )

      // Randomize patient
      const assignToTreatment = Math.random() < treatmentProb

      if (assignToTreatment) {
        treatmentN++
        const responded = Math.random() < treatmentRate
        if (responded) {
          treatmentResponses++
          alphaTreatment++
        } else {
          betaTreatment++
        }
      } else {
        controlN++
        const responded = Math.random() < controlRate
        if (responded) {
          controlResponses++
          alphaControl++
        } else {
          betaControl++
        }
      }

      // Record every 5th patient for visualization
      if (i % 5 === 0 || i === totalN) {
        data.push({
          patient: i,
          allocationProb: treatmentProb,
          controlN,
          treatmentN,
          controlResponses,
          treatmentResponses,
        })
      }
    }

    setSimulationData(data)
    setIsRunning(false)
  }

  const finalStats = useMemo(() => {
    if (!simulationData || simulationData.length === 0) return null

    const final = simulationData[simulationData.length - 1]
    const controlResponseRate = final.controlN > 0
      ? final.controlResponses / final.controlN
      : 0
    const treatmentResponseRate = final.treatmentN > 0
      ? final.treatmentResponses / final.treatmentN
      : 0

    return {
      controlN: final.controlN,
      treatmentN: final.treatmentN,
      controlRate: controlResponseRate,
      treatmentRate: treatmentResponseRate,
      totalPatients: final.patient,
    }
  }, [simulationData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adaptive Design Laboratory</h1>
        <p className="mt-2 text-muted-foreground">
          Simulate response-adaptive randomization and observe allocation probabilities evolve
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="mt-0.5 h-5 w-5 text-primary" />
            <div className="space-y-2 text-sm">
              <p>
                <strong>Response-Adaptive Randomization:</strong> Allocation probabilities change
                during the trial based on accumulating outcome data, potentially assigning more
                patients to better-performing arms.
              </p>
              <p>
                The tuning parameter controls how adaptive the design is: 0 = fixed 1:1, 1 = fully
                adaptive to posterior probabilities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Parameters</CardTitle>
            <CardDescription>Set true response rates and sample size</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Control Response Rate: {(controlRate * 100).toFixed(0)}%
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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Treatment Response Rate: {(treatmentRate * 100).toFixed(0)}%
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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Total Sample Size: {totalN}
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={totalN}
                onChange={(e) => setTotalN(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tuning Parameter: {tuningParameter.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={tuningParameter}
                onChange={(e) => setTuningParameter(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {tuningParameter === 0 && 'Fixed 1:1 allocation'}
                {tuningParameter > 0 && tuningParameter < 0.5 && 'Mildly adaptive'}
                {tuningParameter >= 0.5 && tuningParameter < 0.8 && 'Moderately adaptive'}
                {tuningParameter >= 0.8 && 'Highly adaptive'}
              </p>
            </div>

            <Button onClick={runSimulation} disabled={isRunning} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>Final allocation and response rates</CardDescription>
          </CardHeader>
          <CardContent>
            {finalStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Control Arm</p>
                    <p className="mt-2 text-3xl font-bold">{finalStats.controlN}</p>
                    <p className="text-sm text-muted-foreground">
                      patients ({((finalStats.controlN / finalStats.totalPatients) * 100).toFixed(1)}%)
                    </p>
                    <div className="mt-3">
                      <p className="text-sm">Response Rate</p>
                      <p className="text-xl font-semibold">
                        {(finalStats.controlRate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-primary/5 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Treatment Arm</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{finalStats.treatmentN}</p>
                    <p className="text-sm text-muted-foreground">
                      patients ({((finalStats.treatmentN / finalStats.totalPatients) * 100).toFixed(1)}%)
                    </p>
                    <div className="mt-3">
                      <p className="text-sm">Response Rate</p>
                      <p className="text-xl font-semibold">
                        {(finalStats.treatmentRate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {finalStats.treatmentN > finalStats.controlN && (
                  <Badge className="w-full justify-center">
                    More patients allocated to better-performing arm
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                Run a simulation to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visualizations */}
      {simulationData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Allocation Probability Over Time</CardTitle>
              <CardDescription>
                Probability of assigning next patient to treatment arm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="patient"
                    label={{ value: 'Patient Number', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'P(Treatment)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                    labelFormatter={(label) => `Patient ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="allocationProb"
                    name="Treatment Allocation Probability"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => 0.5}
                    name="Fixed 1:1 (50%)"
                    stroke="#6b7280"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cumulative Allocation</CardTitle>
              <CardDescription>Number of patients in each arm over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="patient"
                    label={{ value: 'Patient Number', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis label={{ value: 'Cumulative N', angle: -90, position: 'insideLeft' }} />
                  <Tooltip labelFormatter={(label) => `Patient ${label}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="controlN"
                    name="Control"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="treatmentN"
                    name="Treatment"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
