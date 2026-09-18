import { products } from './catalog';
import type { CartItem } from './shop';
export type CheckoutAttempt = { token: string; fingerprint: string; items: CartItem[]; created: number; sessionId?: string; completed?: boolean };
const activeKey = 'aalan-checkout';
const historyKey = 'aalan-checkout-history';
function valid(value: unknown): value is CheckoutAttempt {
  const attempt = value as CheckoutAttempt | null;
  return Boolean(attempt && typeof attempt.token === 'string' && /^[a-f0-9-]{36}$/.test(attempt.token) && Number.isFinite(attempt.created) && Array.isArray(attempt.items) && attempt.items.length <= 40 && attempt.items.every(item => item && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 10 && products.some(product => product.id === item.id && product.sizes.includes(item.size))));
}
export function readAttempt(sessionId?: string): CheckoutAttempt | null {
  try {
    if (sessionId) {
      const history: unknown = JSON.parse(sessionStorage.getItem(historyKey) || '[]');
      if (Array.isArray(history)) {
        const found = history.find(value => valid(value) && value.sessionId === sessionId);
        if (found) return found;
      }
    }
    const active: unknown = JSON.parse(sessionStorage.getItem(activeKey) || 'null');
    return valid(active) && (!sessionId || !active.sessionId || active.sessionId === sessionId) ? active : null;
  } catch { return null; }
}
export function saveAttempt(attempt: CheckoutAttempt) {
  sessionStorage.setItem(activeKey,JSON.stringify(attempt));
  if (!attempt.sessionId) return;
  let history: CheckoutAttempt[] = [];
  try { const value = JSON.parse(sessionStorage.getItem(historyKey) || '[]'); if (Array.isArray(value)) history = value.filter(valid); } catch { /* replace corrupt storage */ }
  sessionStorage.setItem(historyKey,JSON.stringify([...history.filter(value => value.sessionId !== attempt.sessionId),attempt].slice(-20)));
}
