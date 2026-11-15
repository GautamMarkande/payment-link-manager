import { describe, expect, it } from 'vitest'
import { matchesFilter, resolveStatus } from './status.ts'

const now = new Date('2026-11-15T10:30:00.000Z')

describe('resolveStatus', () => {
  it('keeps a payable link active until its expiry, then shows expired', () => {
    expect(
      resolveStatus({ recordedStatus: 'active', expiresAt: null }, now),
    ).toBe('active')
    expect(
      resolveStatus(
        { recordedStatus: 'active', expiresAt: '2026-11-20T18:29:59.999Z' },
        now,
      ),
    ).toBe('active')
    expect(
      resolveStatus(
        { recordedStatus: 'active', expiresAt: '2026-11-14T18:29:59.999Z' },
        now,
      ),
    ).toBe('expired')
    expect(
      resolveStatus({ recordedStatus: 'active', expiresAt: now.toISOString() }, now),
    ).toBe('expired')
  })

  it('keeps a paid link paid after the expiry moment', () => {
    expect(
      resolveStatus(
        { recordedStatus: 'paid', expiresAt: '2026-11-01T00:00:00.000Z' },
        now,
      ),
    ).toBe('paid')
  })
})

describe('matchesFilter', () => {
  it('shows every status for All and only the selected status otherwise', () => {
    expect(matchesFilter('expired', 'all')).toBe(true)
    expect(matchesFilter('active', 'paid')).toBe(false)
    expect(matchesFilter('paid', 'paid')).toBe(true)
  })
})
