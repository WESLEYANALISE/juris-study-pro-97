
-- Create table for podcast comments
CREATE TABLE IF NOT EXISTS public.podcast_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS podcast_comments_podcast_id_idx ON public.podcast_comments(podcast_id);
CREATE INDEX IF NOT EXISTS podcast_comments_user_id_idx ON public.podcast_comments(user_id);

-- Create table for podcast likes
CREATE TABLE IF NOT EXISTS public.podcast_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT podcast_likes_unique UNIQUE (podcast_id, user_id)
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS podcast_likes_podcast_id_idx ON public.podcast_likes(podcast_id);
CREATE INDEX IF NOT EXISTS podcast_likes_user_id_idx ON public.podcast_likes(user_id);

-- Enable Row Level Security
ALTER TABLE public.podcast_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Allow users to select all comments" 
  ON public.podcast_comments FOR SELECT 
  USING (true);

CREATE POLICY "Allow users to insert their own comments" 
  ON public.podcast_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own comments" 
  ON public.podcast_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments" 
  ON public.podcast_comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for likes
CREATE POLICY "Allow users to select all likes" 
  ON public.podcast_likes FOR SELECT 
  USING (true);

CREATE POLICY "Allow users to insert their own likes" 
  ON public.podcast_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own likes" 
  ON public.podcast_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at for comments
CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_podcast_comments_timestamp
BEFORE UPDATE ON public.podcast_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp_column();
