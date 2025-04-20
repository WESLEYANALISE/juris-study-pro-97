import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Info, Download } from "lucide-react";
import JurisprudenciaForm from "./JurisprudenciaForm";
import JurisprudenciaResultados from "./JurisprudenciaResultados";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProxyStatusAlert from "./ProxyStatusAlert";
import ProxyInstructionsDialog from "./ProxyInstructionsDialog";

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

const RESULTADOS_SIMULADOS: ResultadoDatajud[] = [
  {
    numeroProcesso: "0000123-45.2022.5.00.0000",
    classe: { codigo: 1, nome: "Recurso Ordinário" },
    assuntos: [{ nome: "Horas Extras" }, { nome: "Verbas Rescisórias" }],
    orgaoJulgador: { nome: "2ª Turma" },
    dataAjuizamento: "2022-06-15T00:00:00Z",
    movimentos: [
      { nome: "Distribuído", dataHora: "2022-06-15T14:30:00Z" },
      { nome: "Conclusos para Decisão", dataHora: "2022-07-10T09:15:00Z" },
      { nome: "Julgado Procedente", dataHora: "2022-08-25T16:45:00Z" }
    ]
  },
  {
    numeroProcesso: "0000456-78.2021.5.00.0001",
    classe: { codigo: 2, nome: "Agravo de Instrumento" },
    assuntos: [{ nome: "Pensão" }, { nome: "Previdência Privada" }],
    orgaoJulgador: { nome: "3ª Turma" },
    dataAjuizamento: "2021-11-23T00:00:00Z",
    movimentos: [
      { nome: "Autuado", dataHora: "2021-11-23T10:20:00Z" },
      { nome: "Conclusos para Relatório", dataHora: "2021-12-15T11:00:00Z" },
      { nome: "Incluído em Pauta", dataHora: "2022-01-18T13:30:00Z" },
      { nome: "Julgado Parcialmente Procedente", dataHora: "2022-02-05T15:10:00Z" }
    ]
  },
  {
    numeroProcesso: "0000789-12.2023.5.00.0002",
    classe: { codigo: 3, nome: "Mandado de Segurança" },
    assuntos: [{ nome: "Pensão por Morte" }],
    orgaoJulgador: { nome: "Seção Especializada" },
    dataAjuizamento: "2023-01-08T00:00:00Z",
    movimentos: [
      { nome: "Protocolado", dataHora: "2023-01-08T08:45:00Z" },
      { nome: "Despacho", dataHora: "2023-01-20T14:20:00Z" },
      { nome: "Vista ao Ministério Público", dataHora: "2023-02-10T16:30:00Z" }
    ]
  }
];

