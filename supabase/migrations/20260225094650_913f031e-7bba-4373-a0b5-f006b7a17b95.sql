
-- Add SEO columns to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS og_image text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS og_title text;
