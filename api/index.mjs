import Stripe from "stripe";
import { createApp } from "../server/app.mjs";
import { openSupabaseStore } from "../server/supabase-store.mjs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageReady = Boolean(supabaseUrl && supabaseKey);
const origin = new URL(
  process.env.APP_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "localhost"}`,
).origin;
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      maxNetworkRetries: 1,
      timeout: 15_000,
    })
  : null;
// Never fall back to ephemeral SQLite on Vercel. Missing configuration fails closed.
export default createApp({
  stripe,
  store: storageReady ? openSupabaseStore(supabaseUrl, supabaseKey) : null,
  storageReady,
  origin,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  countries: (process.env.SHIPPING_COUNTRIES || "US")
    .split(",")
    .map((value) => value.trim().toUpperCase()),
});
