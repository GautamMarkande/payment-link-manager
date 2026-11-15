export type RecordedStatus = 'active' | 'paid'

export type DisplayStatus = 'active' | 'paid' | 'expired'

export type StatusFilter = 'all' | DisplayStatus

export type PaymentLink = {
  id: string
  amount: number
  description: string
  email: string | null
  phone: string | null
  expiresAt: string | null
  createdAt: string
  recordedStatus: RecordedStatus
}
