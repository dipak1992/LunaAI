-- ============================================================
-- Phase 9: Long-term Memory — user_memory table upgrade
-- ============================================================

-- Ensure table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.user_memory (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text        NOT NULL,
  type        text        NOT NULL DEFAULT 'fact',
  source      text,
  pinecone_id text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from earlier phases
ALTER TABLE public.user_memory ADD COLUMN IF NOT EXISTS type        text DEFAULT 'fact';
ALTER TABLE public.user_memory ADD COLUMN IF NOT EXISTS source      text;
ALTER TABLE public.user_memory ADD COLUMN IF NOT EXISTS pinecone_id text;

-- Indexes
CREATE INDEX IF NOT EXISTS user_memory_user_id_idx
  ON public.user_memory (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_memory_pinecone_idx
  ON public.user_memory (pinecone_id);

-- Dedup: same user + same content = one row
CREATE UNIQUE INDEX IF NOT EXISTS user_memory_unique_content_idx
  ON public.user_memory (user_id, md5(content));

-- RLS
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own memory"   ON public.user_memory;
CREATE POLICY "users read own memory"
  ON public.user_memory FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users insert own memory" ON public.user_memory;
CREATE POLICY "users insert own memory"
  ON public.user_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users delete own memory" ON public.user_memory;
CREATE POLICY "users delete own memory"
  ON public.user_memory FOR DELETE
  USING (auth.uid() = user_id);
