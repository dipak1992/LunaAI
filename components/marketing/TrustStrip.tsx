'use client';

import { Lock, Moon, Stethoscope } from 'lucide-react';
import FadeUp from '@/components/ui/FadeUp';

const TRUST_ITEMS = [
  {
    icon: Stethoscope,
    text: 'Informed by menopause specialists',
  },
  {
    icon: Lock,
    text: 'Your voice never trains our AI',
  },
  {
    icon: Moon,
    text: 'Join women finding clarity',
  },
];

interface TrustStripProps {
  className?: string;
  delay?: number;
}

export default function TrustStrip({ className = '', delay = 0.4 }: TrustStripProps) {
  return (
    <FadeUp delay={delay}>
      <div
        className={`mx-auto flex max-w-3xl flex-col gap-4 text-sm text-white/70 md:flex-row md:items-center md:justify-center md:gap-6 ${className}`}
      >
        {TRUST_ITEMS.map((item, index) => (
          <div key={item.text} className="contents">
            {index > 0 && (
              <span className="hidden md:inline" aria-hidden="true">
                •
              </span>
            )}
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 shrink-0 text-luna-aurora-mint" aria-hidden="true" />
              <span>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
