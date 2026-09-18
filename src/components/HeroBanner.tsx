import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Flame } from "lucide-react";

const heroImage = "/images/hero-editorial.jpg";

export default function HeroBanner() {
  const nav = useNavigate();
  const ticker =
    "NEW SEASON DROPS  •  MEN & WOMEN RUNWAY EDITS  •  VERIFIED STRIPE CHECKOUT  •  LIMITED TIME: UP TO 50% OFF  •  COMPLIMENTARY GLOBAL EXPRESS  •  ";

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      {/* Background Ambient Glow Spots */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-rose-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />

      <div className="mx-auto flex min-h-[calc(100vh-130px)] max-w-7xl flex-col justify-between lg:flex-row lg:items-stretch">
        {/* Left Editorial Copy */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-16 sm:px-10 lg:py-24 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 live-pulse-dot" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-neutral-200">
              SPRING / SUMMER 2026 DROP
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl text-5xl font-black uppercase tracking-tight sm:text-7xl xl:text-8xl leading-[0.92]"
          >
            Style <br />
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              Without
            </span>{" "}
            <br />
            <span className="text-rose-500 underline decoration-rose-500/40 decoration-wavy decoration-2 underline-offset-8">
              Limits.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-lg text-base text-neutral-300 sm:text-lg font-normal leading-relaxed"
          >
            Architectural silhouettes, premium technical fabrics, and unapologetic aesthetics. Up to 50% off selected seasonal archive styles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => nav("/women")}
              className="btn-sheen-sweep group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-xs font-black tracking-widest text-neutral-950 shadow-xl transition-all hover:bg-rose-600 hover:text-white"
            >
              <span>EXPLORE WOMEN</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => nav("/men")}
              className="btn-sheen-sweep group flex items-center gap-3 rounded-full border border-white/30 bg-white/5 px-8 py-4 text-xs font-black tracking-widest text-white backdrop-blur-md transition-all hover:border-white hover:bg-white hover:text-neutral-950"
            >
              <span>EXPLORE MEN</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.button>
          </motion.div>

          {/* Quick Value Proof Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 max-w-lg"
          >
            <div>
              <p className="text-2xl font-black text-white">400+</p>
              <p className="text-xs text-neutral-400 font-medium">Curated Pieces</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-500">48h</p>
              <p className="text-xs text-neutral-400 font-medium">Express Dispatch</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">4.9/5</p>
              <p className="text-xs text-neutral-400 font-medium">Customer Rating</p>
            </div>
          </motion.div>
        </div>

        {/* Right Editorial Imagery */}
        <div className="relative flex-1 overflow-hidden min-h-[500px] lg:min-h-auto">
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative h-full w-full"
          >
            <img
              src={heroImage}
              alt="High fashion editorial model wearing streetwear"
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent lg:bg-gradient-to-r lg:from-neutral-950 lg:via-transparent lg:to-neutral-950/40" />

            {/* Floating Editorial Badge */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="absolute bottom-8 left-6 sm:bottom-12 sm:left-12 glass-dark p-4 rounded-2xl max-w-xs shadow-2xl backdrop-blur-xl border border-white/15"
            >
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-rose-400">
                <Flame size={14} className="text-rose-500" />
                Featured Capsule
              </div>
              <p className="mt-1 text-sm font-bold text-white">
                Monochrome Utility Oversized Bomber
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                <span>In Stock · Limited Edition</span>
                <span className="font-extrabold text-white">$129.00</span>
              </div>
            </motion.div>

            {/* Top Right Floating Pill */}
            <div className="absolute top-6 right-6 hidden sm:flex items-center gap-2 rounded-full border border-white/20 bg-neutral-950/60 px-4 py-2 backdrop-blur-md">
              <Sparkles size={13} className="text-rose-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white">
                EDITORIAL 01 / SS26
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Marquee Strip */}
      <div className="overflow-hidden border-t border-white/10 bg-neutral-950 py-3.5 text-[11px] font-extrabold tracking-[0.25em] text-neutral-400">
        <div className="marquee-track flex whitespace-nowrap">
          {ticker.repeat(3)}
        </div>
      </div>
    </section>
  );
}
