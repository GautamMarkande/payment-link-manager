# Payment links

Merchant dashboard for creating and tracking payment links. Links are saved in this browser and stay after a reload.

## What it does

- Create a link with an amount in rupees, a description, a customer email or phone, and an optional expiry.
- Amount must be greater than 0, at most 2 decimal places, and at most ₹5,00,000.
- Description is required and limited to 100 characters.
- At least one of email or phone is required, and each value is checked when it is filled in.
- Expiry is optional and must be in the future. After that moment, an active or partially paid link is shown as Expired. A fully paid link never expires.
- Allow partial payments, with a minimum first payment greater than 0 and no more than the link amount.
- Record a payment on an active or partially paid link. The amount must be greater than 0 and no more than the amount due.
- The list shows how much is paid and how much is due.
- Filter the list by All, Active, Partially paid, Paid, or Expired.

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
