
export interface Caso {
  id: string;
  titulo: string;
  descricao: string;
  cliente: string;
  problema: string;
  documentos?: any;
  nivel_dificuldade?: string;
  created_at?: string;
}

export interface Solucao {
  id: string;
  caso_id: string;
  user_id: string;
  solucao: string;
  status?: string;
  pontuacao?: number;
  feedback?: string;
  created_at?: string;
}

export interface Baralho {
  id: string;
  nome: string;
  descricao: string;
  area_direito: string;
  nivel_dificuldade?: string;
}

export interface Artigo {
  id: string;
  baralho_id: string;
  lei: string;
  artigo: string;
  texto: string;
  pontos: number;
}

export interface Cenario {
  id: string;
  titulo: string;
  descricao: string;
  situacao_inicial: string;
  opcoes: any;
  consequencias: any;
  area_direito: string;
  nivel_dificuldade?: string;
}

export interface ProgressoRPG {
  id: string;
  user_id: string;
  cenario_id: string;
  caminho_escolhido?: any;
  pontuacao: number;
  completado: boolean;
}
