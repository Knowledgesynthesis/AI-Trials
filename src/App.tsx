import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Home } from '@/pages/Home'
import { Modules } from '@/pages/Modules'
import { ModuleDetail } from '@/pages/ModuleDetail'
import { BayesianLab } from '@/pages/BayesianLab'
import { AdaptiveLab } from '@/pages/AdaptiveLab'
import { Glossary } from '@/pages/Glossary'
import { Assessment } from '@/pages/Assessment'
import { Settings } from '@/pages/Settings'
import { Placeholder } from '@/pages/Placeholder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/module/:moduleId" element={<ModuleDetail />} />
          <Route path="/bayesian-lab" element={<BayesianLab />} />
          <Route path="/adaptive-lab" element={<AdaptiveLab />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/trial-designer"
            element={
              <Placeholder
                title="Trial Designer"
                description="Design synthetic trials with different randomization schemes and endpoints"
              />
            }
          />
          <Route
            path="/interim-dashboard"
            element={
              <Placeholder
                title="Interim Analysis Dashboard"
                description="Explore interim monitoring, stopping boundaries, and conditional power"
              />
            }
          />
          <Route
            path="/ethics"
            element={
              <Placeholder
                title="Ethics Center"
                description="Understand clinical equipoise, fairness, and regulatory considerations"
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
