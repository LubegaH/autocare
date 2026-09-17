import { z } from 'zod'
import { getBrowserClient } from '../../shared/supabase/client.ts'
import { callRpc } from '../../shared/supabase/rpc.ts'
import type { Result, ResultError } from '../../shared/types/result.ts'
import { listMyGarages, type GarageRpc } from '../garages/garageService.ts'
import {
  deliverIdentityInvitation,
  type IdentityInvitationDelivery,
} from '../garages/staffInvitationService.ts'
import {
  issueCustomerClaimSchema,
  redeemCustomerClaimSchema,
  type IssueCustomerClaimInput,
} from './customerClaimSchemas.ts'

const claimableCustomerSchema = z.object({
  customer_id: z.uuid(),
  creation_key: z.uuid(),
  full_name: z.string(),
  phone_e164: z.string(),
  email: z.email().nullable(),
})

export type ClaimableCustomer = z.infer<typeof claimableCustomerSchema>

export async function searchClaimableCustomers(
  garageId: string,
  search: string,
): Promise<Result<ClaimableCustomer[]>> {
  const parsed = z
    .object({ garageId: z.uuid(), search: z.string().trim().min(2).max(100) })
    .safeParse({ garageId, search })
  if (!parsed.success)
    return { success: false, error: validationError(parsed.error) }
  if (!navigator.onLine)
    return {
      success: false,
      error: {
        code: 'offline',
        message: 'Reconnect to search customer records.',
      },
    }

  const garages = await listMyGarages()
  if (!garages.success)
    return garages.error.code === 'unauthenticated' ||
      garages.error.code === 'unauthorized'
      ? garages
      : {
          success: false,
          error: {
            code: garages.error.code,
            message:
              'Customer records could not be searched. Retry when connected.',
            cause: garages.error.cause,
          },
        }
  if (
    !garages.data.some(
      (garage) =>
        garage.garage_id === parsed.data.garageId &&
        (garage.role === 'owner' || garage.role === 'manager'),
    )
  )
    return {
      success: false,
      error: {
        code: 'unauthorized',
        message: 'You do not have permission to search these customers.',
      },
    }

  const client = getBrowserClient()
  if (!client.success) return client
  const digits = parsed.data.search.replace(/\D/g, '')
  const byPhone = /^[+()\d\s-]+$/.test(parsed.data.search) && digits.length >= 4
  const searchColumn = byPhone ? 'phone_e164' : 'full_name'
  const searchText = byPhone
    ? digits.startsWith('0')
      ? digits.slice(1)
      : digits
    : parsed.data.search
  const { data, error } = await client.data
    .from('garage_customers')
    .select('customer_id, creation_key, full_name, phone_e164, email')
    .eq('garage_id', parsed.data.garageId)
    .is('linked_profile_id', null)
    .is('archived_at', null)
    .ilike(searchColumn, `%${searchText}%`)
    .order('full_name')
    .limit(20)

  if (error)
    return {
      success: false,
      error: {
        code: 'database_unavailable',
        message:
          'Customer records could not be searched. Retry when connected.',
        cause: error,
      },
    }
  const output = z.array(claimableCustomerSchema).safeParse(data)
  return output.success
    ? { success: true, data: output.data }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message: 'Customer search returned an unexpected result.',
          cause: output.error,
        },
      }
}

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
