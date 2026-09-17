import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import type { AuthSession } from '../auth/authGateway.ts'
import { loadSession } from '../auth/authService.ts'
import { setInvitedUserPassword } from '../garages/staffInvitationService.ts'
import { redeemCustomerClaim } from './customerClaimService.ts'

type State =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; session: AuthSession }

export function RedeemCustomerClaimPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [pending, setPending] = useState(false)

  const initialize = useCallback(async () => {
    if (!/^[0-9a-f]{64}$/.test(token))
      return setState({
        kind: 'error',
        message: 'This customer claim link is invalid.',
      })
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

  async function redeem(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (state.kind !== 'ready') return
    setPending(true)
    if (state.session.invitedAt) {
      const password = String(
        event ? (new FormData(event.currentTarget).get('password') ?? '') : '',
      )
      const passwordResult = await setInvitedUserPassword(password)
      if (!passwordResult.success) {
        setPending(false)
        return setState({
          kind: 'error',
          message: passwordResult.error.message,
        })
      }
    }
    const result = await redeemCustomerClaim(token)
    setPending(false)
    if (!result.success)
      return setState({ kind: 'error', message: result.error.message })
    void navigate('/dashboard')
  }

  const returnTo = `${location.pathname}${location.search}`
  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="claim-title">
        <header className="auth-card__header">
          <p className="eyebrow">Customer claim</p>
          <h1 id="claim-title">Link your customer record</h1>
          <p>
            Email matching alone grants no access. Confirm this single-use claim
            while signed in.
          </p>
        </header>
        <div className="auth-card__body">
          {state.kind === 'loading' ? (
            <p role="status">Checking claim…</p>
          ) : null}
          {state.kind === 'signed-out' ? (
            <div className="empty-state">
              <h2>Sign in to continue</h2>
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
              onSubmit={(event) => void redeem(event)}
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
              <button className="primary-action" disabled={pending}>
                {pending ? 'Linking…' : 'Set password & link record'}
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
                onClick={() => void redeem()}
              >
                {pending ? 'Linking…' : 'Link customer record'}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
