
export type SimuladoCategoria = 'OAB' | 'PRF' | 'PF' | 'TJSP' | 'JUIZ' | 'PROMOTOR' | 'DELEGADO';

export interface Questao {
  id: string;
  ano: number;
  banca: string;
  numero_questao: number;
  questao: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_correta: 'A' | 'B' | 'C' | 'D';
  imagem_url?: string;
  area?: string;
  explicacao?: string;
}

export interface SimuladoSessao {
  id: string;
  categoria: SimuladoCategoria;
  data_inicio: string;
  data_fim?: string;
  total_questoes: number;
  acertos: number;
  pontuacao: number;
  tempo_total: number;
  completo: boolean;
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
