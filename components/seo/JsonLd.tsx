interface OrganizationLdProps {
  url?: string;
}

export function OrganizationLd({ url = 'https://luna.app' }: OrganizationLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Luna',
    url,
    logo: `${url}/og-image.png`,
    description:
      'The AI menopause companion who actually knows you. Not another tracker — a companion.',
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SoftwareApplicationLd({ url = 'https://luna.app' }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Luna',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    url,
    description:
      'AI-powered menopause companion with voice check-ins, predictive forecasting, and long-term memory.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '120',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BlogPostLdProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  author?: string;
  url?: string;
}

export function BlogPostLd({
  title,
  description,
  slug,
  publishedAt,
  author = 'Luna Team',
  url = 'https://luna.app',
}: BlogPostLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: `${url}/whispers/${slug}`,
    datePublished: publishedAt,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Luna',
      logo: { '@type': 'ImageObject', url: `${url}/og-image.png` },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
