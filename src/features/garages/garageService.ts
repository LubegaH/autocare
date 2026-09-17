import type { Result, ResultError } from '../../shared/types/result.ts'
import { callRpc } from '../../shared/supabase/rpc.ts'
import {
  createGarageSchema,
  garageSummarySchema,
  type CreateGarageInput,
  type GarageSummary,
} from './garageSchemas.ts'
import { z } from 'zod'

export type GarageRpc = (
  name: string,
  args?: Record<string, unknown>,
) => Promise<Result<unknown>>

function validationError(message: string, field: string): ResultError {
  return {
    code: 'validation_error',
    message: 'Check the highlighted fields and try again.',
    fieldErrors: { [field]: [message] },
  }
}

export async function createGarage(
  input: CreateGarageInput,
  rpc: GarageRpc = callRpc,
): Promise<Result<{ garageId: string }>> {
  const parsed = createGarageSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return {
      success: false,
      error: validationError(
        issue?.message ?? 'Check this value.',
        String(issue?.path[0] ?? 'form'),
      ),
    }
  }

  const response = await rpc('create_garage', {
    p_name: parsed.data.name,
    p_phone_e164: parsed.data.phone,
    p_creation_key: parsed.data.creationKey,
    p_timezone: 'Africa/Kampala',
  })
  if (!response.success) return response

  const output = z.uuid().safeParse(response.data)
  return output.success
    ? { success: true, data: { garageId: output.data } }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message:
            'The garage was saved, but AutoCare could not open it. Refresh to continue.',
          cause: output.error,
        },
      }
}

export async function listMyGarages(
  rpc: GarageRpc = callRpc,
): Promise<Result<GarageSummary[]>> {
  const response = await rpc('list_my_garages')
  if (!response.success) return response
  const output = z.array(garageSummarySchema).safeParse(response.data)
  return output.success
    ? { success: true, data: output.data }
    : {
        success: false,
        error: {
          code: 'invalid_response',
          message: 'Your garages could not be displayed. Refresh to try again.',
          cause: output.error,
        },
      }
}
