
import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Lista de tabelas permitidas para prevenir SQL injection e type errors
const ALLOWED_TABLES = [
  "Código_Civil", 
  "Código_Penal", 
  "Código_de_Processo_Civil", 
  "Código_de_Processo_Penal", 
  "Código_de_Defesa_do_Consumidor", 
  "Código_Tributário_Nacional", 
  "Código_Comercial", 
  "Código_Eleitoral", 
  "Código_de_Trânsito_Brasileiro", 
  "Código_Brasileiro_de_Telecomunicações", 
  "Estatuto_da_Criança_e_do_Adolescente", 
  "Estatuto_do_Idoso", 
  "Estatuto_da_Terra", 
  "Estatuto_da_Cidade", 
  "Estatuto_da_Advocacia_e_da_OAB", 
  "Estatuto_do_Desarmamento", 
  "Estatuto_do_Torcedor", 
  "Estatuto_da_Igualdade_Racial", 
  "Estatuto_da_Pessoa_com_Deficiência", 
  "Estatuto_dos_Servidores_Públicos_Civis_da_União",
  "Constituicao_Federal",
  "Constituição_Federal"
]; 

// Interface para representar os artigos de leis
interface LawArticle {
  id: string;
  law_name: string;
  numero: string;       // Número do artigo (coluna 'numero')
  artigo: string;       // Texto do artigo (coluna 'artigo')
  tecnica?: string;     // Explicação técnica (coluna 'tecnica')
  formal?: string;      // Explicação formal (coluna 'formal')
  exemplo?: string;     // Exemplo prático (coluna 'exemplo')
}

interface DataStats {
  total: number;
  withNumero: number;
  withArtigo: number;
  withTecnica: number;
  withFormal: number;
  withExemplo: number;
}

// Create a cache for already processed articles
const articlesCache = new Map<string, LawArticle[]>();

export const useVadeMecumArticles = (searchQuery: string) => {
  const { lawId } = useParams<{ lawId: string; }>();
  const [dataStats, setDataStats] = useState<DataStats>({
    total: 0,
    withNumero: 0,
    withArtigo: 0,
    withTecnica: 0,
    withFormal: 0,
    withExemplo: 0
  });

  // Função para validar o nome da tabela de forma segura
  const getTableName = useCallback((encodedName: string | undefined): string | null => {
    if (!encodedName) {
      console.error("Nome da tabela não fornecido");
      return null;
    }
    try {
      // Decodificar o nome da tabela
      const decodedName = decodeURIComponent(encodedName);

      // Verificar se a tabela está na lista de permitidas
      if (!ALLOWED_TABLES.includes(decodedName)) {
        console.error(`Tabela "${decodedName}" não está na lista de permitidas`);
        return null;
      }
      return decodedName;
    } catch (err) {
      console.error("Erro ao decodificar nome da tabela:", err);
      return null;
    }
  }, []);

  // Processa os dados brutos do banco para o formato correto
  const processRawData = useCallback((data: any[]): LawArticle[] => {
    if (!data || !Array.isArray(data)) {
      console.error("Dados inválidos recebidos:", data);
      return [];
    }

    // Mapear e transformar os dados - mantendo os nomes originais das colunas
    const mappedData = data.map((item: any) => {
      // Garante que temos pelo menos os campos necessários
      const processedItem = {
        id: item.id ? item.id.toString() : '',
        law_name: getTableName(lawId) || '',
        numero: item.numero || '',
        artigo: item.artigo || '',
        tecnica: item.tecnica || '',
        formal: item.formal || '',
        exemplo: item.exemplo || ''
      };
      return processedItem;
    });

    // Coleta estatísticas para debugging
    const stats = {
      total: mappedData.length,
      withNumero: mappedData.filter(a => !!a.numero?.trim()).length,
      withArtigo: mappedData.filter(a => !!a.artigo?.trim()).length,
      withTecnica: mappedData.filter(a => !!a.tecnica?.trim()).length,
      withFormal: mappedData.filter(a => !!a.formal?.trim()).length,
      withExemplo: mappedData.filter(a => !!a.exemplo?.trim()).length
    };
    
    setDataStats(stats);

    // Save to cache for future use
    if (lawId) {
      articlesCache.set(lawId, mappedData);
    }

    return mappedData;
  }, [lawId, getTableName]);

  // Use React Query for caching instead of useState + useEffect
  const { 
    data: articles = [], 
    isLoading: loading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['vademecum-articles', lawId],
    queryFn: async () => {
      // First check if we have a cached version
      if (lawId && articlesCache.has(lawId)) {
        return articlesCache.get(lawId) || [];
      }

      const tableName = getTableName(lawId);
      if (!tableName) {
        throw new Error("Lei não encontrada ou não disponível");
      }

      try {
        // Try edge function first
        const response = await supabase.functions.invoke("query-vademecum-table", {
          body: { table_name: tableName }
        });

        if (response.error) {
          throw response.error;
        }

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error("Dados inválidos recebidos");
        }

        return processRawData(response.data);
      } catch (edgeFnError) {
        console.error("Edge function error, falling back to direct query:", edgeFnError);
        
        // Fallback to direct query
        const { data: directData, error: directError } = await supabase
          .from(tableName as any)
          .select('*');
        
        if (directError) throw directError;
        if (!directData) throw new Error("Nenhum dado encontrado");
        
        return processRawData(directData);
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - law content rarely changes
    gcTime: 60 * 60 * 1000, // 1 hour (antigo cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Erro ao carregar artigos. Tente novamente."
    }
  });

  // Filtered articles with memoization
  const filteredArticles = useMemo(() => {
    if (searchQuery.trim() === "") {
      return articles;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    return articles.filter(article => {
      if (!article.artigo && !article.numero) return false;
      return (
        article.artigo?.toLowerCase().includes(lowerQuery) || 
        article.numero?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [searchQuery, articles]);

  const decodedLawName = lawId ? decodeURIComponent(lawId).replace(/_/g, ' ') : '';

  return {
    articles,
    filteredArticles,
    loading,
    error: error ? (error as Error).message : null,
    dataStats,
    loadArticles: refetch,
    decodedLawName,
    tableName: lawId ? decodeURIComponent(lawId) : ''
  };
};

export default useVadeMecumArticles;
