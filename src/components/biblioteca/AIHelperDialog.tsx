
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import type { Livro } from "@/types/biblioteca";

interface AIHelperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
  results: Livro[] | null | "buscando";  // Changed type to allow for "buscando" string
  onSelectBook: (livro: Livro) => void;
}

export function AIHelperDialog({
  open,
  onOpenChange,
  onSearch,
  results,
  onSelectBook
}: AIHelperDialogProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <FileText size={18} /> Ajuda por IA
          </h3>
          <p className="text-sm mb-2">
            Descreva o tema/assunto que deseja estudar e a IA sugerirá livros relevantes.
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              value={query}
              type="text"
              className="flex-1"
              placeholder="Ex: Direito Penal, contrato, recursos..."
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => (e.key === "Enter" ? handleSearch() : undefined)}
            />
            <Button size="sm" onClick={handleSearch}>Buscar</Button>
          </div>
          <div>
            {results === null ? null : results === "buscando" ? (
              <div className="text-center py-6 text-muted-foreground">Buscando sugestões…</div>
            ) : results.length === 0 ? (
              <div className="text-center py-6 text-destructive">Nenhum livro encontrado.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {results.map(lv => (
                  <div
                    key={lv.id}
                    className="flex items-center gap-3 cursor-pointer border rounded-lg p-2 hover:shadow bg-muted"
                    onClick={() => onSelectBook(lv)}
                  >
                    {lv.imagem ? (
                      <div className="h-16 w-12 flex-shrink-0 relative overflow-hidden rounded">
                        <img
                          src={lv.imagem}
                          alt={lv.livro}
                          className="h-full w-full object-cover absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-black/70 flex items-end p-1">
                          <span className="text-[10px] text-white line-clamp-2 font-medium">
                            {lv.livro}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 w-12 bg-gray-800 rounded flex-shrink-0 flex items-end">
                        <div className="p-1 w-full">
                          <span className="text-[10px] text-white line-clamp-2 font-medium">
                            {lv.livro}
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{lv.livro}</div>
                      <div className="text-xs text-muted-foreground">{lv.area}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
