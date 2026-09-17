import { describe, expect, it, vi } from 'vitest'
import { getBrowserClient } from '../../shared/supabase/client.ts'
import type { IdentityInvitationDelivery } from '../garages/staffInvitationService.ts'
import {
  issueCustomerClaim,
  redeemCustomerClaim,
  searchClaimableCustomers,
} from './customerClaimService.ts'

vi.mock('../../shared/supabase/client.ts', () => ({
  getBrowserClient: vi.fn(),
}))

const garageId = '50000000-0000-4000-8000-000000000001'
const claimId = '51000000-0000-4000-8000-000000000001'
const customerId = '52000000-0000-4000-8000-000000000001'

describe('customer claim service', () => {
  it('searches only unlinked, unarchived customers in the selected garage', async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            customer_id: customerId,
            creation_key: '53000000-0000-4000-8000-000000000001',
            full_name: 'Kato Samuel',
            phone_e164: '+256700123456',
            email: null,
          },
        ],
        error: null,
      }),
    }
    vi.mocked(getBrowserClient).mockReturnValue({
      success: true,
      data: {
        rpc: vi.fn().mockResolvedValue({
          data: [{ garage_id: garageId, name: 'Garage A', role: 'owner' }],
          error: null,
        }),
        from: vi.fn().mockReturnValue(query),
      },
    } as never)

    const result = await searchClaimableCustomers(garageId, 'Kato')

    expect(result.success && result.data[0]?.customer_id).toBe(customerId)
    expect(query.eq).toHaveBeenCalledWith('garage_id', garageId)
    expect(query.is).toHaveBeenCalledWith('linked_profile_id', null)
    expect(query.is).toHaveBeenCalledWith('archived_at', null)
    expect(query.ilike).toHaveBeenCalledWith('full_name', '%Kato%')
    expect(query.limit).toHaveBeenCalledWith(20)
  })

  it('can find a customer by a local phone number', async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    vi.mocked(getBrowserClient).mockReturnValue({
      success: true,
      data: {
        rpc: vi.fn().mockResolvedValue({
          data: [{ garage_id: garageId, name: 'Garage A', role: 'manager' }],
          error: null,
        }),
        from: vi.fn().mockReturnValue(query),
      },
    } as never)

    const result = await searchClaimableCustomers(garageId, '0700123456')

    expect(result).toEqual({ success: true, data: [] })
    expect(query.ilike).toHaveBeenCalledWith('phone_e164', '%700123456%')
  })

  it('rejects customer searches by staff without claim authority', async () => {
    const from = vi.fn()
    vi.mocked(getBrowserClient).mockReturnValue({
      success: true,
      data: {
        rpc: vi.fn().mockResolvedValue({
          data: [{ garage_id: garageId, name: 'Garage A', role: 'mechanic' }],
          error: null,
        }),
        from,
      },
    } as never)

    const result = await searchClaimableCustomers(garageId, 'Kato')

    expect(result).toEqual({
      success: false,
      error: {
        code: 'unauthorized',
        message: 'You do not have permission to search these customers.',
      },
    })
    expect(from).not.toHaveBeenCalled()
  })

  it('sends normalized customer data with an idempotency key', async () => {
    const delivery = vi.fn<IdentityInvitationDelivery>().mockResolvedValue({
      success: true,
      data: { claimId, customerId },
    })
    const result = await issueCustomerClaim(
      {
        garageId,
        fullName: ' Kato Samuel ',
        phone: '0700123456',
        email: 'KATO@example.test',
        creationKey: '53000000-0000-4000-8000-000000000001',
      },
      delivery,
    )
    expect(result).toEqual({ success: true, data: { claimId, customerId } })
    expect(delivery).toHaveBeenCalledWith({
      kind: 'customer',
      garageId,
      fullName: 'Kato Samuel',
      phoneE164: '+256700123456',
      email: 'kato@example.test',
      creationKey: '53000000-0000-4000-8000-000000000001',
    })
  })

  it('rejects invalid customer data before delivery', async () => {
    const delivery = vi.fn<IdentityInvitationDelivery>()
    const result = await issueCustomerClaim(
      {
        garageId,
        fullName: '',
        phone: 'bad',
        email: 'bad',
        creationKey: 'bad',
      },
      delivery,
    )
    expect(result.success).toBe(false)
    expect(delivery).not.toHaveBeenCalled()
  })

  it('redeems a valid token through the claim command', async () => {
    const token = 'b'.repeat(64)
    const rpc = vi.fn().mockResolvedValue({
      success: true,
      data: { garage_id: garageId, customer_id: customerId },
    })
    const result = await redeemCustomerClaim(token, rpc)
    expect(result).toEqual({ success: true, data: { garageId, customerId } })
    expect(rpc).toHaveBeenCalledWith('redeem_customer_claim', {
      p_token: token,
    })
  })
})
