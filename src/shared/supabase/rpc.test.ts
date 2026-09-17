import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBrowserClient } from './client.ts'
import { callRpc } from './rpc.ts'

vi.mock('./client.ts', () => ({ getBrowserClient: vi.fn() }))

describe('callRpc', () => {
  beforeEach(() => vi.resetAllMocks())

  it('preserves the Supabase client receiver when invoking RPC', async () => {
    const rpcOwner = {
      marker: 'bound-client',
      rpc(this: { marker: string }, functionName: string) {
        return Promise.resolve({
          data: `${this.marker}:${functionName}`,
          error: null,
        })
      },
    }
    vi.mocked(getBrowserClient).mockReturnValue({
      success: true,
      data: rpcOwner,
    } as never)

    await expect(callRpc('list_my_garages')).resolves.toEqual({
      success: true,
      data: 'bound-client:list_my_garages',
    })
  })
})
