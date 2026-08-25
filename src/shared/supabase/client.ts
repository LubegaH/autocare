import { createClient } from '@supabase/supabase-js'
import { getPublicConfig } from '../config/env.ts'
import type { Result } from '../types/result.ts'
import type { Database } from './database.types.ts'

type SupabaseClient = ReturnType<typeof createClient<Database>>
let browserClient: Result<SupabaseClient> | undefined

function createBrowserClient(): Result<SupabaseClient> {
  const config = getPublicConfig()

  if (!config.success) {
    return config
  }

  return {
    success: true,
    data: createClient<Database>(
      config.data.supabaseUrl,
      config.data.supabasePublishableKey,
      {
        auth: { persistSession: true },
      },
    ),
  }
}

export function getBrowserClient(): Result<SupabaseClient> {
  browserClient ??= createBrowserClient()
  return browserClient
}
