import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { MonitoringBoundary } from './shared/monitoring/MonitoringBoundary.tsx'
import { initializeMonitoring } from './shared/monitoring/sentry.ts'
import { getPublicConfig } from './shared/config/env.ts'
import './index.css'

const config = getPublicConfig()

if (config.success && config.data.sentryDsn) {
  void initializeMonitoring(config.data.sentryDsn)
}

const root = document.getElementById('root')

if (!root) {
  throw new Error('Application root element is missing')
}

createRoot(root).render(
  <StrictMode>
    <MonitoringBoundary>
      <App />
    </MonitoringBoundary>
  </StrictMode>,
)
