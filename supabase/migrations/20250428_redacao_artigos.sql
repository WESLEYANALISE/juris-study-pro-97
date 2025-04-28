
-- Create redacao_artigos table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.redacao_artigos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  playlist_ids TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add is_single_video column to video_playlists_juridicas if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'video_playlists_juridicas' AND column_name = 'is_single_video'
  ) THEN
    ALTER TABLE public.video_playlists_juridicas 
    ADD COLUMN is_single_video BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add video_id column to video_playlists_juridicas if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'video_playlists_juridicas' AND column_name = 'video_id'
  ) THEN
    ALTER TABLE public.video_playlists_juridicas 
    ADD COLUMN video_id TEXT;
  END IF;
END $$;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for redacao_artigos
DROP TRIGGER IF EXISTS update_redacao_artigos_updated_at ON public.redacao_artigos;
CREATE TRIGGER update_redacao_artigos_updated_at
BEFORE UPDATE ON public.redacao_artigos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on redacao_artigos table
ALTER TABLE public.redacao_artigos ENABLE ROW LEVEL SECURITY;

-- Create policy for everyone to be able to read articles
CREATE POLICY "Everyone can read articles" ON public.redacao_artigos
  FOR SELECT
  USING (true);

-- Add a single article example to get started
INSERT INTO public.redacao_artigos (titulo, conteudo, categoria, tags)
VALUES (
  'Princípios da Redação Jurídica Moderna',
  '# Princípios da Redação Jurídica Moderna

## Clareza e Objetividade

A redação jurídica moderna prioriza a clareza e a objetividade. O objetivo é comunicar com precisão o argumento jurídico sem recorrer ao vocabulário rebuscado e às construções sintáticas complexas que caracterizavam os textos jurídicos tradicionais.

## Linguagem Técnica e Acessível

A linguagem técnica é indispensável, mas deve ser utilizada de forma acessível. Os termos técnicos são necessários para a precisão, mas devem ser empregados com moderação e, quando possível, acompanhados de explicações claras.

## Estrutura Lógica

Um texto jurídico bem estruturado segue uma progressão lógica de ideias, com introdução, desenvolvimento e conclusão bem definidos. A divisão em tópicos facilita a leitura e a compreensão.

## Argumentação Fundamentada

A argumentação jurídica deve estar bem fundamentada em normas, doutrina e jurisprudência. As citações devem ser precisas e relevantes, evitando o uso excessivo apenas para demonstração de erudição.',
  'Redação Jurídica',
  ARRAY['Redação', 'Técnica', 'Modernidade']
);

-- Add all RLS policies for video_playlists_juridicas if they don't exist yet
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'video_playlists_juridicas' AND policyname = 'Everyone can read video playlists'
  ) THEN
    CREATE POLICY "Everyone can read video playlists" ON public.video_playlists_juridicas
      FOR SELECT
      USING (true);
  END IF;
END $$;
