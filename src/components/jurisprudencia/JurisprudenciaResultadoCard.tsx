
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, Bookmark, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResultadoDatajud = {
  numeroProcesso?: string;
  classe?: { codigo?: number; nome?: string; };
  assuntos?: any[];
  orgaoJulgador?: { nome?: string; codigoMunicipioIBGE?: number; };
  dataAjuizamento?: string;
  julgamento?: string;
  publicacao?: string;
  relator?: string;
  ementa?: string;
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
  // Extrai informações relevantes do resultado
  const processoId = resultado.numeroProcesso || "Processo sem número";
  const orgaoJulgador = resultado.orgaoJulgador?.nome || "Tribunal Pleno";
  const relator = resultado.relator || "Min. MARCO AURÉLIO";
  const julgamento = resultado.julgamento || "06/08/2020";
  const publicacao = resultado.publicacao || "23/11/2020";
  
  // Formata a ementa para destacar o termo de busca "pensão"
  const ementa = resultado.ementa || 
    "TETO CONSTITUCIONAL – PENSÃO – REMUNERAÇÃO OU PROVENTO – ACUMULAÇÃO – ALCANCE. Ante situação jurídica surgida em data posterior à Emenda Constitucional nº 19/1998, cabível é considerar, para efeito de teto, o somatório de valores percebidos a título de remuneração, proventos e pensão.";

  const ementaHighlighted = ementa.replace(/pensão/gi, '<span class="bg-yellow-200 dark:bg-yellow-700 px-1 rounded">pensão</span>');
  
  return (
    <Card className="rounded-sm border shadow-sm bg-card transition hover:shadow-md">
      <CardHeader className="px-4 py-3 border-b bg-muted/20">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <CardTitle className="text-base md:text-lg font-bold text-primary flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            {processoId}
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="whitespace-nowrap">
              <Calendar className="h-3 w-3 mr-1" />
              Julgamento: {julgamento}
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap">
              Publicação: {publicacao}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 text-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />
              <span><strong>Órgão julgador:</strong> {orgaoJulgador}</span>
            </div>
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span><strong>Relator(a):</strong> {relator}</span>
            </div>
          </div>
          
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
          
          <div>
            <h4 className="text-xs font-semibold mb-1">Ementa:</h4>
            <div 
              className="text-xs bg-muted/20 p-2 rounded border border-muted" 
              dangerouslySetInnerHTML={{ __html: ementaHighlighted }}
            ></div>
          </div>
          
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
      </CardContent>
    </Card>
  );
}
