import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../lib/shop";

const links = [
  ["NEW IN", "/?section=new-arrivals"],
  ["MEN", "/men"],
  ["WOMEN", "/women"],
  ["SALE", "/sale"],
  ["TRENDING", "/?section=trending"],
  ["STREETWEAR", "/shop?category=STREETWEAR"],
];

export default function Navbar() {
  const location = useLocation();
  const { count, wishlist } = useShop();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      {/* Top Luxury Announcement Marquee Banner */}
      <div className="bg-neutral-950 text-white border-b border-white/10 text-[11px] font-semibold tracking-widest py-2 px-4 overflow-hidden select-none">
        <div className="marquee-track flex gap-12 items-center text-neutral-300">
          <span className="flex items-center gap-2">
            <Sparkles size={13} className="text-rose-500" />
            COMPLIMENTARY WORLDWIDE EXPRESS ON ORDERS OVER $150
          </span>
          <span className="text-neutral-600">•</span>
          <span>CURATED EDITORIAL STREETWEAR & RUNWAY ESSENTIALS</span>
          <span className="text-neutral-600">•</span>
          <span className="text-rose-400 font-bold">
            LIMITED TIME: UP TO 50% OFF SELECTED ARCHIVE PIECES
          </span>
          <span className="text-neutral-600">•</span>
          <span>DUTIES & TAXES INCLUDED AT CHECKOUT</span>
          <span className="text-neutral-600">•</span>
          <span className="flex items-center gap-2">
            <Sparkles size={13} className="text-rose-500" />
            COMPLIMENTARY WORLDWIDE EXPRESS ON ORDERS OVER $150
          </span>
          <span className="text-neutral-600">•</span>
          <span>CURATED EDITORIAL STREETWEAR & RUNWAY ESSENTIALS</span>
          <span className="text-neutral-600">•</span>
          <span className="text-rose-400 font-bold">
            LIMITED TIME: UP TO 50% OFF SELECTED ARCHIVE PIECES
          </span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-header shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-b border-neutral-200/80"
            : "bg-white/95 backdrop-blur-md border-b border-neutral-200/60"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            to="/"
            className="group relative flex items-center text-3xl font-black tracking-tighter text-neutral-950 transition-transform active:scale-95"
            aria-label="AALAN home"
          >
            <span>aalan</span>
            <span className="inline-block text-rose-600 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-125">
              .
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {links.map(([label, to]) => {
              const isActive =
                to === "/"
                  ? location.pathname === "/" && !location.search
                  : location.pathname + location.search === to;
              const isSale = label === "SALE";

              return (
                <Link
                  key={label}
                  to={to}
                  className={`group relative py-1 text-xs font-bold tracking-widest transition-colors ${
                    isSale
                      ? "text-rose-600 hover:text-rose-700"
                      : isActive
                        ? "text-neutral-950"
                        : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-neutral-950 transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    } ${isSale ? "!bg-rose-600" : ""}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Search Toggle / Link */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                aria-label="Search products"
              >
                <Search size={19} />
              </button>

              {/* Expandable Search Overlay */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 z-50 w-72 sm:w-80 rounded-2xl bg-white p-3 shadow-2xl border border-neutral-200"
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchVal.trim()) {
                          window.location.hash = `#/shop?q=${encodeURIComponent(searchVal.trim())}`;
                          setSearchOpen(false);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search drops, jackets, boots..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        className="w-full bg-neutral-50 px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200 outline-none focus:border-neutral-900"
                      />
                      <button
                        type="submit"
                        className="bg-neutral-950 p-2 text-white rounded-lg hover:bg-neutral-800"
                        aria-label="Submit search"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
            >
              <Heart
                size={19}
                className={`transition-colors ${
                  wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              {wishlist.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white"
                >
                  {wishlist.length}
                </motion.span>
              )}
            </Link>

            {/* Shopping Bag Link with Spring Counter */}
            <Link
              to="/cart"
              aria-label={"Shopping bag, " + count + " items"}
              className="group relative flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-white hover:bg-neutral-800 transition-all active:scale-95 shadow-sm"
            >
              <ShoppingBag
                size={17}
                className="transition-transform group-hover:scale-110"
              />
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ y: -8, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 8, opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="min-w-[1.1rem] text-center text-xs font-black tracking-tight text-white"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </Link>

            {/* Mobile Menu Button */}
            <button
              ref={menuButton}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-950 hover:bg-neutral-100 lg:hidden transition-colors"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-neutral-100 bg-white/95 backdrop-blur-xl px-6 py-6 lg:hidden shadow-xl"
            >
              <div className="flex flex-col space-y-1">
                {links.map(([label, to], index) => (
                  <motion.div
                    key={label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      to={to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold tracking-wider transition-colors ${
                        label === "SALE"
                          ? "text-rose-600 bg-rose-50"
                          : "text-neutral-800 hover:bg-neutral-100"
                      }`}
                    >
                      <span>{label}</span>
                      <ArrowRight size={15} className="text-neutral-400" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
