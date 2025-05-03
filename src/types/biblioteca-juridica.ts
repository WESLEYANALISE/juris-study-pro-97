
export interface LivroJuridico {
  id: string;
  titulo: string;
  categoria: string;
  pdf_url: string;
  capa_url: string | null;
  descricao: string | null;
  autor?: string;
  editora?: string;
  ano_publicacao?: number;
  edicao?: string;
  total_paginas?: number;
  isbn?: string;
  tags?: string[];
}

export interface ReadingProgressType {
  livro_id: string;
  pagina_atual: number;
  ultima_leitura: string;
  favorito: boolean;
  anotacoes?: Anotacao[];
  marcadores?: Marcador[];
}

export interface Anotacao {
  id: string;
  pagina: number;
  texto: string;
  posicao_x: number;
  posicao_y: number;
  cor: string;
  data_criacao: string;
}

export interface Marcador {
  id: string;
  pagina: number;
  titulo?: string;
  data_criacao: string;
}

export interface BibliotecaFilters {
  categoria?: string;
  searchTerm?: string;
  favorites?: boolean;
  recent?: boolean;
  sort?: 'title' | 'date' | 'author';
  sortDirection?: 'asc' | 'desc';
}
