import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Heart,
  Check,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { products, money } from "../lib/catalog";
import { useShop } from "../lib/shop";
import ProductCard from "../components/ProductCard";

export default function Shop({
  collection,
  wishlist = false,
}: {
  collection?: string;
  wishlist?: boolean;
}) {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("featured");
  const { wishlist: saved } = useShop();
  const category = params.get("category") || "ALL";
  const query = params.get("q") || "";
  const available = products.filter(
    (p) =>
      (!collection || p.collection === collection) &&
      (!wishlist || saved.includes(p.id)),
  );
  const categories = ["ALL", ...new Set(available.map((p) => p.category))];
  const shown = available.filter(
    (p) =>
      (category === "ALL" || p.category === category) &&
      `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  if (sort !== "featured")
    shown.sort((a, b) =>
      sort === "low" ? a.price - b.price : b.price - a.price,
    );
  const title = wishlist
    ? "Your wishlist"
    : collection === "men"
      ? "Men’s Edit"
      : collection === "women"
        ? "Women’s Edit"
        : collection === "sale"
          ? "Sale"
          : "Shop all";
  return (
    <>
      <section className="bg-black px-6 py-16 text-white">
        <h1 className="mx-auto max-w-7xl text-5xl font-black uppercase">
          {title}
        </h1>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <label htmlFor="search" className="mb-2 block font-bold">
          Search products
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            next.set("q", e.target.value);
            setParams(next, { replace: true });
          }}
          placeholder="Search by name or category"
          className="mb-6 w-full border p-3"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((value) => (
            <button
              key={value}
              aria-pressed={category === value}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("category", value);
                setParams(next);
              }}
              className={`border px-4 py-2 text-xs font-bold ${category === value ? "bg-black text-white" : ""}`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="my-6 flex items-center justify-between">
          <p aria-live="polite">{shown.length} products</p>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border p-2"
          >
            <option value="featured">Featured</option>
            <option value="low">Price low to high</option>
            <option value="high">Price high to low</option>
          </select>
        </div>
        {shown.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="py-16">
            No products found. Try another search or{" "}
            <Link className="underline" to="/shop">
              browse all products
            </Link>
            .
          </p>
        )}
      </section>
    </>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { add, toggle, wishlist, cart } = useShop();

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "care">(
    "details",
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-black uppercase text-neutral-900">
          Product Not Found
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          The requested garment is unavailable or has been archived.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-rose-600 transition-colors"
        >
          <span>Return To Shop</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  const full =
    cart.length >= 40 &&
    !cart.some((item) => item.id === product.id && item.size === selectedSize);
  const currentInCart =
    cart.find((item) => item.id === product.id && item.size === selectedSize)
      ?.quantity || 0;
  const limit = currentInCart >= 10;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    add({ id: product.id, size: selectedSize, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  // Related products from the same category or collection
  const related = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.collection === product.collection),
    )
    .slice(0, 4);

  // Gallery angles (hero main + styling zooms if remote Unsplash)
  const images = product.image.startsWith("http")
    ? [
        product.image,
        `${product.image}&auto=format&fit=crop&crop=faces,center&w=900&q=85`,
        `${product.image}&auto=format&fit=crop&crop=top,center&w=900&q=85`,
      ]
    : [product.image];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-neutral-100 bg-neutral-50/50 py-3.5 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-semibold text-neutral-500">
          <Link to="/" className="hover:text-neutral-950 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-neutral-950 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${product.category}`}
            className="hover:text-neutral-950 transition-colors uppercase"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="font-bold text-neutral-900 truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </nav>

      {/* Main Product Showcase Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail selector */}
            <div className="flex sm:flex-col gap-3 shrink-0 overflow-x-auto sm:overflow-visible">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-16 sm:h-24 sm:w-20 overflow-hidden rounded-xl border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? "border-neutral-950 shadow-md ring-1 ring-neutral-950"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Featured Image */}
            <div className="group relative flex-1 aspect-[3/4] overflow-hidden rounded-3xl bg-neutral-100 shadow-sm border border-neutral-200/80">
              <img
                src={images[activeImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {discountPercent && (
                  <span className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.collection === "new" && (
                  <span className="rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg">
                    NEW RUNWAY DROP
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggle(product.id)}
                aria-label={`${isWishlisted ? "Remove" : "Save"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
                className={`absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all active:scale-125 ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-600"
                    : "bg-white/90 text-neutral-800 hover:bg-white hover:text-rose-600"
                }`}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                  className={isWishlisted ? "text-rose-600" : ""}
                />
              </button>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-neutral-700">
                  {product.category} · CAPSULE 01
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                  <span>★★★★★</span>
                  <span className="text-neutral-500 font-semibold">
                    (4.9 · 128 Reviews)
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="mt-4 text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
                {product.name}
              </h1>

              {/* Price Display */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-black text-neutral-950">
                  {money(product.price)}
                </span>
                {product.originalPrice && (
                  <del className="text-lg font-semibold text-neutral-400">
                    {money(product.originalPrice)}
                  </del>
                )}
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  In Stock · Ready to Ship
                </span>
              </div>

              {/* Short Editorial Description */}
              <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                Precision-engineered silhouette cut from heavy 420gsm organic
                combed cotton. Features bespoke hardware, dropped shoulders, and
                subtle architectural seam structuring. Designed to transcend
                seasonal trends.
              </p>

              {/* Size Selector */}
              <div className="mt-8 border-t border-neutral-100 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-950">
                    Select Size:{" "}
                    {selectedSize ? (
                      <strong className="text-rose-600 ml-1">
                        {selectedSize}
                      </strong>
                    ) : (
                      <span className="text-neutral-400 font-normal">
                        Choose an option
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSize(product.sizes[1] || product.sizes[0])
                    }
                    className="text-xs font-bold text-neutral-500 underline hover:text-neutral-950"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSelectedSize(s);
                          setAdded(false);
                        }}
                        className={`h-11 min-w-11 px-4 rounded-xl text-xs font-black transition-all ${
                          isSelected
                            ? "bg-neutral-950 text-white shadow-md ring-2 ring-neutral-950 scale-105"
                            : "border border-neutral-200 bg-white text-neutral-800 hover:border-neutral-950 hover:text-neutral-950"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-950">
                  Quantity:
                </span>
                <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-lg font-black text-neutral-700 hover:bg-white transition-colors disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-black text-neutral-950">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= 10}
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-lg font-black text-neutral-700 hover:bg-white transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  disabled={!selectedSize || full || limit}
                  onClick={handleAddToCart}
                  className={`btn-sheen-sweep flex-1 flex h-14 items-center justify-center gap-2 rounded-2xl px-6 text-xs font-black uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95 ${
                    full || limit
                      ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                      : !selectedSize
                        ? "bg-neutral-100 text-neutral-500 cursor-not-allowed border border-neutral-200"
                        : added
                          ? "bg-emerald-600 text-white shadow-emerald-600/30"
                          : "bg-neutral-950 text-white hover:bg-rose-600 shadow-neutral-950/20"
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={18} className="stroke-[3]" />
                      <span>ADDED TO BAG</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>
                        {full
                          ? "BAG LIMIT REACHED"
                          : limit
                            ? "MAXIMUM 10 IN BAG"
                            : !selectedSize
                              ? "CHOOSE YOUR SIZE"
                              : "ADD TO BAG"}
                      </span>
                    </>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="flex h-14 items-center justify-center rounded-2xl border border-neutral-200 px-6 text-xs font-black uppercase tracking-widest text-neutral-900 hover:border-neutral-950 hover:bg-neutral-50 transition-colors"
                >
                  VIEW BAG
                </Link>
              </div>

              {/* Trust Guarantees */}
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-6">
                <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700">
                  <Truck size={16} className="text-rose-500 shrink-0" />
                  <span>Free Express On Orders $150+</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700">
                  <ShieldCheck size={16} className="text-rose-500 shrink-0" />
                  <span>Secure 256-Bit Stripe Payment</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700">
                  <RefreshCw size={16} className="text-rose-500 shrink-0" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700">
                  <Sparkles size={16} className="text-rose-500 shrink-0" />
                  <span>Guaranteed Authentic Atelier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Specifications Tabs */}
        <div className="mt-20 border-t border-neutral-200 pt-12">
          <div className="flex gap-8 border-b border-neutral-200">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors relative ${
                activeTab === "details"
                  ? "text-neutral-950 border-b-2 border-neutral-950"
                  : "text-neutral-400 hover:text-neutral-950"
              }`}
            >
              Fabric & Details
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors relative ${
                activeTab === "shipping"
                  ? "text-neutral-950 border-b-2 border-neutral-950"
                  : "text-neutral-400 hover:text-neutral-950"
              }`}
            >
              Shipping & Returns
            </button>
            <button
              onClick={() => setActiveTab("care")}
              className={`pb-4 text-xs font-black uppercase tracking-widest transition-colors relative ${
                activeTab === "care"
                  ? "text-neutral-950 border-b-2 border-neutral-950"
                  : "text-neutral-400 hover:text-neutral-950"
              }`}
            >
              Garment Care
            </button>
          </div>

          <div className="py-8 max-w-3xl text-sm text-neutral-600 leading-relaxed">
            {activeTab === "details" && (
              <div className="space-y-4">
                <p>
                  Engineered with an oversized silhouette tailored to drape
                  naturally over the shoulders. Developed using premium
                  ring-spun yarn treated for a vintage washed hand-feel that
                  softens over time.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-700 text-xs font-medium">
                  <li>Custom engraved matte hardware accents</li>
                  <li>Reinforced double-needle stitching along stress seams</li>
                  <li>Pre-shrunk organic combed cotton formulation</li>
                  <li>Ethically fabricated in limited numbered batches</li>
                </ul>
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="space-y-4">
                <p>
                  Orders placed before 2:00 PM EST dispatch same-day. Worldwide
                  express courier options are calculated directly at checkout
                  with all duties and taxes fully pre-paid.
                </p>
                <p className="text-xs text-neutral-500">
                  Returns are accepted within 30 days of parcel receipt. Every
                  order includes a complimentary pre-addressed return label.
                </p>
              </div>
            )}
            {activeTab === "care" && (
              <div className="space-y-4">
                <p>To maintain the architectural form and rich textile dye:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-700 text-xs font-medium">
                  <li>
                    Machine wash cold (30°C) inside out with gentle detergent
                  </li>
                  <li>
                    Do not tumble dry; reshape garment while damp and lay flat
                    to dry
                  </li>
                  <li>
                    Iron on reverse side at medium heat; avoid steam directly on
                    labels
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Recommended / Complete The Look Carousel */}
        {/* {related.length > 0 && (
          <div className="mt-20 border-t border-neutral-200 pt-16">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-600">
                  PAIR WITH THIS DROP
                </span>
                <h3 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
                  Complete The Look
                </h3>
              </div>
              <Link to="/shop" className="text-xs font-bold underline hover:text-rose-600">
                EXPLORE ALL
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )} */}
      </section>
    </div>
  );
}
