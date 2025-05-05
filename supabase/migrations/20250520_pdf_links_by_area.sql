
-- Create UUID extension if not already created
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table for PDF links organized by area
CREATE TABLE IF NOT EXISTS pdf_links_by_area (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pdf_name TEXT NOT NULL,
  area TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  original_path TEXT,
  description TEXT,
  total_pages INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_id TEXT
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_pdf_links_area ON pdf_links_by_area(area);
CREATE INDEX IF NOT EXISTS idx_pdf_links_name ON pdf_links_by_area(pdf_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE pdf_links_by_area ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access" 
ON pdf_links_by_area FOR SELECT USING (true);

-- Restrict insert/update/delete to authenticated users
CREATE POLICY "Allow authenticated users to insert"
ON pdf_links_by_area FOR INSERT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update their own records"
ON pdf_links_by_area FOR UPDATE TO authenticated
USING (true);

-- Populate the table with data from biblioteca_juridica10
INSERT INTO pdf_links_by_area (
  pdf_name,
  area,
  pdf_url,
  original_path,
  description,
  total_pages,
  source_id
)
SELECT 
  titulo AS pdf_name,
  categoria AS area,
  pdf_url,
  pdf_url AS original_path,
  descricao AS description,
  total_paginas AS total_pages,
  id AS source_id
FROM 
  biblioteca_juridica10
WHERE 
  pdf_url IS NOT NULL
ON CONFLICT DO NOTHING;
