import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import Logo from '@/components/brand/Logo';

export default function NotFound() {
  return (
    <main className="aurora-bg-subtle flex min-h-screen items-center justify-center px-6 py-16 text-luna-cream">
      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-luna-ink/55 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl md:p-12">
        <div className="mx-auto mb-8 flex justify-center">
          <Logo size={42} />
        </div>
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-luna-cream/10">
          <Search className="h-6 w-6 text-luna-aurora-mint" aria-hidden="true" />
        </div>
        <p className="mb-4 text-sm uppercase tracking-[0.14em] text-luna-aurora-mint/80">
          Page not found
        </p>
        <h1 className="font-serif text-4xl leading-tight text-luna-cream md:text-5xl">
          This path has gone quiet.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/68">
          The page you are looking for may have moved, or the link may no longer be active.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-luna-cream px-6 py-3 text-sm font-semibold text-luna-ink transition-colors hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return home
        </Link>
      </section>
    </main>
  );
}
