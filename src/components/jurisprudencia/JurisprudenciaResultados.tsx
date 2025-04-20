
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import JurisprudenciaResultadoCard from "./JurisprudenciaResultadoCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ResultadoDatajud = {
  [key: string]: any;
};

interface JurisprudenciaResultadosProps {
  resultados: ResultadoDatajud[];
  loading: boolean;
  erro: string | null;
  formatarData: (dataString?: string) => string;
  totalResultados?: number;
  termoBusca?: string;
}

export default function JurisprudenciaResultados({
  resultados,
  loading,
  erro,
  formatarData,
  totalResultados = 0,
  termoBusca = ""
}: JurisprudenciaResultadosProps) {
  return (
    <div className="mt-6 min-h-[120px]">
      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 rounded-xl w-full" />
          ))}
        </div>
      )}

      {!loading && erro && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro na consulta</AlertTitle>
          <AlertDescription className="mt-2">
            {erro}
            {erro.includes("CORS") && (
              <p className="mt-2 text-sm">
                Os navegadores bloqueiam chamadas diretas à API do Datajud devido à 
                política de segurança CORS. É necessário usar o servidor proxy.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!loading && resultados.length === 0 && !erro && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Search className="h-12 w-12 mb-4 opacity-20" />
          <h3 className="text-lg font-medium">Nenhum resultado para exibir</h3>
          <p className="mt-2 max-w-md">
            Digite um termo de busca e selecione um tribunal para pesquisar 
            na base de jurisprudência.
          </p>
        </div>
      )}

      {!loading && resultados.length > 0 && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              {termoBusca && totalResultados > 0 && (
                <p className="text-sm">
                  <strong>{totalResultados.toLocaleString('pt-BR')}</strong> resultado(s) para: <Badge variant="outline" className="font-normal">{termoBusca}</Badge>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select className="text-sm border p-1 rounded">
                <option>10 por página</option>
                <option>25 por página</option>
                <option>50 por página</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {resultados.map((res, idx) => (
              <JurisprudenciaResultadoCard key={idx} resultado={res} formatarData={formatarData} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
