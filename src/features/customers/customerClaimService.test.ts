import { describe, expect, it, vi } from 'vitest'
import type { IdentityInvitationDelivery } from '../garages/staffInvitationService.ts'
import {
  issueCustomerClaim,
  redeemCustomerClaim,
} from './customerClaimService.ts'

const garageId = '50000000-0000-4000-8000-000000000001'
const claimId = '51000000-0000-4000-8000-000000000001'
const customerId = '52000000-0000-4000-8000-000000000001'

describe('customer claim service', () => {
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
