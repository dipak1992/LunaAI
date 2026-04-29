'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import Logo from '@/components/brand/Logo';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="aurora-bg-subtle flex min-h-screen items-center justify-center px-6 py-16 text-luna-cream">
      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-luna-ink/55 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl md:p-12">
        <div className="mx-auto mb-8 flex justify-center">
          <Logo size={42} />
        </div>
        <p className="mb-4 text-sm uppercase tracking-[0.14em] text-luna-aurora-mint/80">
          Something went wrong
        </p>
        <h1 className="font-serif text-4xl leading-tight text-luna-cream md:text-5xl">
          Luna needs a moment to steady the sky.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/68">
          The page hit an unexpected issue. Try again, or return home and continue from there.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-luna-cream px-6 py-3 text-sm font-semibold text-luna-ink transition-colors hover:bg-white"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-luna-cream transition-colors hover:border-white/30 hover:bg-white/[0.04]"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
