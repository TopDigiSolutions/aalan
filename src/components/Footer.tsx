import { Link } from "react-router-dom";
import { ArrowUp, ShieldCheck, CreditCard, Lock } from "lucide-react";
import { PaymentBadges } from "./PaymentIcons";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="group inline-flex items-center text-4xl font-black tracking-tighter">
              <span>aalan</span>
              <span className="text-rose-600 transition-transform duration-300 group-hover:translate-x-1">
                .
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-neutral-400 leading-relaxed">
              Fashion Without Limits. Architectural silhouettes, technical textiles, and experimental contemporary cuts designed for modern existence.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-emerald-400" />
                256-Bit SSL Encryption
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                Stripe Verified
              </span>
            </div>
          </div>

          {/* Shop Nav */}
          <nav aria-label="Footer shop" className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-300">
              SHOP ARCHIVE
            </h2>
            {[
              ["All products", "/shop"],
              ["Men", "/men"],
              ["Women", "/women"],
              ["Sale", "/sale"],
            ].map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className="block text-sm text-neutral-400 transition-colors hover:text-white hover:translate-x-1 duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Visit Nav */}
          <nav aria-label="Shopping help" className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-300">
              CLIENT SERVICES
            </h2>
            <Link
              to="/wishlist"
              className="block text-sm text-neutral-400 transition-colors hover:text-white hover:translate-x-1 duration-200"
            >
              Wishlist
            </Link>
            <Link
              to="/cart"
              className="block text-sm text-neutral-400 transition-colors hover:text-white hover:translate-x-1 duration-200"
            >
              Shopping bag
            </Link>
            <Link
              to="/help"
              className="block text-sm text-neutral-400 transition-colors hover:text-white hover:translate-x-1 duration-200"
            >
              Shopping information
            </Link>
          </nav>
        </div>

        {/* Bottom Bar with Payment Icons & Back to Top */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-neutral-900 pt-8 lg:flex-row">
          <p className="text-xs text-neutral-400 text-center lg:text-left">
            © {new Date().getFullYear()} AALAN. Prices in USD. Secure checkout by Stripe. All rights reserved.
          </p>

          {/* Bottom Right Corner: Accepted Cards & Back to Top */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-5">
            <PaymentBadges
              showLabel={true}
              labelPrefix="We Accept"
              theme="dark"
              badgeSize="h-6 w-9"
            />

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
            >
              <span>BACK TO TOP</span>
              <ArrowUp
                size={13}
                className="transition-transform duration-300 group-hover:-translate-y-1"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
