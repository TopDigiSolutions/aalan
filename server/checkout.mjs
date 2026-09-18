import catalog from "../shared/catalog.json" with { type: "json" };
const products = new Map(catalog.map((product) => [product.id, product]));

export function validateCart(items) {
  if (!Array.isArray(items) || !items.length || items.length > 40)
    throw new Error("Choose between 1 and 40 product variants.");
  const seen = new Set();
  return items.map((item) => {
    const product = products.get(item?.id);
    if (
      !product ||
      !product.sizes.includes(item.size) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10
    )
      throw new Error("Invalid product, size, or quantity.");
    const key = `${item.id}:${item.size}`;
    if (seen.has(key)) throw new Error("Duplicate product variant.");
    seen.add(key);
    return { product, size: item.size, quantity: item.quantity };
  });
}

export function checkoutParameters(items, origin, token, countries) {
  return {
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: token,
    metadata: { store: "aalan" },
    billing_address_collection: "required",
    shipping_address_collection: { allowed_countries: countries },
    line_items: validateCart(items).map(({ product, size, quantity }) => ({
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: product.price,
        product_data: {
          name: `${product.name} / ${size}`,
          metadata: { product_id: product.id, size },
        },
      },
    })),
    success_url: `${origin}/#/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#/cart?canceled=1`,
  };
}

export function paymentState(session) {
  if (session.payment_status === 'paid') return 'paid';
  if (session.status === 'expired') return 'expired';
  const intent = typeof session.payment_intent === 'object' ? session.payment_intent : null;
  if (intent?.status === 'canceled') return 'canceled';
  if (intent?.status === 'requires_action') return 'requires_action';
  if (intent?.status === 'requires_payment_method' && intent.last_payment_error) return 'failed';
  return 'pending';
}

export async function recordPayment(stripe, store, sessionId, retrievedSession) {
  const session = retrievedSession ?? await stripe.checkout.sessions.retrieve(sessionId);
  if (
    session.metadata?.store !== "aalan" ||
    session.mode !== "payment" ||
    session.payment_status !== "paid"
  )
    return session;
  if (!(await store.order(session.id))) {
    const lines = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });
    if (lines.has_more) throw new Error("Unexpected order size.");
    await store.saveOrder(
      session,
      lines.data.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        amount: line.amount_total,
      })),
    );
  }
  return session;
}
