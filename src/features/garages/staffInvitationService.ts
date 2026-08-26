import { z } from 'zod'
import { getBrowserClient } from '../../shared/supabase/client.ts'
import { callRpc } from '../../shared/supabase/rpc.ts'
import type { Result, ResultError } from '../../shared/types/result.ts'
import { updatePassword } from '../auth/authService.ts'
import {
  acceptStaffInvitationSchema,
  inviteStaffSchema,
  type InviteStaffInput,
} from './staffInvitationSchemas.ts'
import type { GarageRpc } from './garageService.ts'

export type InvitationDelivery = (
  body: Record<string, unknown>,
) => Promise<Result<unknown>>

function firstValidationError(error: z.ZodError): ResultError {
  const issue = error.issues[0]
  const field = String(issue?.path[0] ?? 'form')
  return {
    code: 'validation_error',
    message: 'Check the highlighted fields and try again.',
    fieldErrors: { [field]: [issue?.message ?? 'Check this value.'] },
  }
}

async function deliverInvitation(
  body: Record<string, unknown>,
): Promise<Result<unknown>> {
  const client = getBrowserClient()
  if (!client.success) return client
  const { data, error } = await client.data.functions.invoke(
    'staff-invitations',
    { body },
  )
  return error
    ? {
        success: false,
        error: {
          code: 'unexpected_error',
          message:
            'The invitation email could not be sent. No active invitation was kept.',
          cause: error,
        },
      }
    : { success: true, data }
}

export async function inviteStaff(
  input: InviteStaffInput,
  delivery: InvitationDelivery = deliverInvitation,
): Promise<Result<{ invitationId: string }>> {
  const parsed = inviteStaffSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: firstValidationError(parsed.error) }
  const response = await delivery({
    garageId: parsed.data.garageId,
    fullName: parsed.data.fullName,
    phoneE164: parsed.data.phone,
    email: parsed.data.email,
    role: parsed.data.role,
  })
  if (!response.success) return response
  const output = z.object({ invitationId: z.uuid() }).safeParse(response.data)
  return output.success
    ? { success: true, data: output.data }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message:
            'The invitation was processed, but its status could not be confirmed.',
          cause: output.error,
        },
      }
}

export async function acceptStaffInvitation(
  token: string,
  rpc: GarageRpc = callRpc,
): Promise<Result<{ garageId: string; role: string }>> {
  const parsed = acceptStaffInvitationSchema.safeParse({ token })
  if (!parsed.success)
    return { success: false, error: firstValidationError(parsed.error) }
  const response = await rpc('accept_staff_invitation', {
    p_token: parsed.data.token,
  })
  if (!response.success) return response
  const output = z
    .object({ garage_id: z.uuid(), role: z.string() })
    .safeParse(response.data)
  return output.success
    ? {
        success: true,
        data: { garageId: output.data.garage_id, role: output.data.role },
      }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message: 'The invitation result could not be confirmed.',
          cause: output.error,
        },
      }
}

export async function setInvitedUserPassword(
  password: string,
): Promise<Result<null>> {
  return updatePassword(password)
}
