import { toCents } from './money.ts'
import type { DisplayStatus, PaymentLink, StatusFilter } from './types.ts'

export function resolveStatus(
  link: Pick<PaymentLink, 'amount' | 'amountPaid' | 'expiresAt'>,
  now: Date,
): DisplayStatus {
  if (toCents(link.amountPaid) >= toCents(link.amount) && toCents(link.amount) > 0) {
    return 'paid'
  }
  if (link.expiresAt !== null && new Date(link.expiresAt).getTime() <= now.getTime()) {
    return 'expired'
  }
  if (toCents(link.amountPaid) > 0) return 'partial'
  return 'active'
}

export function matchesFilter(status: DisplayStatus, filter: StatusFilter): boolean {
  return filter === 'all' || status === filter
}

export function statusLabel(status: DisplayStatus): string {
  if (status === 'active') return 'Active'
  if (status === 'partial') return 'Partially paid'
  if (status === 'paid') return 'Paid'
  return 'Expired'
}
