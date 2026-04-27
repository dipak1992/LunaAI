import MarketingPage from '@/components/marketing/MarketingPage';

export const metadata = {
  title: 'The Science · Luna',
  description: 'Evidence-informed design behind Luna.',
};

export default function SciencePage() {
  return (
    <MarketingPage
      eyebrow="The Science"
      title={
        <>
          Gentle outside. <span className="italic text-luna-aurora-pink">Rigorous inside.</span>
        </>
      }
      subtitle="The research and reasoning behind how Luna works."
    >
      <h2>The Menopause Gap</h2>
      <p>
        Menopause research remains chronically underfunded, and many clinicians receive
        limited training in menopause care. The result is that millions of women navigate
        the transition without informed support.
      </p>
      <p>
        Luna was designed to fill the space between appointments: a listening, learning
        companion informed by symptom tracking, hormone fluctuation research, and
        reflective support practices.
      </p>

      <h2>Evidence-Informed Principles</h2>
      <h3>1. Longitudinal Tracking Improves Understanding</h3>
      <p>
        Consistent symptom journaling can improve self-awareness and clinical
        conversations. Luna&apos;s check-ins surface patterns too subtle for memory alone.
      </p>

      <h3>2. Voice Reduces Friction</h3>
      <p>
        Lower-friction health tools tend to be easier to keep using. Spoken check-ins
        replace forms with natural speech and capture emotional tone alongside facts.
      </p>

      <h3>3. Reflection, Not Prescription</h3>
      <p>
        Luna reflects rather than advises. She names patterns, offers gentle
        observations, and defers medical decisions to clinicians.
      </p>

      <h2>What Luna Uses</h2>
      <ul>
        <li>Large language models for natural conversation and pattern interpretation.</li>
        <li>Embedding models for semantic long-term memory.</li>
        <li>Whisper for voice transcription.</li>
        <li>Safety classifiers to detect crisis language and route to resources.</li>
      </ul>

      <h2>What Luna Is Not</h2>
      <p>
        Luna is not a diagnostic tool and does not provide medical advice. Forecasts are
        probabilistic reflections of patterns, not clinical predictions.
      </p>

      <p className="callout">
        The best technology in women&apos;s health will not replace clinicians. It will help
        women feel heard between visits and arrive at visits better understood.
      </p>
    </MarketingPage>
  );
}
