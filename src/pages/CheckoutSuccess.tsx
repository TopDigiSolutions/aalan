import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useShop } from "../lib/shop";
import { readAttempt, saveAttempt } from '../lib/checkout-attempt';
import { api } from "../lib/api";
import { money } from "../lib/catalog";
export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const id = params.get("session_id");
  const { complete } = useShop();
  const completeRef = useRef(complete);
  completeRef.current = complete;
  const [status, setStatus] = useState("Checking your payment…"),
    [amount, setAmount] = useState<number | null>(null),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    setAmount(null);
    setStatus('Checking your payment…');
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    async function check() {
      try {
        const attempt = id ? readAttempt(id) : null;
        if (!id || !attempt?.token)
          throw new Error(
            "Open this confirmation in the browser where you started checkout.",
          );
        const result = await api<{
          status: string;
          order: { amount: number } | null;
        }>(`/api/orders/${encodeURIComponent(id)}`, {
          signal: controller.signal,
          headers: { "X-Checkout-Token": attempt.token },
        });
        if (controller.signal.aborted) return;
        if (result.status === "paid" && result.order) {
          setStatus("Payment confirmed. Thank you for your order!");
          setAmount(result.order.amount);
          completeRef.current(attempt.token, attempt.items);
          try { saveAttempt({...attempt,completed:true}); } catch { /* payment remains verified if storage becomes unavailable */ }
        } else if (result.status === "expired") {
          try { saveAttempt({...attempt,completed:true}); } catch { /* retain expiry message */ }
          setStatus(
            "This checkout has expired. Return to your bag to try again.",
          );
        } else if (result.status === 'failed') {
          setStatus('Payment failed. Your bag is unchanged. Return to your bag and try another payment method.');
        } else if (result.status === 'canceled') {
          try { saveAttempt({...attempt,completed:true}); } catch { /* retain cancellation message */ }
          setStatus('Payment canceled. Your bag is unchanged.');
        } else if (result.status === 'requires_action') {
          setStatus('Your bank requires authentication. Return to your bag and reopen checkout to finish verification.');
        } else if (++attempts < 10) {
          setStatus("Your payment is processing…");
          timer = setTimeout(check, 3000);
        } else setStatus("Payment is still processing. Check again shortly.");
      } catch (error) {
        if (!controller.signal.aborted)
          setStatus(
            error instanceof Error
              ? error.message
              : "Unable to verify payment.",
          );
      }
    }
    void check();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [id, retry]);
  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-50/60 py-16">
      <section className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl border border-neutral-100">
        <h1 className="mb-4 text-3xl font-black tracking-tight text-neutral-950">
          Order confirmation
        </h1>
        <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
          <p role="status" className="text-sm font-semibold text-neutral-800">
            {status}
          </p>
        </div>
        {amount !== null ? (
          <p className="mt-6 text-lg font-black text-emerald-600">
            Paid: {money(amount)}
          </p>
        ) : (
          <button
            className="mt-6 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-bold text-neutral-900 transition-colors hover:bg-neutral-50 active:scale-95"
            onClick={() => setRetry((value) => value + 1)}
          >
            Check again
          </button>
        )}
        <div className="mt-8 flex flex-col gap-2 border-t border-neutral-100 pt-6">
          <Link
            to="/shop"
            className="inline-block text-xs font-bold uppercase tracking-wider text-neutral-900 underline hover:text-rose-600"
          >
            Continue shopping
          </Link>
          <Link
            to="/cart"
            className="inline-block text-xs font-bold uppercase tracking-wider text-neutral-600 underline hover:text-neutral-950"
          >
            View bag
          </Link>
        </div>
      </section>
    </div>
  );
}
