export interface WhisperPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;    // ISO date
  author: string;
  readTime: string;       // e.g. "4 min read"
  tags: string[];
  body: string;           // markdown content
}

const posts: WhisperPost[] = [
  {
    slug: 'what-is-perimenopause',
    title: 'What Is Perimenopause? The Season Before the Season',
    description:
      'Perimenopause can start years before menopause. Here\u2019s what\u2019s actually happening in your body \u2014 and why it matters.',
    publishedAt: '2025-04-15',
    author: 'Luna Team',
    readTime: '5 min read',
    tags: ['perimenopause', 'hormones', 'education'],
    body: `## The Quiet Shift

Perimenopause isn\u2019t a switch that flips. It\u2019s a tide that turns \u2014 slowly, unevenly, sometimes years before your last period.

Most women enter perimenopause in their early-to-mid 40s, though it can begin as early as 35. During this time, estrogen and progesterone fluctuate unpredictably, creating a cascade of symptoms that can feel confusing, isolating, or even frightening.

## What\u2019s Actually Happening

Your ovaries are gradually producing less estrogen, but not in a straight line. Some months you may produce *more* estrogen than usual, followed by a sharp drop. This rollercoaster is what drives many perimenopausal symptoms:

- **Hot flashes and night sweats** \u2014 your thermostat recalibrating
- **Sleep disruption** \u2014 often the first sign
- **Mood changes** \u2014 anxiety, irritability, or a fog that wasn\u2019t there before
- **Irregular periods** \u2014 shorter, longer, heavier, lighter
- **Brain fog** \u2014 difficulty concentrating or finding words

## Why It Matters

Understanding that these changes are *hormonal* \u2014 not psychological, not imagined \u2014 is the first step toward navigating them with grace. You\u2019re not losing yourself. You\u2019re meeting a new season.

Luna tracks these patterns over time, helping you see the weather of your body \u2014 so nothing catches you unprepared.`,
  },
  {
    slug: 'hot-flashes-explained',
    title: 'Hot Flashes: Why Your Body\u2019s Thermostat Goes Haywire',
    description:
      'The science behind hot flashes, what triggers them, and evidence-based ways to find relief.',
    publishedAt: '2025-04-20',
    author: 'Luna Team',
    readTime: '4 min read',
    tags: ['hot flashes', 'symptoms', 'remedies'],
    body: `## The Internal Storm

A hot flash feels like someone turned up the heat from the inside. Your face flushes, your chest burns, sweat appears from nowhere \u2014 and then, just as suddenly, you\u2019re cold.

## The Science

Hot flashes happen when declining estrogen narrows your thermoneutral zone \u2014 the temperature range where your body feels comfortable. Even tiny fluctuations in core temperature can trigger a full vasodilation response: blood vessels dilate, skin flushes, sweat glands activate.

## Common Triggers

- Alcohol (especially red wine)
- Spicy food
- Caffeine
- Stress and anxiety
- Hot environments
- Tight clothing

## What Helps

**Lifestyle:**
- Layer clothing for quick removal
- Keep your bedroom cool (65\u00b0F / 18\u00b0C)
- Practice slow breathing when one starts
- Regular exercise (counterintuitive but effective)

**Evidence-based options:**
- HRT (most effective for severe flashes)
- Cognitive behavioral therapy (CBT)
- Certain SSRIs (prescribed off-label)
- Black cohosh (modest evidence)

Luna helps you identify *your* specific triggers by tracking patterns over time \u2014 because everyone\u2019s storm has different weather.`,
  },
  {
    slug: 'sleep-and-menopause',
    title: 'Why Menopause Steals Your Sleep (And How to Reclaim It)',
    description:
      'Sleep disruption is one of the earliest and most persistent menopause symptoms. Here\u2019s what\u2019s happening and what works.',
    publishedAt: '2025-04-25',
    author: 'Luna Team',
    readTime: '5 min read',
    tags: ['sleep', 'insomnia', 'remedies'],
    body: `## The 3am Wake-Up

You fall asleep fine. Then at 2 or 3am, you\u2019re wide awake \u2014 mind racing, body hot, unable to drift back. Sound familiar?

Sleep disruption affects up to 60% of menopausal women. It\u2019s not just annoying \u2014 it cascades into fatigue, brain fog, mood changes, and weakened immunity.

## Why It Happens

- **Declining progesterone** \u2014 your natural sedative
- **Night sweats** \u2014 waking you with heat and damp sheets
- **Cortisol shifts** \u2014 stress hormones peaking at the wrong time
- **Reduced melatonin** \u2014 your sleep signal weakens with age

## What Actually Works

**Sleep hygiene (the basics):**
- Consistent wake time (even weekends)
- Cool, dark bedroom
- No screens 1 hour before bed
- Limit caffeine after noon

**Targeted strategies:**
- Magnesium glycinate before bed
- Progesterone therapy (discuss with your doctor)
- CBT-I (cognitive behavioral therapy for insomnia)
- Weighted blankets (grounding effect)

**What Luna does:**
Luna tracks your sleep quality alongside other symptoms, revealing patterns you might miss \u2014 like how a stressful Tuesday predicts a rough Wednesday night.`,
  },
  {
    slug: 'brain-fog-menopause',
    title: 'Menopause Brain Fog: You\u2019re Not Losing Your Mind',
    description:
      'Cognitive changes during menopause are real, temporary, and manageable. Here\u2019s the science and the reassurance.',
    publishedAt: '2025-04-28',
    author: 'Luna Team',
    readTime: '4 min read',
    tags: ['brain fog', 'cognition', 'reassurance'],
    body: `## The Missing Words

You walk into a room and forget why. You search for a word that was *right there*. You read a paragraph three times. This is menopause brain fog \u2014 and it\u2019s real.

## The Reassurance

Research shows that cognitive changes during perimenopause are **temporary**. Your brain is adapting to new hormonal levels, not declining. Studies following women through the menopause transition show that cognitive function returns to baseline after the transition completes.

## What\u2019s Happening

Estrogen plays a key role in:
- Memory consolidation
- Verbal fluency
- Processing speed
- Attention and focus

When estrogen fluctuates wildly (perimenopause) or drops significantly (menopause), these functions are temporarily affected.

## What Helps

- **Exercise** \u2014 increases BDNF (brain growth factor)
- **Sleep** \u2014 the single most important factor
- **Omega-3 fatty acids** \u2014 DHA supports brain cell membranes
- **Mental stimulation** \u2014 learning new skills, not just puzzles
- **Stress reduction** \u2014 cortisol is toxic to memory centers
- **HRT** \u2014 may help if started during perimenopause

You\u2019re not losing your mind. You\u2019re weathering a storm \u2014 and it will pass.`,
  },
  {
    slug: 'mood-changes-anxiety',
    title: 'The Anxiety No One Warned You About',
    description:
      'Menopause-related anxiety and mood changes are among the most distressing symptoms. Understanding why helps.',
    publishedAt: '2025-05-01',
    author: 'Luna Team',
    readTime: '5 min read',
    tags: ['anxiety', 'mood', 'mental health'],
    body: `## When Calm Disappears

You\u2019ve never been an anxious person. But suddenly, your heart races for no reason. You feel a dread you can\u2019t name. Small things feel overwhelming. This isn\u2019t you \u2014 or is it?

## It\u2019s Hormonal

Estrogen and progesterone both influence serotonin, GABA, and other neurotransmitters that regulate mood. When these hormones fluctuate or decline:

- **Serotonin drops** \u2192 low mood, irritability
- **GABA decreases** \u2192 anxiety, racing thoughts
- **Norepinephrine shifts** \u2192 panic-like sensations

This isn\u2019t weakness. It\u2019s biochemistry.

## What Helps

**Immediate relief:**
- Box breathing (4-4-4-4)
- Cold water on wrists
- Grounding (5 things you can see, 4 you can touch...)
- Movement \u2014 even a 10-minute walk

**Longer-term:**
- Regular exercise (30 min, 5x/week)
- Therapy (especially CBT)
- HRT (can dramatically improve mood)
- Limiting alcohol and caffeine
- Community \u2014 talking to others who understand

Luna notices your emotional patterns and gently reflects them back \u2014 so you can see the weather changing before the storm arrives.`,
  },
];

export function getAllPosts(): WhisperPost[] {
  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string): WhisperPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}
