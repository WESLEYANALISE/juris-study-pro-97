
export interface LivroJuridico {
  id: string;
  titulo: string;
  autor?: string;
  descricao?: string;
  capa_url?: string | null;
  categoria: string;
  subcategoria?: string;
  pdf_url: string;
  total_paginas?: number;
  data_publicacao?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProgressoLeitura {
  id: string;
  user_id: string;
  livro_id: string;
  pagina_atual: number;
  ultima_leitura: Date;
  favorito: boolean;
}

export interface Marcador {
  id: string;
  user_id: string;
  livro_id: string;
  pagina: number;
  titulo?: string;
  cor: string;
}

export interface Anotacao {
  id: string;
  user_id: string;
  livro_id: string;
  pagina: number;
  texto: string;
  posicao?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  cor: string;
}
