export function toCents(value: number): number {
  return Math.round(value * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}

export function amountDue(amount: number, amountPaid: number): number {
  return fromCents(toCents(amount) - toCents(amountPaid))
}
