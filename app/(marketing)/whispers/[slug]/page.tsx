import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPostBySlug, getAllSlugs } from '@/lib/whispers/posts';
import { BlogPostLd } from '@/components/seo/JsonLd';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://luna.app';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} — Luna Whispers`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [
        `${BASE_URL}/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.description.slice(0, 80))}`,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function WhisperPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Simple markdown → HTML (headings, bold, italic, lists, paragraphs)
  const html = post.body
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('## ')) {
        return `<h2 class="font-fraunces text-2xl text-white/90 mt-8 mb-3">${block.slice(3)}</h2>`;
      }
      if (block.startsWith('- ')) {
        const items = block
          .split('\n')
          .filter((l) => l.startsWith('- '))
          .map((l) => `<li>${formatInline(l.slice(2))}</li>`)
          .join('');
        return `<ul class="list-disc list-inside space-y-1 text-white/70 text-sm leading-relaxed">${items}</ul>`;
      }
      return `<p class="text-white/70 text-sm leading-relaxed">${formatInline(block)}</p>`;
    })
    .join('\n');

  return (
    <>
      <Header />
      <BlogPostLd
        title={post.title}
        description={post.description}
        slug={post.slug}
        publishedAt={post.publishedAt}
        author={post.author}
      />
      <main className="relative min-h-screen bg-luna-ink px-6 pb-20 pt-28">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, rgba(168,216,201,0.07), transparent 38%), radial-gradient(ellipse at 80% 10%, rgba(255,212,163,0.05), transparent 34%)',
          }}
        />
        <article className="relative mx-auto max-w-2xl">
          <Link
            href="/whispers"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            All Whispers
          </Link>

          <header className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <time className="text-xs text-white/45">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <span className="text-xs text-white/30">&middot;</span>
              <span className="text-xs text-white/45">{post.readTime}</span>
            </div>
            <h1 className="font-fraunces text-3xl md:text-4xl text-aurora mb-4">
              {post.title}
            </h1>
            <p className="text-white/65 text-base">{post.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-xs bg-white/5 text-white/55 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div
            className="prose-luna space-y-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* CTA */}
          <div className="mt-16 glass-aurora rounded-2xl p-8 text-center">
            <p className="font-fraunces text-xl text-white/80 mb-3">
              Track your own patterns with Luna
            </p>
            <p className="text-sm text-white/40 mb-5">
              Voice check-ins, predictive forecasts, and a companion who remembers.
            </p>
            <Link
              href="/signup"
              className="btn-primary text-sm px-6 py-2.5 inline-block"
            >
              Begin free
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90 font-medium">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\u2192/g, '→');
}
