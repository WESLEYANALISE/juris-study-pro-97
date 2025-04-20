
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Calendar, ChevronDown, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Lista de tribunais e aliases organizados por categoria
const TRIBUNAIS_POR_CATEGORIA = {
  "Tribunais Superiores": [
    { nome: "Tribunal Superior do Trabalho", alias: "api_publica_tst" },
    { nome: "Tribunal Superior Eleitoral", alias: "api_publica_tse" },
    { nome: "Superior Tribunal de Justiça", alias: "api_publica_stj" },
    { nome: "Superior Tribunal Militar", alias: "api_publica_stm" },
  ],
  "Justiça Federal": [
    { nome: "TRF 1ª Região", alias: "api_publica_trf1" },
    { nome: "TRF 2ª Região", alias: "api_publica_trf2" },
    { nome: "TRF 3ª Região", alias: "api_publica_trf3" },
    { nome: "TRF 4ª Região", alias: "api_publica_trf4" },
    { nome: "TRF 5ª Região", alias: "api_publica_trf5" },
    { nome: "TRF 6ª Região", alias: "api_publica_trf6" },
  ],
  "Justiça Estadual": [
    { nome: "TJMG", alias: "api_publica_tjmg" },
    { nome: "TJSP", alias: "api_publica_tjsp" },
    { nome: "TJRJ", alias: "api_publica_tjrj" },
    { nome: "TJRS", alias: "api_publica_tjrs" },
    { nome: "TJDFT", alias: "api_publica_tjdft" },
  ],
  "Justiça do Trabalho": [
    { nome: "TRT 1ª Região", alias: "api_publica_trt1" },
    { nome: "TRT 2ª Região", alias: "api_publica_trt2" },
    { nome: "TRT 3ª Região", alias: "api_publica_trt3" },
    { nome: "TRT 4ª Região", alias: "api_publica_trt4" },
  ],
  "Justiça Eleitoral": [
    { nome: "TRE-SP", alias: "api_publica_tre-sp" },
    { nome: "TRE-MG", alias: "api_publica_tre-mg" },
    { nome: "TRE-RJ", alias: "api_publica_tre-rj" },
    { nome: "TRE-RS", alias: "api_publica_tre-rs" },
  ],
};

// Criar lista plana para uso no componente
const TRIBUNAIS = Object.values(TRIBUNAIS_POR_CATEGORIA).flat();

type ResultadoDatajud = {
  numeroProcesso?: string;
  classe?: {
    codigo?: number;
    nome?: string;
  };
  assuntos?: any[];
  orgaoJulgador?: {
    nome?: string;
    codigoMunicipioIBGE?: number;
  };
  dataAjuizamento?: string;
  movimentos?: any[];
  [key: string]: any;
};

export default function JurisprudenciaSearch() {
  const [tribunal, setTribunal] = useState<string>(TRIBUNAIS[0].alias);
  const [termo, setTermo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ResultadoDatajud[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<string>("Tribunais Superiores");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!termo.trim()) {
      toast({
        title: "Digite um termo para buscar",
        description: "Por favor, informe um termo de pesquisa para realizar a consulta.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setResultados([]);
    setErro(null);

    try {
      // API Key fixa do Datajud (conforme documentação)
      const apiKey = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
      
      // Construindo URL para o tribunal selecionado
      const url = `https://api-publica.datajud.cnj.jus.br/${tribunal}/_search`;
      
      // Preparando a consulta usando o padrão ElasticSearch
      const queryBody = {
        size: 10,
        query: {
          multi_match: {
            query: termo,
            fields: ["*"],
            type: "best_fields",
            fuzziness: "AUTO"
          }
        },
        sort: [
          { "@timestamp": { order: "desc" } }
        ]
      };

      console.log("Consultando API:", url);
      console.log("Corpo da requisição:", JSON.stringify(queryBody));

      // Ajuste: Usando modo no-cors, para tentar resolver problemas de CORS
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `APIKey ${apiKey}`
        },
        body: JSON.stringify(queryBody),
        // Ajuste: Adicionar timeout de 20 segundos
        signal: AbortSignal.timeout(20000)
      });

      if (!res.ok) {
        console.error("Erro na API:", res.status, res.statusText);
        throw new Error(`Erro ao consultar a API: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Resposta da API:", data);

      if (data.hits && data.hits.hits) {
        const docs = data.hits.hits.map((hit: any) => hit._source) || [];
        setResultados(docs);
        
        if (docs.length === 0) {
          setErro("Nenhum resultado encontrado para os critérios informados.");
        } else {
          toast({
            title: "Busca realizada com sucesso",
            description: `${docs.length} ${docs.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}.`,
          });
        }
      } else {
        setErro("Formato de resposta inesperado. Por favor, tente novamente.");
      }
    } catch (err: any) {
      console.error("Erro na requisição:", err);
      
      // Melhor tratamento de erros específicos
      if (err.name === 'AbortError') {
        setErro("A consulta excedeu o tempo limite. Por favor, tente novamente.");
      } else if (err.message.includes('Failed to fetch')) {
        setErro("Não foi possível conectar à API do Datajud. Isso pode ocorrer devido a restrições de rede ou CORS. Tente acessar usando uma conexão diferente.");
      } else {
        setErro(err.message || "Não foi possível buscar informações. Verifique sua conexão e tente novamente.");
      }
      
      toast({
        title: "Erro na consulta",
        description: "Ocorreu um erro ao consultar a jurisprudência. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString?: string) => {
    if (!dataString) return "Data não informada";
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch (e) {
      return dataString;
    }
  };

  const renderizarResultado = (resultado: ResultadoDatajud, index: number) => {
    return (
      <div
        key={index}
        className="rounded-lg border shadow bg-card p-4 text-sm transition hover:shadow-md"
      >
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
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 p-2">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block mb-1 text-xs font-medium">Categoria</label>
            <Select 
              value={categoria} 
              onValueChange={(value) => {
                setCategoria(value);
                const primeiroTribunalDaCategoria = TRIBUNAIS_POR_CATEGORIA[value as keyof typeof TRIBUNAIS_POR_CATEGORIA][0].alias;
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
                {TRIBUNAIS_POR_CATEGORIA[categoria as keyof typeof TRIBUNAIS_POR_CATEGORIA].map(tj => (
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
            {resultados.map((res, idx) => renderizarResultado(res, idx))}
          </div>
        )}
      </div>
    </div>
  );
}
