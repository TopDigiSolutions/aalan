export function VisaIcon({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <span
      title="Visa"
      className={`inline-flex items-center justify-center rounded bg-white px-1.5 py-0.5 shadow-sm border border-neutral-200/80 shrink-0 transition-transform hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 36 12"
        className="h-3 w-auto"
        fill="#1434CB"
        role="img"
        aria-label="Visa"
      >
        <path d="M14.53 0.2L9.5 11.8H6.2L3.77 2.6C3.62 2 3.48 1.8 3 1.5C2.26 1.1 1.06 0.7 0 0.5L0.07 0.2H5.45C6.15 0.2 6.77 0.7 6.92 1.5L8.25 8.6L11.45 0.2H14.53ZM27.35 8C27.37 5 23.15 4.8 23.18 3.5C23.2 3.1 23.6 2.6 24.5 2.5C25 2.4 26.25 2.4 27.5 2.9L28.1 0.6C27.27 0.3 26.2 0 24.8 0C21.8 0 19.7 1.6 19.68 3.8C19.65 5.5 21.2 6.4 22.37 7C23.57 7.6 24 8 24 8.5C23.97 9.3 23 9.7 22.1 9.7C20.6 9.7 19.7 9.3 19 8.9L18.4 11.3C19.2 11.7 20.65 12 22 12C25.25 12 27.33 10.4 27.35 8ZM35.3 11.8H38L35.6 0.2H33.2C32.6 0.2 32.1 0.5 31.9 1.1L27.2 11.8H30.4L31 10.1H34.9L35.3 11.8ZM31.9 7.8L33.5 3.3L34.4 7.8H31.9ZM18.8 0.2L16.2 11.8H13.2L15.8 0.2H18.8Z" />
      </svg>
    </span>
  );
}

export function MastercardIcon({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <span
      title="Mastercard"
      className={`inline-flex items-center justify-center rounded bg-white px-1 py-0.5 shadow-sm border border-neutral-200/80 shrink-0 transition-transform hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 32 20"
        className="h-3.5 w-auto"
        role="img"
        aria-label="Mastercard"
      >
        <circle cx="11" cy="10" r="7" fill="#EB001B" />
        <circle cx="21" cy="10" r="7" fill="#F79E1B" />
        <path
          d="M16 4.75A6.97 6.97 0 0 1 18.66 10 6.97 6.97 0 0 1 16 15.25 6.97 6.97 0 0 1 13.34 10 6.97 6.97 0 0 1 16 4.75Z"
          fill="#FF5F00"
        />
      </svg>
    </span>
  );
}

export function AmexIcon({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <span
      title="American Express"
      className={`inline-flex items-center justify-center rounded bg-[#006FCF] px-1 py-0.5 shadow-sm border border-blue-600 shrink-0 transition-transform hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 32 14"
        className="h-3 w-auto"
        role="img"
        aria-label="American Express"
      >
        <text
          x="50%"
          y="70%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="7.5"
          letterSpacing="0.06em"
        >
          AMEX
        </text>
      </svg>
    </span>
  );
}

export function DiscoverIcon({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <span
      title="Discover"
      className={`inline-flex items-center justify-center rounded bg-white px-1 py-0.5 shadow-sm border border-neutral-200/80 shrink-0 transition-transform hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 38 12"
        className="h-2.5 w-auto"
        role="img"
        aria-label="Discover"
      >
        <text
          x="1"
          y="9"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="7"
          fill="#231F20"
          letterSpacing="-0.02em"
        >
          DISC
        </text>
        <circle cx="23.5" cy="6.2" r="3.2" fill="#FF6000" />
        <text
          x="28"
          y="9"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="7"
          fill="#231F20"
          letterSpacing="-0.02em"
        >
          VER
        </text>
      </svg>
    </span>
  );
}

export function PaymentBadges({
  showLabel = true,
  badgeSize = "h-5 w-8",
  labelPrefix = "We Accept",
  theme = "dark",
}: {
  showLabel?: boolean;
  badgeSize?: string;
  labelPrefix?: string;
  theme?: "dark" | "light";
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      {showLabel && (
        <span
          className={`text-[10px] font-extrabold uppercase tracking-widest ${
            theme === "dark" ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          {labelPrefix}:
        </span>
      )}
      <div className="flex items-center gap-1.5" aria-label="Accepted payment cards">
        <VisaIcon className={badgeSize} />
        <MastercardIcon className={badgeSize} />
        <AmexIcon className={badgeSize} />
        <DiscoverIcon className={badgeSize} />
      </div>
    </div>
  );
}
