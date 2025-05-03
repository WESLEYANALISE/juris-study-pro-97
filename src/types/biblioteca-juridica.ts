
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
  data_publicacao?: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CategoriaBiblioteca {
  id: string;
  nome: string;
  descricao?: string;
  imagem_url?: string;
  contador_livros?: number;
}

export interface ProgressoLeitura {
  id: string;
  user_id: string;
  livro_id: string;
  pagina_atual: number;
  ultima_leitura: string | Date;
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
