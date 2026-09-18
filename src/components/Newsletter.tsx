import { useEffect, useRef, useState } from "react";
import { Mail, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";

export default function Newsletter() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  return (
    <section id="newsletter" className="relative overflow-hidden bg-neutral-950 py-24 text-white">
      {/* Radial Backlight */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-rose-600/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-md">
          <Sparkles size={13} className="text-rose-400" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-300">
            VIP ACCESS
          </span>
        </div>

        <h2 className="mt-4 text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
          Join The Inner Circle
        </h2>
        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-md mx-auto">
          Be first in line for secret archive drops, runway previews, and an exclusive 15% welcome credit.
        </p>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              role="status"
              className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-8 backdrop-blur-xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={30} />
              </div>
              <h3 className="mt-4 text-xl font-black text-white">You're Subscribed</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Welcome to AALAN. Check your inbox for your 15% archive code: <strong className="text-white">SS26</strong>
              </p>
            </motion.div>
          ) : (
            <form
              className="mt-10"
              onSubmit={async (e) => {
                e.preventDefault();
                if (controller.current) return;
                const abort = new AbortController();
                controller.current = abort;
                setBusy(true);
                setError("");
                try {
                  await api("/api/newsletter", {
                    method: "POST",
                    signal: abort.signal,
                    body: JSON.stringify({ email, consent: true }),
                  });
                  if (!abort.signal.aborted) setDone(true);
                } catch (error) {
                  if (!abort.signal.aborted) {
                    const errMsg =
                      error instanceof Error
                        ? error.message
                        : "Subscription failed.";
                    setError(errMsg);
                    addToast({
                      type: "error",
                      title: "Subscription Error",
                      description: errMsg,
                    });
                  }
                } finally {
                  if (!abort.signal.aborted) setBusy(false);
                  controller.current = null;
                }
              }}
            >
              <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                    <Mail size={18} />
                  </div>
                  <input
                    id="newsletter-email"
                    required
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL FOR 15% OFF"
                    className="h-14 w-full rounded-xl border border-white/20 bg-white/5 pl-11 pr-4 text-xs font-bold uppercase tracking-wider text-white placeholder-neutral-400 outline-none backdrop-blur-md transition-all focus:border-white focus:bg-white/10"
                  />
                </div>

                <button
                  disabled={busy}
                  className="btn-sheen-sweep flex h-14 items-center justify-center gap-2 rounded-xl bg-white px-8 text-xs font-black uppercase tracking-widest text-neutral-950 shadow-xl transition-all hover:bg-rose-600 hover:text-white disabled:opacity-50 active:scale-95"
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>SUBSCRIBING…</span>
                    </>
                  ) : (
                    <>
                      <span>JOIN NOW</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <label className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 text-left text-xs text-neutral-400">
                <input
                  required
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-rose-600 focus:ring-0"
                />
                <span>I agree to receive drop alerts & promotional codes from AALAN.</span>
              </label>

              {error && (
                <p role="alert" className="mt-4 text-xs font-bold text-rose-400">
                  {error}
                </p>
              )}
            </form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
