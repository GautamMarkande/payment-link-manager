import { describe, expect, it } from 'vitest'
import { matchesFilter, resolveStatus } from './status.ts'

const now = new Date('2026-11-15T10:30:00.000Z')

function link(amountPaid: number, expiresAt: string | null, amount = 1000) {
  return { amount, amountPaid, expiresAt }
}

describe('resolveStatus', () => {
  it('shows active when nothing is paid and partial once some money has arrived', () => {
    expect(resolveStatus(link(0, null), now)).toBe('active')
    expect(resolveStatus(link(0, '2026-11-20T18:29:59.999Z'), now)).toBe('active')
    expect(resolveStatus(link(250, '2026-11-20T18:29:59.999Z'), now)).toBe('partial')
  })

  it('lets expiry win over active and partially paid, while a fully paid link never expires', () => {
    expect(resolveStatus(link(0, '2026-11-14T18:29:59.999Z'), now)).toBe('expired')
    expect(resolveStatus(link(0, now.toISOString()), now)).toBe('expired')
    expect(resolveStatus(link(400, '2026-11-01T00:00:00.000Z'), now)).toBe('expired')
    expect(resolveStatus(link(1000, '2026-11-01T00:00:00.000Z'), now)).toBe('paid')
  })
})

describe('matchesFilter', () => {
  it('shows every status for All and only the selected status otherwise', () => {
    expect(matchesFilter('partial', 'all')).toBe(true)
    expect(matchesFilter('active', 'partial')).toBe(false)
    expect(matchesFilter('partial', 'partial')).toBe(true)
    expect(matchesFilter('paid', 'paid')).toBe(true)
  })
})
