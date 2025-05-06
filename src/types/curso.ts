

export interface Curso {
  id: number;
  titulo?: string;
  descricao?: string;
  categoria?: string;
  autor?: string;
  duracao?: string;
  modulos?: number;
  avaliacao?: number;
  alunos?: number;
  thumbnail?: string;
  conteudo?: Record<string, Array<{titulo: string, duracao?: string}>>;
  
  // Fields from the cursos_narrados table
  area?: string;
  capa?: string;
  dificuldade?: string;
  download?: string;
  link?: string;
  materia?: string;
  sequencia?: number;
  sobre?: string;
  tipo_acesso?: string;
}
