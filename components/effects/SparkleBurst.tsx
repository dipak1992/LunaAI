'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';

interface SparkleBurstProps {
  trigger: number;
  count?: number;
  radius?: number;
  colors?: string[];
  size?: number;
}

function sparkleNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export default function SparkleBurst({
  trigger,
  count = 18,
  radius = 120,
  colors = ['#FF9AAE', '#C8A8E9', '#8FB8E8', '#A8D8C9', '#FAF7F2'],
  size = 6,
}: SparkleBurstProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const seed = trigger + index * 97;
        const angle = (index / count) * Math.PI * 2 + sparkleNoise(seed) * 0.4;
        const distance = radius * (0.6 + sparkleNoise(seed + 1) * 0.6);
        return {
          id: `${trigger}-${index}`,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          color: colors[index % colors.length],
          delay: sparkleNoise(seed + 2) * 0.1,
          scale: 0.6 + sparkleNoise(seed + 3) * 0.8,
        };
      }),
    [trigger, count, radius, colors],
  );

  if (!trigger) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={trigger}
        className="pointer-events-none absolute left-1/2 top-1/2 z-30"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: particle.color,
              boxShadow: `0 0 14px ${particle.color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: particle.x,
              y: particle.y,
              opacity: [0, 1, 0],
              scale: [0, particle.scale, 0],
            }}
            transition={{ duration: 0.9, delay: particle.delay, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
