import { z } from 'zod'
import { callRpc } from '../../shared/supabase/rpc.ts'
import type { Result, ResultError } from '../../shared/types/result.ts'
import type { GarageRpc } from '../garages/garageService.ts'
import {
  deliverIdentityInvitation,
  type IdentityInvitationDelivery,
} from '../garages/staffInvitationService.ts'
import {
  issueCustomerClaimSchema,
  redeemCustomerClaimSchema,
  type IssueCustomerClaimInput,
} from './customerClaimSchemas.ts'

function validationError(error: z.ZodError): ResultError {
  const issue = error.issues[0]
  return {
    code: 'validation_error',
    message: 'Check the highlighted fields and try again.',
    fieldErrors: {
      [String(issue?.path[0] ?? 'form')]: [
        issue?.message ?? 'Check this value.',
      ],
    },
  }
}

export async function issueCustomerClaim(
  input: IssueCustomerClaimInput,
  delivery: IdentityInvitationDelivery = deliverIdentityInvitation,
): Promise<Result<{ claimId: string; customerId: string }>> {
  const parsed = issueCustomerClaimSchema.safeParse(input)
  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) }
  const response = await delivery({
    kind: 'customer',
    garageId: parsed.data.garageId,
    fullName: parsed.data.fullName,
    phoneE164: parsed.data.phone,
    email: parsed.data.email,
    creationKey: parsed.data.creationKey,
  })
  if (!response.success) return response
  const output = z
    .object({ claimId: z.uuid(), customerId: z.uuid() })
    .safeParse(response.data)
  return output.success
    ? { success: true, data: output.data }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message:
            'The claim was processed, but its status could not be confirmed.',
          cause: output.error,
        },
      }
}

export async function redeemCustomerClaim(
  token: string,
  rpc: GarageRpc = callRpc,
): Promise<Result<{ garageId: string; customerId: string }>> {
  const parsed = redeemCustomerClaimSchema.safeParse({ token })
  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) }
  const response = await rpc('redeem_customer_claim', {
    p_token: parsed.data.token,
  })
  if (!response.success) return response
  const output = z
    .object({ garage_id: z.uuid(), customer_id: z.uuid() })
    .safeParse(response.data)
  return output.success
    ? {
        success: true,
        data: {
          garageId: output.data.garage_id,
          customerId: output.data.customer_id,
        },
      }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message: 'The customer link could not be confirmed.',
          cause: output.error,
        },
      }
}
