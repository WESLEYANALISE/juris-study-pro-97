
export interface LivroPro {
  id: string;
  nome: string;
  pdf: string;
  categoria: string;
  capa_url: string | null;
  descricao: string | null;
  total_paginas: number | null;
  created_at: string;
  updated_at: string;
}

export interface Anotacao {
  id: string;
  livro_id: string;
  user_id: string;
  texto: string;
  pagina: number;
  posicao?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  cor: string;
  created_at: string;
}

export interface Marcador {
  id: string;
  livro_id: string;
  user_id: string;
  pagina: number;
  titulo: string | null;
  created_at: string;
}

export interface Progresso {
  id: string;
  livro_id: string;
  user_id: string;
  pagina_atual: number;
  updated_at: string;
}
