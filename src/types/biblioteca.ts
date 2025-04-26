export interface Livro {
  id: string;
  livro: string;
  area: string;
  link: string | null;
  download: string | null;
  imagem: string | null;
  sobre: string | null;
}

export interface BibliotecaStats {
  total: number;
  byArea: Record<string, number>;
}
