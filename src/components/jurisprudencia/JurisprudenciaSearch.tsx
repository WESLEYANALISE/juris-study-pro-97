
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Info } from "lucide-react";
import JurisprudenciaForm from "./JurisprudenciaForm";
import JurisprudenciaResultados from "./JurisprudenciaResultados";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [categoria, setCategoria] = useState<string>("Tribunais Superiores");
  const [tribunal, setTribunal] = useState<string>(TRIBUNAIS_POR_CATEGORIA[categoria as keyof typeof TRIBUNAIS_POR_CATEGORIA][0].alias);
  const [termo, setTermo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ResultadoDatajud[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [showCorsInfo, setShowCorsInfo] = useState(false);

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
    setShowCorsInfo(false);

    try {
      const apiKey = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
      const url = `https://api-publica.datajud.cnj.jus.br/${tribunal}/_search`;

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

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `APIKey ${apiKey}`
        },
        body: JSON.stringify(queryBody),
        signal: AbortSignal.timeout(15000)
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
      
      if (err.name === 'AbortError') {
        setErro("A consulta excedeu o tempo limite. Por favor, tente novamente.");
      } else if (err.message.includes('Failed to fetch')) {
        setErro("Não foi possível conectar à API do Datajud devido a restrições de CORS.");
        setShowCorsInfo(true);
      } else {
        setErro(err.message || "Não foi possível buscar informações. Verifique sua conexão e tente novamente.");
      }
      
      toast({
        title: "Erro na consulta",
        description: "Ocorreu um erro ao consultar a jurisprudência. Por favor, veja os detalhes abaixo.",
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

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 p-2">
      <JurisprudenciaForm
        categoria={categoria}
        setCategoria={setCategoria}
        tribunal={tribunal}
        setTribunal={setTribunal}
        termo={termo}
        setTermo={setTermo}
        loading={loading}
        onSubmit={handleSubmit}
        TRIBUNAIS_POR_CATEGORIA={TRIBUNAIS_POR_CATEGORIA}
      />

      {showCorsInfo && (
        <Alert className="my-4 bg-amber-50 dark:bg-amber-950/30">
          <Info className="h-5 w-5" />
          <AlertTitle>Limitação do navegador (CORS)</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              Os navegadores bloqueiam chamadas diretas à API do Datajud devido à política de segurança CORS. 
              Para usar esta funcionalidade em produção, é necessário implementar um servidor proxy.
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">
                Como resolver este problema?
              </summary>
              <div className="mt-2 pl-4 text-sm border-l-2 border-amber-200 dark:border-amber-800">
                <p className="mb-2">
                  1. Implemente um servidor proxy em Node.js/Express que faça a chamada à API do Datajud.
                </p>
                <p className="mb-2">
                  2. Configure o proxy para adicionar o header de autorização e repassar as requisições.
                </p>
                <p>
                  3. Modifique o frontend para fazer chamadas ao seu servidor proxy em vez de chamar a API do Datajud diretamente.
                </p>
              </div>
            </details>
          </AlertDescription>
        </Alert>
      )}

      <JurisprudenciaResultados
        resultados={resultados}
        loading={loading}
        erro={erro}
        formatarData={formatarData}
      />
    </div>
  );
}
