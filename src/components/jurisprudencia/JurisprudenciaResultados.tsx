
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import JurisprudenciaResultadoCard from "./JurisprudenciaResultadoCard";

type ResultadoDatajud = {
  [key: string]: any;
};

interface JurisprudenciaResultadosProps {
  resultados: ResultadoDatajud[];
  loading: boolean;
  erro: string | null;
  formatarData: (dataString?: string) => string;
}

export default function JurisprudenciaResultados({
  resultados,
  loading,
  erro,
  formatarData,
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
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {!loading && resultados.length > 0 && (
        <div className="flex flex-col gap-4 mt-2">
          {resultados.map((res, idx) => (
            <JurisprudenciaResultadoCard key={idx} resultado={res} formatarData={formatarData} />
          ))}
        </div>
      )}
    </div>
  );
}
