
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Tribunal {
  nome: string;
  alias: string;
}
interface JurisprudenciaFormProps {
  categoria: string;
  setCategoria: (categoria: string) => void;
  tribunal: string;
  setTribunal: (tribunal: string) => void;
  termo: string;
  setTermo: (termo: string) => void;
  loading: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  TRIBUNAIS_POR_CATEGORIA: Record<string, Tribunal[]>;
}

export default function JurisprudenciaForm({
  categoria,
  setCategoria,
  tribunal,
  setTribunal,
  termo,
  setTermo,
  loading,
  onSubmit,
  TRIBUNAIS_POR_CATEGORIA,
}: JurisprudenciaFormProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block mb-1 text-xs font-medium">Categoria</label>
          <Select
            value={categoria}
            onValueChange={(value) => {
              setCategoria(value);
              const primeiroTribunalDaCategoria = TRIBUNAIS_POR_CATEGORIA[value][0].alias;
              setTribunal(primeiroTribunalDaCategoria);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(TRIBUNAIS_POR_CATEGORIA).map(cat => (
                <SelectItem value={cat} key={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-xs font-medium">Tribunal</label>
          <Select value={tribunal} onValueChange={setTribunal}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tribunal" />
            </SelectTrigger>
            <SelectContent>
              {TRIBUNAIS_POR_CATEGORIA[categoria].map(tj => (
                <SelectItem value={tj.alias} key={tj.alias}>
                  {tj.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block mb-1 text-xs font-medium">Termo de busca</label>
          <Input
            value={termo}
            onChange={e => setTermo(e.target.value)}
            placeholder="Ex: habeas corpus, pensão, contrato..."
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto gap-2 flex items-center">
          {loading ? (
            <>Buscando...</>
          ) : (
            <>
              <Search className="h-4 w-4" /> 
              Buscar Jurisprudência
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
