
import { Card, CardDescription } from "@/components/ui/card";

type Livro = {
  id: string;
  titulo: string;
  autor: string | null;
  editora: string | null;
  area: string;
  ano_publicacao: number | null;
  capa_url: string | null;
  sinopse: string | null;
  link_leitura: string | null;
  link_download: string | null;
  tags: string[] | null;
};

export function BookCard({ livro }: { livro: Livro }) {
  return (
    <Card className="group flex flex-col hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-[300px] overflow-hidden">
      <div className="relative flex-grow overflow-hidden">
        {livro.capa_url ? (
          <div className="w-full h-full relative">
            <img
              src={livro.capa_url}
              alt={livro.titulo}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/70 flex items-end">
              <div className="p-3 w-full">
                <h3 className="font-semibold text-sm text-white line-clamp-3">{livro.titulo}</h3>
                {livro.autor && (
                  <p className="text-xs text-white/80 mt-1 line-clamp-1">{livro.autor}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-end">
            <div className="p-3 w-full">
              <h3 className="font-semibold text-sm text-white line-clamp-3">{livro.titulo}</h3>
              {livro.autor && (
                <p className="text-xs text-white/80 mt-1 line-clamp-1">{livro.autor}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <CardDescription className="p-2 text-xs text-center border-t">
        {livro.area}
      </CardDescription>
    </Card>
  );
}
