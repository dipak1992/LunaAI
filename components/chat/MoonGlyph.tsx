export default function MoonGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Crescent moon */}
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="url(#moonGrad)"
        opacity={0.9}
      />
      {/* Heartbeat pulse line */}
      <path
        d="M6 12h2l1.5-3 2 6 1.5-3H15"
        stroke="url(#pulseGrad)"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8A8E9" />
          <stop offset="100%" stopColor="#FF9AAE" />
        </linearGradient>
        <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF9AAE" />
          <stop offset="100%" stopColor="#C8A8E9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
