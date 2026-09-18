# AALAN storefront

React, TypeScript, Vite, and compiled Tailwind frontend with a Node/Express API, Stripe-hosted checkout, and SQLite order storage. Requires **Node 24+**.

## Local development

1. Run `npm ci`.
2. Copy `.env.example` to `.env`. Set `STRIPE_SECRET_KEY` to your Stripe **test** secret key. Never put secret keys in `VITE_` variables or frontend code.
3. Start the API with `npm run dev:api`.
4. Start the frontend with `npm run dev`, then use **http://localhost:5173**. The URL must match `APP_URL` exactly; Vite proxies `/api` to port 3001.
5. With Stripe CLI installed and authenticated, run `stripe listen --forward-to localhost:3001/api/stripe/webhook`. Copy its `whsec_...` secret into `STRIPE_WEBHOOK_SECRET` and restart the API.
6. Choose a product size, add to the bag, and check out in test mode. Verify that a paid order appears in `data/store.sqlite` and confirmation clears only purchased quantities. Canceling checkout keeps the bag.

Checkout stays unavailable until both Stripe secrets are set. No real Stripe purchase was performed during implementation; credentials were not supplied. No Stripe publishable key is needed for the hosted redirect integration.

## Payment behavior

The client sends product IDs, sizes, and quantities. Prices come from `shared/catalog.json` on the server in integer USD cents. The API rejects invalid quantities, unknown products, invalid sizes, and duplicate variants. Retries reuse a checkout idempotency key stored in the current browser tab.

The raw-body webhook verifies Stripe signatures and retrieves the session from Stripe. Only paid AALAN sessions create orders. A unique session ID makes repeated events harmless. The return page independently verifies payment through the API with its browser checkout token; the redirect alone never proves payment. Orders contain line items, customer email, and shipping details for manual fulfillment. Public order responses omit personal details.

Register `/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Card payments are enabled in this version. This follows [Stripe's Checkout fulfillment guidance](https://docs.stripe.com/checkout/fulfillment).

## Verification

```text
npm test
npm run test:ui
npm run build
npm audit
```

Backend tests exercise validation, authorization, signed/replayed webhooks and persistence failures with mocked Stripe network calls. DOM component tests cover cart quantity limits, persistence, wishlist, filters, sorting, corrupted storage, and repeated confirmation. Browser visual QA and a real test-mode checkout remain required.

## Deployment

**Vercel:** `api/index.mjs` and `vercel.json` deploy the API alongside the frontend. Configure Supabase (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`) and run the supplied migration using [the Supabase setup guide](docs/SUPABASE_SETUP.md). Configure Stripe secrets using [the Vercel setup guide](docs/VERCEL_SETUP.md). The adapter uses HTTPS queries instead of local SQLite. `/api/health` remains available before configuration, while payment endpoints fail closed.

Build with `npm run build`. On a Node 24 host with persistent disk, set `NODE_ENV=production`, HTTPS `APP_URL`, both Stripe secrets, `SHIPPING_COUNTRIES`, and an absolute `DATABASE_PATH` on the persistent volume, then run `npm start`. The API serves `dist` in production. Put it behind an HTTPS reverse proxy and restrict direct port access.

The built-in rate limiter is per process. This configuration deliberately does not trust forwarded IP headers: behind a proxy, requests share the proxy's rate-limit bucket. Set an explicitly trusted proxy configuration and a shared rate-limit store before operating multiple instances. Do not blindly enable `trust proxy`.

The standalone SQLite implementation targets a single server instance. Back up the database using SQLite's backup facilities, protect the volume because it contains customer data, and test recovery. On Vercel, use the included Supabase adapter; never point SQLite at ephemeral function storage. Configure Supabase backups and test recovery for production orders.

## Launch prerequisites

See [the full project review](docs/PROJECT_REVIEW.md). Replace sample catalog data and generic size options, provide actual inventory and fulfillment procedures, and configure shipping/taxes and store policies. The current checkout adds no shipping fee and does not calculate tax. Newsletter signup stores consented email addresses but sends no messages; email delivery and unsubscribe management need an email service. Orders are recorded, not automatically shipped.

Resource cleanup is implemented for requests, timers, listeners, and shutdown. A source review and automated tests cannot guarantee zero memory leaks; production load and heap profiling have not been performed.

## Guest shopping

Customers can browse, save favorites, add products, and check out without signing in. Bags and wishlists persist in the same browser; they do not sync across devices. Old `/login`, `/signup`, and `/account` routes redirect to the shop. Supabase remains the server-side order and newsletter store.
