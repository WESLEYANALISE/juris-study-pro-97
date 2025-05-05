
// Types for simulados

export type SimuladoCategoria = 'OAB' | 'PRF' | 'PF' | 'TJSP' | 'JUIZ' | 'PROMOTOR' | 'DELEGADO';

export interface Questao {
  id: string;
  ano?: string | number;
  banca?: string;
  numero_questao?: string;
  questao: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_e?: string;
  resposta_correta?: string;
  alternativa_correta?: string; // Some APIs use this field instead of resposta_correta
  explicacao?: string;
  area?: string;
  subarea?: string;
  nivel?: string;
  imagem_url?: string;
  edicao_id?: string;
  edicao?: string;
}

export interface RespostaUsuario {
  questaoId: string;
  resposta: string;
  correta: boolean;
  tempo?: number; // Time spent on this question in seconds
}

export interface ResultadoSimulado {
  id: string;
  userId: string;
  acertos: number;
  erros: number;
  tempoTotal: number; // Total time in seconds
  questoes: RespostaUsuario[];
  createdAt: string;
  categoriaId?: string;
  categoriaName?: string;
}

export interface SimuladoEdicao {
  id: string;
  categoria: SimuladoCategoria;
  nome: string;
  ano: number;
  numero: number;
  total_questoes: number;
  data_prova?: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SimuladoSessao {
  id: string;
  categoria: SimuladoCategoria;
  edicao_id?: string;
  user_id: string;
  data_inicio: string;
  data_fim?: string;
  total_questoes: number;
  acertos: number;
  completo: boolean;
  tempo_total: number;
  pontuacao?: number;
  created_at?: string;
}

export interface SimuladoResposta {
  id?: string;
  sessao_id: string;
  questao_id: string;
  resposta_selecionada?: string;
  acertou?: boolean;
  tempo_resposta?: number;
  created_at?: string;
}
