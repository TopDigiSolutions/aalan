import { Link } from "react-router-dom";
import { ArrowRight, Flame, Percent } from "lucide-react";
import { products } from "../lib/catalog";
import ProductCard from "./ProductCard";

export default function SaleOffers() {
  const saleProducts = products
    .filter((p) => p.collection === "sale")
    .slice(0, 4);

  return (
    <section id="sale" className="relative overflow-hidden bg-neutral-950 py-24 text-white">
      {/* Ambient Red Glow in Background */}
      <div className="pointer-events-none absolute right-10 top-10 h-96 w-96 rounded-full bg-rose-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute left-10 bottom-10 h-96 w-96 rounded-full bg-rose-900/15 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Banner Callout */}
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-rose-500 live-pulse-dot" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-400">
              LIMITED TIME ARCHIVE DROP
            </span>
          </div>

          <h2 className="mt-4 text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none">
            UP TO <span className="text-rose-500">50%</span> OFF
          </h2>

          <p className="mt-4 max-w-lg text-sm sm:text-base text-neutral-300 font-medium">
            Selected archive silhouettes & seasonal pieces. Prices as marked. Complimentary shipping on orders over $150.
          </p>

          <Link
            to="/sale"
            className="btn-sheen-sweep group mt-8 inline-flex items-center gap-3 rounded-full bg-rose-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-rose-600/30 transition-all hover:bg-rose-500 active:scale-95"
          >
            <span>SHOP COMPLETE SALE ARCHIVE</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Featured 4 Sale Products */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
