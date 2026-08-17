import { BrowserRouter, Route, Routes } from 'react-router'
import { StatusPage } from './features/system-status/StatusPage.tsx'
import { loadSystemStatus } from './features/system-status/loadSystemStatus.ts'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={<StatusPage loadStatus={loadSystemStatus} />}
        />
      </Routes>
    </BrowserRouter>
  )
}
