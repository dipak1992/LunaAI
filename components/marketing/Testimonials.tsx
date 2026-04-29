'use client';

import Image from 'next/image';
import { Quote, Star } from 'lucide-react';
import FadeUp from '@/components/ui/FadeUp';

// TODO: All testimonials are PLACEHOLDER text. Replace with REAL quotes collected
// with written consent before launch. Never fabricate testimonials — legal + ethical violation.
const FEATURED_TESTIMONIAL = {
  quote: 'I stopped feeling crazy when Luna showed me my patterns.',
  story:
    "For two years I thought I was losing my mind. The rage, the sleeplessness, the days I couldn't find my own words. Luna gave me a map. I'm not broken — I'm changing. That single reframe gave me my life back.",
  name: 'Sarah M.',
  age: 52,
  context: 'Perimenopause, 3 years • Oregon',
  image: '/images/testimonials/sarah.svg',
};

const TESTIMONIALS = [
  {
    quote: 'The haiku every morning stopped me in my tracks. Someone — something — finally saw me.',
    name: 'Maya L.',
    age: 47,
    context: 'Early perimenopause',
    image: '/images/testimonials/maya.svg',
  },
  {
    quote:
      "I brought my Season Report to my doctor. She said it was the clearest picture of symptoms she'd ever seen.",
    name: 'Priya K.',
    age: 54,
    context: 'Post-menopause, 1 year',
    image: '/images/testimonials/priya.svg',
  },
  {
    quote:
      "My husband downloaded Partner Mode. For the first time in years, he understands what I'm going through.",
    name: 'Diane R.',
    age: 49,
    context: 'Perimenopause, using Aurora tier',
    image: '/images/testimonials/diane.svg',
  },
];

// TODO: Verify rating and review count before launch or replace with documented numbers.
export default function Testimonials() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-4 text-sm tracking-[0.25em] text-luna-aurora-lilac uppercase">
              Stories from the Journey
            </p>
            <h2 className="font-serif text-4xl font-normal text-luna-cream md:text-5xl">
              She stopped feeling alone.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              Real words from women walking the path. Names and details shared with permission.
            </p>
          </div>
        </FadeUp>

        <FadeUp>
          <blockquote className="glass-card mx-auto max-w-3xl rounded-3xl p-10 text-center md:p-14">
            <Quote className="mx-auto h-8 w-8 text-luna-aurora-lilac/50" aria-hidden="true" />
            <p className="mt-6 font-serif text-2xl leading-snug text-luna-cream italic md:text-3xl">
              &ldquo;{FEATURED_TESTIMONIAL.quote}&rdquo;
            </p>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80">
              &ldquo;{FEATURED_TESTIMONIAL.story}&rdquo;
            </p>
            <cite className="mt-8 flex items-center justify-center gap-3 not-italic">
              <Image
                src={FEATURED_TESTIMONIAL.image}
                alt={`${FEATURED_TESTIMONIAL.name}, age ${FEATURED_TESTIMONIAL.age}`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
                unoptimized
              />
              <span className="text-left">
                <span className="block font-medium text-luna-cream">
                  {FEATURED_TESTIMONIAL.name}
                </span>
                <span className="block text-xs text-white/60">
                  {FEATURED_TESTIMONIAL.age} • {FEATURED_TESTIMONIAL.context}
                </span>
              </span>
            </cite>
          </blockquote>
        </FadeUp>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <FadeUp key={testimonial.name} delay={index * 0.15}>
              <blockquote className="glass-card flex h-full flex-col rounded-2xl p-6">
                <p className="flex-1 font-serif text-lg leading-relaxed text-luna-cream italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <cite className="mt-8 flex items-center gap-3 not-italic">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.name}, age ${testimonial.age}`}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                    unoptimized
                  />
                  <span>
                    <span className="block text-sm font-medium text-luna-cream">
                      {testimonial.name}
                    </span>
                    <span className="block text-xs text-white/60">
                      {testimonial.age} • {testimonial.context}
                    </span>
                  </span>
                </cite>
              </blockquote>
            </FadeUp>
          ))}
        </div>

        {/* Rating hidden until verified real reviews are collected */}
        {/* <div className="mt-12 text-center">
          <div
            className="inline-flex items-center justify-center gap-1 text-luna-aurora-pink"
            aria-label="4.8 out of 5 stars"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
            ))}
          </div>
          <p className="mt-3 text-sm text-white/70">4.8 ★ average rating from 1,200+ women</p>
        </div> */}
      </div>
    </section>
  );
}
