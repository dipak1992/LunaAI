import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { getAllPosts } from '@/lib/whispers/posts';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import AuroraBackground from '@/components/marketing/AuroraBackground';
import StarField from '@/components/marketing/StarField';

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
  const [featured, ...rest] = posts;
  const categories = Array.from(new Set(posts.flatMap((post) => post.tags))).slice(0, 7);

  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-x-hidden bg-luna-ink px-6 pb-24 pt-28 text-luna-cream">
        <AuroraBackground />
        <StarField />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, rgba(168,216,201,0.07), transparent 38%), radial-gradient(ellipse at 80% 10%, rgba(255,212,163,0.05), transparent 34%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <section className="pb-14 pt-6 md:pb-18">
            <p className="mb-4 text-sm uppercase tracking-[0.14em] text-luna-aurora-mint/80">
              Whispers
            </p>
            <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-end">
              <div>
                <h1 className="font-fraunces text-5xl leading-tight text-luna-cream md:text-7xl">
                  Calm education for the change no one explained.
                </h1>
              </div>
              <div>
                <p className="max-w-xl text-lg leading-8 text-white/72">
                  Gentle wisdom on menopause — the science, the stories, and the seasons
                  of change.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {categories.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {featured && (
            <Link
              href={`/whispers/${featured.slug}`}
              className="group grid overflow-hidden rounded-2xl border border-[#eadfd5] bg-luna-cream text-luna-ink shadow-2xl shadow-black/20 transition-transform hover:-translate-y-1 md:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="relative min-h-64 bg-[radial-gradient(ellipse_at_35%_25%,rgba(168,216,201,0.5),transparent_46%),linear-gradient(135deg,#fbf7f1,#eadfd5)] p-8">
                <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-luna-ink/10 bg-white/70 p-5 shadow-xl">
                  <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-luna-ink/55">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Featured whisper
                  </div>
                  <p className="font-serif text-3xl leading-tight text-luna-ink">
                    {featured.tags[0]}
                  </p>
                </div>
              </div>
              <div className="p-8 md:p-10">
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-luna-ink/55">
                  <time>
                    {new Date(featured.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span>&middot;</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="font-fraunces text-3xl leading-tight text-luna-ink md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-5 text-base leading-7 text-luna-ink/70">
                  {featured.description}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-luna-storm">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          )}

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/whispers/${post.slug}`}
                className="group block rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-400 hover:border-luna-cream/25 hover:bg-luna-cream hover:text-luna-ink hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15"
              >
                <div className="flex items-center gap-3 mb-2">
                  <time className="text-xs text-white/50 group-hover:text-luna-ink/55">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span className="text-xs text-white/30 group-hover:text-luna-ink/35">&middot;</span>
                  <span className="text-xs text-white/50 group-hover:text-luna-ink/55">{post.readTime}</span>
                </div>
                <h2 className="font-fraunces text-xl text-white/90 transition-colors duration-300 group-hover:text-luna-ink mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-white/65 line-clamp-2 group-hover:text-luna-ink/68">
                  {post.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/55 border border-white/10 group-hover:border-luna-ink/10 group-hover:bg-luna-aurora-mint/15 group-hover:text-luna-ink/65"
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
