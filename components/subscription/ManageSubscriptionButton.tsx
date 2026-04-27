'use client';

import { CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });

      if (res.status === 401) {
        window.location.href = '/login?redirect=/dashboard';
        return;
      }

      if (res.status === 404) {
        window.location.href = '/pricing';
        return;
      }

      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      console.error(data.error ?? 'Portal failed');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/50 transition-all duration-200 hover:text-white/90 disabled:opacity-50"
    >
      <CreditCard size={14} />
      <span className="hidden sm:inline">{loading ? 'Opening...' : 'Subscription'}</span>
    </button>
  );
}
