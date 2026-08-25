import { describe, expect, it } from 'vitest'
import { formatStatusUpdatedAt } from './systemStatus.ts'

describe('formatStatusUpdatedAt', () => {
  it('renders timestamps in the pilot garage timezone', () => {
    expect(formatStatusUpdatedAt('2026-08-17T08:00:00+00:00')).toContain(
      '11:00',
    )
  })
})
