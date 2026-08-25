import { createBrowserRouter, RouterProvider } from 'react-router'
import { StatusPage } from './features/system-status/StatusPage.tsx'
import { loadSystemStatus } from './features/system-status/loadSystemStatus.ts'
import { AccountPage } from './features/auth/AccountPage.tsx'
import { RecoveryPage } from './features/auth/RecoveryPage.tsx'
import { SignInPage } from './features/auth/SignInPage.tsx'
import { SignUpPage } from './features/auth/SignUpPage.tsx'

const router = createBrowserRouter([
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
  { path: '/recover', element: <RecoveryPage /> },
  { path: '/account', element: <AccountPage /> },
  {
    path: '*',
    element: <StatusPage loadStatus={loadSystemStatus} />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
