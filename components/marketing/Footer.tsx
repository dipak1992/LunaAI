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
    <footer className="relative bg-luna-ink px-6 py-20" style={{ borderTop: '1px solid transparent', borderImage: 'linear-gradient(90deg, transparent, rgba(233,184,255,0.25), rgba(255,158,199,0.25), transparent) 1' }}>
      <div className="mx-auto max-w-7xl">
        {/* Top row */}
        <div className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-flex transition-opacity hover:opacity-85">
              <Logo size={34} animated={false} />
            </Link>
            <p className="text-[0.9375rem] italic text-white/65 leading-relaxed">
              &ldquo;She is not a season ending. She is a sky rearranging.&rdquo;
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[0.8125rem] tracking-[0.25em] uppercase text-white/55">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[0.9375rem] text-white/75 hover:text-white transition-colors duration-300"
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
        <div className="flex flex-col gap-2 border-t border-white/5 pt-8 md:flex-row md:justify-between">
          <p className="text-sm text-white/55">
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
