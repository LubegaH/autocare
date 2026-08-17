import { createBrowserClient } from '../../shared/supabase/client.ts'
import type { Result } from '../../shared/types/result.ts'
import { systemStatusSchema, type SystemStatus } from './systemStatus.ts'

export async function loadSystemStatus(): Promise<Result<SystemStatus | null>> {
  if (!navigator.onLine) {
    return {
      ok: false,
      message: 'You are offline. Reconnect before checking the database.',
    }
  }

  const client = createBrowserClient()

  if (!client.ok) {
    return client
  }

  const { data, error } = await client.value
    .from('system_status')
    .select('service, status, message, updated_at')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    return {
      ok: false,
      message:
        'AutoCare could not reach the local database. Check it and retry.',
      cause: error,
    }
  }

  if (!data) {
    return { ok: true, value: null }
  }

  const parsed = systemStatusSchema.safeParse(data)

  if (!parsed.success) {
    return {
      ok: false,
      message: 'The database returned an unexpected status record.',
      cause: parsed.error,
    }
  }

  return { ok: true, value: parsed.data }
}
