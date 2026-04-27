import Link from 'next/link';
import Logo from '@/components/brand/Logo';

const COLUMNS = [
  {
    title: 'Luna',
    links: [
      { label: 'Story', href: '/about' },
      { label: 'Science', href: '/science' },
      { label: 'Pricing', href: '/pricing' },
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
    <footer className="relative border-t border-white/5 bg-luna-ink px-6 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Top row */}
        <div className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-flex transition-opacity hover:opacity-85">
              <Logo size={34} animated={false} />
            </Link>
            <p className="text-sm italic text-white/40 leading-relaxed">
              &ldquo;She is not a season ending. She is a sky rearranging.&rdquo;
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs tracking-[0.25em] uppercase text-white/30">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/50 hover:text-white/90 transition-colors duration-300"
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
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Luna. Made with care.
          </p>
          <p className="text-xs text-white/20">
            Not a medical device. Always consult your clinician.
          </p>
        </div>
      </div>
    </footer>
  );
}
