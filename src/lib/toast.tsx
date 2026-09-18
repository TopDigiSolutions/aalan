import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastItem = {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
  image?: string;
};

type ToastContextType = {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Math.random());
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Render Container - Top Right */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-24 right-5 z-50 flex w-full max-w-sm flex-col gap-3 px-4"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`pointer-events-auto flex items-center gap-3.5 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${
                t.type === "error"
                  ? "bg-neutral-950/95 text-white border-rose-600/70 shadow-rose-950/30"
                  : t.type === "success"
                    ? "bg-neutral-950/95 text-white border-neutral-800 shadow-neutral-950/40"
                    : "bg-neutral-900/95 text-white border-neutral-700"
              }`}
            >
              {t.image ? (
                <img
                  src={t.image}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-xl object-cover border border-white/20"
                />
              ) : (
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    t.type === "error"
                      ? "bg-rose-500/20 text-rose-400"
                      : t.type === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-white/10 text-neutral-300"
                  }`}
                >
                  {t.type === "error" ? (
                    <AlertTriangle size={20} />
                  ) : t.type === "success" ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Info size={20} />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-white truncate">
                  {t.title}
                </h4>
                {t.description && (
                  <p className="mt-0.5 text-xs font-semibold text-neutral-300 line-clamp-2">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-neutral-400 hover:text-white p-1 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
}
