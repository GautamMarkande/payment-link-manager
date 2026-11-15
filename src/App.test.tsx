import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('payment links dashboard', () => {
  it('shows validation errors, then lists a new link and hides it from Paid', async () => {
    const user = userEvent.setup()
    render(<App />)

    const expired = screen.getByRole('article', { name: 'Friday table hold' })
    expect(expired).toHaveTextContent('Expired')
    expect(expired).not.toHaveTextContent('Active')

    await user.click(screen.getByRole('button', { name: 'Create payment link' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/could not create the link/i)
    expect(screen.getByText('Enter an amount.')).toBeInTheDocument()
    expect(screen.getByText('Enter a description.')).toBeInTheDocument()
    expect(screen.getByText('Enter an email or a phone number.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Amount (₹)'), '1500')
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

    await user.click(screen.getByRole('button', { name: /^Expired$/ }))
    expect(screen.getByRole('heading', { name: 'Friday table hold' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'E2E festival ticket' })).not.toBeInTheDocument()
  })
})
