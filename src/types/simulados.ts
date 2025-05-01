
export type SimuladoCategoria = 'OAB' | 'PRF' | 'PF' | 'TJSP' | 'JUIZ' | 'PROMOTOR' | 'DELEGADO';

export interface SimuladoEdicao {
  id: string;
  categoria: SimuladoCategoria;
  nome: string;
  ano: number;
  numero: number;
  total_questoes: number;
  data_prova?: string;
  descricao?: string;
}

export interface Questao {
  id: string;
  ano: number | string;
  banca: string;
  numero_questao: number | string;
  questao: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_correta: 'A' | 'B' | 'C' | 'D';
  imagem_url?: string;
  area?: string;
  explicacao?: string;
  edicao_id?: string;
}

export interface SimuladoSessao {
  id: string;
  categoria: SimuladoCategoria;
  edicao_id: string;
  data_inicio: string;
  data_fim?: string;
  total_questoes: number;
  acertos: number;
  pontuacao: number;
  tempo_total: number;
  completo: boolean;
  user_id: string;
}

export interface SimuladoResposta {
  id: string;
  sessao_id: string;
  questao_id: string;
  resposta_selecionada: 'A' | 'B' | 'C' | 'D';
  acertou: boolean;
  tempo_resposta: number;
}

export interface SimuladoEstatistica {
  id: string;
  categoria: SimuladoCategoria;
  area?: string;
  total_respondidas: number;
  total_acertos: number;
  percentual: number;
}

export interface SimuladoAreaDificil {
  area: string;
  categoria: SimuladoCategoria;
  media_percentual: number;
  total_questoes: number;
  total_usuarios: number;
}

export interface SimuladoUsuarioProgresso {
  id: string;
  user_id: string;
  categoria: SimuladoCategoria;
  total_simulados: number;
  total_questoes: number;
  total_acertos: number;
  percentual_acertos: number;
  tempo_medio_questao: number;
  pontuacao_media: number;
  ultima_sessao: string;
  created_at: string;
  updated_at: string;
}
