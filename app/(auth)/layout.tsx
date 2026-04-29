import Link from 'next/link';
import { CloudSun, LockKeyhole, Mic, ShieldCheck } from 'lucide-react';
import Logo from '@/components/brand/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="aurora-bg-subtle min-h-screen w-full overflow-y-auto px-5 py-8 sm:py-10">
      {/* Back to home */}
      <div className="relative z-10 mx-auto mb-8 w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[0.9375rem] text-white/60 hover:text-white/90 transition-colors duration-300"
          aria-label="Back to home"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Luna
        </Link>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 lg:min-h-[720px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <aside className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl lg:block">
          <Logo size={46} />
          <div className="mt-14">
            <p className="mb-4 text-sm uppercase tracking-[0.14em] text-luna-aurora-mint/80">
              Private menopause companion
            </p>
            <h2 className="max-w-lg font-serif text-5xl leading-tight text-luna-cream">
              A calmer way back into your body&apos;s patterns.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/68">
              Voice check-ins, body-weather forecasts, and a companion that remembers
              without making you feel watched.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-luna-cream/10 bg-luna-ink/35 p-5">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm font-semibold text-luna-cream">Today&apos;s check-in</span>
              <span className="rounded-full bg-luna-aurora-mint/20 px-3 py-1 text-xs text-luna-aurora-mint">
                Private
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Mic, label: 'Voice' },
                { icon: CloudSun, label: 'Forecast' },
                { icon: LockKeyhole, label: 'Secure' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
                  <item.icon className="mx-auto mb-3 h-5 w-5 text-luna-aurora-mint" aria-hidden="true" />
                  <p className="text-xs text-white/62">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-luna-cream p-4 text-luna-ink">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-luna-ink/50">
                Luna notices
              </p>
              <p className="mt-2 font-serif text-xl leading-snug text-luna-ink">
                Sleep and warmth may be moving together this week.
              </p>
            </div>
          </div>
        </aside>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-luna-ink/50 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size={40} />
          </div>
          {children}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/50">
            <ShieldCheck className="h-4 w-4 text-luna-aurora-mint" aria-hidden="true" />
            Encrypted in transit and at rest
          </div>
        </section>
      </div>

      {/* Ambient glow — decorative, hidden on very small screens to save paint */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(168,216,201,0.18) 0%, rgba(255,212,163,0.08) 40%, transparent 70%)',
        }}
      />
    </div>
  );
}
