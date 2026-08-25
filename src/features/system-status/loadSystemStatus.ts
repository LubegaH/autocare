import { getBrowserClient } from '../../shared/supabase/client.ts'
import type { Result } from '../../shared/types/result.ts'
import { systemStatusSchema, type SystemStatus } from './systemStatus.ts'

export async function loadSystemStatus(): Promise<Result<SystemStatus | null>> {
  if (!navigator.onLine) {
    return {
      success: false,
      error: {
        code: 'offline',
        message: 'You are offline. Reconnect before checking the database.',
      },
    }
  }

  const client = getBrowserClient()

  if (!client.success) {
    return client
  }

  const { data, error } = await client.data
    .from('system_status')
    .select('service, status, message, updated_at')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: {
        code: 'database_unavailable',
        message: 'AutoCare could not reach the database. Check it and retry.',
        cause: error,
      },
    }
  }

  if (!data) {
    return { success: true, data: null }
  }

  const parsed = systemStatusSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'invalid_response',
        message: 'The database returned an unexpected status record.',
        cause: parsed.error,
      },
    }
  }

  return { success: true, data: parsed.data }
}
