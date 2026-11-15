import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App.tsx'
import { STORAGE_KEY } from './storage.ts'

describe('payment links dashboard', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('shows validation errors, then lists a new link and hides it from Paid', async () => {
    const user = userEvent.setup()
    render(<App />)

    const expired = screen.getByRole('article', { name: 'Friday table hold' })
    expect(expired).toHaveTextContent('Expired')
    expect(expired).toHaveTextContent('Paid')
    expect(expired).toHaveTextContent('Due')
    expect(expired).not.toHaveTextContent('Active')

    await user.click(screen.getByRole('button', { name: 'Create payment link' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/could not create the link/i)
    expect(screen.getByText('Enter an amount.')).toBeInTheDocument()
    expect(screen.getByText('Enter a description.')).toBeInTheDocument()
    expect(screen.getByText('Enter an email or a phone number.')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /^Amount \(₹\)$/ }), '1500')
    await user.type(screen.getByLabelText('Description'), 'E2E festival ticket')
    await user.type(screen.getByLabelText('Email'), 'buyer@example.com')
    await user.click(screen.getByRole('button', { name: /^Create payment link$/ }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Payment link created for E2E festival ticket.',
    )
    expect(screen.getByRole('heading', { name: 'E2E festival ticket' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Paid$/ }))
    expect(screen.queryByRole('heading', { name: 'E2E festival ticket' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'No paid links' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Partially paid$/ }))
    expect(screen.getByRole('heading', { name: 'Studio rental' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'E2E festival ticket' })).not.toBeInTheDocument()
  })

  it('records a partial payment and keeps the link after a reload', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.click(screen.getByRole('checkbox', { name: 'Allow partial payments' }))
    await user.click(screen.getByRole('button', { name: /^Create payment link$/ }))
    expect(screen.getByText('Enter a minimum first payment.')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /^Amount \(₹\)$/ }), '1000')
    await user.type(screen.getByRole('textbox', { name: /^Minimum first payment \(₹\)$/ }), '1500')
    await user.type(screen.getByLabelText('Description'), 'Kiln deposit')
    await user.type(screen.getByLabelText('Email'), 'kiln@example.com')
    await user.click(screen.getByRole('button', { name: /^Create payment link$/ }))
    expect(screen.getByText('Minimum first payment cannot exceed the link amount.')).toBeInTheDocument()

    await user.clear(screen.getByRole('textbox', { name: /^Minimum first payment \(₹\)$/ }))
    await user.type(screen.getByRole('textbox', { name: /^Minimum first payment \(₹\)$/ }), '400')
    await user.click(screen.getByRole('button', { name: /^Create payment link$/ }))

    const card = screen.getByRole('article', { name: 'Kiln deposit' })
    expect(card).toHaveTextContent('Active')
    expect(card).toHaveTextContent('₹0.00')
    expect(card).toHaveTextContent('₹1,000.00')

    const payment = within(card).getByRole('textbox', { name: /^Payment amount \(₹\)$/ })
    await user.type(payment, '100')
    await user.click(screen.getByRole('button', { name: 'Record payment for Kiln deposit' }))
    expect(screen.getByText('The first payment must be at least the minimum first payment.')).toBeInTheDocument()

    await user.clear(payment)
    await user.type(payment, '400')
    await user.click(screen.getByRole('button', { name: 'Record payment for Kiln deposit' }))
    expect(screen.getByRole('article', { name: 'Kiln deposit' })).toHaveTextContent('Partially paid')

    view.unmount()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Kiln deposit' })).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Kiln deposit')
    cleanup()
  })
})
