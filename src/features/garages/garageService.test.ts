import { describe, expect, it, vi } from 'vitest'
import type { GarageRpc } from './garageService.ts'
import { createGarage, listMyGarages } from './garageService.ts'

describe('garage service', () => {
  it('creates a garage with normalized boundary data and an idempotency key', async () => {
    const rpc = vi.fn<GarageRpc>().mockResolvedValue({
      success: true,
      data: '30000000-0000-4000-8000-000000000001',
    })
    const result = await createGarage(
      {
        name: ' AutoCare Central ',
        phone: '0700123456',
        creationKey: '31000000-0000-4000-8000-000000000001',
      },
      rpc,
    )
    expect(result).toEqual({
      success: true,
      data: { garageId: '30000000-0000-4000-8000-000000000001' },
    })
    expect(rpc).toHaveBeenCalledWith('create_garage', {
      p_name: 'AutoCare Central',
      p_phone_e164: '+256700123456',
      p_creation_key: '31000000-0000-4000-8000-000000000001',
      p_timezone: 'Africa/Kampala',
    })
  })

  it('rejects invalid data before calling the database', async () => {
    const rpc = vi.fn<GarageRpc>()
    const result = await createGarage(
      { name: '', phone: 'bad', creationKey: 'bad' },
      rpc,
    )
    expect(result.success).toBe(false)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('validates the garage list returned by the database', async () => {
    const result = await listMyGarages(async () => ({
      success: true,
      data: [
        {
          garage_id: '30000000-0000-4000-8000-000000000001',
          name: 'AutoCare Central',
          role: 'owner',
        },
      ],
    }))
    expect(result.success && result.data[0]?.role).toBe('owner')
  })

  it('fails closed on an unknown membership role', async () => {
    const result = await listMyGarages(async () => ({
      success: true,
      data: [
        {
          garage_id: '30000000-0000-4000-8000-000000000001',
          name: 'AutoCare Central',
          role: 'finance_admin',
        },
      ],
    }))
    expect(result.success).toBe(false)
  })
})
