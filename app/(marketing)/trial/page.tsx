import { Metadata } from 'next';
import { TrialExperience } from '@/components/trial/TrialExperience';

export const metadata: Metadata = {
  title: 'Try Luna Free — Your First Whisper | Luna AI',
  description:
    'Experience Luna with one free voice check-in. No signup required. Share how you\'re feeling and receive a personalized response and haiku.',
  openGraph: {
    title: 'Try Luna Free — Your First Whisper',
    description:
      'One free voice check-in. No signup. Tell Luna how you\'re feeling today.',
  },
};

export default function TrialPage() {
  return (
    <main className="relative min-h-screen aurora-bg flex flex-col items-center justify-center px-4 py-16">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.08) 0%, transparent 60%)',
        }}
      />

      <TrialExperience />

      {/* Footer note */}
      <p className="absolute bottom-6 text-white/25 text-xs text-center px-4">
        Your whisper is processed securely and never shared. Luna is not a medical professional.
      </p>
    </main>
  );
}
