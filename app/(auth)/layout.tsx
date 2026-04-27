import Logo from '@/components/brand/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="aurora-bg min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Logo at top */}
      <div className="mb-12">
        <Logo size={48} />
      </div>

      {/* Auth content */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Ambient glow */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(233,184,255,0.3) 0%, rgba(255,158,199,0.15) 40%, transparent 70%)',
        }}
      />
    </div>
  );
}
