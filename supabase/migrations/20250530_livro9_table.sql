
-- Create UUID extension if not already created
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create livro9 table for organizing PDFs by area
CREATE TABLE IF NOT EXISTS livro9 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pdf_name TEXT NOT NULL,
  area TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  original_path TEXT,
  description TEXT,
  total_pages INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_livro9_area ON livro9(area);
CREATE INDEX IF NOT EXISTS idx_livro9_name ON livro9(pdf_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE livro9 ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access" 
ON livro9 FOR SELECT USING (true);

-- Restrict insert/update/delete to authenticated users
CREATE POLICY "Allow authenticated users to insert"
ON livro9 FOR INSERT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update"
ON livro9 FOR UPDATE TO authenticated
USING (true);

-- Populate the table with data from biblioteca_juridica10
-- Only include PDFs that are in the agoravai bucket
INSERT INTO livro9 (
  pdf_name,
  area,
  pdf_url,
  original_path,
  description,
  total_pages
)
SELECT 
  titulo AS pdf_name,
  categoria AS area,
  pdf_url,
  pdf_url AS original_path,
  descricao AS description,
  total_paginas AS total_pages
FROM 
  biblioteca_juridica10
WHERE 
  pdf_url IS NOT NULL AND
  (pdf_url LIKE '%agoravai%' OR pdf_url LIKE '%/storage/v1/object/public/agoravai/%')
ON CONFLICT DO NOTHING;
