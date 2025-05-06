
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { SupabaseArticle } from "@/types/supabase";

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

export const useVadeMecumArticlesOptimized = (searchQuery: string) => {
  const { lawId } = useParams<{ lawId: string; }>();
  const [articles, setArticles] = useState<SupabaseArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<SupabaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache para evitar requisições repetidas
  const articlesCache = useMemo(() => new Map<string, SupabaseArticle[]>(), []);

  // Obtém o nome da tabela de forma segura
  const tableName = useMemo(() => {
    if (!lawId) return null;
    
    try {
      const decodedName = decodeURIComponent(lawId);
      return ALLOWED_TABLES.includes(decodedName) ? decodedName : null;
    } catch (err) {
      return null;
    }
  }, [lawId]);

  const decodedLawName = useMemo(() => 
    lawId ? decodeURIComponent(lawId).replace(/_/g, ' ') : '',
  [lawId]);

  // Função otimizada para carregar artigos
  const loadArticles = useCallback(async () => {
    if (!tableName) {
      setError("Lei não encontrada ou não disponível");
      setArticles([]);
      setLoading(false);
      return;
    }

    // Verificar se já temos dados em cache
    if (articlesCache.has(tableName)) {
      const cachedData = articlesCache.get(tableName);
      if (cachedData && cachedData.length > 0) {
        setArticles(cachedData);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Primeira tentativa: usar consulta direta (mais rápido que edge function)
      const { data, error } = await supabase
        .from(tableName as any)
        .select('id, numero, artigo, tecnica, formal, exemplo')
        .limit(500); // Limitamos para melhor performance inicial
      
      if (error) {
        throw error;
      }
      
      if (data && Array.isArray(data)) {
        const processedData = data.map((item: any) => ({
          id: item.id ? item.id.toString() : '',
          law_name: tableName || '',
          numero: item.numero || '',
          artigo: item.artigo || '',
          tecnica: item.tecnica || '',
          formal: item.formal || '',
          exemplo: item.exemplo || ''
        }));
        
        setArticles(processedData);
        articlesCache.set(tableName, processedData);
      } else {
        setArticles([]);
      }
    } catch (err) {
      setError("Erro ao carregar artigos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [tableName, articlesCache]);

  // Efeito para carregar artigos quando o ID da lei mudar
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Filtrar artigos com base na consulta de pesquisa
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = articles.filter(article => {
        if (!article.artigo && !article.numero) return false;
        return (
          article.artigo?.toLowerCase().includes(lowerQuery) || 
          article.numero?.toLowerCase().includes(lowerQuery)
        );
      });
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  return {
    articles,
    filteredArticles,
    loading,
    error,
    loadArticles,
    decodedLawName,
    tableName
  };
};

export default useVadeMecumArticlesOptimized;
