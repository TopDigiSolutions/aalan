import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { timingSafeEqual } from "node:crypto";
import { resolve } from "node:path";
import { checkoutParameters, recordPayment, paymentState } from "./checkout.mjs";

export function createApp({
  stripe,
  store,
  origin,
  webhookSecret,
  countries = ["US"],
  serveStatic = false,
  storageReady = true,
}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "img-src": [
            "'self'",
            "data:",
            "https://images.unsplash.com",
            "https://zgnpmogdjnnhpwewavnr.supabase.co",
          ],
          "font-src": ["'self'", "https://fonts.gstatic.com"],
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          "upgrade-insecure-requests": origin.startsWith("https:") ? [] : null,
        },
      },
    }),
  );
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.get("/api/health", (_req, res) =>
    res.json({
      status: "ok",
      service: "aalan-api",
      paymentsConfigured: Boolean(stripe && webhookSecret && storageReady),
    }),
  );
  app.use("/api", (_req, res, next) => {
    if (!storageReady)
      return res.status(503).json({
        error:
          "Database is not configured. Set the Supabase server environment variables and redeploy.",
      });
    next();
  });
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json", limit: "256kb" }),
    async (req, res, next) => {
      if (!stripe || !webhookSecret)
        return res.status(503).json({ error: "Payments are not configured." });
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.get("stripe-signature"),
          webhookSecret,
        );
      } catch {
        return res.status(400).json({ error: "Invalid webhook signature." });
      }
      try {
        if (
          [
            "checkout.session.completed",
            "checkout.session.async_payment_succeeded",
            "checkout.session.async_payment_failed",
          ].includes(event.type)
        )
          await recordPayment(stripe, store, event.data.object.id);
        res.json({ received: true });
      } catch (error) {
        next(error);
      }
    },
  );
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 60,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again in a minute." },
    }),
  );
  app.use(express.json({ limit: "16kb" }));
  app.use("/api", (req, res, next) => {
    const reqOrigin = req.get("origin");
    if (req.method === "POST") {
      const allowedOrigins = new Set(
        [
          origin,
          process.env.APP_URL,
          "https://aalan.store",
          "https://www.aalan.store",
          "https://aalan.vercel.app",
          "https://aalan-gamma.vercel.app",
          process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : null,
          process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        ].filter(Boolean),
      );
      if (!reqOrigin || !allowedOrigins.has(reqOrigin))
        return res.status(403).json({ error: "Invalid request origin." });
    }
    next();
  });
  app.post("/api/checkout", async (req, res, next) => {
    if (!stripe || !webhookSecret)
      return res.status(503).json({
        error: "Checkout is not configured yet. Please try again later.",
      });
    const token = req.get("idempotency-key");
    if (!token || !/^[a-f0-9-]{36}$/.test(token))
      return res.status(400).json({ error: "Invalid checkout identifier." });
    let params;
    try {
      params = checkoutParameters(req.body?.items, origin, token, countries);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    try {
      // Check persistence before sending a customer to pay when storage is down.
      await store.order(`checkout_readiness_${token}`);
      const created = await stripe.checkout.sessions.create(params, {
        idempotencyKey: token,
      });
      // Idempotent create responses are cached by Stripe. Retrieve current state
      // so a retry cannot redirect to an expired or already completed checkout.
      const session = await stripe.checkout.sessions.retrieve(created.id);
      if (session.status === 'complete') return res.json({sessionId:session.id,status:'complete'});
      if (session.status === 'expired' || !session.url)
        return res
          .status(409)
          .json({ error: "This checkout has expired. Click checkout again to start a new session.", code:'CHECKOUT_EXPIRED' });
      res.json({ url: session.url, sessionId:session.id, status:'open' });
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/orders/:sessionId", async (req, res, next) => {
    if (!stripe)
      return res.status(503).json({ error: "Payments are not configured." });
    const token = req.get("x-checkout-token");
    if (
      !/^cs_(test_|live_)?[a-zA-Z0-9]{8,200}$/.test(req.params.sessionId) ||
      !token ||
      !/^[a-f0-9-]{36}$/.test(token)
    )
      return res.status(400).json({ error: "Invalid order request." });
    try {
      const session = await stripe.checkout.sessions.retrieve(
        req.params.sessionId,
        { expand: ['payment_intent'] },
      );
      const actual = Buffer.from(session.client_reference_id ?? "");
      const supplied = Buffer.from(token);
      if (
        actual.length !== supplied.length ||
        !timingSafeEqual(actual, supplied) ||
        session.metadata?.store !== "aalan"
      )
        return res.status(404).json({ error: "Order not found." });
      await recordPayment(stripe, store, session.id, session);
      res.json({
        status: paymentState(session),
        order: (await store.order(session.id)) ?? null,
      });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/newsletter", async (req, res) => {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      req.body.consent !== true
    )
      return res
        .status(400)
        .json({ error: "Enter a valid email and agree to subscribe." });
    await store.subscribe(email);
    res.json({ subscribed: true });
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Endpoint not found." }),
  );
  if (serveStatic)
    app.use(
      express.static(resolve("dist"), {
        maxAge: "1h",
        setHeaders(res, path) {
          if (path.endsWith("index.html")) res.set("Cache-Control", "no-cache");
        },
      }),
    );
  app.use((error, _req, res, _next) => {
    if (error.code === 'resource_missing') return res.status(404).json({error:'Checkout session not found.'});
    const badRequest =
      error.type === "entity.parse.failed" || error.type === "entity.too.large";
    console.error("Request failed:", error.type || error.code || error.name);
    res.status(badRequest ? 400 : 500).json({
      error: badRequest
        ? "Invalid request body."
        : "Unable to complete the request. Please try again.",
    });
  });
  return app;
}
