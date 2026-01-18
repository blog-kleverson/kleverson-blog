-- Add show_updated_at column to posts table for controlling visibility of update date
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS show_updated_at boolean NOT NULL DEFAULT false;

-- Add article_url column to leads table to track which article the lead came from
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS article_url text;