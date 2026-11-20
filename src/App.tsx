import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'

const Home = lazy(() => import('@/pages/Home'))
const Learn = lazy(() => import('@/pages/Learn'))
const Lesson = lazy(() => import('@/pages/Lesson'))
const LabsIndex = lazy(() => import('@/pages/LabsIndex'))
const Cases = lazy(() => import('@/pages/Cases'))
const Ethics = lazy(() => import('@/pages/Ethics'))
const Exam = lazy(() => import('@/pages/Exam'))
const Glossary = lazy(() => import('@/pages/Glossary'))
const Sources = lazy(() => import('@/pages/Sources'))
const Progress = lazy(() => import('@/pages/Progress'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const SampleSizeLab = lazy(() => import('@/pages/labs/SampleSizeLab'))
const RandomizationLab = lazy(() => import('@/pages/labs/RandomizationLab'))
const EstimandLab = lazy(() => import('@/pages/labs/EstimandLab'))
const MultiplicityLab = lazy(() => import('@/pages/labs/MultiplicityLab'))
const NonInferiorityLab = lazy(() => import('@/pages/labs/NonInferiorityLab'))
const GroupSequentialLab = lazy(() => import('@/pages/labs/GroupSequentialLab'))
const RarLab = lazy(() => import('@/pages/labs/RarLab'))
const BayesianLab = lazy(() => import('@/pages/labs/BayesianLab'))
const EnrichmentLab = lazy(() => import('@/pages/labs/EnrichmentLab'))
const DesignReviewLab = lazy(() => import('@/pages/labs/DesignReviewLab'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="learn" element={<Learn />} />
          <Route path="learn/:moduleId" element={<Lesson />} />
          <Route path="labs" element={<LabsIndex />} />
          <Route path="labs/sample-size" element={<SampleSizeLab />} />
          <Route path="labs/randomization" element={<RandomizationLab />} />
          <Route path="labs/estimands" element={<EstimandLab />} />
          <Route path="labs/multiplicity" element={<MultiplicityLab />} />
          <Route path="labs/non-inferiority" element={<NonInferiorityLab />} />
          <Route path="labs/group-sequential" element={<GroupSequentialLab />} />
          <Route path="labs/adaptive-randomization" element={<RarLab />} />
          <Route path="labs/bayesian" element={<BayesianLab />} />
          <Route path="labs/enrichment" element={<EnrichmentLab />} />
          <Route path="labs/design-review" element={<DesignReviewLab />} />
          <Route path="cases" element={<Cases />} />
          <Route path="ethics" element={<Ethics />} />
          <Route path="exam" element={<Exam />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="sources" element={<Sources />} />
          <Route path="progress" element={<Progress />} />
          {/* v1 URLs */}
          <Route path="modules" element={<Navigate to="/learn" replace />} />
          <Route path="module/:id" element={<Navigate to="/learn" replace />} />
          <Route path="bayesian-lab" element={<Navigate to="/labs/bayesian" replace />} />
          <Route path="adaptive-lab" element={<Navigate to="/labs/adaptive-randomization" replace />} />
          <Route path="interim-dashboard" element={<Navigate to="/labs/group-sequential" replace />} />
          <Route path="trial-designer" element={<Navigate to="/labs/design-review" replace />} />
          <Route path="assessment" element={<Navigate to="/exam" replace />} />
          <Route path="settings" element={<Navigate to="/progress" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
