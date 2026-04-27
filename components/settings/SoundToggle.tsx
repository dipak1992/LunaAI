'use client';

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getSoundEnabled, playSound, setSoundEnabled } from '@/lib/sound/player';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(() =>
    typeof window === 'undefined' ? true : getSoundEnabled(),
  );

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) playSound('pop', 0.18);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/50 transition-all duration-200 hover:text-white/90"
      aria-label={enabled ? 'Mute Luna sounds' : 'Enable Luna sounds'}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      <span className="hidden sm:inline">Sound</span>
    </button>
  );
}
