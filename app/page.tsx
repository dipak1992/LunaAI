import Logo from '@/components/brand/Logo';

export default function Page() {
  return (
    <main className="aurora-bg min-h-screen flex flex-col items-center justify-center gap-16 px-6 py-24">

      {/* ── 1. Logo at 3 sizes ── */}
      <section className="flex flex-col items-center gap-8">
        <p className="label-whisper">Logo — three sizes</p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          <Logo size={28} />
          <Logo size={40} />
          <Logo size={64} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-10 mt-2">
          <span className="text-whisper">28px</span>
          <span className="text-whisper">40px (default)</span>
          <span className="text-whisper">64px</span>
        </div>
      </section>

      <div className="divider-aurora w-full max-w-xl" />

      {/* ── 2. Aurora headline ── */}
      <section className="text-center container-prose">
        <p className="label-whisper">text-aurora headline</p>
        <h1 className="text-aurora text-balance">
          Your body&rsquo;s weather forecast, decoded
        </h1>
      </section>

      <div className="divider-aurora w-full max-w-xl" />

      {/* ── 3. Primary button ── */}
      <section className="flex flex-col items-center gap-4">
        <p className="label-whisper">btn-primary</p>
        <button className="btn-primary">
          Begin your story
        </button>
      </section>

      <div className="divider-aurora w-full max-w-xl" />

      {/* ── 4. Glass card with text-poetic ── */}
      <section className="w-full max-w-lg">
        <p className="label-whisper text-center">glass-card + text-poetic</p>
        <div className="glass-card">
          <p className="text-poetic text-lg leading-relaxed">
            &ldquo;You are not broken. You are becoming. Every hot flash, every sleepless
            night, every mood that surprises you — your body is speaking a language
            worth learning.&rdquo;
          </p>
          <p className="text-whisper mt-6">— Luna</p>
        </div>
      </section>

      <div className="divider-aurora w-full max-w-xl" />

      {/* ── 5. Voice orb with animate-breathe ── */}
      <section className="flex flex-col items-center gap-6">
        <p className="label-whisper">voice-orb + animate-breathe</p>
        <div
          className="voice-orb animate-breathe rounded-full"
          style={{ width: 96, height: 96 }}
          aria-label="Luna voice orb"
        />
        <p className="text-whisper">Listening…</p>
      </section>

    </main>
  );
}
