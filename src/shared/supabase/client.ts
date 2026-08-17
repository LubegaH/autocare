import { createClient } from '@supabase/supabase-js'
import { getPublicConfig } from '../config/env.ts'
import type { Result } from '../types/result.ts'
import type { Database } from './database.types.ts'

type SupabaseClient = ReturnType<typeof createClient<Database>>

export function createBrowserClient(): Result<SupabaseClient> {
  const config = getPublicConfig()

  if (!config.ok) {
    return config
  }

  return {
    ok: true,
    value: createClient<Database>(
      config.value.supabaseUrl,
      config.value.supabasePublishableKey,
      {
        auth: { persistSession: true },
      },
    ),
  }
}
