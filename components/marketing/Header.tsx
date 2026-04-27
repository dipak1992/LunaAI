'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/brand/Logo';

const NAV_LINKS = [
  { label: 'Story', href: '/about' },
  { label: 'Science', href: '/science' },
  { label: 'Whispers', href: '/whispers' },
  { label: 'Pricing', href: '/pricing' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-luna-ink/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="transition-opacity hover:opacity-85"
          aria-label="Luna home"
        >
          <Logo size={34} animated={false} />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/50 hover:text-white/90 transition-colors duration-300 tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden md:block text-sm text-white/50 hover:text-white/90 transition-colors duration-300"
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className="hidden md:block text-sm text-white/50 hover:text-white/90 transition-colors duration-300"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-luna-cream px-5 py-2.5 text-sm font-medium text-luna-ink hover:bg-white transition-colors duration-300"
          >
            Begin free
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
