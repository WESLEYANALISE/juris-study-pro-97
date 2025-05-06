
export interface DocumentoHTML {
  id: string;
  titulo: string;
  categoria: string;
  conteudo_html: string;
  thumbnail_url?: string | null;
  descricao?: string | null;
  autor?: string | null;
  data_publicacao?: string | null;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProgressoLeitura {
  id?: string;
  user_id: string;
  documento_id: string;
  secao_atual: string;
  progresso_percentual: number;
  ultima_leitura?: string;
  favorito: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MarcadorHTML {
  id?: string;
  user_id: string;
  documento_id: string;
  titulo: string;
  secao_id: string;
  posicao?: string | null;
  cor: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnotacaoHTML {
  id?: string;
  user_id: string;
  documento_id: string;
  secao_id: string;
  texto: string;
  cor: string;
  seletor_css?: string | null;
  texto_selecionado?: string | null;
  created_at?: string;
  updated_at?: string;
}
