import { afterEach, describe, expect, it } from 'vitest'
import { loadSystemStatus } from './loadSystemStatus.ts'

describe('loadSystemStatus', () => {
  afterEach(() => {
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
      ok: false,
      message: 'You are offline. Reconnect before checking the database.',
    })
  })
})
