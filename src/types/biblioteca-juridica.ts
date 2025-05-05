
export interface LivroJuridico {
  id: string;
  titulo: string;
  categoria: string;
  pdf_url: string;
  capa_url?: string | null;
  descricao?: string | null;
  total_paginas?: number | null;
  autor?: string | null;
}

export interface ProgressoLeitura {
  id: string;
  user_id: string;
  livro_id: string;
  pagina_atual: number;
  ultima_leitura: string;
  favorito: boolean;
}

export interface Marcador {
  id: string;
  user_id: string;
  livro_id: string;
  pagina: number;
  descricao: string;
  created_at: string;
}

export interface Anotacao {
  id: string;
  user_id: string;
  livro_id: string;
  pagina: number;
  texto: string;
  created_at: string;
}
