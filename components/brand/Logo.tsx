'use client';

import { motion } from 'framer-motion';
import { useId } from 'react';

interface LogoProps {
  /** Size of the SVG icon in px (default: 40) */
  size?: number;
  /** Whether to run entrance / idle animations (default: true) */
  animated?: boolean;
  /** Hide the wordmark and show icon only */
  iconOnly?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

export default function Logo({
  size = 40,
  animated = true,
  iconOnly = false,
  className = '',
}: LogoProps) {
  // Unique IDs so multiple Logo instances on the same page don't share gradients
  const uid = useId().replace(/:/g, '');
  const moonGradId = `moonGrad-${uid}`;
  const pulseGradId = `pulseGrad-${uid}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-label="Luna logo"
        role="img"
      >
        <defs>
          <linearGradient id={moonGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#E9B8FF" />
            <stop offset="50%"  stopColor="#FF9EC7" />
            <stop offset="100%" stopColor="#FFD4A3" />
          </linearGradient>
          <linearGradient id={pulseGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#E9B8FF" />
            <stop offset="50%"  stopColor="#FF9EC7" />
            <stop offset="100%" stopColor="#FFD4A3" />
          </linearGradient>
        </defs>

        {/* ── Crescent moon ── */}
        <motion.path
          d="M 28 8 A 14 14 0 1 0 28 32 A 10 10 0 1 1 28 8"
          fill={`url(#${moonGradId})`}
          initial={animated ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: '20px 20px' }}
        />

        {/* ── Heartbeat pulse line ── */}
        <motion.path
          d="M 8 20 L 12 20 L 14 16 L 18 24 L 20 20 L 24 20"
          stroke={`url(#${pulseGradId})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={animated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* ── Wordmark ── */}
      {!iconOnly && (
        <motion.span
          className="font-serif font-light tracking-wide text-aurora"
          style={{ fontSize: size * 0.6 }}
          initial={animated ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          luna
        </motion.span>
      )}
    </div>
  );
}
