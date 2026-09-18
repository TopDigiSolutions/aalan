import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";
import { ShopProvider, useShop } from "./lib/shop";
import { ToastProvider } from "./lib/toast";
import { products } from "./lib/catalog";
import ProductCard from "./components/ProductCard";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("checkout errors preserve the bag and reuse the identifier on retry", async () => {
  localStorage.setItem(
    "aalan-shop-v1",
    JSON.stringify({
      cart: [{ id: "men-1", size: "M", quantity: 1 }],
      wishlist: [],
    }),
  );
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Payments unavailable" }),
  });
  vi.stubGlobal("fetch", fetchMock);
  mount(<Cart />);
  fireEvent.click(screen.getByRole("button", { name: "CHECKOUT WITH STRIPE" }));
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toBe("Payments unavailable"),
  );
  const token = fetchMock.mock.calls[0][1].headers["Idempotency-Key"];
  expect(screen.getByText("Total: $129.00")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "CHECKOUT WITH STRIPE" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(fetchMock.mock.calls[1][1].headers["Idempotency-Key"]).toBe(token);
});

test("leaving checkout aborts its in-flight network request", () => {
  localStorage.setItem(
    "aalan-shop-v1",
    JSON.stringify({
      cart: [{ id: "men-1", size: "M", quantity: 1 }],
      wishlist: [],
    }),
  );
  const fetchMock = vi.fn().mockImplementation(() => new Promise(() => {}));
  vi.stubGlobal("fetch", fetchMock);
  const view = mount(<Cart />);
  fireEvent.click(screen.getByRole("button", { name: "CHECKOUT WITH STRIPE" }));
  const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
  expect(signal.aborted).toBe(false);
  view.unmount();
  expect(signal.aborted).toBe(true);
});
function State() {
  const shop = useShop();
  return (
    <>
      <output data-testid="count">{shop.count}</output>
      <button
        onClick={() =>
          shop.complete("receipt-1", [{ id: "men-1", size: "M", quantity: 1 }])
        }
      >
        Confirm receipt
      </button>
    </>
  );
}
function mount(children: React.ReactNode) {
  return render(
    <StrictMode>
      <MemoryRouter>
        <ToastProvider>
          <ShopProvider>{children}</ShopProvider>
        </ToastProvider>
      </MemoryRouter>
    </StrictMode>,
  );
}
test("requires a size, adds items, limits quantity, and persists bag", () => {
  mount(
    <>
      <State />
      <ProductCard product={products[0]} />
    </>,
  );
  expect(
    screen.getByRole("button", { name: "ADD TO BAG" }).hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "M" } });
  fireEvent.click(screen.getByRole("button", { name: "ADD TO BAG" }));
  expect(screen.getByTestId("count").textContent).toBe("1");
  for (let i = 0; i < 12; i++)
    fireEvent.click(
      screen.getByRole("button", { name: /ADD ANOTHER|MAXIMUM 10/ }),
    );
  expect(screen.getByTestId("count").textContent).toBe("10");
  expect(
    JSON.parse(localStorage.getItem("aalan-shop-v1")!).cart[0].quantity,
  ).toBe(10);
});
test("wishlisting toggles accessibly and persists", () => {
  mount(<ProductCard product={products[0]} />);
  fireEvent.click(screen.getByRole("button", { name: /Save .* wishlist/ }));
  expect(
    screen
      .getByRole("button", { name: /Remove .* wishlist/ })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(JSON.parse(localStorage.getItem("aalan-shop-v1")!).wishlist).toEqual([
    "men-1",
  ]);
});
test("filters and sorts real catalog products", () => {
  mount(<Shop collection="men" />);
  fireEvent.click(screen.getByRole("button", { name: "SHOES" }));
  expect(screen.getByText("1 products")).toBeTruthy();
  expect(screen.queryByText("Oversized Bomber")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "ALL" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Sort products" }), {
    target: { value: "low" },
  });
  expect(
    within(screen.getAllByRole("article")[0]).getByText("Dad Cap"),
  ).toBeTruthy();
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "no-such-product" },
  });
  expect(screen.getByText(/No products found/)).toBeTruthy();
});
test("corrupted saved data does not break the storefront", () => {
  localStorage.setItem(
    "aalan-shop-v1",
    JSON.stringify({
      cart: [null, { id: "fake", size: "M", quantity: 1 }],
      wishlist: ["fake"],
    }),
  );
  mount(<State />);
  expect(screen.getByTestId("count").textContent).toBe("0");
});
test("repeat payment confirmation cannot remove a later addition", () => {
  mount(
    <>
      <State />
      <ProductCard product={products[0]} />
    </>,
  );
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "M" } });
  fireEvent.click(screen.getByRole("button", { name: "ADD TO BAG" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirm receipt" }));
  expect(screen.getByTestId("count").textContent).toBe("0");
  fireEvent.click(screen.getByRole("button", { name: /ADD ANOTHER/ }));
  fireEvent.click(screen.getByRole("button", { name: "Confirm receipt" }));
  expect(screen.getByTestId("count").textContent).toBe("1");
});
test("cart quantities update totals and removal empties bag", () => {
  localStorage.setItem(
    "aalan-shop-v1",
    JSON.stringify({
      cart: [{ id: "men-1", size: "M", quantity: 1 }],
      wishlist: [],
    }),
  );
  mount(<Cart />);
  expect(screen.getByText("Total: $129.00")).toBeTruthy();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
  expect(screen.getByText("Total: $258.00")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Remove Oversized/ }));
  expect(screen.getByText(/Your bag is empty/)).toBeTruthy();
});
