import { Link } from "react-router-dom";
import { ArrowUpRight, Truck, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";

const categories = [
  {
    label: "MEN",
    to: "/men",
    desc: "Tailored silhouettes & oversized outerwear",
    image:
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
    badge: "12 PIECES",
  },
  {
    label: "WOMEN",
    to: "/women",
    desc: "Fluid draping & contemporary staples",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    badge: "12 PIECES",
  },
  {
    label: "SHOES",
    to: "/shop?category=SHOES",
    desc: "Sculpted boots & minimalist footwear",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    badge: "FOOTWEAR",
  },
  {
    label: "STREETWEAR",
    to: "/shop?category=STREETWEAR",
    desc: "Heavyweight hoodies & cargo silhouettes",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    badge: "HOT DROP",
  },
  {
    label: "ACTIVEWEAR",
    to: "/shop?category=ACTIVEWEAR",
    desc: "High-performance moisture-wicking tech",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80",
    badge: "RUNWAY",
  },
];

const perks = [
  {
    icon: Truck,
    title: "Global Express Delivery",
    subtitle: "Complimentary on orders over $150",
  },
  {
    icon: ShieldCheck,
    title: "Direct Stripe Security",
    subtitle: "256-bit encrypted checkout",
  },
  {
    icon: RefreshCw,
    title: "Seamless 30-Day Returns",
    subtitle: "Pre-paid label included in package",
  },
  {
    icon: Sparkles,
    title: "Authenticity Guaranteed",
    subtitle: "100% verified atelier craftsmanship",
  },
];

export default function Categories() {
  return (
    <section id="categories" className="bg-neutral-900 py-24 text-white">
      {/* Brand Perks Strip */}
      <div className="mx-auto mb-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-rose-400 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold tracking-tight text-white">
                    {perk.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{perk.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end border-b border-white/10 pb-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-500">
              CURATED CAPSULES
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              Shop By Category
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-400">
            Explore our thoughtfully curated collections designed with architectural precision and high-grade technical textiles.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <Link
              key={cat.label}
              to={cat.to}
              className={`group relative overflow-hidden rounded-2xl bg-neutral-950 shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${
                index === 0 ? "sm:col-span-2 lg:col-span-2 aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/8]" : "aspect-[4/3]"
              }`}
            >
              {/* Category Background Image with Zoom */}
              <img
                src={cat.image}
                alt={cat.label}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-75 group-hover:opacity-90"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent transition-opacity duration-300" />

              {/* Top Pill Tag */}
              <div className="absolute top-4 left-4">
                <span className="rounded-full bg-neutral-950/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-neutral-300 backdrop-blur-md border border-white/10">
                  {cat.badge}
                </span>
              </div>

              {/* Bottom Content Bar */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white transition-transform duration-300 group-hover:translate-x-1">
                    {cat.label}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-300 max-w-xs font-medium">
                    {cat.desc}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white">
                  <ArrowUpRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
