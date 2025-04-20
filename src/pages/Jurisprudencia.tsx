
import React from "react";
import JurisprudenciaSearch from "@/components/jurisprudencia/JurisprudenciaSearch";
import { FileSearch } from "lucide-react";

export default function Jurisprudencia() {
  return (
    <div className="container py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-4">
          <FileSearch className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Consulta de Jurisprudência</h1>
          <p className="text-muted-foreground text-center max-w-xl">
            Pesquise decisões judiciais de diversos tribunais do Brasil através da API Pública do Datajud do CNJ.
          </p>
        </div>
      </div>
      
      <JurisprudenciaSearch />
    </div>
  );
}
