import { describe, expect, it, vi } from 'vitest'
import {
  grantFinanceAdmin,
  listFinanceCandidates,
  revokeFinanceAdmin,
} from './financeAccessService.ts'

const garageId = '60000000-0000-4000-8000-000000000001'
const membershipId = '61000000-0000-4000-8000-000000000001'
const grantId = '62000000-0000-4000-8000-000000000001'

describe('finance access service', () => {
  it('validates candidate output and exposes only the supported capability state', async () => {
    const result = await listFinanceCandidates(garageId, async () => ({
      success: true,
      data: [
        {
          membership_id: membershipId,
          full_name: 'Finance Supervisor',
          role: 'supervisor',
          grant_id: null,
          has_finance_admin: false,
        },
      ],
    }))
    expect(result.success && result.data[0]?.has_finance_admin).toBe(false)
  })

  it('requires a reason before granting access', async () => {
    const rpc = vi.fn()
    const result = await grantFinanceAdmin(
      { garageId, membershipId, reason: '' },
      rpc,
    )
    expect(result.success).toBe(false)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('grants finance access to an exact membership', async () => {
    const rpc = vi.fn().mockResolvedValue({ success: true, data: grantId })
    const result = await grantFinanceAdmin(
      { garageId, membershipId, reason: 'Handles daily cash' },
      rpc,
    )
    expect(result).toEqual({ success: true, data: { grantId } })
    expect(rpc).toHaveBeenCalledWith('grant_finance_admin', {
      p_garage_id: garageId,
      p_membership_id: membershipId,
      p_reason: 'Handles daily cash',
    })
  })

  it('revokes the exact grant with an audit reason', async () => {
    const rpc = vi.fn().mockResolvedValue({ success: true, data: null })
    const result = await revokeFinanceAdmin(
      { garageId, grantId, reason: 'Assignment ended' },
      rpc,
    )
    expect(result).toEqual({ success: true, data: null })
    expect(rpc).toHaveBeenCalledWith('revoke_finance_admin', {
      p_garage_id: garageId,
      p_grant_id: grantId,
      p_reason: 'Assignment ended',
    })
  })
})
