import { describe, expect, it, vi } from 'vitest'
import type { IdentityInvitationDelivery } from './staffInvitationService.ts'
import { acceptStaffInvitation, inviteStaff } from './staffInvitationService.ts'

const invitationId = '40000000-0000-4000-8000-000000000001'
const garageId = '41000000-0000-4000-8000-000000000001'
const token = 'a'.repeat(64)

describe('staff invitation service', () => {
  it('normalizes the profile boundary before delivery', async () => {
    const delivery = vi.fn<IdentityInvitationDelivery>().mockResolvedValue({
      success: true,
      data: { invitationId },
    })
    const result = await inviteStaff(
      {
        garageId,
        fullName: ' Mechanic One ',
        phone: '0700123456',
        email: 'MECHANIC@example.test',
        role: 'mechanic',
      },
      delivery,
    )
    expect(result).toEqual({ success: true, data: { invitationId } })
    expect(delivery).toHaveBeenCalledWith({
      kind: 'staff',
      garageId,
      fullName: 'Mechanic One',
      phoneE164: '+256700123456',
      email: 'mechanic@example.test',
      role: 'mechanic',
    })
  })

  it('rejects an invalid role before delivery', async () => {
    const delivery = vi.fn<IdentityInvitationDelivery>()
    const result = await inviteStaff(
      {
        garageId,
        fullName: 'Finance Person',
        phone: '0700123456',
        email: 'finance@example.test',
        role: 'finance_admin',
      },
      delivery,
    )
    expect(result.success).toBe(false)
    expect(delivery).not.toHaveBeenCalled()
  })

  it('accepts only a well-formed token and validates the result', async () => {
    const rpc = vi.fn().mockResolvedValue({
      success: true,
      data: { garage_id: garageId, role: 'mechanic' },
    })
    const result = await acceptStaffInvitation(token, rpc)
    expect(result).toEqual({
      success: true,
      data: { garageId, role: 'mechanic' },
    })
    expect(rpc).toHaveBeenCalledWith('accept_staff_invitation', {
      p_token: token,
    })
  })

  it('does not send a malformed token to the database', async () => {
    const rpc = vi.fn()
    const result = await acceptStaffInvitation('raw-short-token', rpc)
    expect(result.success).toBe(false)
    expect(rpc).not.toHaveBeenCalled()
  })
})
