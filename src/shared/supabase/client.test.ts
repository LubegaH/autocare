import { describe, expect, it, vi } from 'vitest'

const { createClientMock, getPublicConfigMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(() => ({ client: 'singleton' })),
  getPublicConfigMock: vi.fn(() => ({
    success: true,
    data: {
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'publishable-key',
    },
  })),
}))

vi.mock('@supabase/supabase-js', () => ({ createClient: createClientMock }))
vi.mock('../config/env.ts', () => ({ getPublicConfig: getPublicConfigMock }))

import { getBrowserClient } from './client.ts'

describe('getBrowserClient', () => {
  it('reuses one auth client for the browser context', () => {
    const first = getBrowserClient()
    const second = getBrowserClient()

    expect(first).toBe(second)
    expect(createClientMock).toHaveBeenCalledOnce()
  })
})
