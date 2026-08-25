import { z } from 'zod'

const fullName = z
  .string()
  .trim()
  .min(2, 'Enter your full name.')
  .max(100, 'Keep your name under 100 characters.')

const email = z
  .email('Enter a valid email address.')
  .transform((value) => value.trim().toLowerCase())

const password = z
  .string()
  .min(10, 'Use at least 10 characters for your password.')
  .max(72, 'Keep your password under 73 characters.')

export function normalizePhone(value: string): string {
  const compact = value.replace(/[\s()-]/g, '')

  if (/^0[0-9]{9}$/.test(compact)) {
    return `+256${compact.slice(1)}`
  }

  if (/^256[0-9]{9}$/.test(compact)) {
    return `+${compact}`
  }

  return compact
}

const phoneE164 = z
  .string()
  .transform(normalizePhone)
  .refine((value) => /^\+[1-9][0-9]{7,14}$/.test(value), {
    message: 'Enter a valid phone number, such as +256 700 123456.',
  })

export const signUpSchema = z
  .object({
    fullName,
    phone: phoneE164,
    email,
    password,
  })
  .strict()

export const signInSchema = z
  .object({ email, password: z.string().min(1, 'Enter your password.') })
  .strict()

export const recoverySchema = z.object({ email }).strict()

export type SignUpInput = z.input<typeof signUpSchema>
export type SignInInput = z.input<typeof signInSchema>
export type RecoveryInput = z.input<typeof recoverySchema>
