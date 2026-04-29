'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import Link from 'next/link';

interface GlowButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  className?: string;
}

export default function GlowButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
}: GlowButtonProps) {
  const base =
    'relative inline-flex items-center justify-center px-8 py-4 rounded-full font-sans font-semibold text-base transition-all duration-500 cursor-pointer';

  const styles =
    variant === 'primary'
      ? 'bg-luna-cream text-luna-ink hover:bg-white'
      : 'bg-transparent text-luna-cream border border-white/20 hover:border-white/50';

  const inner = (
    <motion.span
      className={`${base} ${styles} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      {variant === 'primary' && (
        <span
          className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(circle at center, rgba(200,168,233,0.3) 0%, transparent 70%)',
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.span>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return (
    <button onClick={onClick} type="button">
      {inner}
    </button>
  );
}
