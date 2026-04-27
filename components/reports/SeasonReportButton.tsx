'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import { playSound } from '@/lib/sound/player';

export default function SeasonReportButton() {
  const [loading, setLoading] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reports/monthly');

      if (res.status === 402) {
        setUpgrade(true);
        return;
      }

      if (res.status === 422) {
        const body = (await res.json()) as { message?: string };
        setError(body.message ?? 'Not enough data yet.');
        return;
      }

      if (!res.ok) throw new Error('Failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      playSound('chime', 0.2);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error(err);
      setError("Couldn't open your report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl border border-luna-whisper/10 bg-luna-whisper/[0.02] p-5">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-luna-whisper/40">Season report</p>
          <p className="font-serif text-base italic text-luna-cream">
            A 30-day PDF for reflection or your clinician.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-luna-cream px-5 py-3 text-sm font-medium text-luna-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {loading ? 'Writing your season...' : 'Generate Season Report'}
        </button>
        {error && <p className="mt-3 text-center text-xs leading-5 text-luna-aurora-pink/80">{error}</p>}
      </div>

      <UpgradeModal open={upgrade} onClose={() => setUpgrade(false)} feature="report" />
    </>
  );
}
