import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products } from "./catalog";
import { useToast } from "./toast";
export type CartItem = { id: string; size: string; quantity: number };
const key = "aalan-shop-v1";

function initial(
  storageKey = key,
  stored?: { cart: unknown; wishlist: string[]; completed: string[] },
): {
  cart: CartItem[];
  wishlist: string[];
  completed: string[];
} {
  try {
    const value =
      stored ?? JSON.parse(localStorage.getItem(storageKey) || "{}");
    const seen = new Set<string>();
    const cart = Array.isArray(value.cart)
      ? value.cart
          .filter((item: CartItem) => {
            const variant = `${item?.id}:${item?.size}`;
            if (
              !item ||
              seen.has(variant) ||
              !products.some(
                (p) => p.id === item.id && p.sizes.includes(item.size),
              ) ||
              !Number.isInteger(item.quantity) ||
              item.quantity < 1 ||
              item.quantity > 10
            )
              return false;
            seen.add(variant);
            return true;
          })
          .slice(0, 40)
      : [];
    return {
      cart,
      wishlist: Array.isArray(value.wishlist)
        ? [
            ...new Set<string>(
              value.wishlist.filter((id: string) =>
                products.some((p) => p.id === id),
              ),
            ),
          ]
        : [],
      completed: Array.isArray(value.completed)
        ? value.completed
            .filter((id: unknown) => typeof id === "string")
            .slice(-20)
        : [],
    };
  } catch {
    return { cart: [], wishlist: [], completed: [] };
  }
}

type Shop = ReturnType<typeof initial> & {
  add: (item: CartItem) => void;
  update: (id: string, size: string, quantity: number) => void;
  toggle: (id: string) => void;
  complete: (token: string, items: CartItem[]) => void;
  clearCart: () => void;
  count: number;
  message: string;
};

const Context = createContext<Shop | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => initial());
  const [message, setMessage] = useState("");
  const { addToast } = useToast();
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      setMessage("");
    } catch {
      setMessage(
        "Browser storage is unavailable. Your bag will last for this visit only.",
      );
    }
  }, [state]);

  const value = useMemo<Shop>(
    () => ({
      ...state,
      message,
      count: state.cart.reduce((sum, item) => sum + item.quantity, 0),
      clearCart() {
        setState((previous) => ({ ...previous, cart: [] }));
      },
      add(item) {
        const prod = products.find(
          (p) => p.id === item.id && p.sizes.includes(item.size),
        );
        if (!prod || !Number.isInteger(item.quantity) || item.quantity < 1)
          return;

        setState((previous) => {
          const exists = previous.cart.some(
            (row) => row.id === item.id && row.size === item.size,
          );
          if (!exists && previous.cart.length >= 40) {
            addToast({
              type: "error",
              title: "Bag Limit Reached",
              description:
                "You cannot add more than 40 unique items to your bag.",
            });
            return previous;
          }

          addToast({
            type: "success",
            title: "Added to Bag",
            description: `${prod.name} (Size ${item.size})`,
            image: prod.image,
          });

          return {
            ...previous,
            cart: exists
              ? previous.cart.map((row) =>
                  row.id === item.id && row.size === item.size
                    ? {
                        ...row,
                        quantity: Math.min(10, row.quantity + item.quantity),
                      }
                    : row,
                )
              : [
                  ...previous.cart,
                  { ...item, quantity: Math.min(10, item.quantity) },
                ],
          };
        });
      },
      update(id, size, quantity) {
        const prod = products.find((p) => p.id === id);
        if (quantity === 0 && prod) {
          addToast({
            type: "info",
            title: "Removed from Bag",
            description: `${prod.name} (Size ${size}) removed`,
            image: prod.image,
          });
        }

        setState((previous) => ({
          ...previous,
          cart: previous.cart
            .map((item) =>
              item.id === id && item.size === size
                ? { ...item, quantity: Math.min(10, Math.max(0, quantity)) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      toggle(id) {
        const prod = products.find((p) => p.id === id);
        setState((previous) => {
          const isWishlisted = previous.wishlist.includes(id);
          if (prod) {
            addToast({
              type: isWishlisted ? "info" : "success",
              title: isWishlisted
                ? "Removed from Wishlist"
                : "Saved to Wishlist",
              description: prod.name,
              image: prod.image,
            });
          }
          return {
            ...previous,
            wishlist: isWishlisted
              ? previous.wishlist.filter((value) => value !== id)
              : [...previous.wishlist, id],
          };
        });
      },
      complete(token, items) {
        // Store receipt markers with the bag; repeated confirmations must be harmless.
        setState((previous) =>
          previous.completed.includes(token)
            ? previous
            : {
                ...previous,
                completed: [...previous.completed, token].slice(-20),
                cart: previous.cart.flatMap((row) => {
                  const purchased = items.find(
                    (item) => item.id === row.id && item.size === row.size,
                  );
                  const quantity = row.quantity - (purchased?.quantity || 0);
                  return quantity > 0 ? [{ ...row, quantity }] : [];
                }),
              },
        );
      },
    }),
    [state, message, addToast],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useShop() {
  const shop = useContext(Context);
  if (!shop) throw new Error("ShopProvider is required");
  return shop;
}
