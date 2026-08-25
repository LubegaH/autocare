import { afterEach, describe, expect, it, vi } from 'vitest'

const { getBrowserClientMock } = vi.hoisted(() => ({
  getBrowserClientMock: vi.fn(),
}))

vi.mock('../../shared/supabase/client.ts', () => ({
  getBrowserClient: getBrowserClientMock,
}))

import { loadSystemStatus } from './loadSystemStatus.ts'

describe('loadSystemStatus', () => {
  afterEach(() => {
    getBrowserClientMock.mockReset()
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
  })

  it('does not attempt a database request while offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })

    await expect(loadSystemStatus()).resolves.toEqual({
      success: false,
      error: {
        code: 'offline',
        message: 'You are offline. Reconnect before checking the database.',
      },
    })
    expect(getBrowserClientMock).not.toHaveBeenCalled()
  })

  it('maps database failures to a stable recoverable error', async () => {
    const databaseError = { message: 'connection failed' }
    const maybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: databaseError })
    const eq = vi.fn(() => ({ maybeSingle }))
    const select = vi.fn(() => ({ eq }))
    const from = vi.fn(() => ({ select }))
    getBrowserClientMock.mockReturnValue({
      success: true,
      data: { from },
    })

    await expect(loadSystemStatus()).resolves.toEqual({
      success: false,
      error: {
        code: 'database_unavailable',
        message: 'AutoCare could not reach the database. Check it and retry.',
        cause: databaseError,
      },
    })
  })

  it('rejects an unexpected database response', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        service: 'AutoCare foundation',
        status: 'degraded',
        message: 'Unexpected state',
        updated_at: '2026-08-17T08:00:00+00:00',
      },
      error: null,
    })
    const eq = vi.fn(() => ({ maybeSingle }))
    const select = vi.fn(() => ({ eq }))
    const from = vi.fn(() => ({ select }))
    getBrowserClientMock.mockReturnValue({
      success: true,
      data: { from },
    })

    const result = await loadSystemStatus()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('invalid_response')
    }
  })
})
