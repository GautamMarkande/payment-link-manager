import { useId, useState, type FormEvent } from 'react'
import { amountDue } from '../money.ts'
import { formatCustomer, formatDate, formatDateTime, formatInr } from '../format.ts'
import { statusLabel } from '../status.ts'
import type { DisplayStatus, PaymentLink, StatusFilter } from '../types.ts'
import { validateRecordedPayment } from '../validation.ts'

type LinkListProps = {
  items: Array<{ link: PaymentLink; status: DisplayStatus }>
  filter: StatusFilter
  onRecordPayment: (id: string, amount: number) => void
}

const EMPTY_COPY: Record<StatusFilter, { title: string; body: string }> = {
  all: {
    title: 'No payment links yet',
    body: 'Create a link to start collecting. It will show up in this list.',
  },
  active: {
    title: 'No active links',
    body: 'Active links are still payable, have not been paid, and have not passed their expiry.',
  },
  partial: {
    title: 'No partially paid links',
    body: 'Links show up here after a payment that does not cover the full amount.',
  },
  paid: {
    title: 'No paid links',
    body: 'When the amount due reaches zero, the link shows up here.',
  },
  expired: {
    title: 'No expired links',
    body: 'Unpaid and partially paid links move here once the expiry date has passed.',
  },
}

function RecordPayment({
  link,
  onRecordPayment,
}: {
  link: PaymentLink
  onRecordPayment: (id: string, amount: number) => void
}) {
  const [raw, setRaw] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()
  const errorId = useId()
  const due = amountDue(link.amount, link.amountPaid)
  const hint =
    link.allowPartial && link.amountPaid === 0 && link.minimumFirstPayment !== null
      ? `Due ${formatInr(due)}. First payment at least ${formatInr(link.minimumFirstPayment)}.`
      : link.allowPartial
        ? `Due ${formatInr(due)}.`
        : `Due ${formatInr(due)}. This link must be paid in full.`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateRecordedPayment(raw, link)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onRecordPayment(link.id, result.value)
    setRaw('')
    setError(null)
  }

  return (
    <form className="pay-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={inputId}>Payment amount (₹)</label>
        <input
          id={inputId}
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={raw}
          onChange={(event) => {
            setRaw(event.target.value)
            setError(null)
          }}
        />
        <p className="hint">{hint}</p>
      </div>
      <button type="submit" className="secondary" aria-label={`Record payment for ${link.description}`}>
        Record payment
      </button>
      {error ? (
        <p id={errorId} className="field-error">
          {error}
        </p>
      ) : null}
    </form>
  )
}

export function LinkList({ items, filter, onRecordPayment }: LinkListProps) {
  if (items.length === 0) {
    const copy = EMPTY_COPY[filter]
    return (
      <div className="empty">
        <h3>{copy.title}</h3>
        <p>{copy.body}</p>
      </div>
    )
  }

  return (
    <ul className="link-list">
      {items.map(({ link, status }) => {
        const label = statusLabel(status)
        const due = amountDue(link.amount, link.amountPaid)
        return (
          <li key={link.id}>
            <article className="link-card" aria-labelledby={`link-${link.id}-title`}>
              <div className="link-top">
                <p className="link-amount">{formatInr(link.amount)}</p>
                <p className={`status status-${status}`}>{label}</p>
              </div>
              <h3 id={`link-${link.id}-title`}>{link.description}</h3>
              <dl>
                <div>
                  <dt>Customer</dt>
                  <dd>{formatCustomer(link.email, link.phone)}</dd>
                </div>
                <div>
                  <dt>Paid</dt>
                  <dd>{formatInr(link.amountPaid)}</dd>
                </div>
                <div>
                  <dt>Due</dt>
                  <dd>{formatInr(due)}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>
                    <time dateTime={link.createdAt}>{formatDateTime(link.createdAt)}</time>
                  </dd>
                </div>
                <div>
                  <dt>Expiry</dt>
                  <dd>
                    {link.expiresAt ? (
                      <time dateTime={link.expiresAt}>
                        {status === 'expired' ? 'Ended' : 'Ends'} {formatDate(link.expiresAt)}
                      </time>
                    ) : (
                      'No expiry'
                    )}
                  </dd>
                </div>
              </dl>
              {status === 'active' || status === 'partial' ? (
                <RecordPayment link={link} onRecordPayment={onRecordPayment} />
              ) : null}
            </article>
          </li>
        )
      })}
    </ul>
  )
}
