
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

// Lista de tribunais e aliases
const TRIBUNAIS = [
  { nome: "Tribunal Superior do Trabalho", alias: "api_publica_tst" },
  { nome: "Tribunal Superior Eleitoral", alias: "api_publica_tse" },
  { nome: "Tribunal Superior de Justiça", alias: "api_publica_stj" },
  { nome: "Tribunal Superior Militar", alias: "api_publica_stm" },
  { nome: "TRF 1ª Região", alias: "api_publica_trf1" },
  { nome: "TRF 2ª Região", alias: "api_publica_trf2" },
  { nome: "TRF 3ª Região", alias: "api_publica_trf3" },
  { nome: "TRF 4ª Região", alias: "api_publica_trf4" },
  { nome: "TRF 5ª Região", alias: "api_publica_trf5" },
  { nome: "TRF 6ª Região", alias: "api_publica_trf6" },
  { nome: "TJMG", alias: "api_publica_tjmg" },
  { nome: "TJSP", alias: "api_publica_tjsp" },
  { nome: "TJRJ", alias: "api_publica_tjrj" },
  { nome: "TJRS", alias: "api_publica_tjrs" },
  // Adicione mais conforme necessário...
];

type ResultadoDatajud = {
  processo?: string;
  tema?: string;
  dataDistribuicao?: string;
  assunto?: any;
  classe?: any;
  parte?: any;
  [key: string]: any;
};

export default function JurisprudenciaSearch() {
  const [tribunal, setTribunal] = useState<string>(TRIBUNAIS[0].alias);
  const [termo, setTermo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ResultadoDatajud[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResultados([]);
    setErro(null);

    try {
      // Fetch usando POST (a API espera POST com body {"query":{}})
      const url = `https://api-publica.datajud.cnj.jus.br/${tribunal}/_search`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: {
            multi_match: {
              query: termo,
              fields: ["*"]
            }
          },
          size: 10  // Limita a 10 resultados para ser rápido/mobile
        }),
      });

      if (!res.ok) throw new Error("Erro ao consultar a API");

      const data = await res.json();

      const docs = data.hits?.hits?.map((hit: any) => hit._source) ?? [];

      setResultados(docs);
      if (docs.length === 0) setErro("Nenhum resultado encontrado.");
    } catch (err: any) {
      setErro("Não foi possível buscar informações agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-4 p-2">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
        <div className="flex-1">
          <label className="block mb-1 text-xs font-medium">Tribunal</label>
          <Select value={tribunal} onValueChange={setTribunal}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tribunal" />
            </SelectTrigger>
            <SelectContent>
              {TRIBUNAIS.map(tj => (
                <SelectItem value={tj.alias} key={tj.alias}>
                  {tj.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-xs font-medium">Tema, palavra-chave, etc</label>
          <Input
            value={termo}
            onChange={e => setTermo(e.target.value)}
            placeholder="Ex: contrato, pensão, trabalhista…"
            required
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto mt-2 sm:mt-0 gap-2 flex items-center">
          <Search className="h-4 w-4" /> Buscar
        </Button>
      </form>

      <div className="mt-4 min-h-[120px]">
        {loading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 rounded-xl w-full" />
            ))}
          </div>
        )}

        {!loading && erro && (
          <div className="text-center text-sm p-4 text-muted-foreground">{erro}</div>
        )}

        {!loading && resultados.length > 0 && (
          <div className="flex flex-col gap-4 mt-2">
            {resultados.map((res, idx) => (
              <div
                key={idx}
                className="rounded-lg border shadow bg-card p-3 text-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-primary">{res.processo || "Sem número"}</span>
                  {res.tema && <span className="block text-xs text-muted-foreground">Tema: {res.tema}</span>}
                  {res.assunto && <span className="block text-xs text-muted-foreground">Assunto: {typeof res.assunto === "object" ? JSON.stringify(res.assunto) : res.assunto}</span>}
                  {res.classe && <span className="block text-xs text-muted-foreground">Classe: {typeof res.classe === "object" ? JSON.stringify(res.classe) : res.classe}</span>}
                  {res.dataDistribuicao && (
                    <span className="block text-xs text-muted-foreground">Data de Distribuição: {res.dataDistribuicao}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
