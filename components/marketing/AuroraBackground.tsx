'use client';

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* Top-left aurora blob */}
      <div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px] animate-breathe"
        style={{ background: 'radial-gradient(circle, #C8A8E9 0%, transparent 70%)' }}
      />
      {/* Top-right aurora blob */}
      <div
        className="absolute -top-20 -right-40 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #8FB8E8 0%, transparent 70%)',
          animation: 'breathe 8s ease-in-out infinite 2s',
        }}
      />
      {/* Bottom-center aurora blob */}
      <div
        className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full opacity-10 blur-[120px]"
        style={{
          background: 'radial-gradient(ellipse, #FF9AAE 0%, transparent 70%)',
          animation: 'breathe 10s ease-in-out infinite 1s',
        }}
      />
    </div>
  );
}
