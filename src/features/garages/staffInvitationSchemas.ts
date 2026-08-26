import { z } from 'zod'
import { normalizePhone } from '../auth/authSchemas.ts'

export const inviteStaffSchema = z
  .object({
    garageId: z.uuid(),
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter the staff member’s full name.')
      .max(100),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine(
        (value) => /^\+[1-9][0-9]{7,14}$/.test(value),
        'Enter a valid phone number.',
      ),
    email: z
      .email('Enter a valid email address.')
      .transform((value) => value.trim().toLowerCase()),
    role: z.enum(['manager', 'supervisor', 'mechanic']),
  })
  .strict()

export const acceptStaffInvitationSchema = z.object({
  token: z.string().regex(/^[0-9a-f]{64}$/, 'This invitation link is invalid.'),
})

export type InviteStaffInput = {
  garageId: string
  fullName: string
  phone: string
  email: string
  role: string
}
