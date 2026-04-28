-- 0003_search_indexes.sql
-- Full-text search support: pg_trgm extension, generated tsvector columns, GIN indexes.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- daily_logs: tsvector over content_md (which mirrors structured content for FTS)
ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(content_md, ''))) STORED;

CREATE INDEX IF NOT EXISTS daily_logs_search_idx
  ON public.daily_logs USING GIN (search_tsv);

-- accomplishments: tsvector over text + trigram index for fuzzy "looks-like" search
ALTER TABLE public.accomplishments
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
    GENERATED ALWAYS AS (to_tsvector('english', text)) STORED;

CREATE INDEX IF NOT EXISTS accomplishments_search_idx
  ON public.accomplishments USING GIN (search_tsv);

CREATE INDEX IF NOT EXISTS accomplishments_text_trgm_idx
  ON public.accomplishments USING GIN (text gin_trgm_ops);
