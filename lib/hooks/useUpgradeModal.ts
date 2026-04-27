'use client';

import { useCallback, useState } from 'react';

export type UpgradeFeature = 'checkin' | 'chat' | 'forecast' | 'memory' | 'report';

export function useUpgradeModal() {
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<UpgradeFeature>('chat');

  const prompt = useCallback((nextFeature: UpgradeFeature) => {
    setFeature(nextFeature);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { open, feature, prompt, close };
}
