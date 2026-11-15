export const MAX_AMOUNT = 500_000
export const MAX_DESCRIPTION_LENGTH = 100

export type LinkFormValues = {
  amount: string
  description: string
  email: string
  phone: string
  expiry: string
}

export type LinkFormErrors = {
  amount?: string
  description?: string
  email?: string
  phone?: string
  customer?: string
  expiry?: string
}

export type ValidLinkInput = {
  amount: number
  description: string
  email: string | null
  phone: string | null
  expiresAt: string | null
}

export type FieldResult<T> = { ok: true; value: T } | { ok: false; error: string }

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

export function validateAmount(raw: string): FieldResult<number> {
  const trimmed = raw.trim().replace(/,/g, '')
  if (trimmed === '') {
    return { ok: false, error: 'Enter an amount.' }
  }
  if (trimmed.startsWith('-')) {
    return { ok: false, error: 'Amount must be greater than 0.' }
  }
  if (/^\d+\.\d{3,}$/.test(trimmed)) {
    return { ok: false, error: 'Use at most 2 decimal places.' }
  }
  if (!AMOUNT_PATTERN.test(trimmed)) {
    return { ok: false, error: 'Enter a valid amount.' }
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, error: 'Amount must be greater than 0.' }
  }
  if (value > MAX_AMOUNT) {
    return { ok: false, error: 'Amount cannot exceed ₹5,00,000.' }
  }
  return { ok: true, value }
}

export function validateDescription(raw: string): FieldResult<string> {
  const value = raw.trim()
  if (value === '') {
    return { ok: false, error: 'Enter a description.' }
  }
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return { ok: false, error: 'Description must be 100 characters or fewer.' }
  }
  return { ok: true, value }
}

export function isValidEmail(raw: string): boolean {
  const value = raw.trim()
  if (value.length > 254 || value.includes('..')) return false
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
}

export function isValidPhone(raw: string): boolean {
  const compact = raw.trim().replace(/[\s()-]/g, '')
  return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(compact)
}

export function normalizePhone(raw: string): string {
  const compact = raw.trim().replace(/[\s()-]/g, '')
  let national = compact.startsWith('+') ? compact.slice(1) : compact
  if (national.startsWith('91') && national.length === 12) national = national.slice(2)
  if (national.startsWith('0') && national.length === 11) national = national.slice(1)
  return `+91 ${national.slice(0, 5)} ${national.slice(5)}`
}

type CustomerResult =
  | { ok: true; email: string | null; phone: string | null }
  | { ok: false; email?: string; phone?: string; customer?: string }

export function validateCustomer(emailRaw: string, phoneRaw: string): CustomerResult {
  const email = emailRaw.trim()
  const phone = phoneRaw.trim()
  if (email === '' && phone === '') {
    return { ok: false, customer: 'Enter an email or a phone number.' }
  }
  const errors: { email?: string; phone?: string } = {}
  if (email !== '' && !isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (phone !== '' && !isValidPhone(phone)) {
    errors.phone = 'Enter a valid 10-digit mobile number.'
  }
  if (errors.email || errors.phone) {
    return { ok: false, ...errors }
  }
  return {
    ok: true,
    email: email === '' ? null : email,
    phone: phone === '' ? null : normalizePhone(phone),
  }
}

export function validateExpiry(raw: string, now: Date): FieldResult<string | null> {
  const value = raw.trim()
  if (value === '') return { ok: true, value: null }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return { ok: false, error: 'Enter a valid expiry date.' }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const expiry = new Date(year, month - 1, day, 23, 59, 59, 999)
  if (
    expiry.getFullYear() !== year ||
    expiry.getMonth() !== month - 1 ||
    expiry.getDate() !== day
  ) {
    return { ok: false, error: 'Enter a valid expiry date.' }
  }
  if (expiry.getTime() <= now.getTime()) {
    return { ok: false, error: 'Expiry must be in the future.' }
  }
  return { ok: true, value: expiry.toISOString() }
}

export function validatePaymentLink(
  values: LinkFormValues,
  now: Date,
): { ok: true; value: ValidLinkInput } | { ok: false; errors: LinkFormErrors } {
  const amount = validateAmount(values.amount)
  const description = validateDescription(values.description)
  const customer = validateCustomer(values.email, values.phone)
  const expiry = validateExpiry(values.expiry, now)
  const errors: LinkFormErrors = {}
  if (!amount.ok) errors.amount = amount.error
  if (!description.ok) errors.description = description.error
  if (!customer.ok) {
    errors.customer = customer.customer
    errors.email = customer.email
    errors.phone = customer.phone
  }
  if (!expiry.ok) errors.expiry = expiry.error
  if (!amount.ok || !description.ok || !customer.ok || !expiry.ok) {
    return { ok: false, errors }
  }
  return {
    ok: true,
    value: {
      amount: amount.value,
      description: description.value,
      email: customer.email,
      phone: customer.phone,
      expiresAt: expiry.value,
    },
  }
}
