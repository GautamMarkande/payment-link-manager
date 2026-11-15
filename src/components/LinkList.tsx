import { formatCustomer, formatDate, formatDateTime, formatInr } from '../format.ts'
import { statusLabel } from '../status.ts'
import type { DisplayStatus, PaymentLink, StatusFilter } from '../types.ts'

type LinkListProps = {
  items: Array<{ link: PaymentLink; status: DisplayStatus }>
  filter: StatusFilter
  onMarkPaid: (id: string) => void
}

const EMPTY_COPY: Record<StatusFilter, { title: string; body: string }> = {
  all: {
    title: 'No payment links yet',
    body: 'Create a link to start collecting. It will show up in this list.',
  },
  active: {
    title: 'No active links',
    body: 'Active links are still payable and have not passed their expiry.',
  },
  paid: {
    title: 'No paid links',
    body: 'When a payment arrives, mark the link as paid and it will show up here.',
  },
  expired: {
    title: 'No expired links',
    body: 'Links move here on their own once the expiry date has passed.',
  },
}

export function LinkList({ items, filter, onMarkPaid }: LinkListProps) {
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
              {status === 'active' ? (
                <button
                  type="button"
                  className="secondary"
                  aria-label={`Mark ${link.description} as paid`}
                  onClick={() => onMarkPaid(link.id)}
                >
                  Mark as paid
                </button>
              ) : null}
            </article>
          </li>
        )
      })}
    </ul>
  )
}
