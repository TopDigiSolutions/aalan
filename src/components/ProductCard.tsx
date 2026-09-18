import { useState } from "react";
import { Heart, Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { money, type Product } from "../lib/catalog";
import { useShop } from "../lib/shop";

// Safe mock for test environments (jsdom) lacking IntersectionObserver
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  // @ts-expect-error fallback for headless test runners
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

export default function ProductCard({ product }: { product: Product }) {
  const { add, toggle, wishlist, cart } = useShop();

  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [justToggledHeart, setJustToggledHeart] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const full =
    cart.length >= 40 &&
    !cart.some((item) => item.id === product.id && item.size === size);
  const limit = cart.some(
    (item) =>
      item.id === product.id && item.size === size && item.quantity >= 10,
  );

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  const handleWishlist = () => {
    setJustToggledHeart(true);
    toggle(product.id);
    setTimeout(() => setJustToggledHeart(false), 300);
  };

  const handleAddToCart = () => {
    add({ id: product.id, size, quantity: 1 });
    setAdded(true);
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] border border-neutral-200/80">
      <div>
        {/* Product Image Box */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-100">
          <Link to={`/product/${product.id}`} className="block h-full w-full">
            <img
              loading="lazy"
              decoding="async"
              width="640"
              height="853"
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {discountPercent && (
              <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            {product.collection === "new" && (
              <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                NEW IN
              </span>
            )}
          </div>

          {/* Wishlist Heart Button with Pop Spring */}
          <button
            aria-label={`${isWishlisted ? "Remove" : "Save"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
            aria-pressed={isWishlisted}
            onClick={handleWishlist}
            className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all active:scale-125 ${
              isWishlisted
                ? "bg-rose-50 text-rose-600"
                : "bg-white/90 text-neutral-800 hover:bg-white hover:text-rose-600"
            }`}
          >
            <motion.div
              animate={justToggledHeart ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <Heart
                size={17}
                fill={isWishlisted ? "currentColor" : "none"}
                className={`transition-colors ${
                  isWishlisted ? "text-rose-600" : "text-neutral-700"
                }`}
              />
            </motion.div>
          </button>
        </div>

        {/* Product Meta */}
        <div className="mt-3.5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">
            {product.category}
          </p>
          <Link
            to={`/product/${product.id}`}
            className="block text-sm font-bold text-neutral-950 hover:text-rose-600 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-sm font-black text-neutral-950">
              {money(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-semibold text-neutral-400 line-through">
                {money(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Size Selector & Add to Bag */}
      <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
        {/* Size Selection Dropdown */}
        <div className="relative">
          <select
            aria-label={`Select size for ${product.name}`}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-800 outline-none transition-colors focus:border-neutral-900 focus:bg-white pr-8"
          >
            <option value="">Select Size</option>
            {product.sizes.map((s) => (
              <option key={s} value={s}>
                Size {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />
        </div>

        {/* Dynamic Add to Bag Button */}
        <button
          onClick={handleAddToCart}
          disabled={!size || full || limit}
          className={`btn-sheen-sweep relative flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-neutral-950 text-white hover:bg-rose-600 shadow-sm"
          }`}
        >
          {added ? (
            <>
              <Check size={14} />
              <span>ADD ANOTHER</span>
            </>
          ) : limit ? (
            <span>MAX (10) REACHED</span>
          ) : full ? (
            <span>BAG FULL (40)</span>
          ) : (
            <span>ADD TO BAG</span>
          )}
        </button>
      </div>
    </article>
  );
}
