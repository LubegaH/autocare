import { describe, expect, it } from 'vitest'
import { normalizePhone, signUpSchema } from './authSchemas.ts'

describe('authentication input', () => {
  it.each([
    ['0700123456', '+256700123456'],
    ['256700123456', '+256700123456'],
    ['+256 700 123456', '+256700123456'],
  ])('normalizes %s to E.164', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it('rejects missing profile data and a short password', () => {
    const result = signUpSchema.safeParse({
      fullName: '',
      phone: '123',
      email: 'not-an-email',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('normalizes a valid signup boundary', () => {
    const result = signUpSchema.parse({
      fullName: '  Kato Samuel  ',
      phone: '0700 123 456',
      email: 'KATO@example.test',
      password: 'correct horse battery staple',
    })
    expect(result).toEqual({
      fullName: 'Kato Samuel',
      phone: '+256700123456',
      email: 'kato@example.test',
      password: 'correct horse battery staple',
    })
  })
})
