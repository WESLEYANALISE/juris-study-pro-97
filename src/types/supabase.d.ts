
export interface SupabaseArticle {
  id: number | string;
  numero?: string;
  artigo?: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
}

export interface SupabaseFavorite {
  id?: number | string;
  user_id: string;
  article_id?: string | number;
  questao_id?: string | number;
  law_name?: string;
  article_number?: string;
  article_text?: string;
  favoritado_em?: string;
}

export interface SupabaseQuestion {
  id: number | string;
  questao?: string;
  alternativa_a?: string;
  alternativa_b?: string;
  alternativa_c?: string;
  alternativa_d?: string;
  alternativa_e?: string;
  resposta_correta?: string;
  area?: string;
  ano?: string;
  banca?: string;
  imagem_url?: string;
}

export interface SupabaseHistoryEntry {
  id?: number | string;
  user_id: string;
  questao_id?: number | string;
  article_id?: number | string;
  visualizado_em: string;
}

export interface SupabaseUserProgress {
  id?: number | string;
  user_id: string;
  modulo_id?: number | string;
  curso_id?: number | string;
  progresso: number;
  concluido: boolean;
  ultimo_acesso: string;
}

// Tables that exist in the database but might not be in the generated types
export interface SupabaseDatabaseTables {
  questoes_favoritas: SupabaseFavorite;
  historico_questoes: SupabaseHistoryEntry;
  progresso_usuario: SupabaseUserProgress;
  cursos_narrados: any;
}

// For strongly typing our app interfaces
export interface HistoricoQuestao {
  questao_id: string;
  visualizado_em: string;
}

export interface ProgressoUsuario {
  progresso: number;
  concluido?: boolean;
  ultimo_acesso?: string;
}
