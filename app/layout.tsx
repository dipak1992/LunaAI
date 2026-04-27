import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import PageTransition from '@/components/effects/PageTransition';
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

export const metadata: Metadata = {
  title: 'Luna — Your body\u2019s weather forecast, decoded',
  description:
    'The AI menopause companion who actually knows you. Not another tracker \u2014 a companion.',
  openGraph: {
    title: 'Luna — Your body\u2019s weather forecast, decoded',
    description:
      'Menopause isn\u2019t a problem to solve. It\u2019s a season to understand.',
    images: ['/og-image.png'],
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
      <body className="min-h-full flex flex-col">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
