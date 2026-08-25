import { useCallback, useEffect, useState } from 'react'
import type { Result } from '../../shared/types/result.ts'
import { formatStatusUpdatedAt, type SystemStatus } from './systemStatus.ts'

type StatusPageProps = {
  loadStatus: () => Promise<Result<SystemStatus | null>>
}

type ViewState =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; status: SystemStatus }

export function StatusPage({ loadStatus }: StatusPageProps) {
  const [view, setView] = useState<ViewState>({ kind: 'loading' })

  const refresh = useCallback(async () => {
    setView({ kind: 'loading' })
    const result = await loadStatus()
    setView(
      result.success
        ? result.data
          ? { kind: 'ready', status: result.data }
          : { kind: 'empty' }
        : { kind: 'error', message: result.error.message },
    )
  }, [loadStatus])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <main className="app-shell">
      <article className="status-card">
        <header className="status-card__header">
          <p className="eyebrow">Walking skeleton</p>
          <h1>AutoCare</h1>
        </header>

        <div className="status-card__body">
          <p className="status-copy">
            The smallest live path from this page to the database is in place.
            Product workflows come next, one approved slice at a time.
          </p>

          {view.kind === 'ready' ? (
            <table className="status-table">
              <caption className="sr-only">AutoCare service status</caption>
              <tbody>
                <tr>
                  <th scope="row">Service</th>
                  <td>{view.status.service}</td>
                </tr>
                <tr>
                  <th scope="row">Status</th>
                  <td>
                    <span className="status-badge">{view.status.status}</span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Updated</th>
                  <td>{formatStatusUpdatedAt(view.status.updated_at)}</td>
                </tr>
              </tbody>
            </table>
          ) : null}

          <p
            className="status-message"
            data-kind={view.kind === 'error' ? 'error' : 'status'}
            role={view.kind === 'error' ? 'alert' : 'status'}
          >
            {view.kind === 'loading' ? 'Checking the foundation…' : null}
            {view.kind === 'empty'
              ? 'No status row exists yet. Apply the development seed, then retry.'
              : null}
            {view.kind === 'error' ? view.message : null}
            {view.kind === 'ready' ? view.status.message : null}
          </p>

          <button
            className="primary-action"
            type="button"
            disabled={view.kind === 'loading'}
            onClick={() => void refresh()}
          >
            {view.kind === 'loading' ? 'Checking…' : 'Refresh status'}
          </button>
        </div>
      </article>
    </main>
  )
}
