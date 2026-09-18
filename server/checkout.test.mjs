import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import {
  checkoutParameters,
  validateCart,
  recordPayment,
} from "./checkout.mjs";
import { openStore } from "./store.mjs";
import { createApp } from "./app.mjs";
const items = [{ id: "men-1", size: "M", quantity: 2, price: 1 }];
const token = randomUUID();
const session = {
  id: "cs_test_example123456",
  mode: "payment",
  metadata: { store: "aalan" },
  payment_status: "paid",
  status: "complete",
  amount_total: 25800,
  currency: "usd",
  client_reference_id: token,
  customer_details: { email: "buyer@example.com" },
};
function mockStripe() {
  return {
    checkout: {
      sessions: {
        retrieve: async id => id === 'cs_test_open123456' ? {...session,id,status:'open',payment_status:'unpaid',url:'https://checkout.stripe.com/c/pay/test'} : session,
        listLineItems: async () => ({
          data: [
            {
              description: "Oversized Bomber / M",
              quantity: 2,
              amount_total: 25800,
            },
          ],
          has_more: false,
        }),
        create: async (_params, _options) => ({
          id:'cs_test_open123456',
          url: "https://checkout.stripe.com/c/pay/test",
        }),
      },
    },
    webhooks: new Stripe("sk_test_placeholder").webhooks,
  };
}

test("checkout ignores client prices and uses integer catalog amounts", () => {
  const params = checkoutParameters(items, "https://shop.example", token, [
    "US",
  ]);
  assert.equal(params.line_items[0].price_data.unit_amount, 12900);
  assert.equal(params.line_items[0].quantity, 2);
  assert.equal(
    params.success_url,
    "https://shop.example/#/checkout/success?session_id={CHECKOUT_SESSION_ID}",
  );
});
test("rejects invalid carts and duplicate variants", () => {
  for (const input of [
    null,
    [],
    [null],
    [{ id: "fake", size: "M", quantity: 1 }],
    [{ id: "men-1", size: "bad", quantity: 1 }],
    ...[-1, 0, 11, 1.5, "2", NaN].map((quantity) => [
      { id: "men-1", size: "M", quantity },
    ]),
    [...items, ...items],
    Array(41).fill(items[0]),
  ])
    assert.throws(() => validateCart(input));
});
test("paid orders are durable and duplicate fulfillment is harmless", async () => {
  const store = openStore(":memory:");
  try {
    await Promise.all([
      recordPayment(mockStripe(), store, session.id),
      recordPayment(mockStripe(), store, session.id),
    ]);
    assert.equal(store.order(session.id).amount, 25800);
  } finally {
    store.close();
  }
});
test("unpaid and unrelated sessions cannot create orders", async () => {
  const store = openStore(":memory:");
  try {
    for (const value of [
      { ...session, payment_status: "unpaid" },
      { ...session, metadata: { store: "other" } },
    ]) {
      const stripe = mockStripe();
      stripe.checkout.sessions.retrieve = async () => value;
      await recordPayment(stripe, store, session.id);
      assert.equal(store.order(session.id), undefined);
    }
  } finally {
    store.close();
  }
});
async function fixture(t, overrides = {}) {
  const store = openStore(":memory:");
  const stripe = mockStripe();
  const secret = "whsec_testsecret";
  const app = createApp({
    store,
    stripe,
    origin: "http://localhost:5173",
    webhookSecret: secret,
    ...overrides,
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  });
  return {
    store,
    stripe,
    secret,
    url: `http://127.0.0.1:${server.address().port}`,
  };
}
test("checkout validates origin, request identifier, and server-priced input", async (t) => {
  const { url, stripe } = await fixture(t);
  let called;
  stripe.checkout.sessions.create = async (params, options) => {
    called = { params, options };
    return { id:'cs_test_open123456', url: "https://checkout.stripe.com/c/pay/test" };
  };
  const send = (headers) =>
    fetch(`${url}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ items }),
    });
  assert.equal((await send({})).status, 403);
  assert.equal((await send({ Origin: "http://localhost:5173" })).status, 400);
  const response = await send({
    Origin: "http://localhost:5173",
    "Idempotency-Key": token,
  });
  assert.equal(response.status, 200);
  assert.equal(called.params.line_items[0].price_data.unit_amount, 12900);
  assert.equal(called.options.idempotencyKey, token);
});
test("checkout fails closed without secrets", async (t) => {
  const { url } = await fixture(t, { stripe: null });
  assert.equal(
    (
      await fetch(`${url}/api/checkout`, {
        method: "POST",
        headers: {
          Origin: "http://localhost:5173",
          "Content-Type": "application/json",
        },
        body: "{}",
      })
    ).status,
    503,
  );
});
test("confirmation requires the matching token and never returns customer email", async (t) => {
  const { url } = await fixture(t);
  assert.equal((await fetch(`${url}/api/orders/${session.id}`)).status, 400);
  assert.equal(
    (
      await fetch(`${url}/api/orders/${session.id}`, {
        headers: { "X-Checkout-Token": randomUUID() },
      })
    ).status,
    404,
  );
  const response = await fetch(`${url}/api/orders/${session.id}`, {
    headers: { "X-Checkout-Token": token },
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "paid");
  assert.equal(body.order.email, undefined);
});
test("webhook rejects invalid signatures and accepts signed retries once", async (t) => {
  const { url, store, stripe, secret } = await fixture(t);
  const payload = JSON.stringify({
    id: "evt_test",
    type: "checkout.session.completed",
    data: { object: { id: session.id } },
  });
  const send = (signature) =>
    fetch(`${url}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": signature,
      },
      body: payload,
    });
  assert.equal((await send("invalid")).status, 400);
  assert.equal(store.order(session.id), undefined);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
  assert.equal((await send(signature)).status, 200);
  assert.equal((await send(signature)).status, 200);
  assert.equal(store.order(session.id).amount, 25800);
  assert.equal(
    (
      await send(
        stripe.webhooks.generateTestHeaderString({
          payload,
          secret,
          timestamp: 1,
        }),
      )
    ).status,
    400,
  );
});
test("webhook returns retryable failure if persistence fails", async (t) => {
  const { url, store, stripe, secret } = await fixture(t);
  store.saveOrder = () => {
    throw new Error("database unavailable");
  };
  const payload = JSON.stringify({
    type: "checkout.session.completed",
    data: { object: { id: session.id } },
  });
  const response = await fetch(`${url}/api/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Stripe-Signature": stripe.webhooks.generateTestHeaderString({
        payload,
        secret,
      }),
    },
    body: payload,
  });
  assert.equal(response.status, 500);
});
test("newsletter requires consent and handles repeated subscription", async (t) => {
  const { url } = await fixture(t);
  const send = (body) =>
    fetch(`${url}/api/newsletter`, {
      method: "POST",
      headers: {
        Origin: "http://localhost:5173",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  assert.equal((await send({ email: "reader@example.com" })).status, 400);
  assert.equal((await send({ email: "invalid", consent: true })).status, 400);
  assert.equal(
    (await send({ email: "reader@example.com", consent: true })).status,
    200,
  );
  assert.equal(
    (await send({ email: "reader@example.com", consent: true })).status,
    200,
  );
});
