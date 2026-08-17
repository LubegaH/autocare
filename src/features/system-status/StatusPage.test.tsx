import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StatusPage } from './StatusPage.tsx'

const readyStatus = {
  service: 'AutoCare foundation',
  status: 'ready' as const,
  message: 'The page, action, and database table are connected.',
  updated_at: '2026-08-17T08:00:00+00:00',
}

describe('StatusPage', () => {
  it('loads the database status and lets the user refresh it', async () => {
    const user = userEvent.setup()
    const loadStatus = vi.fn().mockResolvedValue({
      ok: true,
      value: readyStatus,
    })

    render(<StatusPage loadStatus={loadStatus} />)

    expect(await screen.findByText('AutoCare foundation')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Refresh status' }))

    expect(loadStatus).toHaveBeenCalledTimes(2)
    expect(await screen.findByText(readyStatus.message)).toBeVisible()
  })

  it('explains how to recover when the status table is empty', async () => {
    const loadStatus = vi.fn().mockResolvedValue({ ok: true, value: null })

    render(<StatusPage loadStatus={loadStatus} />)

    expect(
      await screen.findByText(/reset the local database, then retry/i),
    ).toBeVisible()
  })
})
