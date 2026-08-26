import type { Result } from '../types/result.ts'
import { getBrowserClient } from './client.ts'

type RpcError = { code: string; message: string }
type RpcResponse = PromiseLike<{ data: unknown; error: RpcError | null }>
type RpcInvoker = (
  functionName: string,
  args?: Record<string, unknown>,
) => RpcResponse

export async function callRpc(
  functionName: string,
  args?: Record<string, unknown>,
): Promise<Result<unknown>> {
  const client = getBrowserClient()
  if (!client.success) return client

  // Generated database types are refreshed from migrations in the database gate.
  // Runtime output still crosses a Zod boundary in each feature gateway.
  const invoke = client.data.rpc.bind(client.data) as unknown as RpcInvoker
  const { data, error } = await invoke(functionName, args)

  if (!error) return { success: true, data }

  if (error.code === '28000' || error.code === '42501') {
    return {
      success: false,
      error: {
        code: error.code === '28000' ? 'unauthenticated' : 'unauthorized',
        message:
          error.code === '28000'
            ? 'Sign in with a verified account to continue.'
            : 'You do not have permission to perform this action.',
        cause: error,
      },
    }
  }

  if (error.code === '23505') {
    return {
      success: false,
      error: {
        code: 'conflict',
        message:
          'That change conflicts with an existing record. Refresh and try again.',
        cause: error,
      },
    }
  }

  return {
    success: false,
    error: {
      code: 'database_unavailable',
      message:
        'AutoCare could not save that change. Your entries are still here; please retry.',
      cause: error,
    },
  }
}
