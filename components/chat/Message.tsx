'use client';

import { motion } from 'framer-motion';
import Logo from '@/components/brand/Logo';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  index?: number;
  animate?: boolean;
}

export default function Message({ role, content, index = 0, animate = true }: MessageProps) {
  const initial = animate ? { opacity: 0, y: 12 } : false;
  const delay = animate ? Math.min(index * 0.05, 0.3) : 0;

  if (role === 'assistant') {
    return (
      <motion.div
        className="flex items-start gap-3"
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Luna avatar */}
        <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-luna-aurora-lilac to-luna-aurora-pink flex items-center justify-center shadow-md shadow-luna-aurora-lilac/20">
          <Logo size={18} animated={false} iconOnly />
        </div>

        {/* Bubble — aurora left border for personality */}
        <div className="relative max-w-[80%]">
          {/* Aurora left accent */}
          <div
            className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
            style={{ background: 'linear-gradient(180deg, #C8A8E9, #FF9AAE)' }}
          />
          <div className="rounded-2xl rounded-tl-sm px-4 py-3 pl-5 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
            <p className="text-[15px] leading-relaxed text-luna-whisper whitespace-pre-wrap">
              {content}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex justify-end"
      initial={initial}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 bg-gradient-to-br from-luna-aurora-lilac/25 to-luna-aurora-pink/15 border border-luna-aurora-lilac/25 backdrop-blur-sm shadow-sm shadow-luna-aurora-lilac/10">
        <p className="text-[15px] leading-relaxed text-luna-cream whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </motion.div>
  );
}
