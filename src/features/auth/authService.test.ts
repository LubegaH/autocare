import { describe, expect, it, vi } from 'vitest'
import type { AuthGateway } from './authGateway.ts'
import { requestRecovery, signIn, signUp } from './authService.ts'

function gateway(overrides: Partial<AuthGateway> = {}): AuthGateway {
  return {
    signUp: async () => ({
      data: { userId: 'user-1', hasSession: false },
      error: null,
    }),
    signIn: async () => ({
      data: {
        userId: 'user-1',
        email: 'kato@example.test',
        invitedAt: null,
      },
      error: null,
    }),
    requestRecovery: async () => ({ data: null, error: null }),
    getSession: async () => ({ data: null, error: null }),
    signOut: async () => ({ data: null, error: null }),
    updatePassword: async () => ({ data: null, error: null }),
    ...overrides,
  }
}

const validSignup = {
  fullName: 'Kato Samuel',
  phone: '0700123456',
  email: 'KATO@example.test',
  password: 'correct horse battery staple',
}

describe('auth service', () => {
  it('passes only normalized signup data to the gateway', async () => {
    const signUpGateway = vi.fn<AuthGateway['signUp']>().mockResolvedValue({
      data: { userId: 'user-1', hasSession: false },
      error: null,
    })
    const result = await signUp(validSignup, gateway({ signUp: signUpGateway }))
    expect(result).toEqual({
      success: true,
      data: { confirmationRequired: true },
    })
    expect(signUpGateway).toHaveBeenCalledWith({
      fullName: 'Kato Samuel',
      phoneE164: '+256700123456',
      email: 'kato@example.test',
      password: 'correct horse battery staple',
    })
  })

  it('does not call the gateway when signup validation fails', async () => {
    const signUpGateway = vi.fn<AuthGateway['signUp']>()
    const result = await signUp(
      { ...validSignup, phone: 'invalid' },
      gateway({ signUp: signUpGateway }),
    )
    expect(result.success).toBe(false)
    expect(signUpGateway).not.toHaveBeenCalled()
  })

  it('maps invalid credentials to a recoverable message', async () => {
    const result = await signIn(
      { email: 'kato@example.test', password: 'wrong-password' },
      gateway({
        signIn: async () => ({
          data: null,
          error: {
            message: 'internal provider detail',
            code: 'invalid_credentials',
          },
        }),
      }),
    )
    expect(result).toEqual({
      success: false,
      error: {
        code: 'unauthenticated',
        message: 'The email or password is incorrect.',
      },
    })
  })

  it('uses the same response for recovery regardless of account existence', async () => {
    const result = await requestRecovery(
      { email: 'unknown@example.test' },
      gateway(),
    )
    expect(result).toEqual({ success: true, data: null })
  })
})
