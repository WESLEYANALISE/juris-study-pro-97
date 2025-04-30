
export interface Faculdade {
  id: string;
  nome: string;
  sigla: string;
  descricao: string;
  logo_url: string | null;
  website: string | null;
}

export interface GradeCurricular {
  id: string;
  faculdade_id: string;
  nome: string;
  descricao: string;
  duracao_semestres: number;
  ativo: boolean;
}

export interface Disciplina {
  id: string;
  grade_id: string;
  nome: string;
  descricao: string | null;
  ementa: string | null;
  periodo: number;
  area: string;
  carga_horaria: number | null;
  codigo: string | null;
}

export interface DisciplinaPrerequisito {
  id: string;
  disciplina_id: string;
  prerequisito_id: string;
  prerequisito?: Disciplina;
}

export interface DisciplinaMaterial {
  id: string;
  disciplina_id: string;
  tipo: 'pdf' | 'video' | 'link' | 'livro' | 'mapa_mental';
  titulo: string;
  descricao: string | null;
  url: string | null;
  thumbnail_url: string | null;
  autor: string | null;
}

export interface UserProgressoDisciplina {
  id: string;
  user_id: string;
  disciplina_id: string;
  status: 'nao_iniciado' | 'em_progresso' | 'concluido';
  nota: number | null;
  anotacoes: string | null;
  favorito: boolean;
  progresso_percentual: number | null;
  data_conclusao: string | null;
}

export interface AIGeneratedContent {
  content: string;
}
