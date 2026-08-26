import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import type { AuthSession } from '../auth/authGateway.ts'
import { loadSession } from '../auth/authService.ts'
import {
  acceptStaffInvitation,
  setInvitedUserPassword,
} from './staffInvitationService.ts'

type PageState =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; session: AuthSession }
  | { kind: 'accepted' }

export function AcceptStaffInvitationPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const [state, setState] = useState<PageState>({ kind: 'loading' })
  const [pending, setPending] = useState(false)

  const initialize = useCallback(async () => {
    if (!/^[0-9a-f]{64}$/.test(token)) {
      setState({ kind: 'error', message: 'This invitation link is invalid.' })
      return
    }
    const session = await loadSession()
    setState(
      session.success
        ? session.data
          ? { kind: 'ready', session: session.data }
          : { kind: 'signed-out' }
        : { kind: 'error', message: session.error.message },
    )
  }, [token])

  useEffect(() => {
    void initialize()
  }, [initialize])

  async function accept(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (state.kind !== 'ready') return
    setPending(true)
    if (state.session.invitedAt) {
      const values = event ? new FormData(event.currentTarget) : null
      const password = String(values?.get('password') ?? '')
      const passwordResult = await setInvitedUserPassword(password)
      if (!passwordResult.success) {
        setPending(false)
        setState({ kind: 'error', message: passwordResult.error.message })
        return
      }
    }
    const result = await acceptStaffInvitation(token)
    setPending(false)
    if (!result.success) {
      setState({ kind: 'error', message: result.error.message })
      return
    }
    setState({ kind: 'accepted' })
    void navigate('/dashboard')
  }

  const returnTo = `${location.pathname}${location.search}`
  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="invite-title">
        <header className="auth-card__header">
          <p className="eyebrow">Staff invitation</p>
          <h1 id="invite-title">Join the garage</h1>
          <p>
            Membership is granted only after you sign in and accept this
            single-use invitation.
          </p>
        </header>
        <div className="auth-card__body">
          {state.kind === 'loading' ? (
            <p role="status">Checking invitation…</p>
          ) : null}
          {state.kind === 'signed-out' ? (
            <div className="empty-state">
              <h2>Sign in to continue</h2>
              <p>Use the exact email address that received this invitation.</p>
              <Link
                className="button-link"
                to={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}
              >
                Sign in
              </Link>
            </div>
          ) : null}
          {state.kind === 'error' ? (
            <div>
              <p className="form-message form-message--error" role="alert">
                {state.message}
              </p>
              <button
                className="primary-action"
                type="button"
                onClick={() => void initialize()}
              >
                Retry
              </button>
            </div>
          ) : null}
          {state.kind === 'ready' && state.session.invitedAt ? (
            <form
              className="auth-form"
              onSubmit={(event) => void accept(event)}
            >
              <label>
                Create password
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                />
              </label>
              <button
                className="primary-action"
                type="submit"
                disabled={pending}
              >
                {pending ? 'Joining garage…' : 'Set password & join'}
              </button>
            </form>
          ) : null}
          {state.kind === 'ready' && !state.session.invitedAt ? (
            <div>
              <p>
                Signed in as <strong>{state.session.email}</strong>.
              </p>
              <button
                className="primary-action"
                type="button"
                disabled={pending}
                onClick={() => void accept()}
              >
                {pending ? 'Joining garage…' : 'Accept invitation'}
              </button>
            </div>
          ) : null}
          {state.kind === 'accepted' ? (
            <p className="form-message" role="status">
              Invitation accepted. Opening your dashboard…
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
