
export interface Livro {
  id: string;
  livro: string;
  area: string;
  link: string | null;
  download: string | null;
  imagem: string | null;
  sobre: string | null;
  favorito?: boolean;
}

export interface BibliotecaStats {
  totalLivros: number;
  totalAreas: number;
  areasPopulares: { area: string; count: number }[];
}
