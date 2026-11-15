import type { DisplayStatus, PaymentLink, StatusFilter } from './types.ts'

export function resolveStatus(
  link: Pick<PaymentLink, 'recordedStatus' | 'expiresAt'>,
  now: Date,
): DisplayStatus {
  if (link.recordedStatus === 'paid') return 'paid'
  if (link.expiresAt !== null && new Date(link.expiresAt).getTime() <= now.getTime()) {
    return 'expired'
  }
  return 'active'
}

export function matchesFilter(status: DisplayStatus, filter: StatusFilter): boolean {
  return filter === 'all' || status === filter
}

export function statusLabel(status: DisplayStatus): string {
  if (status === 'active') return 'Active'
  if (status === 'paid') return 'Paid'
  return 'Expired'
}
