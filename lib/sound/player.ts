'use client';

import { Howl } from 'howler';

const STORAGE_KEY = 'luna:sound_enabled';

type SoundName = 'chime' | 'whoosh' | 'pop';

const sources: Record<SoundName, string> = {
  chime: '/sounds/chime.wav',
  whoosh: '/sounds/whoosh.wav',
  pop: '/sounds/pop.wav',
};

const cache: Partial<Record<SoundName, Howl>> = {};

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const value = localStorage.getItem(STORAGE_KEY);
  return value === null ? true : value === '1';
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
}

export function getSoundEnabled(): boolean {
  return isEnabled();
}

export function playSound(name: SoundName, volume = 0.25) {
  if (typeof window === 'undefined') return;
  if (!isEnabled()) return;

  try {
    if (!cache[name]) {
      cache[name] = new Howl({
        src: [sources[name]],
        volume,
        preload: true,
        html5: false,
      });
    }
    cache[name]?.volume(volume);
    cache[name]?.play();
  } catch {
    // Audio should never block the interface.
  }
}
