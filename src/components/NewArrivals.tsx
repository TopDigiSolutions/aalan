import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { products } from "../lib/catalog";
import ProductCard from "./ProductCard";

export default function NewArrivals() {
  const newProducts = products.filter((p) => p.collection === "new");

  return (
    <section id="new-arrivals" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-rose-600">
            <Sparkles size={14} className="text-rose-600" />
            FRESH FROM THE ATELIER
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              New Arrivals
            </h2>
            <span className="rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-black text-neutral-600">
              {newProducts.length} STYLES
            </span>
          </div>
        </div>

        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-900 transition-colors hover:text-rose-600"
        >
          <span>VIEW COMPLETE ARCHIVE</span>
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {newProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
