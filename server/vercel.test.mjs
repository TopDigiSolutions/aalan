import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./app.mjs";
import { recordPayment } from "./checkout.mjs";
import { openSupabaseStore } from "./supabase-store.mjs";

test("Vercel health is available before configuration and mutations fail closed", async (t) => {
  const server = createApp({
    stripe: null,
    store: null,
    origin: "https://example.com",
    storageReady: false,
  }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).paymentsConfigured, false);
  const webhook = await fetch(`${base}/api/stripe/webhook`, { method: "POST" });
  assert.equal(webhook.status, 503);
});

test("payment recording waits for asynchronous database writes and propagates failures", async () => {
  const session = {
    id: "cs_test_example123",
    metadata: { store: "aalan" },
    mode: "payment",
    payment_status: "paid",
  };
  const stripe = {
    checkout: {
      sessions: {
        retrieve: async () => session,
        listLineItems: async () => ({ data: [], has_more: false }),
      },
    },
  };
  let saved = false;
  const store = {
    order: async () => undefined,
    saveOrder: async () => {
      await Promise.resolve();
      saved = true;
    },
  };
  await recordPayment(stripe, store, session.id);
  assert.equal(saved, true);
  store.saveOrder = async () => {
    throw new Error("unavailable");
  };
  await assert.rejects(recordPayment(stripe, store, session.id), /unavailable/);
});

test("Supabase requests enforce conflict handling, field privacy, and request timeouts", async () => {
  const calls = [];
  const store = openSupabaseStore(
    "https://example.supabase.co",
    "sb_secret_test",
    async (url, init) => {
      calls.push({ url: new URL(url), init });
      return new Response(
        init.method === "GET"
          ? JSON.stringify([
              { session_id: "cs_example", amount: 123, currency: "usd" },
            ])
          : null,
        {
          status: init.method === "GET" ? 200 : 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    },
  );
  await store.saveOrder(
    { id: "cs_example", amount_total: 123, currency: "usd" },
    [],
  );
  const order = await store.order("cs_example");
  await store.subscribe("x'@example.com");
  assert.equal(order.amount, 123);
  assert.equal(calls[0].url.searchParams.get("on_conflict"), "session_id");
  assert.match(
    new Headers(calls[0].init.headers).get("prefer"),
    /resolution=ignore-duplicates/,
  );
  assert.equal(
    calls[1].url.searchParams.get("select"),
    "session_id,amount,currency,created_at",
  );
  assert.equal(calls[1].url.searchParams.get("session_id"), "eq.cs_example");
  assert.equal(JSON.parse(calls[2].init.body).email, "x'@example.com");
  assert.ok(calls.every((call) => call.init.signal instanceof AbortSignal));
});

test("Supabase database errors fail without exposing response details", async () => {
  const store = openSupabaseStore(
    "https://example.supabase.co",
    "sb_secret_test",
    async () =>
      new Response(JSON.stringify({ message: "private backend detail" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
  );
  await assert.rejects(
    store.order("cs_example"),
    (error) =>
      error.message.includes("Supabase storage operation failed") &&
      !error.message.includes("private backend detail"),
  );
  await assert.rejects(
    store.saveOrder(
      { id: "cs_example", amount_total: 123, currency: "usd" },
      [],
    ),
  );
});
