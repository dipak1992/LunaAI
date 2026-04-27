import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import PageTransition from '@/components/effects/PageTransition';
import { OrganizationLd, SoftwareApplicationLd } from '@/components/seo/JsonLd';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://luna.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Luna \u2014 Your body\u2019s weather forecast, decoded',
    template: '%s | Luna',
  },
  description:
    'The AI menopause companion who actually knows you. Voice check-ins, predictive forecasts, and a companion who remembers.',
  keywords: [
    'menopause',
    'perimenopause',
    'AI companion',
    'symptom tracker',
    'hot flashes',
    'hormone health',
    'women health',
    'menopause app',
  ],
  authors: [{ name: 'Luna' }],
  creator: 'Luna',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Luna',
    title: 'Luna \u2014 Your body\u2019s weather forecast, decoded',
    description:
      'Menopause isn\u2019t a problem to solve. It\u2019s a season to understand.',
    images: [
      {
        url: `${BASE_URL}/api/og?title=Luna&subtitle=Your+body%E2%80%99s+weather+forecast%2C+decoded`,
        width: 1200,
        height: 630,
        alt: 'Luna \u2014 AI Menopause Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luna \u2014 Your body\u2019s weather forecast, decoded',
    description:
      'The AI menopause companion who actually knows you.',
    images: [
      `${BASE_URL}/api/og?title=Luna&subtitle=Your+body%E2%80%99s+weather+forecast%2C+decoded`,
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <OrganizationLd url={BASE_URL} />
        <SoftwareApplicationLd url={BASE_URL} />
      </head>
      <body className="min-h-full flex flex-col">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
