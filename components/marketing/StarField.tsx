'use client';

import { motion, useReducedMotion } from 'framer-motion';

const STARS = [
  { id: 1, top: 8, left: 12, size: 2, delay: 0.1, duration: 3.4 },
  { id: 2, top: 14, left: 72, size: 1, delay: 0.8, duration: 2.8 },
  { id: 3, top: 21, left: 35, size: 1.5, delay: 1.2, duration: 3.1 },
  { id: 4, top: 28, left: 88, size: 2, delay: 0.4, duration: 3.8 },
  { id: 5, top: 34, left: 18, size: 1, delay: 1.9, duration: 2.6 },
  { id: 6, top: 42, left: 64, size: 1.5, delay: 0.6, duration: 3.2 },
  { id: 7, top: 49, left: 7, size: 1, delay: 2.1, duration: 3.6 },
  { id: 8, top: 55, left: 78, size: 2, delay: 1.4, duration: 2.9 },
  { id: 9, top: 63, left: 28, size: 1.5, delay: 0.2, duration: 3.5 },
  { id: 10, top: 70, left: 92, size: 1, delay: 1.7, duration: 3 },
  { id: 11, top: 76, left: 46, size: 2, delay: 0.9, duration: 3.7 },
  { id: 12, top: 83, left: 15, size: 1, delay: 2.4, duration: 2.7 },
  { id: 13, top: 11, left: 51, size: 1.5, delay: 1.1, duration: 3.3 },
  { id: 14, top: 19, left: 5, size: 1, delay: 0.5, duration: 2.8 },
  { id: 15, top: 37, left: 53, size: 2, delay: 2, duration: 3.9 },
  { id: 16, top: 58, left: 41, size: 1, delay: 1.6, duration: 3.1 },
  { id: 17, top: 66, left: 69, size: 1.5, delay: 0.3, duration: 2.9 },
  { id: 18, top: 88, left: 61, size: 2, delay: 1.3, duration: 3.6 },
  { id: 19, top: 91, left: 31, size: 1, delay: 2.2, duration: 3 },
  { id: 20, top: 6, left: 91, size: 1.5, delay: 0.7, duration: 3.4 },
];

export default function StarField() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {STARS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-luna-cream"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: prefersReducedMotion ? 0.28 : 0.18,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.12, 0.5, 0.18], scale: [1, 1.45, 1] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: s.duration,
                  delay: s.delay,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }
          }
        />
      ))}
    </div>
  );
}
