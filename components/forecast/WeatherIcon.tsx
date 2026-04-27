'use client';

import { motion } from 'framer-motion';
import type { WeatherKind } from '@/lib/forecast/types';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudDrizzle } from 'lucide-react';

interface Props {
  kind: WeatherKind;
  size?: number;
  className?: string;
}

const MAP: Record<WeatherKind, { Icon: React.ElementType; color: string }> = {
  clear:   { Icon: Sun,            color: 'text-luna-aurora-mint' },
  partly:  { Icon: CloudSun,       color: 'text-luna-aurora-blue' },
  cloudy:  { Icon: Cloud,          color: 'text-luna-whisper/80' },
  rain:    { Icon: CloudDrizzle,   color: 'text-luna-aurora-lilac' },
  storm:   { Icon: CloudRain,      color: 'text-luna-aurora-pink' },
  thunder: { Icon: CloudLightning, color: 'text-luna-aurora-pink' },
};

export default function WeatherIcon({ kind, size = 32, className = '' }: Props) {
  const { Icon, color } = MAP[kind];
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Icon size={size} className={color} strokeWidth={1.5} />
    </motion.div>
  );
}
