# Payment links

Merchant dashboard for creating and tracking payment links. Data stays in memory in the browser tab.

## What it does

- Create a link with an amount in rupees, a description, a customer email or phone, and an optional expiry.
- Amount must be greater than 0, at most 2 decimal places, and at most ₹5,00,000.
- Description is required and limited to 100 characters.
- At least one of email or phone is required, and each value is checked when it is filled in.
- Expiry is optional and must be in the future. After that moment, an unpaid link is shown as Expired.
- Filter the list by All, Active, Paid, or Expired.
- Mark an active link as paid. Paid stays paid.

## Commands

Install:

```bash
npm install
npx playwright install chromium
```

Run the app:

```bash
npm run dev
```

Open http://127.0.0.1:5173

Unit tests:

```bash
npm test
```

End-to-end test:

```bash
npm run test:e2e
```

Production build:

```bash
npm run build
```
