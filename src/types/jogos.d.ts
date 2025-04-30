
// This file defines types for jogos (games) functionality
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

// Type for the Supabase client when using custom tables
export interface CustomTypes {
  jogos_escritorio_casos: Caso;
  jogos_escritorio_solucoes: Solucao;
  jogos_cartas_baralhos: Baralho;
  jogos_cartas_artigos: Artigo;
  jogos_cartas_partidas: {
    id: string;
    user_id: string;
    baralho_id: string;
    pontuacao: number;
    completada: boolean;
    jogo_id: string;
    created_at?: string;
  };
  jogos_rpg_cenarios: Cenario;
  jogos_rpg_progresso: ProgressoRPG;
  jogos_categorias: {
    id: string;
    nome: string;
    descricao: string;
    icone: string;
    nivel_dificuldade: string;
    background_variant: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
  };
  jogos_leaderboards: {
    id: string;
    user_id: string;
    jogo_id: string;
    pontuacao: number;
    data_registro: string;
  };
  jogos_quiz_perguntas: {
    id: string;
    pergunta: string;
    opcao_a: string;
    opcao_b: string;
    opcao_c: string;
    opcao_d: string;
    resposta_correta: string;
    explicacao?: string;
    categoria: string;
    area: string;
    nivel_dificuldade?: string;
    created_at: string;
  };
  jogos_quiz_respostas: {
    id: string;
    user_id: string;
    pergunta_id: string;
    resposta_selecionada: string;
    acertou: boolean;
    tempo_resposta?: number;
    created_at: string;
  };
  jogos_simulacoes_casos: {
    id: string;
    titulo: string;
    descricao: string;
    fatos: string;
    provas?: string;
    area_direito: string;
    nivel_dificuldade?: string;
    created_at: string;
  };
  jogos_simulacoes_submissoes: {
    id: string;
    user_id: string;
    caso_id: string;
    papel: string;
    argumentacao: string;
    pontuacao?: number;
    feedback?: string;
    created_at: string;
  };
  jogos_user_badges: {
    id: string;
    user_id: string;
    jogo_id: string;
    badge_nome: string;
    badge_descricao?: string;
    badge_icone?: string;
    conquistado_em: string;
  };
  jogos_user_stats: {
    id: string;
    user_id: string;
    jogo_id: string;
    pontuacao: number;
    partidas_jogadas: number;
    partidas_vencidas: number;
    melhor_resultado: number;
    ultimo_acesso: string;
    created_at: string;
    updated_at: string;
  };
  annotations: {
    id: string;
    user_id: string;
    law_id: string;
    article_number: string;
    annotation_text?: string;
    highlight_color?: string;
    ai_generated?: boolean;
    created_at: string;
    updated_at: string;
  };
}
