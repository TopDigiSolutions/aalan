import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Lock,
  Trash2,
} from "lucide-react";
import { useShop } from "../lib/shop";
import { useToast } from "../lib/toast";
import { money, products } from "../lib/catalog";
import { api, ApiError } from "../lib/api";
import { readAttempt, saveAttempt } from "../lib/checkout-attempt";
import { PaymentBadges } from "../components/PaymentIcons";

export default function Cart() {
  const { cart, update, message } = useShop();
  const { addToast } = useToast();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const total = cart.reduce(
    (sum, item) =>
      sum + products.find((p) => p.id === item.id)!.price * item.quantity,
    0,
  );

  async function checkout() {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    try {
      const fingerprint = JSON.stringify(cart);
      let attempt = readAttempt();
      if (!attempt || attempt.completed || attempt.fingerprint !== fingerprint)
        attempt = {
          token: crypto.randomUUID(),
          fingerprint,
          items: cart,
          created: Date.now(),
        };
      saveAttempt(attempt);
      const response = await api<{
        url?: string;
        sessionId: string;
        status: "open" | "complete";
      }>("/api/checkout", {
        method: "POST",
        signal: abort.signal,
        headers: { "Idempotency-Key": attempt.token },
        body: JSON.stringify({ items: cart }),
      });
      saveAttempt({ ...attempt, sessionId: response.sessionId });
      if (response.status === "complete") {
        navigate(
          `/checkout/success?session_id=${encodeURIComponent(response.sessionId)}`,
        );
        return;
      }
      const url = new URL(response.url || "");
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
        throw new Error("Invalid checkout destination.");
      window.location.assign(url.href);
    } catch (error) {
      if (error instanceof ApiError && error.code === "CHECKOUT_EXPIRED") {
        const attempt = readAttempt();
        if (attempt) {
          try {
            saveAttempt({ ...attempt, completed: true });
          } catch {
            /* display original error */
          }
        }
      }
      if (!abort.signal.aborted) {
        const errMsg =
          error instanceof Error
            ? error.message
            : "Checkout failed. Enable browser storage and try again.";
        setError(errMsg);
        addToast({
          type: "error",
          title: "Checkout Error",
          description: errMsg,
        });
      }
    } finally {
      if (!abort.signal.aborted) setBusy(false);
      controller.current = null;
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-50/60 py-12">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between border-b border-neutral-200 pb-4">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
            Your Bag
          </h1>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            {cart.reduce((sum, i) => sum + i.quantity, 0)} Items
          </span>
        </div>

        {params.has("canceled") && (
          <div
            role="status"
            className="mb-6 rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs font-bold text-amber-800"
          >
            Checkout canceled. Your items are still here.
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl bg-blue-50 p-4 border border-blue-200 text-xs font-bold text-blue-800"
          >
            {message}
          </div>
        )}

        {cart.length ? (
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            {/* Items List */}
            <div className="space-y-4 lg:col-span-7">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.id)!;
                return (
                  <article
                    key={`${item.id}:${item.size}`}
                    className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-neutral-200/70 transition-all hover:shadow-md"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-28 w-20 rounded-xl object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="font-extrabold text-sm sm:text-base text-neutral-900 transition-colors hover:text-rose-600"
                          >
                            {product.name}
                          </Link>
                          <strong className="text-sm sm:text-base font-black text-neutral-950">
                            {money(product.price * item.quantity)}
                          </strong>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-neutral-600">
                          Size {item.size} · {money(product.price)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                          <span>Quantity</span>
                          <select
                            disabled={busy}
                            className="rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs font-bold text-neutral-900 outline-none transition-colors focus:border-neutral-950"
                            value={item.quantity}
                            onChange={(e) =>
                              update(item.id, item.size, Number(e.target.value))
                            }
                          >
                            {Array.from({ length: 10 }, (_, i) => (
                              <option key={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </label>

                        <button
                          disabled={busy}
                          onClick={() => update(item.id, item.size, 0)}
                          className="flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-rose-600 transition-colors underline"
                          aria-label={`Remove ${product.name}, size ${item.size}`}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Order Summary Box */}
            <div className="rounded-3xl bg-white p-6 shadow-md border border-neutral-200/80 lg:col-span-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                Order Summary
              </h2>

              <div className="mt-4 space-y-2 text-xs font-semibold text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">
                    {money(total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Express Shipping</span>
                  <span className="font-bold text-emerald-600">
                    Complimentary
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes & Duties</span>
                  <span className="font-bold text-neutral-900">Included</span>
                </div>
              </div>

              <div className="mt-4 border-t border-neutral-100 pt-4">
                <p className="text-xl font-bold">Total: {money(total)}</p>
                <p className="my-2 text-xs text-neutral-600">
                  USD. No additional shipping charge is applied by this store.
                  Pay securely through Stripe. No account needed.
                </p>

                {error && (
                  <p
                    role="alert"
                    className="my-3 rounded-lg bg-rose-50 p-2.5 text-xs font-bold text-rose-700 border border-rose-200"
                  >
                    {error}
                  </p>
                )}

                <button
                  onClick={checkout}
                  disabled={busy}
                  className="btn-sheen-sweep group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 p-4 font-bold text-white shadow-lg transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-50"
                >
                  <Lock size={15} />
                  <span>
                    {busy ? "Opening secure checkout…" : "CHECKOUT WITH STRIPE"}
                  </span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <div className="mt-5 flex items-center justify-center gap-4 text-[11px] font-semibold text-neutral-600">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Stripe Encrypted
                  </span>
                  <span>•</span>
                  <span>30-Day Returns</span>
                </div>

                <div className="mt-4 flex flex-col items-center justify-center gap-2 border-t border-neutral-100 pt-4">
                  <PaymentBadges
                    showLabel={true}
                    labelPrefix="We Accept"
                    theme="light"
                    badgeSize="h-5 w-8"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-16 text-center shadow-sm border border-neutral-200/60 max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <ShoppingBag size={28} />
            </div>
            <h3 className="mt-4 text-xl font-black text-neutral-900">
              Your bag is empty.
            </h3>
            <p className="mt-2 text-xs text-neutral-600">
              Explore the latest runway arrivals and seasonal archive styles.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-rose-600 transition-colors"
            >
              <span>Explore the collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
