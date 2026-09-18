# Vercel deployment

The project serves the Vite storefront and Express API from one Vercel deployment. `/api/*` routes to `api/index.mjs`. SQLite remains available for local development; Vercel uses Supabase over HTTPS and never writes a local database. Local development also uses Supabase when its environment variables are set.

1. Create or select a Supabase project. Run `supabase/migrations/202609140001_store.sql` in its SQL Editor. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` to the Vercel Production environment. Keep the key server-only.
2. Under **Settings → Environment Variables**, set these for Production:
   - `STRIPE_SECRET_KEY`: your sandbox `sk_test_...` key.
   - `APP_URL`: the deployed storefront's HTTPS origin (no trailing slash). If omitted, the function uses Vercel's production domain.
   - `SHIPPING_COUNTRIES`: comma-separated country codes you actually ship to.
3. In the same Stripe sandbox, create a webhook destination for `https://YOUR-PRODUCTION-DOMAIN/api/stripe/webhook`, listening for `checkout.session.completed` and `checkout.session.async_payment_succeeded` from your account.
4. Reveal that destination's signing secret. Set `STRIPE_WEBHOOK_SECRET` in Vercel's Production environment.
5. Redeploy after running the SQL and saving the environment variables. The schema has row-level security enabled and browser roles cannot access order or subscriber records. Duplicate session IDs are ignored on insert.
6. Check `/api/health`. `status: "ok"` confirms the function runs; `paymentsConfigured: true` confirms required configuration is present, not that Stripe credentials or database connectivity have been verified. Complete a real sandbox Checkout purchase and inspect the Stripe webhook delivery for a `200` response.

Until the database and Stripe secrets are configured, payment endpoints return `503` rather than acknowledge payments without recording them. The health endpoint remains public and never returns secrets. Use the public production domain for Stripe, not a preview protected by Vercel login. If production is protected, use Vercel's documented webhook access controls; do not assume Stripe can pass an interactive login.

The Express rate limiter is local to each function instance. Configure Vercel Firewall rate limits for `/api/checkout`, `/api/orders/*`, and `/api/newsletter` for production-wide abuse protection. Do not impose browser challenges on the Stripe webhook path. Inventory, shipping/tax policy, and fulfillment prerequisites in PROJECT_REVIEW.md still apply.
