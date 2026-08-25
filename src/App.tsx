import { createBrowserRouter, RouterProvider } from 'react-router'
import { StatusPage } from './features/system-status/StatusPage.tsx'
import { loadSystemStatus } from './features/system-status/loadSystemStatus.ts'

const router = createBrowserRouter([
  {
    path: '*',
    element: <StatusPage loadStatus={loadSystemStatus} />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
