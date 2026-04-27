import MarketingPage from '@/components/marketing/MarketingPage';

export const metadata = {
  title: 'Privacy Policy · Luna',
  description: 'How Luna protects your story.',
};

export default function PrivacyPage() {
  return (
    <MarketingPage
      eyebrow="Privacy Policy"
      title={
        <>
          Your story, <span className="italic text-luna-aurora-pink">deeply yours.</span>
        </>
      }
      subtitle="What we collect, what we do not, and how we keep it safe."
      lastUpdated="January 2025"
    >
      <p className="callout">
        Short version: Your voice, your data, your story. We never sell it. You can
        delete everything with one click.
      </p>

      <h2>1. Who We Are</h2>
      <p>
        Luna is a wellness companion for women navigating perimenopause and menopause.
        This Privacy Policy explains what data we collect, why we collect it, and what
        rights you have.
      </p>

      <h2>2. What We Collect</h2>
      <h3>Account Data</h3>
      <ul>
        <li>Email address and display name for sign-in.</li>
        <li>Payment information processed by Stripe. We never see card numbers.</li>
      </ul>

      <h3>Health And Wellness Data You Share</h3>
      <ul>
        <li>Voice check-ins, transcripts, symptom logs, moods, and notes.</li>
        <li>Chat conversations with Luna.</li>
        <li>Onboarding responses such as intention and menopause stage.</li>
      </ul>

      <h3>Technical Data</h3>
      <ul>
        <li>Device type, browser, and IP address for security and analytics.</li>
        <li>Usage events to respect plan limits and improve the product.</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To provide Luna&apos;s companion experience: chat, forecasts, and memory.</li>
        <li>To personalize responses to your specific patterns.</li>
        <li>To process subscriptions and send essential account notices.</li>
        <li>To detect safety risks and respond responsibly.</li>
        <li>To improve Luna in aggregate, not tied to your identity.</li>
      </ul>

      <h2>4. What We Never Do</h2>
      <ul>
        <li>We never sell your data.</li>
        <li>We never share your health data with insurers or employers.</li>
        <li>We never train public AI models on your personal conversations.</li>
        <li>We never expose your story to other users.</li>
      </ul>

      <h2>5. HIPAA And Compliance</h2>
      <p>
        Luna is a wellness companion, not a covered entity under HIPAA. Still, we design
        with healthcare-grade safeguards in mind, including encryption, access controls,
        and row-level security.
      </p>
      <ul>
        <li>Data is encrypted at rest and in transit.</li>
        <li>Access is restricted via role-based controls and row-level security.</li>
        <li>Infrastructure partners include Supabase, Stripe, OpenAI, Pinecone, and Vercel.</li>
      </ul>

      <h2 id="crisis">6. Safety And Crisis Signals</h2>
      <p>
        Luna may detect language suggesting self-harm, severe emotional distress, or
        medical emergency signals. When that happens, Luna may show crisis resources,
        log a limited safety event, and avoid sending the message to the language model.
      </p>

      <h2>7. Your Rights</h2>
      <ul>
        <li>Access your data.</li>
        <li>Delete your account and associated data.</li>
        <li>Correct your information.</li>
        <li>Export your data in a structured format.</li>
        <li>Object to non-essential processing.</li>
      </ul>

      <h2>8. Data Retention</h2>
      <ul>
        <li>Transcripts and symptom logs are retained while your account is active.</li>
        <li>Deleted accounts are purged within 30 days of deletion request.</li>
        <li>Backups are rotated and expunged within 90 days.</li>
      </ul>

      <h2>9. Contact</h2>
      <p>
        Questions, concerns, or requests:{' '}
        <a href="mailto:privacy@luna.app">privacy@luna.app</a>.
      </p>
    </MarketingPage>
  );
}
