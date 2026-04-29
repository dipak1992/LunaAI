'use client';

import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import { playSound } from '@/lib/sound/player';

interface HaikuCardProps {
  id?: string;
  lines: string[];
  date?: string;
  mood?: string | null;
  saved?: boolean;
  onToggleSave?: (saved: boolean) => void;
  floating?: boolean;
}

export default function HaikuCard({
  id,
  lines,
  date,
  mood,
  saved = false,
  onToggleSave,
  floating = true,
}: HaikuCardProps) {
  const [localSaved, setLocalSaved] = useState(saved);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!id || saving) return;

    const next = !localSaved;
    setSaving(true);
    setLocalSaved(next);

    try {
      const res = await fetch(`/api/haiku/${id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saved: next }),
      });

      if (!res.ok) throw new Error('Save failed');
      onToggleSave?.(next);
      playSound('chime', 0.18);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
    } catch {
      setLocalSaved(!next);
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
    : undefined;

  return (
    <motion.article
      className="relative overflow-hidden rounded-2xl border border-luna-sunset/25 bg-luna-cream p-6 text-luna-ink shadow-soft"
      animate={floating ? { y: [0, -4, 0] } : undefined}
      transition={floating ? { duration: 6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(11,11,20,0.7) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      />

      <div className="relative">
        {(formattedDate || id) && (
          <div className="mb-5 flex items-center justify-between gap-4">
            {formattedDate ? (
              <p className="text-xs uppercase tracking-[0.14em] text-luna-ink/60">
                {formattedDate}
              </p>
            ) : (
              <span />
            )}

            {id && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full p-2 text-luna-ink/45 transition-colors hover:bg-luna-ink/5 hover:text-luna-ink disabled:opacity-50"
                aria-label={localSaved ? 'Remove haiku from saved collection' : 'Save haiku'}
              >
                {localSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          {lines.map((line, index) => (
            <motion.p
              key={`${line}-${index}`}
              className="font-serif text-xl italic leading-relaxed text-luna-ink md:text-2xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {mood && (
          <p className="mt-5 text-xs uppercase tracking-[0.24em] text-luna-ink/40">
            {mood}
          </p>
        )}

        <p className="mt-7 text-right font-serif text-sm italic text-luna-ink/45">- Luna</p>
      </div>
    </motion.article>
  );
}
