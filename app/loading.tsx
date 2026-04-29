import Logo from '@/components/brand/Logo';

export default function Loading() {
  return (
    <main className="aurora-bg-subtle flex min-h-screen items-center justify-center px-6 py-16 text-luna-cream">
      <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-luna-ink/55 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <Logo size={36} />
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded-full bg-luna-cream/12" />
          <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-5 h-10 w-10 animate-pulse rounded-xl bg-luna-aurora-mint/15" />
              <div className="mb-3 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
              <div className="h-3 w-full animate-pulse rounded-full bg-white/8" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
