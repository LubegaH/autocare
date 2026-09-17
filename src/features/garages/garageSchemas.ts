import { z } from 'zod'
import { normalizePhone } from '../auth/authSchemas.ts'

export const createGarageSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter the garage name.').max(120),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine((value) => /^\+[1-9][0-9]{7,14}$/.test(value), {
        message: 'Enter a valid garage phone number.',
      }),
    creationKey: z.uuid(),
  })
  .strict()

export const garageSummarySchema = z.object({
  garage_id: z.uuid(),
  name: z.string(),
  role: z.enum(['owner', 'manager', 'supervisor', 'mechanic']),
})

export type CreateGarageInput = z.input<typeof createGarageSchema>
export type GarageSummary = z.infer<typeof garageSummarySchema>
