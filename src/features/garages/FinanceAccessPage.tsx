import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  grantFinanceAdmin,
  listFinanceCandidates,
  revokeFinanceAdmin,
  type FinanceCandidate,
} from './financeAccessService.ts'

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; candidates: FinanceCandidate[] }

export function FinanceAccessPage() {
  const { garageId = '' } = useParams()
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [pendingId, setPendingId] = useState<string>()

  const refresh = useCallback(async () => {
    setState({ kind: 'loading' })
    const result = await listFinanceCandidates(garageId)
    setState(
      result.success
        ? result.data.length
          ? { kind: 'ready', candidates: result.data }
          : { kind: 'empty' }
        : { kind: 'error', message: result.error.message },
    )
  }, [garageId])
  useEffect(() => {
    void refresh()
  }, [refresh])

  async function change(candidate: FinanceCandidate, reason: string) {
    setPendingId(candidate.membership_id)
    const result =
      candidate.has_finance_admin && candidate.grant_id
        ? await revokeFinanceAdmin({
            garageId,
            grantId: candidate.grant_id,
            reason,
          })
        : await grantFinanceAdmin({
            garageId,
            membershipId: candidate.membership_id,
            reason,
          })
    setPendingId(undefined)
    if (!result.success)
      return setState({ kind: 'error', message: result.error.message })
    await refresh()
  }

  return (
    <main className="app-shell">
      <section className="status-card">
        <header className="status-card__header">
          <p className="eyebrow">Garage security</p>
          <h1>Finance access</h1>
          <p>
            Only active supervisors can receive delegated finance access. They
            cannot delegate onward.
          </p>
        </header>
        <div className="status-card__body">
          {state.kind === 'loading' ? (
            <p role="status">Loading access…</p>
          ) : null}
          {state.kind === 'empty' ? (
            <div className="empty-state">
              <h2>No eligible supervisors</h2>
              <p>
                Invite and activate a supervisor before delegating finance
                access.
              </p>
            </div>
          ) : null}
          {state.kind === 'error' ? (
            <div>
              <p className="form-message form-message--error" role="alert">
                {state.message}
              </p>
              <button className="primary-action" onClick={() => void refresh()}>
                Retry
              </button>
            </div>
          ) : null}
          {state.kind === 'ready' ? (
            <ul className="access-list">
              {state.candidates.map((candidate) => (
                <li key={candidate.membership_id}>
                  <div>
                    <strong>{candidate.full_name}</strong>
                    <span>
                      {candidate.has_finance_admin
                        ? 'Finance access active'
                        : 'No finance access'}
                    </span>
                  </div>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      const reason = String(
                        new FormData(event.currentTarget).get('reason') ?? '',
                      )
                      void change(candidate, reason)
                    }}
                  >
                    <label>
                      Reason
                      <input name="reason" maxLength={240} />
                    </label>
                    <button
                      className={
                        candidate.has_finance_admin
                          ? 'danger-action'
                          : 'primary-action'
                      }
                      disabled={pendingId === candidate.membership_id}
                    >
                      {candidate.has_finance_admin
                        ? 'Revoke access'
                        : 'Grant access'}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            <Link to="/dashboard">Back to dashboard</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
