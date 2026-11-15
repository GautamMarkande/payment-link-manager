export type DisplayStatus = 'active' | 'partial' | 'paid' | 'expired'

export type StatusFilter = 'all' | DisplayStatus

export type PaymentLink = {
  id: string
  amount: number
  amountPaid: number
  description: string
  email: string | null
  phone: string | null
  expiresAt: string | null
  createdAt: string
  allowPartial: boolean
  minimumFirstPayment: number | null
}
