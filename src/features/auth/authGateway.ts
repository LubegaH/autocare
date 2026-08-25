import { getBrowserClient } from '../../shared/supabase/client.ts'
import type { Result } from '../../shared/types/result.ts'

export type AuthGatewayError = {
  message: string
  status?: number
  code?: string
}

export type AuthSession = {
  userId: string
  email: string
}

type GatewayResult<T> = Promise<{ data: T; error: AuthGatewayError | null }>

export type AuthGateway = {
  signUp: (input: {
    email: string
    password: string
    fullName: string
    phoneE164: string
  }) => GatewayResult<{ userId: string | null; hasSession: boolean }>
  signIn: (input: {
    email: string
    password: string
  }) => GatewayResult<AuthSession | null>
  requestRecovery: (email: string) => GatewayResult<null>
  getSession: () => GatewayResult<AuthSession | null>
  signOut: () => GatewayResult<null>
}

function toGatewayError(
  error: {
    message: string
    status?: number | undefined
    code?: string | undefined
  } | null,
): AuthGatewayError | null {
  if (!error) return null
  return {
    message: error.message,
    ...(error.status === undefined ? {} : { status: error.status }),
    ...(error.code === undefined ? {} : { code: error.code }),
  }
}

export function getAuthGateway(): Result<AuthGateway> {
  const client = getBrowserClient()
  if (!client.success) return client

  return {
    success: true,
    data: {
      async signUp(input) {
        const { data, error } = await client.data.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            data: {
              full_name: input.fullName,
              phone_e164: input.phoneE164,
            },
          },
        })
        return {
          data: {
            userId: data.user?.id ?? null,
            hasSession: data.session !== null,
          },
          error: toGatewayError(error),
        }
      },
      async signIn(input) {
        const { data, error } = await client.data.auth.signInWithPassword(input)
        return {
          data: data.user
            ? { userId: data.user.id, email: data.user.email ?? '' }
            : null,
          error: toGatewayError(error),
        }
      },
      async requestRecovery(emailAddress) {
        const { error } = await client.data.auth.resetPasswordForEmail(
          emailAddress,
          { redirectTo: `${window.location.origin}/account` },
        )
        return { data: null, error: toGatewayError(error) }
      },
      async getSession() {
        const { data, error } = await client.data.auth.getSession()
        const user = data.session?.user
        return {
          data: user ? { userId: user.id, email: user.email ?? '' } : null,
          error: toGatewayError(error),
        }
      },
      async signOut() {
        const { error } = await client.data.auth.signOut()
        return { data: null, error: toGatewayError(error) }
      },
    },
  }
}
