
export interface Peticao {
  id: string;
  area: string;
  sub_area?: string;
  tipo: string;
  link: string;
  descricao: string;
  tags?: string[];
  created_at?: string;
}
