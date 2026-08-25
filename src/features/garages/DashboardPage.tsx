import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { GarageSummary } from './garageSchemas.ts'
import { listMyGarages } from './garageService.ts'

type DashboardState =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; garages: GarageSummary[] }

export function DashboardPage() {
  const [state, setState] = useState<DashboardState>({ kind: 'loading' })

  const refresh = useCallback(async () => {
    setState({ kind: 'loading' })
    const result = await listMyGarages()
    setState(
      result.success
        ? result.data.length
          ? { kind: 'ready', garages: result.data }
          : { kind: 'empty' }
        : { kind: 'error', message: result.error.message },
    )
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <main className="app-shell">
      <section className="status-card">
        <header className="status-card__header">
          <p className="eyebrow">Today</p>
          <h1>Dashboard</h1>
        </header>
        <div className="status-card__body">
          {state.kind === 'loading' ? (
            <p role="status">Loading your garages…</p>
          ) : null}
          {state.kind === 'empty' ? (
            <div className="empty-state">
              <h2>No garage yet</h2>
              <p>Create your garage to begin owner onboarding.</p>
              <Link className="button-link" to="/onboarding/garage">
                Set up a garage
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
                onClick={() => void refresh()}
              >
                Retry
              </button>
            </div>
          ) : null}
          {state.kind === 'ready' ? (
            <>
              <h2>Your garages</h2>
              <ul className="garage-list">
                {state.garages.map((garage) => (
                  <li key={garage.garage_id}>
                    <strong>{garage.name}</strong>
                    <span>{garage.role}</span>
                  </li>
                ))}
              </ul>
              <Link className="button-link" to="/onboarding/garage">
                Add another garage
              </Link>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}
