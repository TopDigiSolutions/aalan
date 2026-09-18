import { useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Sale from "./pages/Sale";
import Shop, { ProductDetail } from "./pages/Shop";
import Cart from "./pages/Cart";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import { ShopProvider } from "./lib/shop";
import { ToastProvider } from "./lib/toast";

function NavigationEffects() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    document.title =
      (pathname === "/"
        ? "Fashion Without Limits"
        : pathname.slice(1).split("/")[0]) + " | AALAN";
    const section = new URLSearchParams(search).get("section");
    if (section)
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    else if (!search) window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export function AppContent() {
  return (
    <div className="min-h-screen bg-white text-black">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
        className="sr-only focus:not-sr-only"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/men" element={<Men />} />
          <Route path="/women" element={<Women />} />
          <Route path="/sale" element={<Sale />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/wishlist" element={<Shop wishlist />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/account" element={<Navigate to="/shop" replace />} />
          <Route path="/login" element={<Navigate to="/shop" replace />} />
          <Route path="/signup" element={<Navigate to="/shop" replace />} />
          <Route
            path="/help"
            element={
              <section className="mx-auto max-w-2xl space-y-6 px-6 py-16">
                <h1 className="text-3xl font-bold">Shopping information</h1>
                <p>
                  Select your size and add products to your bag. You can change
                  quantities or remove items before paying.
                </p>
                <p>
                  Checkout is hosted securely by Stripe. AALAN does not store
                  card details. Payment is confirmed by the server before an
                  order is recorded.
                </p>
                <p>
                  Shop and check out without an account. Your bag and wishlist
                  are saved in this browser for your next visit. Clearing
                  browser data removes saved items; they do not sync across
                  devices.
                </p>
                <p>
                  Product photos are illustrative. Detailed size measurements,
                  delivery estimates, returns terms, and customer support
                  details have not yet been provided by the store.
                </p>
              </section>
            }
          />
          <Route
            path="*"
            element={
              <section className="px-6 py-20 text-center">
                <h1 className="text-3xl font-bold">Page not found</h1>
                <Link to="/shop" className="mt-4 block underline">
                  Browse products
                </Link>
              </section>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <ShopProvider>
          <NavigationEffects />
          <AppContent />
        </ShopProvider>
      </ToastProvider>
    </HashRouter>
  );
}
