# Project review

The original project was a React/Vite storefront export with static product arrays and no server or persistence. This review covers the source supplied in this workspace.

| Area                | Original finding                                                        | Result                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payments            | No checkout or backend                                                  | Stripe-hosted card checkout, server-owned USD prices, size/quantity validation, idempotency keys, signed webhooks, server-verified confirmation                   |
| Orders              | No order storage                                                        | SQLite order records with unique Stripe session IDs, purchased line items, email, and shipping details; safe repeated delivery                                    |
| Cart                | Hard-coded badge and inactive icons                                     | Persistent browser bag, size selection, quantity limits, removal, total, cancellation and checkout errors                                                         |
| Wishlist and search | Decorative icons                                                        | Searchable catalog and persistent wishlist                                                                                                                        |
| Collections         | Filters only changed button styling; sort did nothing                   | Real category filtering, price sorting, search, empty states                                                                                                      |
| Products            | Repeated independent arrays                                             | Shared catalog with stable product IDs and product detail routes                                                                                                  |
| Navigation          | Misrouted categories, inactive view-all controls, missing page fallback | Working routes and section links, mobile navigation and not-found view                                                                                            |
| Newsletter          | Claimed success without saving or sending                               | Validated, consent-based SQLite subscription; no email is claimed to have been sent                                                                               |
| Promotions          | Unimplemented coupon and buy-two-get-one claims                         | Removed unsupported offers; displayed catalog sale prices are used by checkout                                                                                    |
| Styling             | Runtime Tailwind CDN and unprocessed directives                         | Compiled Tailwind assets with production security headers                                                                                                         |
| Dependencies        | Old Vite and React Router advisories                                    | Updated build tooling and patched router                                                                                                                          |
| Resource lifecycle  | Untracked navigation timeout; no network lifecycle                      | Timer-free section navigation, aborted requests on unmount, bounded payment polling, event-listener cleanup, bounded cart data, graceful server/database shutdown |

## Still requires business decisions or external services

- **Catalog readiness:** The exported products, prices, illustrative Unsplash photos, and newly supplied generic size choices are sample data. Replace these with actual SKUs, approved photography, accurate sizes and prices before charging customers. Similar names in different collections retain separate IDs and original prices; consolidate only after deciding which are the same real SKU.
- **Inventory:** No stock source was provided. There are quantity limits, but no stock counts or reservations. Do not use this as a stock-controlled catalog until inventory reservation and reconciliation are implemented against actual stock data.
- **Fulfillment and administration:** Paid orders are recorded; shipments are not created automatically. For this version, use Stripe Dashboard for payment/customer review and manual fulfillment. There is no admin UI, shipment tracking, refund workflow, or customer account system. Guest checkout is intentional.
- **Shipping and taxes:** Set supported shipping countries. This version adds no shipping fee and no automatic tax calculation. Configure rates and tax behavior appropriate to the business before launch.
- **Newsletter delivery:** Subscriptions are stored only. Connect an email provider, consent/double-opt-in workflow as appropriate, unsubscribe links, and subscriber deletion tools before sending campaigns.
- **Store information:** Supply support contact, delivery estimates, return/refund policy, privacy policy, terms, size measurements, and business identity. Inactive placeholder policy/social/company links were removed rather than inventing these details.
- **Deployment:** The standalone server can use SQLite with persistent disk, or Supabase when configured. The Vercel adapter uses Supabase over HTTPS; apply the SQL migration and configure credentials using SUPABASE_SETUP.md and VERCEL_SETUP.md. Configuration presence does not prove live payment or database connectivity.

## Verification limits

Automated backend tests use a mocked Stripe API and real SDK signature verification. Component tests exercise browser-like DOM behavior. A production build validates TypeScript and bundling. These checks do not replace a real Stripe test-mode purchase, browser visual/mobile QA, deployment tests, load testing, or heap profiling. No claim of zero memory leaks is made; lifecycle cleanup and bounded state address the issues identified in source review.
