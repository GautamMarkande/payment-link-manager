import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { toDateInputValue } from '../format.ts'
import { validatePaymentLink, type ValidLinkInput } from '../validation.ts'

type CreateLinkFormProps = {
  onCreate: (value: ValidLinkInput) => void
}

const EMPTY = {
  amount: '',
  description: '',
  email: '',
  phone: '',
  expiry: '',
}

export function CreateLinkForm({ onCreate }: CreateLinkFormProps) {
  const [values, setValues] = useState(EMPTY)
  const [attempted, setAttempted] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const formErrorId = useId()
  const amountHintId = useId()
  const amountErrorId = useId()
  const descriptionHintId = useId()
  const descriptionErrorId = useId()
  const customerHintId = useId()
  const customerErrorId = useId()
  const emailErrorId = useId()
  const phoneErrorId = useId()
  const expiryHintId = useId()
  const expiryErrorId = useId()
  const successRef = useRef<HTMLParagraphElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const expiryRef = useRef<HTMLInputElement>(null)

  const [now] = useState(() => new Date())
  const result = validatePaymentLink(values, now)
  const errors = attempted && !result.ok ? result.errors : {}
  const descriptionLength = values.description.trim().length
  const today = toDateInputValue(now)

  useEffect(() => {
    if (success) successRef.current?.focus()
  }, [success])

  function update(field: keyof typeof EMPTY, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setSuccess(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    const submission = validatePaymentLink(values, new Date())
    if (!submission.ok) {
      setSuccess(null)
      if (submission.errors.amount) amountRef.current?.focus()
      else if (submission.errors.description) descriptionRef.current?.focus()
      else if (submission.errors.customer || submission.errors.email) emailRef.current?.focus()
      else if (submission.errors.phone) phoneRef.current?.focus()
      else expiryRef.current?.focus()
      return
    }
    onCreate(submission.value)
    setValues(EMPTY)
    setAttempted(false)
    setSuccess(`Payment link created for ${submission.value.description}.`)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="section-head">
        <h2 id="create-heading">Create a link</h2>
        <p>Amount, a short description, and at least an email or a phone number.</p>
      </div>

      {success ? (
        <p className="banner success" role="status" tabIndex={-1} ref={successRef}>
          {success}
        </p>
      ) : null}

      {attempted && !result.ok ? (
        <div className="banner error" role="alert" id={formErrorId}>
          <p>Could not create the link. Fix the highlighted fields.</p>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="amount">Amount (₹)</label>
        <div className="amount-input">
          <span aria-hidden="true">₹</span>
          <input
            ref={amountRef}
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            aria-required="true"
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={[amountHintId, errors.amount ? amountErrorId : '']
              .filter(Boolean)
              .join(' ')}
            value={values.amount}
            onChange={(event) => update('amount', event.target.value)}
          />
        </div>
        <p id={amountHintId} className="hint">
          Greater than 0, up to ₹5,00,000, with at most 2 decimal places.
        </p>
        {errors.amount ? (
          <p id={amountErrorId} className="field-error">
            {errors.amount}
          </p>
        ) : null}
      </div>

      <div className="field">
        <div className="label-row">
          <label htmlFor="description">Description</label>
          <span className={descriptionLength > 100 ? 'counter over' : 'counter'}>
            {descriptionLength}/100
          </span>
        </div>
        <textarea
          ref={descriptionRef}
          id="description"
          name="description"
          rows={3}
          aria-required="true"
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={[descriptionHintId, errors.description ? descriptionErrorId : '']
            .filter(Boolean)
            .join(' ')}
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
        />
        <p id={descriptionHintId} className="hint">
          What the customer is paying for.
        </p>
        {errors.description ? (
          <p id={descriptionErrorId} className="field-error">
            {errors.description}
          </p>
        ) : null}
      </div>

      <fieldset className="customer">
        <legend>Customer</legend>
        <p id={customerHintId} className="hint">
          Email, 10-digit mobile, or both. At least one is required.
        </p>
        {errors.customer ? (
          <p id={customerErrorId} className="field-error">
            {errors.customer}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={errors.email || errors.customer ? true : undefined}
            aria-describedby={[
              customerHintId,
              errors.customer ? customerErrorId : '',
              errors.email ? emailErrorId : '',
            ]
              .filter(Boolean)
              .join(' ')}
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
          />
          {errors.email ? (
            <p id={emailErrorId} className="field-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            ref={phoneRef}
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="98765 43210"
            aria-invalid={errors.phone || errors.customer ? true : undefined}
            aria-describedby={[
              customerHintId,
              errors.customer ? customerErrorId : '',
              errors.phone ? phoneErrorId : '',
            ]
              .filter(Boolean)
              .join(' ')}
            value={values.phone}
            onChange={(event) => update('phone', event.target.value)}
          />
          {errors.phone ? (
            <p id={phoneErrorId} className="field-error">
              {errors.phone}
            </p>
          ) : null}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="expiry">Expiry date (optional)</label>
        <input
          ref={expiryRef}
          id="expiry"
          name="expiry"
          type="date"
          min={today}
          aria-invalid={errors.expiry ? true : undefined}
          aria-describedby={[expiryHintId, errors.expiry ? expiryErrorId : '']
            .filter(Boolean)
            .join(' ')}
          value={values.expiry}
          onChange={(event) => update('expiry', event.target.value)}
        />
        <p id={expiryHintId} className="hint">
          Leave blank for no expiry. A date must still be in the future.
        </p>
        {errors.expiry ? (
          <p id={expiryErrorId} className="field-error">
            {errors.expiry}
          </p>
        ) : null}
      </div>

      <button type="submit" className="primary">
        Create payment link
      </button>
    </form>
  )
}
