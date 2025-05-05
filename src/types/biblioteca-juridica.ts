
export interface LivroJuridico {
  id: string;
  titulo: string;
  categoria: string;
  pdf_url: string;
  capa_url?: string | null;
  descricao?: string | null;
  total_paginas?: number | null;
}
