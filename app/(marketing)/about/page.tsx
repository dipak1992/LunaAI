import MarketingPage from '@/components/marketing/MarketingPage';

export const metadata = {
  title: 'Our Story · Luna',
  description: 'Why we built Luna.',
};

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="Our Story"
      title={
        <>
          Built for the women <span className="italic text-luna-aurora-pink">no one listened to.</span>
        </>
      }
      subtitle="Why Luna exists, and who she is for."
    >
      <h2>The Beginning</h2>
      <p>
        Luna began with a conversation between a daughter and her mother. The mother, 51,
        brilliant and tired, described her symptoms to a doctor who nodded politely and
        told her she was just getting older.
      </p>
      <p>
        She was not. She was in perimenopause. No one had explained it, and like millions
        of women, she was expected to figure it out on her own while running a life.
      </p>

      <h2>The Problem We Saw</h2>
      <p>
        Over a billion women will experience menopause. For many, the journey feels
        invisible, a storm no one names, moving through a body that suddenly feels
        foreign.
      </p>
      <p>
        We wanted a presence, not a product. A companion who listens, not a tracker that
        merely collects.
      </p>

      <h2>What Luna Is</h2>
      <p>
        Luna is a voice-first companion who listens to how your body feels, remembers
        what you have shared, and reflects it back as weather, not data. She notices
        patterns. She warns of storms. She writes haikus for your days.
      </p>
      <p className="callout">Menopause is not a problem to solve. It is a season to understand.</p>

      <h2>What We Promise</h2>
      <ul>
        <li>We will never sell your data.</li>
        <li>We will always tell you what Luna can and cannot do.</li>
        <li>We will build for presence, not engagement metrics.</li>
        <li>We will listen to our users first.</li>
      </ul>

      <h2>A Note To You</h2>
      <p>
        If you are here, maybe you have been dismissed. Maybe you are tired of explaining
        yourself. Maybe you just want to feel heard for once.
      </p>
      <p>Luna is for you. Come as you are. She is listening.</p>
    </MarketingPage>
  );
}