export default function JurisprudenciaSearch() {
  const [categoria, setCategoria] = useState<string>("Tribunais Superiores");
  const [tribunal, setTribunal] = useState<string>(TRIBUNAIS_POR_CATEGORIA[categoria as keyof typeof TRIBUNAIS_POR_CATEGORIA][0].alias);
  const [termo, setTermo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ResultadoDatajud[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [showProxyInstructions, setShowProxyInstructions] = useState(false);
  const [totalResultados, setTotalResultados] = useState<number>(0);
  const [proxyUrl, setProxyUrl] = useState<string>("http://localhost:3500/api/datajud/search");
  const [proxyStatus, setProxyStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkProxyStatus = async () => {
      try {
        const response = await fetch(proxyUrl.replace('/search', '/health'), {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          setProxyStatus('online');
          console.log("Servidor proxy está online");
        } else {
          setProxyStatus('offline');
          console.log("Servidor proxy está offline (resposta não-ok)");
        }
      } catch (error) {
        setProxyStatus('offline');
        console.log("Servidor proxy está offline:", error);
      }
    };
    
    checkProxyStatus();
  }, [proxyUrl]);

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
    setTotalResultados(0);

    if (proxyStatus === 'online') {
      await buscarViaProxy();
    } else {
      await buscarDadosSimulados();
    }
  };

  const buscarViaProxy = async () => {
    try {
      console.log(`Enviando consulta ao proxy: ${proxyUrl}`);
      console.log(`Tribunal: ${tribunal}, Termo: ${termo}`);
      
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tribunal: tribunal,
          termo: termo
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error || `Erro ao consultar o proxy: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      console.log("Resposta do proxy:", data);

      if (data.hits && data.hits.hits) {
        const docs = data.hits.hits.map((hit: any) => hit._source) || [];
        const total = data.hits.total?.value || docs.length;
        
        setResultados(docs);
        setTotalResultados(total);
        
        if (docs.length === 0) {
          setErro("Nenhum resultado encontrado para os critérios informados.");
        } else {
          toast({
            title: "Busca realizada com sucesso",
            description: `${total.toLocaleString('pt-BR')} ${total === 1 ? 'resultado encontrado' : 'resultados encontrados'}.`,
          });
        }
      } else {
        setErro("Formato de resposta inesperado. Por favor, tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro na requisição ao proxy:", error);
      
      if (error.name === 'AbortError') {
        setErro("A consulta excedeu o tempo limite. Por favor, tente novamente.");
      } else {
        setErro(error.message || "Não foi possível buscar informações. Verifique se o servidor proxy está em execução.");
      }
      
      toast({
        title: "Erro na consulta",
        description: "Ocorreu um erro ao consultar a jurisprudência. Por favor, veja os detalhes abaixo.",
        variant: "destructive",
      });
      
      await buscarDadosSimulados();
    }
  };

  const buscarDadosSimulados = async () => {
    console.log("Carregando dados simulados...");
    
    const resultadosFiltrados = RESULTADOS_SIMULADOS.filter(res => {
      const termoBusca = termo.toLowerCase();
      
      return (
        (res.numeroProcesso?.toLowerCase().includes(termoBusca) || false) ||
        (res.classe?.nome?.toLowerCase().includes(termoBusca) || false) ||
        (res.orgaoJulgador?.nome?.toLowerCase().includes(termoBusca) || false) ||
        (res.assuntos?.some(assunto => 
          typeof assunto === 'object' ? 
            (assunto.nome?.toLowerCase().includes(termoBusca) || false) : 
            String(assunto).toLowerCase().includes(termoBusca)
        ) || false)
      );
    });
    
    setTimeout(() => {
      setResultados(resultadosFiltrados);
      setTotalResultados(resultadosFiltrados.length * 103);
      
      if (resultadosFiltrados.length === 0) {
        setErro("Nenhum resultado encontrado para os critérios informados (modo simulado).");
      } else {
        toast({
          title: "Dados simulados carregados",
          description: `${resultadosFiltrados.length} ${resultadosFiltrados.length === 1 ? 'resultado simulado' : 'resultados simulados'} encontrados.`,
        });
      }
      
      setLoading(false);
    }, 800);
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

  const codeProxyExpress = `
// arquivo: server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

app.post('/api/datajud/search', async (req, res) => {
  const { tribunal, termo } = req.body;
  const url = \`https://api-publica.datajud.cnj.jus.br/\${tribunal}/_search\`;

  const queryBody = {
    size: 50,
    query: {
      multi_match: {
        query: termo,
        fields: ["*"],
        type: "best_fields",
        fuzziness: "AUTO"
      }
    },
    sort: [
      { "_score": { "order": "desc" } },
      { "@timestamp": { "order": "desc" } }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`APIKey \${API_KEY}\`
      },
      body: JSON.stringify(queryBody)
    });

    if (!response.ok) {
      throw new Error(\`Status \${response.status} – \${await response.text()}\`);
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('Erro ao chamar Datajud:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(\`Proxy Datajud rodando na porta \${PORT}\`));
`;

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

      <ProxyStatusAlert
        proxyStatus={proxyStatus}
        setShowProxyInstructions={setShowProxyInstructions}
      />

      <ProxyInstructionsDialog
        open={showProxyInstructions}
        onOpenChange={setShowProxyInstructions}
      />

      <JurisprudenciaResultados
        resultados={resultados}
        loading={loading}
        erro={erro}
        formatarData={formatarData}
        totalResultados={totalResultados}
        termoBusca={termo}
      />
    </div>
  );
}
