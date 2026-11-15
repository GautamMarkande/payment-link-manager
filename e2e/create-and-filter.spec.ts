import { expect, test } from '@playwright/test'

test('creates a payment link and filters it by status', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Amount (₹)').fill('1500')
  await page.getByLabel('Description').fill('Courtyard concert ticket')
  await page.getByLabel('Email').fill('buyer@example.com')
  await page.getByRole('button', { name: 'Create payment link', exact: true }).click()

  const created = page.getByRole('heading', { name: 'Courtyard concert ticket' })
  await expect(created).toBeVisible()
  await expect(page.getByRole('status')).toContainText(
    'Payment link created for Courtyard concert ticket.',
  )

  await page.getByRole('button', { name: 'Active', exact: true }).click()
  await expect(created).toBeVisible()

  await page.getByRole('button', { name: 'Paid', exact: true }).click()
  await expect(created).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'No paid links' })).toBeVisible()

  await page.getByRole('button', { name: 'All', exact: true }).click()
  await expect(created).toBeVisible()
})
