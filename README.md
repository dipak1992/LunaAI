# 🌙 Luna — AI Menopause Companion

> *"She is not a season ending. She is a sky rearranging."*

Luna is a voice-first AI companion designed for women navigating perimenopause and menopause. Instead of cold symptom trackers and clinical dashboards, Luna listens, remembers, and helps women understand their body as a **weather system** — with daily forecasts, pattern insights, and a companion who truly remembers.

---

## ✨ What Luna Does

| Feature | Description |
|---|---|
| 🎙️ **Voice Check-ins** | Speak naturally — Luna transcribes, understands, and responds with empathy |
| 🌤️ **Body Weather Forecast** | 7-day symptom forecasts framed as weather (sunny, cloudy, stormy) |
| 🧠 **Long-term Memory** | Pinecone vector DB stores and retrieves personal context across sessions |
| 💬 **AI Chat** | Ongoing conversation with Luna, context-aware and memory-backed |
| 📊 **Insights & Trends** | Calendar heatmap, symptom frequency charts, trend analysis |
| 🌸 **Daily Haiku** | A personalized poetic reflection generated from your check-in |
| 📋 **Season Reports** | Monthly PDF reports for clinician visits |
| 🔐 **Subscription Tiers** | Free (New Moon), Full Moon ($19/mo), Aurora ($39/mo) via Stripe |
| 🔗 **Referral Program** | Share Luna with friends, track referrals |
| 📝 **Whispers Blog** | Educational content about menopause, hormones, and wellbeing |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 (all tokens in `@theme {}`) |
| **Animations** | Framer Motion 12 |
| **Auth & DB** | Supabase (SSR client, RLS policies) |
| **AI** | OpenAI GPT-4o via AI SDK v6 (`ai` + `@ai-sdk/openai`) |
| **Voice** | OpenAI Whisper (transcription) |
| **Vector Memory** | Pinecone SDK v6 (`luna-memory` index, 1536 dims, cosine) |
| **Embeddings** | OpenAI `text-embedding-3-small` |
| **Payments** | Stripe (checkout, portal, webhooks) |
| **PDF Reports** | `@react-pdf/renderer` |
| **OG Images** | `@vercel/og` (edge runtime) |
| **Sound** | Howler.js |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
luna-web/
├── app/
│   ├── (app)/                    # Authenticated app routes
│   │   ├── dashboard/            # Main dashboard with voice orb
│   │   ├── chat/                 # AI chat with Luna
│   │   ├── insights/             # Trends, heatmap, charts
│   │   ├── haikus/               # Saved daily haikus
│   │   └── settings/             # Profile, billing, sign out
│   ├── (auth)/                   # Auth routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/             # Supabase OAuth callback
│   ├── (marketing)/              # Public marketing pages
│   │   ├── page.tsx              # Landing page
│   │   ├── about/
│   │   ├── science/
│   │   ├── pricing/
│   │   ├── whispers/             # Blog index + posts
│   │   ├── privacy/
│   │   └── terms/
│   ├── api/
│   │   ├── chat/                 # AI chat stream endpoint
│   │   ├── voice-checkin/        # Voice transcription + AI response
│   │   ├── forecast/             # 7-day body weather forecast
│   │   ├── insights/             # Aggregated symptom data
│   │   ├── memory/               # Pinecone memory CRUD + sync
│   │   ├── haiku/                # Daily haiku generation + collection
│   │   ├── reports/monthly/      # PDF season report generation
│   │   ├── referral/             # Referral code generation + redemption
│   │   ├── stripe/               # Checkout, portal, webhook
│   │   ├── transcribe/           # Whisper transcription
│   │   ├── usage/                # Usage tracking
│   │   └── og/                   # Dynamic OG image generation
│   ├── globals.css               # Tailwind v4 design system
│   ├── layout.tsx                # Root layout with metadata + JSON-LD
│   ├── sitemap.ts                # Auto-generated sitemap
│   └── robots.ts                 # robots.txt
├── components/
│   ├── brand/Logo.tsx            # Animated Luna moon logo
│   ├── dashboard/                # VoiceCheckInModal, VoiceOrb, WeatherScore
│   ├── forecast/                 # ForecastStrip, WeatherIcon, StormAlert
│   ├── insights/                 # CalendarHeatmap, TrendChart, SymptomFrequency
│   ├── chat/                     # Message, ChatInput, TypingIndicator
│   ├── haiku/                    # HaikuCard, TodayHaiku
│   ├── marketing/                # Header (mobile hamburger), Footer, AuroraBackground
│   ├── seo/JsonLd.tsx            # Structured data (Organization, SoftwareApp, BlogPost)
│   ├── subscription/             # ManageSubscriptionButton, UpgradeModal
│   └── ui/                       # FadeUp, GlowButton, Modal, WhisperToast
├── lib/
│   ├── ai/luna-prompt.ts         # Luna system prompt builder
│   ├── forecast/                 # Forecast generation + trigger logic
│   ├── haiku/generate.ts         # Haiku generation from check-in
│   ├── memory/
│   │   ├── pinecone-client.ts    # Singleton Pinecone client
│   │   ├── embeddings.ts         # OpenAI embedding helpers
│   │   └── pinecone.ts           # Memory CRUD (upsert, query, delete)
│   ├── reports/                  # Season report PDF builder
│   ├── safety/                   # Crisis detection + logging
│   ├── subscription/             # Tier limits, usage tracking
│   ├── supabase/                 # Server + client + middleware + service clients
│   ├── stripe/client.ts          # Stripe singleton
│   └── whispers/posts.ts         # Static blog post data
├── supabase/
│   ├── migrations/               # All DB migrations (idempotent)
│   └── seed-test-user.sql        # Test user creation script
└── types/                        # TypeScript types (database, voice, etc.)
```

---

## 🗄️ Database Schema (Supabase)

| Table | Purpose |
|---|---|
| `profiles` | User profile, subscription tier, onboarding status |
| `symptom_logs` | Voice check-in data (symptoms, triggers, scores) |
| `forecasts` | 7-day body weather forecasts |
| `chat_messages` | Persistent chat history |
| `user_memory` | Pinecone memory index (type, content, pinecone_id) |
| `usage_events` | Feature usage tracking for tier limits |
| `haikus` | Saved daily haikus |
| `crisis_events` | Safety crisis detection logs |
| `referrals` | Referral tracking (referrer, referred, status) |

### Subscription Tiers

| Tier | Price | Features |
|---|---|---|
| `free` (New Moon) | $0 | 3 check-ins/week, 10 chats/day, 7-day memory |
| `full_moon` | $19/mo | Unlimited check-ins + chat, forecasts, long-term memory |
| `aurora` | $39/mo | Everything + doctor reports, partner mode, priority support |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- OpenAI API key
- Pinecone API key (index: `luna-memory`, 1536 dims, cosine, AWS us-east-1 serverless)
- Stripe account (optional for payments)

### Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=luna-memory

# Stripe (optional)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FULLMOON_MONTHLY=price_...
STRIPE_PRICE_FULLMOON_YEARLY=price_...
STRIPE_PRICE_AURORA_MONTHLY=price_...
STRIPE_PRICE_AURORA_YEARLY=price_...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Database Setup

Run all migrations in order in the Supabase SQL Editor:

```
supabase/migrations/20250427_chat_messages.sql
supabase/migrations/20250427_forecasts.sql
supabase/migrations/20250428_insights.sql
supabase/migrations/20250428_user_memory_upgrade.sql
supabase/migrations/20250429_subscriptions_and_usage.sql
supabase/migrations/20250430_haikus.sql
supabase/migrations/20250501_crisis_events.sql
supabase/migrations/20250502_referrals.sql
```

### Create a Test User

Run `supabase/seed-test-user.sql` in the Supabase SQL Editor to create a test user with Aurora access:
- **Email:** `dibhavisualai@gmail.com`
- **Password:** `Nep@l9057`

---

## 🎨 Design System

Luna uses a custom **Celestial Bloom** design system built on Tailwind CSS v4:

- **Colors:** `luna-ink` (deep dark), `luna-cream`, `luna-aurora-pink`, `luna-aurora-lilac`, `luna-aurora-blue`, `luna-aurora-mint`
- **Fonts:** Fraunces (serif, headings) + Inter (sans, body)
- **Font weight:** 400 minimum (optimized for 35+ readability)
- **Contrast:** All body text `white/90+`, labels `white/65+`
- **Effects:** Aurora gradient backgrounds, glass morphism cards, breathing orb animations
- **Components:** `.glass`, `.glass-card`, `.btn-primary`, `.btn-secondary`, `.input-underline`, `.aurora-bg`, `.voice-orb`

---

## 🔒 Safety

Luna includes a crisis detection system:
- Detects distress signals in voice check-ins and chat
- Logs crisis events to `crisis_events` table
- Shows `CrisisModal` with emergency resources
- Crisis resources always accessible at `/privacy#crisis`

