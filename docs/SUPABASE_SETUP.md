# Connect Supabase to AALAN

Vercel runs the API and Stripe webhook. Supabase stores paid orders and newsletter subscribers. Shopping and checkout do not require customer accounts.

## Guest shopping

Bags and wishlists are saved in this browser. They survive reloads but do not sync across devices, and clearing browser data removes them. No frontend Supabase keys or Auth configuration are required.

The historical cart migration may remain applied; existing account data and its access policies are left intact. The storefront no longer reads or writes account carts.

## Required values

| Vercel environment variable | Where to find it                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `SUPABASE_URL`              | Supabase project **Connect** dialog or **Settings → Data API → Project URL**, such as `https://your-project.supabase.co` |
| `SUPABASE_SECRET_KEY`       | **Settings → API Keys → Secret keys**. Create a server key named `aalan-vercel`, starting with `sb_secret_`.             |

If your project only offers legacy keys, the **service_role** key can be stored as `SUPABASE_SERVICE_ROLE_KEY` instead. Do not use an `anon` or `sb_publishable_` key for the server store. Secret/service-role keys bypass row-level security and must stay in Vercel server environment variables, never in `VITE_` variables, frontend code, or Git.

## Steps

1. Create or select your Supabase project. Wait until it is ready. Ensure its Data API is enabled for the `public` schema (the default configuration).
2. Open **SQL Editor → New query**. Copy the contents of `supabase/migrations/202609140001_store.sql`, then click **Run**. This creates `aalan_orders` and `aalan_subscribers`, enables row-level security, and removes access from browser roles. No public read/write policies are needed.
3. Open your Vercel **aalan → Settings → Environment Variables**. Add the two values above to **Production**. Store the key as sensitive. The Stripe keys are separate variables: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
4. Redeploy. A configuration change does not affect an existing deployment until redeployment.
5. Complete a test purchase through `https://aalan.vercel.app`. In Supabase **Table Editor → aalan_orders**, check that one record is created. In Stripe, confirm the webhook delivery received `200`. Re-delivering the same event must not duplicate the order.

Webhook URL: `https://aalan.vercel.app/api/stripe/webhook`

`/api/health` reports whether required values are present, not whether those values are valid or whether the SQL has been applied. A missing table or invalid credential causes database operations to fail and Stripe retries failed webhook deliveries. The implementation does not silently acknowledge an order it could not save.

Official guide: https://supabase.com/docs/guides/getting-started/api-keys
