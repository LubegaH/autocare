import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBrowserClient } from '../../shared/supabase/client.ts'
import { getAuthGateway } from './authGateway.ts'

vi.mock('../../shared/supabase/client.ts', () => ({
  getBrowserClient: vi.fn(),
}))

describe('auth gateway recovery', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns recovery email links to the password reset form', async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getBrowserClient).mockReturnValue({
      success: true,
      data: { auth: { resetPasswordForEmail } },
    } as never)

    const gateway = getAuthGateway()
    expect(gateway.success).toBe(true)
    if (!gateway.success) return

    await gateway.data.requestRecovery('customer@example.test')
    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      'customer@example.test',
      { redirectTo: `${window.location.origin}/reset-password` },
    )
  })
})
