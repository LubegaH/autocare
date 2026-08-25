import type { Result, ResultError } from '../../shared/types/result.ts'
import {
  getAuthGateway,
  type AuthGateway,
  type AuthGatewayError,
  type AuthSession,
} from './authGateway.ts'
import {
  recoverySchema,
  signInSchema,
  signUpSchema,
  type RecoveryInput,
  type SignInInput,
  type SignUpInput,
} from './authSchemas.ts'

function validationError(error: {
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>
}): ResultError {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
  }
  return {
    code: 'validation_error',
    message: 'Check the highlighted fields and try again.',
    fieldErrors,
  }
}

function authError(error: AuthGatewayError): ResultError {
  if (error.code === 'user_already_exists') {
    return {
      code: 'conflict',
      message: 'An account already exists for this email. Try signing in.',
    }
  }
  if (error.code === 'email_not_confirmed') {
    return {
      code: 'unauthenticated',
      message: 'Verify your email before signing in.',
    }
  }
  if (error.code === 'invalid_credentials') {
    return {
      code: 'unauthenticated',
      message: 'The email or password is incorrect.',
    }
  }
  return {
    code: error.status === 429 ? 'conflict' : 'unexpected_error',
    message:
      error.status === 429
        ? 'Too many attempts. Wait a moment, then try again.'
        : 'Authentication is temporarily unavailable. Please try again.',
    cause: error,
  }
}

function resolveGateway(override?: AuthGateway): Result<AuthGateway> {
  return override ? { success: true, data: override } : getAuthGateway()
}

export async function signUp(
  input: SignUpInput,
  gatewayOverride?: AuthGateway,
): Promise<Result<{ confirmationRequired: boolean }>> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) }
  const gateway = resolveGateway(gatewayOverride)
  if (!gateway.success) return gateway
  const response = await gateway.data.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    fullName: parsed.data.fullName,
    phoneE164: parsed.data.phone,
  })
  if (response.error)
    return { success: false, error: authError(response.error) }
  if (!response.data.userId) {
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: 'Your account could not be created. Please try again.',
      },
    }
  }
  return {
    success: true,
    data: { confirmationRequired: !response.data.hasSession },
  }
}

export async function signIn(
  input: SignInInput,
  gatewayOverride?: AuthGateway,
): Promise<Result<AuthSession>> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) }
  const gateway = resolveGateway(gatewayOverride)
  if (!gateway.success) return gateway
  const response = await gateway.data.signIn(parsed.data)
  if (response.error)
    return { success: false, error: authError(response.error) }
  return response.data
    ? { success: true, data: response.data }
    : {
        success: false,
        error: {
          code: 'unauthenticated',
          message: 'Sign-in did not create a session. Please try again.',
        },
      }
}

export async function requestRecovery(
  input: RecoveryInput,
  gatewayOverride?: AuthGateway,
): Promise<Result<null>> {
  const parsed = recoverySchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) }
  const gateway = resolveGateway(gatewayOverride)
  if (!gateway.success) return gateway
  const response = await gateway.data.requestRecovery(parsed.data.email)
  return response.error
    ? { success: false, error: authError(response.error) }
    : { success: true, data: null }
}

export async function loadSession(
  gatewayOverride?: AuthGateway,
): Promise<Result<AuthSession | null>> {
  const gateway = resolveGateway(gatewayOverride)
  if (!gateway.success) return gateway
  const response = await gateway.data.getSession()
  return response.error
    ? { success: false, error: authError(response.error) }
    : { success: true, data: response.data }
}

export async function signOut(
  gatewayOverride?: AuthGateway,
): Promise<Result<null>> {
  const gateway = resolveGateway(gatewayOverride)
  if (!gateway.success) return gateway
  const response = await gateway.data.signOut()
  return response.error
    ? { success: false, error: authError(response.error) }
    : { success: true, data: null }
}
