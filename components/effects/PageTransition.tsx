'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { playSound } from '@/lib/sound/player';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [showVeil, setShowVeil] = useState(false);

  useEffect(() => {
    const openTimer = window.setTimeout(() => {
      setShowVeil(true);
      playSound('whoosh', 0.12);
    }, 0);
    const contentTimer = window.setTimeout(() => setDisplayChildren(children), 120);
    const veilTimer = window.setTimeout(() => setShowVeil(false), 300);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(contentTimer);
      window.clearTimeout(veilTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {displayChildren}
      <AnimatePresence>
        {showVeil && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[90] bg-luna-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
