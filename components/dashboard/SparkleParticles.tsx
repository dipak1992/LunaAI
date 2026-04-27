'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  angle: number;
  distance: number;
}

interface SparkleParticlesProps {
  active: boolean;
  count?: number;
  originX?: number; // 0–100 percent
  originY?: number; // 0–100 percent
  className?: string;
}

const SPARKLE_COLORS = [
  '#E8B4D0', // luna-pink
  '#C4A8E8', // luna-purple
  '#F5C842', // luna-gold
  '#A8D8E8', // luna-aurora-blue
  '#F0A0B8', // luna-rose
  '#FFFFFF',
];

function generateParticles(count: number, originX: number, originY: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: originX,
    y: originY,
    size: Math.random() * 6 + 3,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    duration: Math.random() * 0.8 + 0.6,
    delay: Math.random() * 0.4,
    angle: (Math.PI * 2 * i) / count + Math.random() * 0.5,
    distance: Math.random() * 60 + 30,
  }));
}

export function SparkleParticles({
  active,
  count = 16,
  originX = 50,
  originY = 50,
  className = '',
}: SparkleParticlesProps) {
  const particlesRef = useRef<Particle[]>([]);

  if (active && particlesRef.current.length === 0) {
    particlesRef.current = generateParticles(count, originX, originY);
  }
  if (!active) {
    particlesRef.current = [];
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {active &&
          particlesRef.current.map((p) => {
            const dx = Math.cos(p.angle) * p.distance;
            const dy = Math.sin(p.angle) * p.distance;

            return (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  translateX: '-50%',
                  translateY: '-50%',
                }}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  x: dx,
                  y: dy,
                  scale: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}

// ── Continuous ambient sparkles (for the done state) ──────────────────────────

interface AmbientSparklesProps {
  active: boolean;
  className?: string;
}

interface AmbientParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function useAmbientParticles(count: number): AmbientParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    duration: Math.random() * 2 + 1.5,
    delay: Math.random() * 2,
  }));
}

export function AmbientSparkles({ active, className = '' }: AmbientSparklesProps) {
  const particles = useAmbientParticles(12);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {active &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 1.5,
                ease: 'easeInOut',
              }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}
