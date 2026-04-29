import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/whispers/posts';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://luna.app';

export const metadata: Metadata = {
  title: 'Whispers — Luna Blog',
  description:
    'Gentle wisdom on menopause, hormones, sleep, mood, and navigating the change with grace.',
  openGraph: {
    title: 'Whispers — Luna Blog',
    description: 'Gentle wisdom on menopause and navigating the change.',
    images: [`${BASE_URL}/api/og?title=Whispers&subtitle=Gentle+wisdom+on+menopause`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whispers — Luna Blog',
    description: 'Gentle wisdom on menopause and navigating the change.',
  },
};

export default function WhispersPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-luna-ink px-6 pb-20 pt-28">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, rgba(168,216,201,0.07), transparent 38%), radial-gradient(ellipse at 80% 10%, rgba(255,212,163,0.05), transparent 34%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-fraunces text-4xl md:text-5xl text-aurora mb-4">
            Whispers
          </h1>
          <p className="text-white/65 text-lg mb-12 max-w-xl">
            Gentle wisdom on menopause — the science, the stories, and the seasons
            of change.
          </p>

          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/whispers/${post.slug}`}
                className="block glass-hover rounded-2xl p-6 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <time className="text-xs text-white/45">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span className="text-xs text-white/30">&middot;</span>
                  <span className="text-xs text-white/45">{post.readTime}</span>
                </div>
                <h2 className="font-fraunces text-xl text-white/90 group-hover:text-aurora transition-colors duration-300 mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-white/65 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/55 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
