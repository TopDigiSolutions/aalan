import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ShopProvider, useShop } from './lib/shop';
import { readAttempt, saveAttempt } from './lib/checkout-attempt';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Cart from './pages/Cart';
const id = 'cs_test_ui12345678';
const items = [{ id: 'men-1', size: 'M', quantity: 1 }];
function seed() { localStorage.setItem('aalan-shop-v1', JSON.stringify({ cart: items, wishlist: [] })); saveAttempt({ token: crypto.randomUUID(), items, fingerprint: JSON.stringify(items), created: Date.now(), sessionId: id }); }
function Count() { return <span data-testid="bag-count">{useShop().count}</span>; }
function mount(path = `/checkout/success?session_id=${id}`) { return render(<MemoryRouter initialEntries={[path]}><ShopProvider><Count /><Routes><Route path="/checkout/success" element={<CheckoutSuccess />} /><Route path="/cart" element={<Cart />} /></Routes></ShopProvider></MemoryRouter>); }
function mockResponse(body: unknown, ok = true) { return { ok, status: ok ? 200 : 500, json: async () => body }; }
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); seed(); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
test.each([
  ['failed', 'Payment failed.'], ['expired', 'This checkout has expired.'], ['canceled', 'Payment canceled.'], ['requires_action', 'Your bank requires authentication.'],
])('%s confirmation keeps the bag and shows the correct instruction', async (status, message) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ status, order: null })));
  mount(); await waitFor(() => expect(screen.getByRole('status').textContent).toContain(message));
  expect(screen.getByTestId('bag-count').textContent).toBe('1'); expect(screen.queryByText(/Paid:/)).toBeNull();
});
test('verified success clears purchased quantities and survives remount', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ status: 'paid', order: { amount: 12900 } })));
  const view = mount(); await screen.findByText('Paid: $129.00'); expect(screen.getByTestId('bag-count').textContent).toBe('0');
  view.unmount(); mount(); await screen.findByText('Paid: $129.00'); expect(screen.getByTestId('bag-count').textContent).toBe('0');
});
test('server failure never shows success or clears the bag', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ error: 'Verification unavailable' }, false)));
  mount(); await screen.findByText('Verification unavailable'); expect(screen.getByTestId('bag-count').textContent).toBe('1');
});
test('missing browser token does not request or claim a payment', async () => {
  sessionStorage.clear(); const request = vi.fn(); vi.stubGlobal('fetch', request); mount();
  await screen.findByText(/Open this confirmation in the browser/); expect(request).not.toHaveBeenCalled();
});
test('pending checks are bounded to ten attempts and stop on unmount', async () => {
  vi.useFakeTimers(); const request = vi.fn().mockResolvedValue(mockResponse({ status: 'pending', order: null })); vi.stubGlobal('fetch', request);
  const view = mount(); await act(async () => { await vi.advanceTimersByTimeAsync(31000); });
  expect(request).toHaveBeenCalledTimes(10); expect(screen.getByRole('status').textContent).toContain('still processing');
  view.unmount(); await act(async () => { await vi.advanceTimersByTimeAsync(60000); }); expect(request).toHaveBeenCalledTimes(10);
});
test('pending followed by paid confirms and stops polling', async () => {
  vi.useFakeTimers(); const request = vi.fn().mockResolvedValueOnce(mockResponse({ status: 'pending', order: null })).mockResolvedValue(mockResponse({ status: 'paid', order: { amount: 12900 } })); vi.stubGlobal('fetch', request);
  mount(); await act(async () => { await vi.advanceTimersByTimeAsync(30000); }); expect(request).toHaveBeenCalledTimes(2); expect(screen.getByText('Paid: $129.00')).toBeTruthy();
});
test('unmount aborts confirmation fetch', async () => {
  const request = vi.fn().mockImplementation(() => new Promise(() => { })); vi.stubGlobal('fetch', request); const view = mount();
  const signal = request.mock.calls[0][1].signal; view.unmount(); expect(signal.aborted).toBe(true);
});
test('earlier checkout keeps its own token after a second attempt starts', async () => {
  const original = readAttempt(id)!; saveAttempt({ ...original, token: crypto.randomUUID(), sessionId: 'cs_test_other123456' });
  const request = vi.fn().mockResolvedValue(mockResponse({ status: 'paid', order: { amount: 12900 } })); vi.stubGlobal('fetch', request); mount();
  await screen.findByText('Paid: $129.00'); expect(request.mock.calls[0][1].headers['X-Checkout-Token']).toBe(original.token);
});
test('cancel return preserves bag and displays cancellation', () => { mount('/cart?canceled=1'); expect(screen.getByRole('status').textContent).toContain('Checkout canceled'); expect(screen.getByTestId('bag-count').textContent).toBe('1'); });
test('expired checkout allows a fresh identifier on explicit retry', async () => {
  const original = readAttempt()!.token;
  const request = vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: 'Expired checkout', code: 'CHECKOUT_EXPIRED' }) }); vi.stubGlobal('fetch', request); mount('/cart');
  fireEvent.click(screen.getByRole('button', { name: 'CHECKOUT WITH STRIPE' })); await screen.findByText('Expired checkout');
  fireEvent.click(screen.getByRole('button', { name: 'CHECKOUT WITH STRIPE' })); await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  expect(request.mock.calls[0][1].headers['Idempotency-Key']).toBe(original); expect(request.mock.calls[1][1].headers['Idempotency-Key']).not.toBe(original);
});
test('already-completed checkout redirects to verification without another payment link', async () => {
  const request = vi.fn().mockResolvedValueOnce(mockResponse({ status: 'complete', sessionId: id })).mockResolvedValue(mockResponse({ status: 'paid', order: { amount: 12900 } })); vi.stubGlobal('fetch', request); mount('/cart');
  fireEvent.click(screen.getByRole('button', { name: 'CHECKOUT WITH STRIPE' })); await screen.findByText('Paid: $129.00'); expect(request).toHaveBeenCalledTimes(2);
});
