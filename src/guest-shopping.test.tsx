import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppContent } from "./App";
import { ShopProvider } from "./lib/shop";

function Location() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}
function mount(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ShopProvider>
        <Location />
        <AppContent />
      </ShopProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test.each(["/login", "/signup", "/account", "/login?redirect=/cart"])(
  "old link %s opens the shop without authentication",
  async (path) => {
    mount(path);
    await waitFor(() =>
      expect(screen.getByTestId("location").textContent).toBe("/shop"),
    );
    expect(screen.queryByRole("link", { name: /sign in|account/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeTruthy();
    expect(screen.queryByText(/SIGN IN|CREATE ACCOUNT/)).toBeNull();
  },
);

test("guest product quantities survive reload and proceed directly to checkout", async () => {
  const request = vi
    .fn()
    .mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: "Payments unavailable" }),
    });
  vi.stubGlobal("fetch", request);
  const view = mount("/product/men-1");
  fireEvent.click(screen.getByRole("button", { name: "M" }));
  fireEvent.click(screen.getByRole("button", { name: "+" }));
  fireEvent.click(
    screen.getByRole("button", { name: "ADD TO BAG" }),
  );
  expect(JSON.parse(localStorage.getItem("aalan-shop-v1")!).cart).toEqual([
    { id: "men-1", size: "M", quantity: 2 },
  ]);
  view.unmount();
  mount("/cart");
  expect(screen.getByText("Total: $258.00")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "CHECKOUT WITH STRIPE" }));
  await screen.findByRole("alert");
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0][0]).toBe("/api/checkout");
  expect(JSON.parse(request.mock.calls[0][1].body).items[0].quantity).toBe(2);
  expect(screen.getByTestId("location").textContent).toBe("/cart");
});

test("unavailable browser storage still allows guest shopping for this visit", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  mount("/product/men-1");
  fireEvent.click(screen.getByRole("button", { name: "M" }));
  fireEvent.click(
    screen.getByRole("button", { name: "ADD TO BAG" }),
  );
  fireEvent.click(screen.getByRole("link", { name: "Shopping bag, 1 items" }));
  expect(screen.getByText("Total: $129.00")).toBeTruthy();
  expect(screen.getByText(/Browser storage is unavailable/)).toBeTruthy();
});
