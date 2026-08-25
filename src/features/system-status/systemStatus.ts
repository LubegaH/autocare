import { z } from 'zod'

export const systemStatusSchema = z.object({
  service: z.string().min(1),
  status: z.literal('ready'),
  message: z.string().min(1),
  updated_at: z.iso.datetime({ offset: true }),
})

export type SystemStatus = z.infer<typeof systemStatusSchema>

const kampalaDateTime = new Intl.DateTimeFormat('en-UG', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Kampala',
})

export function formatStatusUpdatedAt(value: string) {
  return kampalaDateTime.format(new Date(value))
}
