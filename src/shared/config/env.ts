import { z } from 'zod'
import type { Result } from '../types/result.ts'

const publicConfigSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  VITE_SENTRY_DSN: z.union([z.url(), z.literal('')]).optional(),
})

export type PublicConfig = {
  supabaseUrl: string
  supabasePublishableKey: string
  sentryDsn?: string
}

export function getPublicConfig(): Result<PublicConfig> {
  const parsed = publicConfigSchema.safeParse(import.meta.env)

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'configuration_error',
        message:
          'Development services are not configured. Copy .env.example to .env.',
        cause: parsed.error,
      },
    }
  }

  const sentryDsn = parsed.data.VITE_SENTRY_DSN || undefined

  return {
    success: true,
    data: {
      supabaseUrl: parsed.data.VITE_SUPABASE_URL,
      supabasePublishableKey: parsed.data.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...(sentryDsn ? { sentryDsn } : {}),
    },
  }
}
