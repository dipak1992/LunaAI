import Link from 'next/link';
import Logo from '@/components/brand/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="aurora-bg min-h-screen w-full overflow-y-auto flex flex-col items-center justify-start sm:justify-center px-5 py-10 sm:py-16">
      {/* Back to home */}
      <div className="w-full max-w-md mb-8 sm:mb-10">
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

      {/* Logo */}
      <div className="mb-8 sm:mb-12">
        <Logo size={40} />
      </div>

      {/* Auth content */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Ambient glow — decorative, hidden on very small screens to save paint */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(233,184,255,0.3) 0%, rgba(255,158,199,0.15) 40%, transparent 70%)',
        }}
      />
    </div>
  );
}
