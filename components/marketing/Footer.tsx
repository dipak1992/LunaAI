import Link from 'next/link';
import Logo from '@/components/brand/Logo';

const COLUMNS = [
  {
    title: 'Luna',
    links: [
      { label: 'Story', href: '/about' },
      { label: 'Science', href: '/science' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Whispers', href: '/whispers' },
    ],
  },
  {
    title: 'Care',
    links: [
      { label: 'For clinicians', href: '/science' },
      { label: 'Help center', href: 'mailto:hello@luna.app' },
      { label: 'Crisis resources', href: '/privacy#crisis' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'hello@luna.app', href: 'mailto:hello@luna.app' },
      { label: 'privacy@luna.app', href: 'mailto:privacy@luna.app' },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="relative bg-luna-ink px-6 pt-16 pb-12"
      style={{
        borderTop: '1px solid transparent',
        borderImage: 'linear-gradient(90deg, transparent, rgba(233,184,255,0.3), rgba(255,158,199,0.3), transparent) 1',
      }}
    >
      {/* Subtle warm glow at top */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(233,184,255,0.2), rgba(255,158,199,0.2), transparent)',
          filter: 'blur(1px)',
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Mini CTA above links */}
        <div className="mb-14 flex flex-col items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-xl text-white">Ready to begin?</p>
            <p className="mt-1 text-sm text-white/55">Your first check-in is free. No credit card needed.</p>
          </div>
          <Link
            href="/trial"
            className="btn-primary shrink-0 px-6 py-3 text-sm"
          >
            Try Luna Free
          </Link>
        </div>

        {/* Top row */}
        <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-flex transition-opacity hover:opacity-85">
              <Logo size={34} animated={false} />
            </Link>
            <p className="text-[0.9375rem] italic text-white/60 leading-relaxed">
              &ldquo;She is not a season ending. She is a sky rearranging.&rdquo;
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[0.75rem] tracking-[0.14em] uppercase text-white/55">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[0.9375rem] text-white/68 hover:text-white transition-colors duration-300"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-8 md:flex-row md:justify-between">
          <p className="text-sm text-white/45">
            &copy; {new Date().getFullYear()} Luna. Made with care.
          </p>
          <p className="text-sm text-white/45">
            Not a medical device. Always consult your clinician.
          </p>
        </div>
      </div>
    </footer>
  );
}
