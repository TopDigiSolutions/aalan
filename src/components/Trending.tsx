import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import { products } from "../lib/catalog";
import ProductCard from "./ProductCard";

const tabs = ["ALL", "STREETWEAR", "ACTIVEWEAR", "FOOTWEAR"];

export default function Trending() {
  const [tab, setTab] = useState("ALL");

  const filteredProducts = products.filter(
    (p) =>
      p.collection === "trending" &&
      (tab === "ALL" || p.category === tab),
  );

  return (
    <section id="trending" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-rose-600">
            <Flame size={14} className="text-rose-600" />
            HIGH DEMAND
          </div>
          <h2 className="mt-1 text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
            Trending Now
          </h2>
        </div>
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-900 transition-colors hover:text-rose-600"
        >
          <span>EXPLORE ALL PIECES</span>
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Satisfying Gliding Pill Tabs */}
      <div className="flex gap-2 overflow-x-auto py-8 no-scrollbar">
        {tabs.map((value) => {
          const isActive = tab === value;
          return (
            <button
              key={value}
              onClick={() => setTab(value)}
              aria-pressed={isActive}
              className={`relative rounded-full px-5 py-2.5 text-xs font-extrabold tracking-wider transition-colors select-none ${
                isActive ? "text-white" : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTrendingTab"
                  className="absolute inset-0 rounded-full bg-neutral-950 shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{value}</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
