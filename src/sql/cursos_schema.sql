
-- Create tables for course progress tracking
CREATE TABLE IF NOT EXISTS public.curso_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  progresso INTEGER NOT NULL DEFAULT 0,
  concluido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for course feedback
CREATE TABLE IF NOT EXISTS public.curso_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  avaliacao INTEGER NOT NULL CHECK (avaliacao BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for user badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  badge_name TEXT NOT NULL,
  achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add columns to cursos_narrados table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cursos_narrados' AND column_name = 'dificuldade'
  ) THEN
    ALTER TABLE public.cursos_narrados ADD COLUMN dificuldade TEXT DEFAULT 'Iniciante';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cursos_narrados' AND column_name = 'tipo_acesso'
  ) THEN
    ALTER TABLE public.cursos_narrados ADD COLUMN tipo_acesso TEXT DEFAULT 'Gratuito';
  END IF;
END $$;

-- Create RLS policies for the new tables
ALTER TABLE public.curso_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON public.curso_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.curso_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.curso_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON public.curso_progress FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.curso_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all feedback" ON public.curso_feedback FOR SELECT USING (true);
CREATE POLICY "Users can insert their own feedback" ON public.curso_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON public.curso_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own feedback" ON public.curso_feedback FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own badges" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own badges" ON public.user_badges FOR DELETE USING (auth.uid() = user_id);

-- Create an updated_at trigger for curso_progress
CREATE OR REPLACE FUNCTION public.update_curso_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_curso_progress_timestamp ON public.curso_progress;
CREATE TRIGGER set_curso_progress_timestamp
BEFORE UPDATE ON public.curso_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_curso_progress_timestamp();

-- Create an updated_at trigger for user_badges
CREATE OR REPLACE FUNCTION public.update_user_badges_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_badges_timestamp ON public.user_badges;
CREATE TRIGGER set_user_badges_timestamp
BEFORE UPDATE ON public.user_badges
FOR EACH ROW
EXECUTE FUNCTION public.update_user_badges_timestamp();
