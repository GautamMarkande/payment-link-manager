import type { PaymentLink } from './types.ts'

function atDay(now: Date, dayOffset: number, endOfDay: boolean): string {
  const date = new Date(now)
  date.setDate(date.getDate() + dayOffset)
  if (endOfDay) date.setHours(23, 59, 59, 999)
  else date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

export function createSeedLinks(now = new Date()): PaymentLink[] {
  return [
    {
      id: 'seed-active',
      amount: 2500,
      amountPaid: 0,
      description: 'Monsoon workshop deposit',
      email: 'aisha@example.com',
      phone: null,
      expiresAt: atDay(now, 14, true),
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      allowPartial: false,
      minimumFirstPayment: null,
    },
    {
      id: 'seed-partial',
      amount: 4000,
      amountPaid: 1000,
      description: 'Studio rental',
      email: 'rental@example.com',
      phone: null,
      expiresAt: atDay(now, 21, true),
      createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
      allowPartial: true,
      minimumFirstPayment: 800,
    },
    {
      id: 'seed-expired',
      amount: 500,
      amountPaid: 200,
      description: 'Friday table hold',
      email: null,
      phone: '+91 98765 43210',
      expiresAt: atDay(now, -1, true),
      createdAt: atDay(now, -4, false),
      allowPartial: true,
      minimumFirstPayment: 200,
    },
  ]
}
