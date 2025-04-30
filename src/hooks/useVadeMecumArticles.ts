
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

// Lista de tabelas permitidas para prevenir SQL injection e type errors
const ALLOWED_TABLES = ["Código_Civil", "Código_Penal", "Código_de_Processo_Civil", "Código_de_Processo_Penal", "Código_de_Defesa_do_Consumidor", "Código_Tributário_Nacional", "Código_Comercial", "Código_Eleitoral", "Código_de_Trânsito_Brasileiro", "Código_Brasileiro_de_Telecomunicações", "Estatuto_da_Criança_e_do_Adolescente", "Estatuto_do_Idoso", "Estatuto_da_Terra", "Estatuto_da_Cidade", "Estatuto_da_Advocacia_e_da_OAB", "Estatuto_do_Desarmamento", "Estatuto_do_Torcedor", "Estatuto_da_Igualdade_Racial", "Estatuto_da_Pessoa_com_Deficiência", "Estatuto_dos_Servidores_Públicos_Civis_da_União"];

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

  // Função para decodificar o nome da tabela de forma segura
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
      withArticleNumber: mappedData.filter(a => !!a.article_number.trim()).length,
      withArticleText: mappedData.filter(a => !!a.article_text.trim()).length,
      withTechnicalExplanation: mappedData.filter(a => !!a.technical_explanation.trim()).length,
      withFormalExplanation: mappedData.filter(a => !!a.formal_explanation.trim()).length,
      withPracticalExample: mappedData.filter(a => !!a.practical_example.trim()).length
    };
    
    console.log("Dados processados:", {
      tableName: getTableName(lawId),
      totalRecords: mappedData.length,
      stats
    });
    
    setDataStats(stats);

    // Manter a ordenação original do banco de dados
    // Os itens sem número de artigo (como títulos/subtítulos) já devem estar 
    // posicionados corretamente na sequência do banco
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
        return;
      }
      console.log(`Carregando dados da tabela: ${tableName}`);

      // Consultar a tabela específica - respeitar a ordem do banco de dados (id)
      // que deve estar correta para mostrar os cabeçalhos antes dos artigos
      const { data, error } = await supabase.from(tableName as any).select('*').order('id', {
        ascending: true
      });
      
      if (error) {
        console.error(`Erro ao carregar artigos (tentativa ${retryCount + 1}):`, error);

        // Retry automático para erros temporários, até 3 tentativas
        if (retryCount < 3) {
          setTimeout(() => loadArticles(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        setError(`Erro ao carregar artigos: ${error.message}`);
        return;
      }
      
      console.log(`Dados recebidos da tabela ${tableName}:`, data);

      // Processar e validar os dados recebidos
      const processedArticles = processRawData(data || []);
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
    loadArticles();
  }, [loadArticles]);

  // Efeito para filtrar artigos com base na pesquisa
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = articles.filter(article => {
        if (!article.article_text && !article.article_number) return false;
        return (
          article.article_text?.toLowerCase().includes(lowerQuery) || 
          article.article_number?.toLowerCase().includes(lowerQuery)
        );
      });
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