---

## 📈 SEO & Growth

- Dynamic OG images via `/api/og` (edge runtime)
- Auto-generated `sitemap.xml` and `robots.txt`
- JSON-LD structured data (Organization, SoftwareApplication, BlogPosting)
- Per-page metadata with `generateMetadata`
- Blog at `/whispers` with 5 educational posts
- Referral program via `/api/referral`

---

## 🧠 Memory Architecture

Luna's long-term memory uses a hybrid approach:

1. **Supabase** (`user_memory` table) — stores memory metadata, type, source, dedup hash
2. **Pinecone** (`luna-memory` index) — stores 1536-dim embeddings for semantic search
3. **Flow:** After each check-in or chat, key facts are extracted → embedded → upserted to Pinecone → retrieved on next conversation via cosine similarity

---

## 📱 Mobile

- Fully responsive, optimized for 35+ women on mobile
- Dashboard: hamburger menu, time-of-day greeting, voice orb
- Auth pages: scrollable, safe-area padding, back navigation
- Marketing header: animated hamburger with slide-down drawer
- Minimum font size: 17px (1.0625rem), weight 400

---

## 🚢 Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Set all environment variables in the Vercel dashboard. The app uses Next.js edge runtime for OG image generation.

---

## 📄 License

Private — All rights reserved © 2026 Luna.
