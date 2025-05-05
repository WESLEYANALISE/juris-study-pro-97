
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
  conteudo?: any;
  
  // New fields from the actual database
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
