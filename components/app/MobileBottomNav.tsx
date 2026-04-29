'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Home, MessageCircle, MoreHorizontal, Plus, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: Home },
  { href: '/track', label: 'Track', icon: ClipboardList },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/plans', label: 'Plans', icon: Sparkles },
  { href: '/settings', label: 'More', icon: MoreHorizontal },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-luna-ink/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-2xl sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-[1fr_1fr_72px_1fr_1fr] items-end gap-1">
        {NAV_ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors ${
                active ? 'text-luna-cream' : 'text-luna-whisper/64'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}

        <Link
          href="/dashboard?checkin=true"
          className="mx-auto -mt-8 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-luna-cream/25 bg-luna-cream text-luna-ink shadow-2xl shadow-luna-aurora-pink/25"
          aria-label="Start check-in"
        >
          <Plus className="h-6 w-6" strokeWidth={2.2} />
          <span className="text-[10px] font-semibold leading-none">Check In</span>
        </Link>

        {NAV_ITEMS.slice(2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors ${
                active ? 'text-luna-cream' : 'text-luna-whisper/64'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
