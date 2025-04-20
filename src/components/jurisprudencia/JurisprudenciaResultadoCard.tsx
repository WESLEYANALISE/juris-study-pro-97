
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";

type ResultadoDatajud = {
  numeroProcesso?: string;
  classe?: { codigo?: number; nome?: string; };
  assuntos?: any[];
  orgaoJulgador?: { nome?: string; codigoMunicipioIBGE?: number; };
  dataAjuizamento?: string;
  movimentos?: any[];
  [key: string]: any;
};

interface JurisprudenciaResultadoCardProps {
  resultado: ResultadoDatajud;
  formatarData: (dataString?: string) => string;
}

export default function JurisprudenciaResultadoCard({
  resultado,
  formatarData,
}: JurisprudenciaResultadoCardProps) {
  return (
    <div className="rounded-lg border shadow bg-card p-4 text-sm transition hover:shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <span className="font-bold text-primary text-base">
            {resultado.numeroProcesso || "Processo sem número"}
          </span>
          {resultado.dataAjuizamento && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatarData(resultado.dataAjuizamento)}
            </Badge>
          )}
        </div>
        {resultado.classe?.nome && (
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              <strong>Classe:</strong> {resultado.classe.nome}
            </span>
          </div>
        )}
        {resultado.orgaoJulgador?.nome && (
          <span className="block text-xs text-muted-foreground">
            <strong>Órgão Julgador:</strong> {resultado.orgaoJulgador.nome}
          </span>
        )}
        {resultado.assuntos && resultado.assuntos.length > 0 && (
          <div>
            <span className="block text-xs font-semibold mb-1">Assuntos:</span>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(resultado.assuntos[0]) 
                ? resultado.assuntos.flat().map((assunto, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {assunto.nome || "Não especificado"}
                    </Badge>
                  ))
                : resultado.assuntos.map((assunto, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {typeof assunto === 'object' ? (assunto.nome || "Não especificado") : String(assunto)}
                    </Badge>
                  ))
              }
            </div>
          </div>
        )}
        {resultado.movimentos && resultado.movimentos.length > 0 && (
          <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="movimentos">
              <AccordionTrigger className="text-xs py-1">
                Movimentações ({resultado.movimentos.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-40 overflow-y-auto text-xs">
                  {resultado.movimentos.slice(0, 10).map((movimento, idx) => (
                    <div key={idx} className="border-b py-1 last:border-0">
                      <div className="flex justify-between">
                        <span>{movimento.nome}</span>
                        <span className="text-muted-foreground">
                          {formatarData(movimento.dataHora)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {resultado.movimentos.length > 10 && (
                    <div className="text-center text-muted-foreground mt-2">
                      + {resultado.movimentos.length - 10} movimentações não exibidas
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </div>
  );
}
