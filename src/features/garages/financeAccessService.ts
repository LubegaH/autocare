import { z } from 'zod'
import { callRpc } from '../../shared/supabase/rpc.ts'
import type { Result } from '../../shared/types/result.ts'
import type { GarageRpc } from './garageService.ts'

const candidateSchema = z.object({
  membership_id: z.uuid(),
  full_name: z.string(),
  role: z.literal('supervisor'),
  grant_id: z.uuid().nullable(),
  has_finance_admin: z.boolean(),
})

const changeSchema = z.object({
  garageId: z.uuid(),
  targetId: z.uuid(),
  reason: z.string().trim().min(2, 'Record a reason.').max(240),
})

export type FinanceCandidate = z.infer<typeof candidateSchema>

export async function listFinanceCandidates(
  garageId: string,
  rpc: GarageRpc = callRpc,
): Promise<Result<FinanceCandidate[]>> {
  if (!z.uuid().safeParse(garageId).success) {
    return {
      success: false,
      error: {
        code: 'validation_error',
        message: 'The garage link is invalid.',
      },
    }
  }
  const response = await rpc('list_finance_admin_candidates', {
    p_garage_id: garageId,
  })
  if (!response.success) return response
  const output = z.array(candidateSchema).safeParse(response.data)
  return output.success
    ? { success: true, data: output.data }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message: 'Finance access could not be displayed.',
          cause: output.error,
        },
      }
}

export async function grantFinanceAdmin(
  input: { garageId: string; membershipId: string; reason: string },
  rpc: GarageRpc = callRpc,
): Promise<Result<{ grantId: string }>> {
  const parsed = changeSchema.safeParse({
    garageId: input.garageId,
    targetId: input.membershipId,
    reason: input.reason,
  })
  if (!parsed.success)
    return {
      success: false,
      error: {
        code: 'validation_error',
        message: parsed.error.issues[0]?.message ?? 'Check the access change.',
      },
    }
  const response = await rpc('grant_finance_admin', {
    p_garage_id: parsed.data.garageId,
    p_membership_id: parsed.data.targetId,
    p_reason: parsed.data.reason,
  })
  if (!response.success) return response
  const output = z.uuid().safeParse(response.data)
  return output.success
    ? { success: true, data: { grantId: output.data } }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message: 'The access grant could not be confirmed.',
          cause: output.error,
        },
      }
}

export async function revokeFinanceAdmin(
  input: { garageId: string; grantId: string; reason: string },
  rpc: GarageRpc = callRpc,
): Promise<Result<null>> {
  const parsed = changeSchema.safeParse({
    garageId: input.garageId,
    targetId: input.grantId,
    reason: input.reason,
  })
  if (!parsed.success)
    return {
      success: false,
      error: {
        code: 'validation_error',
        message: parsed.error.issues[0]?.message ?? 'Check the access change.',
      },
    }
  const response = await rpc('revoke_finance_admin', {
    p_garage_id: parsed.data.garageId,
    p_grant_id: parsed.data.targetId,
    p_reason: parsed.data.reason,
  })
  return response.success ? { success: true, data: null } : response
}
