import { describe, expect, it } from 'vitest'
import {
  validateAmount,
  validateCustomer,
  validateDescription,
  validateExpiry,
  validateMinimumFirstPayment,
  validatePaymentLink,
  validateRecordedPayment,
} from './validation.ts'

const now = new Date(2026, 10, 15, 16, 0, 0)

describe('validateAmount', () => {
  it('accepts a positive amount up to ₹5,00,000 with at most 2 decimals', () => {
    expect(validateAmount('1500.5')).toEqual({ ok: true, value: 1500.5 })
    expect(validateAmount('5,00,000')).toEqual({ ok: true, value: 500000 })
    expect(validateAmount('0.01')).toEqual({ ok: true, value: 0.01 })
  })

  it('rejects empty, zero, too many decimals, and amounts over the cap', () => {
    expect(validateAmount(' ')).toMatchObject({ ok: false, error: 'Enter an amount.' })
    expect(validateAmount('0')).toMatchObject({ ok: false, error: 'Amount must be greater than 0.' })
    expect(validateAmount('-20')).toMatchObject({ ok: false, error: 'Amount must be greater than 0.' })
    expect(validateAmount('10.999')).toMatchObject({ ok: false, error: 'Use at most 2 decimal places.' })
    expect(validateAmount('500000.01')).toMatchObject({
      ok: false,
      error: 'Amount cannot exceed ₹5,00,000.',
    })
    expect(validateAmount('12.5.1')).toMatchObject({ ok: false, error: 'Enter a valid amount.' })
  })
})

describe('validateDescription', () => {
  it('requires a description of at most 100 characters', () => {
    expect(validateDescription('  Workshop deposit  ')).toEqual({
      ok: true,
      value: 'Workshop deposit',
    })
    expect(validateDescription('   ')).toMatchObject({ ok: false, error: 'Enter a description.' })
    expect(validateDescription('a'.repeat(101))).toMatchObject({
      ok: false,
      error: 'Description must be 100 characters or fewer.',
    })
  })
})

describe('validateCustomer', () => {
  it('requires a valid email or a valid phone, and checks whichever is provided', () => {
    expect(validateCustomer('', '')).toMatchObject({
      ok: false,
      customer: 'Enter an email or a phone number.',
    })
    expect(validateCustomer('not-an-email', '')).toMatchObject({
      ok: false,
      email: 'Enter a valid email address.',
    })
    expect(validateCustomer('', '12345')).toMatchObject({
      ok: false,
      phone: 'Enter a valid 10-digit mobile number.',
    })
    expect(validateCustomer('buyer@example.com', '')).toEqual({
      ok: true,
      email: 'buyer@example.com',
      phone: null,
    })
    expect(validateCustomer('', '+91 98765 43210')).toEqual({
      ok: true,
      email: null,
      phone: '+91 98765 43210',
    })
  })
})

describe('validateExpiry', () => {
  it('allows a blank expiry and rejects a date that is not in the future', () => {
    expect(validateExpiry('', now)).toEqual({ ok: true, value: null })
    expect(validateExpiry('2026-11-14', now)).toMatchObject({
      ok: false,
      error: 'Expiry must be in the future.',
    })
    expect(validateExpiry('2026-02-31', now)).toMatchObject({
      ok: false,
      error: 'Enter a valid expiry date.',
    })
    const tomorrow = validateExpiry('2026-11-16', now)
    expect(tomorrow.ok).toBe(true)
  })
})

describe('validateMinimumFirstPayment', () => {
  it('requires a minimum above 0 and within the link amount only when partial payments are allowed', () => {
    expect(validateMinimumFirstPayment('50', 100, false)).toEqual({ ok: true, value: null })
    expect(validateMinimumFirstPayment('', 100, true)).toMatchObject({
      ok: false,
      error: 'Enter a minimum first payment.',
    })
    expect(validateMinimumFirstPayment('0', 100, true)).toMatchObject({
      ok: false,
      error: 'Minimum first payment must be greater than 0.',
    })
    expect(validateMinimumFirstPayment('100.01', 100, true)).toMatchObject({
      ok: false,
      error: 'Minimum first payment cannot exceed the link amount.',
    })
    expect(validateMinimumFirstPayment('100', 100, true)).toEqual({ ok: true, value: 100 })
  })
})

describe('validateRecordedPayment', () => {
  const partialLink = {
    amount: 1000,
    amountPaid: 0,
    allowPartial: true,
    minimumFirstPayment: 300,
  }

  it('accepts a payment above 0 and within the amount due, including the first-payment minimum', () => {
    expect(validateRecordedPayment('300', partialLink)).toEqual({ ok: true, value: 300 })
    expect(validateRecordedPayment('299.99', partialLink)).toMatchObject({
      ok: false,
      error: 'The first payment must be at least the minimum first payment.',
    })
    expect(validateRecordedPayment('1000.01', partialLink)).toMatchObject({
      ok: false,
      error: 'Payment cannot exceed the amount due.',
    })
    expect(validateRecordedPayment('0', partialLink)).toMatchObject({
      ok: false,
      error: 'Payment must be greater than 0.',
    })
    expect(
      validateRecordedPayment('100', {
        amount: 1000,
        amountPaid: 0,
        allowPartial: false,
        minimumFirstPayment: null,
      }),
    ).toMatchObject({ ok: false, error: 'This link must be paid in full.' })
  })
})

describe('validatePaymentLink', () => {
  it('returns every field error together, and a normalized link when the form is valid', () => {
    expect(
      validatePaymentLink(
        {
          amount: '',
          description: '',
          email: '',
          phone: '',
          expiry: '2020-01-01',
          allowPartial: true,
          minimum: '',
        },
        now,
      ).ok,
    ).toBe(false)

    const created = validatePaymentLink(
      {
        amount: '99.5',
        description: 'Ceramic bowl',
        email: '',
        phone: '09876543210',
        expiry: '',
        allowPartial: true,
        minimum: '40',
      },
      now,
    )
    expect(created).toEqual({
      ok: true,
      value: {
        amount: 99.5,
        description: 'Ceramic bowl',
        email: null,
        phone: '+91 98765 43210',
        expiresAt: null,
        allowPartial: true,
        minimumFirstPayment: 40,
      },
    })
  })
})
