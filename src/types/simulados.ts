
// Types for simulados (should be added to an appropriate types file)

export interface Questao {
  id: string;
  ano?: string;
  banca?: string;
  numero_questao?: string;
  questao: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_e?: string;
  resposta_correta: string;
  explicacao?: string;
  area?: string;
  subarea?: string;
  nivel?: string;
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
