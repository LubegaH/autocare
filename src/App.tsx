import { createBrowserRouter, RouterProvider } from 'react-router'
import { StatusPage } from './features/system-status/StatusPage.tsx'
import { loadSystemStatus } from './features/system-status/loadSystemStatus.ts'
import { AccountPage } from './features/auth/AccountPage.tsx'
import { RecoveryPage } from './features/auth/RecoveryPage.tsx'
import { SignInPage } from './features/auth/SignInPage.tsx'
import { SignUpPage } from './features/auth/SignUpPage.tsx'
import { DashboardPage } from './features/garages/DashboardPage.tsx'
import { GarageOnboardingPage } from './features/garages/GarageOnboardingPage.tsx'
import { AcceptStaffInvitationPage } from './features/garages/AcceptStaffInvitationPage.tsx'
import { StaffInvitePage } from './features/garages/StaffInvitePage.tsx'

const router = createBrowserRouter([
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
  { path: '/recover', element: <RecoveryPage /> },
  { path: '/account', element: <AccountPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/onboarding/garage', element: <GarageOnboardingPage /> },
  { path: '/garages/:garageId/staff/invite', element: <StaffInvitePage /> },
  { path: '/invitations/staff/accept', element: <AcceptStaffInvitationPage /> },
  {
    path: '*',
    element: <StatusPage loadStatus={loadSystemStatus} />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
