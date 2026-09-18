import "dotenv/config";
import Stripe from "stripe";
import { openStore } from "./store.mjs";
import { openSupabaseStore } from "./supabase-store.mjs";
import { createApp } from "./app.mjs";
const origin = new URL(process.env.APP_URL || "http://localhost:5173").origin;
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.APP_URL ||
    !origin.startsWith("https:") ||
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET ||
    !process.env.SHIPPING_COUNTRIES)
)
  throw new Error(
    "Production requires HTTPS APP_URL, Stripe secrets, and SHIPPING_COUNTRIES.",
  );
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (Boolean(process.env.SUPABASE_URL) !== Boolean(supabaseKey))
  throw new Error("Set both SUPABASE_URL and SUPABASE_SECRET_KEY.");
const store = process.env.SUPABASE_URL
  ? openSupabaseStore(process.env.SUPABASE_URL, supabaseKey)
  : openStore(process.env.DATABASE_PATH || "./data/store.sqlite");
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      maxNetworkRetries: 2,
      timeout: 20_000,
    })
  : null;
const app = createApp({
  stripe,
  store,
  origin,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  countries: (process.env.SHIPPING_COUNTRIES || "US")
    .split(",")
    .map((value) => value.trim().toUpperCase()),
  serveStatic: process.env.NODE_ENV === "production",
});
const server = app.listen(Number(process.env.PORT || 3001), "0.0.0.0", () =>
  console.log(`AALAN API listening on port ${process.env.PORT || 3001}`),
);
server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => {
    server.closeAllConnections();
  }, 25_000);
  timeout.unref();
  server.close(() => {
    clearTimeout(timeout);
    store.close();
  });
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
