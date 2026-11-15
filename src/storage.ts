import { createSeedLinks } from './seed.ts'
import type { PaymentLink } from './types.ts'

export const STORAGE_KEY = 'payment-links.v1'

function isLink(value: unknown): value is PaymentLink {
  if (typeof value !== 'object' || value === null) return false
  const link = value as Partial<PaymentLink>
  return (
    typeof link.id === 'string' &&
    typeof link.amount === 'number' &&
    typeof link.amountPaid === 'number' &&
    typeof link.description === 'string' &&
    (typeof link.email === 'string' || link.email === null) &&
    (typeof link.phone === 'string' || link.phone === null) &&
    (typeof link.expiresAt === 'string' || link.expiresAt === null) &&
    typeof link.createdAt === 'string' &&
    typeof link.allowPartial === 'boolean' &&
    (typeof link.minimumFirstPayment === 'number' || link.minimumFirstPayment === null)
  )
}

export function loadLinks(now = new Date()): PaymentLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedLinks(now)
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return createSeedLinks(now)
    const links = parsed.filter(isLink)
    return links
  } catch {
    return createSeedLinks(now)
  }
}

export function saveLinks(links: PaymentLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
}
