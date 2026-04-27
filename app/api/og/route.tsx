import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'Luna';
  const subtitle =
    searchParams.get('subtitle') ?? 'Your body\u2019s weather forecast, decoded';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0E27 0%, #2D1B4E 50%, #6B5B95 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Moon glyph */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          style={{ marginBottom: 24 }}
        >
          <circle cx="40" cy="40" r="36" fill="url(#moonGrad)" />
          <circle cx="52" cy="32" r="24" fill="#2D1B4E" />
          <defs>
            <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9B8FF" />
              <stop offset="100%" stopColor="#FFD4A3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 300,
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.2,
            marginBottom: 16,
            background: 'linear-gradient(to right, #E9B8FF, #FF9EC7, #FFD4A3)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            maxWidth: '70%',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>

        {/* Brand footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E9B8FF, #FF9EC7)',
            }}
          />
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
            luna.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
