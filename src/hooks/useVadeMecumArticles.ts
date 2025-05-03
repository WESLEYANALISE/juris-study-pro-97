
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

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

interface LawArticle {
  id: string;
  law_name: string;
  article_number: string;
  article_text: string;
  technical_explanation?: string;
  formal_explanation?: string;
  practical_example?: string;
}

interface DataStats {
  total: number;
  withArticleNumber: number;
  withArticleText: number;
  withTechnicalExplanation: number;
  withFormalExplanation: number;
  withPracticalExample: number;
}

export const useVadeMecumArticles = (searchQuery: string) => {
  const { lawId } = useParams<{ lawId: string; }>();
  const [articles, setArticles] = useState<LawArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<LawArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataStats, setDataStats] = useState<DataStats>({
    total: 0,
    withArticleNumber: 0,
    withArticleText: 0,
    withTechnicalExplanation: 0,
    withFormalExplanation: 0,
    withPracticalExample: 0
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
  const processRawData = (data: any[]): LawArticle[] => {
    if (!data || !Array.isArray(data)) {
      console.error("Dados inválidos recebidos:", data);
      return [];
    }

    console.log("Raw data sample (first 2 items):", data.slice(0, 2));

    // Mapear e transformar os dados
    const mappedData = data.map((item: any) => {
      // Garante que temos pelo menos os campos necessários
      return {
        id: item.id ? item.id.toString() : '',
        law_name: getTableName(lawId) || '',
        article_number: item.numero || '',
        article_text: item.artigo || '',
        technical_explanation: item.tecnica || '',
        formal_explanation: item.formal || '',
        practical_example: item.exemplo || ''
      };
    });

    // Coleta estatísticas para debugging
    const stats = {
      total: mappedData.length,
      withArticleNumber: mappedData.filter(a => !!a.article_number?.trim()).length,
      withArticleText: mappedData.filter(a => !!a.article_text?.trim()).length,
      withTechnicalExplanation: mappedData.filter(a => !!a.technical_explanation?.trim()).length,
      withFormalExplanation: mappedData.filter(a => !!a.formal_explanation?.trim()).length,
      withPracticalExample: mappedData.filter(a => !!a.practical_example?.trim()).length
    };
    
    console.log("Mapped data sample (first 2 items):", mappedData.slice(0, 2));
    console.log("Dados processados:", {
      tableName: getTableName(lawId),
      totalRecords: mappedData.length,
      stats
    });
    
    setDataStats(stats);

    // Manter a ordenação original do banco de dados
    return mappedData;
  };

  // Carregar artigos com retry automático
  const loadArticles = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);

    try {
      // Obter e verificar o nome da tabela
      const tableName = getTableName(lawId);
      if (!tableName) {
        setError("Lei não encontrada ou não disponível");
        setArticles([]);
        setLoading(false);
        return;
      }
      console.log(`Carregando dados da tabela: ${tableName}`);

      // Tentativa 1: Chamada para a edge function com o nome da tabela
      console.log("Tentativa de carregamento via Edge Function");
      const response = await supabase.functions.invoke("query-vademecum-table", {
        body: { table_name: tableName }
      });

      // Verificar se há erro na chamada da função
      if (response.error) {
        console.error(`Erro ao carregar artigos via Edge Function (tentativa ${retryCount + 1}):`, response.error);

        // Tentativa 2: Fallback para consulta direta
        console.log("Tentando consulta direta como fallback");
        const { data: directData, error: directError } = await supabase
          .from(tableName as any)
          .select('*');
        
        if (directError) {
          console.error("Falha na consulta direta:", directError);
          
          if (retryCount < 3) {
            console.log(`Tentando novamente (${retryCount + 1}/3)...`);
            setTimeout(() => loadArticles(retryCount + 1), 1000 * (retryCount + 1));
            return;
          }
          
          setError(`Erro ao carregar artigos: ${directError.message}`);
          setLoading(false);
          return;
        }
        
        if (directData && Array.isArray(directData)) {
          console.log(`Dados recebidos via consulta direta: ${directData.length} registros`);
          console.log("Primeiros registros:", directData.slice(0, 3));
          
          const processedArticles = processRawData(directData);
          setArticles(processedArticles);
          setFilteredArticles(processedArticles);
          setLoading(false);
          return;
        } else {
          console.error("Consulta direta retornou dados vazios ou inválidos");
          setArticles([]);
          setFilteredArticles([]);
          setLoading(false);
          return;
        }
      }
      
      // Tentativa 1 bem-sucedida: processar dados da Edge Function
      const responseData = response.data;
      console.log(`Dados recebidos da Edge Function para ${tableName}:`, 
        Array.isArray(responseData) ? `${responseData.length} registros` : 'não é um array');
      
      if (!responseData || !Array.isArray(responseData) || responseData.length === 0) {
        console.error("Edge function retornou dados vazios ou inválidos");
        setArticles([]);
        setFilteredArticles([]);
        setLoading(false);
        return;
      }
      
      // Processar e validar os dados recebidos
      const processedArticles = processRawData(responseData);
      setArticles(processedArticles);
      setFilteredArticles(processedArticles);

    } catch (err) {
      console.error("Erro inesperado em loadArticles:", err);
      setError("Ocorreu um erro inesperado ao carregar os artigos");
    } finally {
      setLoading(false);
    }
  }, [lawId, getTableName]);

  // Efeito para carregar artigos quando o ID da lei mudar
  useEffect(() => {
    console.log("lawId mudou, carregando artigos:", lawId);
    loadArticles();
  }, [loadArticles]);

  // Efeito para filtrar artigos com base na pesquisa
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles);
      console.log(`Mostrando todos os ${articles.length} artigos`);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = articles.filter(article => {
        if (!article.article_text && !article.article_number) return false;
        return (
          article.article_text?.toLowerCase().includes(lowerQuery) || 
          article.article_number?.toLowerCase().includes(lowerQuery)
        );
      });
      console.log(`Filtro aplicado: ${filtered.length}/${articles.length} artigos correspondem a "${searchQuery}"`);
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  const decodedLawName = lawId ? decodeURIComponent(lawId).replace(/_/g, ' ') : '';

  return {
    articles,
    filteredArticles,
    loading,
    error,
    dataStats,
    loadArticles,
    decodedLawName,
    tableName: lawId ? decodeURIComponent(lawId) : ''
  };
};

export default useVadeMecumArticles;
