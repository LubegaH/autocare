import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { Result } from '../../shared/types/result.ts'
import type { AuthSession } from './authGateway.ts'
import { loadSession, signOut } from './authService.ts'

type AccountPageProps = {
  load?: () => Promise<Result<AuthSession | null>>
  logout?: () => Promise<Result<null>>
}

type AccountState =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; session: AuthSession }

export function AccountPage({
  load = loadSession,
  logout = signOut,
}: AccountPageProps) {
  const navigate = useNavigate()
  const [state, setState] = useState<AccountState>({ kind: 'loading' })

  const refresh = useCallback(async () => {
    const result = await load()
    setState(
      result.success
        ? result.data
          ? { kind: 'ready', session: result.data }
          : { kind: 'signed-out' }
        : { kind: 'error', message: result.error.message },
    )
  }, [load])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function exit() {
    const result = await logout()
    if (!result.success) {
      setState({ kind: 'error', message: result.error.message })
      return
    }
    void navigate('/sign-in')
  }

  return (
    <main className="app-shell">
      <section className="status-card">
        <header className="status-card__header">
          <p className="eyebrow">Account</p>
          <h1>AutoCare</h1>
        </header>
        <div className="status-card__body">
          {state.kind === 'loading' ? (
            <p role="status">Loading your account…</p>
          ) : null}
          {state.kind === 'signed-out' ? (
            <p>
              Your session has expired. <Link to="/sign-in">Sign in again</Link>
              .
            </p>
          ) : null}
          {state.kind === 'error' ? (
            <p className="form-message form-message--error" role="alert">
              {state.message}
            </p>
          ) : null}
          {state.kind === 'ready' ? (
            <>
              <h2>Signed in</h2>
              <p>{state.session.email}</p>
              <p>Your profile is ready. Garage onboarding comes next.</p>
              <button
                className="primary-action"
                type="button"
                onClick={() => void exit()}
              >
                Sign out
              </button>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}
