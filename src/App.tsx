import { useEffect, useState } from 'react'
import { CreateLinkForm } from './components/CreateLinkForm.tsx'
import { LinkList } from './components/LinkList.tsx'
import { StatusFilter } from './components/StatusFilter.tsx'
import { fromCents, toCents } from './money.ts'
import { matchesFilter, resolveStatus } from './status.ts'
import { loadLinks, saveLinks } from './storage.ts'
import type { PaymentLink, StatusFilter as StatusFilterValue } from './types.ts'
import type { ValidLinkInput } from './validation.ts'

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `link-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function App() {
  const [links, setLinks] = useState<PaymentLink[]>(() => loadLinks())
  const [filter, setFilter] = useState<StatusFilterValue>('all')
  const [actionError, setActionError] = useState<string | null>(null)
  const [now] = useState(() => new Date())

  useEffect(() => {
    saveLinks(links)
  }, [links])

  const withStatus = links.map((link) => ({
    link,
    status: resolveStatus(link, now),
  }))
  const counts: Record<StatusFilterValue, number> = {
    all: withStatus.length,
    active: withStatus.filter((item) => item.status === 'active').length,
    partial: withStatus.filter((item) => item.status === 'partial').length,
    paid: withStatus.filter((item) => item.status === 'paid').length,
    expired: withStatus.filter((item) => item.status === 'expired').length,
  }
  const visible = withStatus
    .filter((item) => matchesFilter(item.status, filter))
    .sort((a, b) => (a.link.createdAt < b.link.createdAt ? 1 : -1))

  function handleCreate(input: ValidLinkInput) {
    try {
      const link: PaymentLink = {
        id: createId(),
        amount: input.amount,
        amountPaid: 0,
        description: input.description,
        email: input.email,
        phone: input.phone,
        expiresAt: input.expiresAt,
        createdAt: new Date().toISOString(),
        allowPartial: input.allowPartial,
        minimumFirstPayment: input.minimumFirstPayment,
      }
      setLinks((current) => [link, ...current])
      setFilter('all')
      setActionError(null)
    } catch {
      setActionError('Could not save the payment link. Try again.')
    }
  }

  function handleRecordPayment(id: string, payment: number) {
    const link = links.find((item) => item.id === id)
    if (!link) {
      setActionError('That payment link is no longer in the list.')
      return
    }
    const status = resolveStatus(link, new Date())
    if (status !== 'active' && status !== 'partial') {
      setActionError('Payments can only be recorded on active or partially paid links.')
      return
    }
    setActionError(null)
    const amountPaid = fromCents(toCents(link.amountPaid) + toCents(payment))
    setLinks((current) =>
      current.map((item) => (item.id === id ? { ...item, amountPaid } : item)),
    )
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="mark" aria-hidden="true">
            ₹
          </span>
          <div>
            <p className="eyebrow">Merchant dashboard</p>
            <h1>Payment links</h1>
          </div>
        </div>
        <p className="lede">
          Create a link for a customer, then track whether it is active, partially paid, paid, or
          expired. Links stay in this browser after a reload.
        </p>
      </header>

      <div className="layout">
        <section className="panel" aria-labelledby="create-heading">
          <CreateLinkForm onCreate={handleCreate} />
        </section>

        <section className="panel" aria-labelledby="links-heading">
          <div className="section-head">
            <h2 id="links-heading">Links</h2>
            <p>Filter by status. A link past its expiry is shown as expired unless it is fully paid.</p>
          </div>
          {actionError ? (
            <div className="banner error" role="alert">
              <p>{actionError}</p>
            </div>
          ) : null}
          <StatusFilter value={filter} counts={counts} onChange={setFilter} />
          <div id="link-results">
            <LinkList items={visible} filter={filter} onRecordPayment={handleRecordPayment} />
          </div>
        </section>
      </div>
    </div>
  )
}
