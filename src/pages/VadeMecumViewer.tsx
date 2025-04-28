
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import ArticleCard from "@/components/vademecum/ArticleCard";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { VadeMecumArticleList } from "@/components/vademecum/VadeMecumArticleList";
import { useInView } from "react-intersection-observer";

interface LawArticle {
  id: string;
  law_name: string;
  article_number: string;
  article_text: string;
  technical_explanation?: string;
  formal_explanation?: string;
  practical_example?: string;
}

// Lista de tabelas permitidas para prevenir SQL injection e type errors
const ALLOWED_TABLES = [
  "Código_Civil", "Código_Penal", "Código_de_Processo_Civil", "Código_de_Processo_Penal",
  "Código_de_Defesa_do_Consumidor", "Código_Tributário_Nacional", "Código_Comercial",
  "Código_Eleitoral", "Código_de_Trânsito_Brasileiro", "Código_Brasileiro_de_Telecomunicações",
  "Estatuto_da_Criança_e_do_Adolescente", "Estatuto_do_Idoso", "Estatuto_da_Terra",
  "Estatuto_da_Cidade", "Estatuto_da_Advocacia_e_da_OAB", "Estatuto_do_Desarmamento", 
  "Estatuto_do_Torcedor", "Estatuto_da_Igualdade_Racial", "Estatuto_da_Pessoa_com_Deficiência",
  "Estatuto_dos_Servidores_Públicos_Civis_da_União"
];

const VadeMecumViewer = () => {
  const { lawId } = useParams<{ lawId: string }>();
  const [articles, setArticles] = useState<LawArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<LawArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleBatch, setVisibleBatch] = useState(20);
  
  // Use react-intersection-observer para detecção de "infinite scroll"
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  
  // Calcular artigos visíveis baseado no batch atual
  const visibleArticles = filteredArticles.slice(0, visibleBatch);
  
  // Função para decodificar o nome da tabela de forma segura
  const getTableName = useCallback((encodedName: string | undefined): string | null => {
    if (!encodedName) {
      console.error("Nome da tabela não fornecido");
      return null;
    }
    
    try {
      // Decodificar o nome da tabela
      const decodedName = decodeURIComponent(encodedName);
      console.log("Nome da tabela decodificado:", decodedName);
      
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

  // Carregar artigos com retry automático
  const loadArticles = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      // Obter e verificar o nome da tabela
      const tableName = getTableName(lawId);
      console.log("Tentando carregar artigos da tabela:", tableName);
      
      if (!tableName) {
        setError("Lei não encontrada ou não disponível");
        setArticles([]);
        toast.error("Lei não encontrada ou não disponível");
        return;
      }
      
      // Consultar a tabela específica
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('numero', { ascending: true });

      if (error) {
        console.error(`Erro ao carregar artigos (tentativa ${retryCount + 1}):`, error);
        
        // Retry automático para erros temporários, até 3 tentativas
        if (retryCount < 3) {
          console.log(`Tentando novamente (${retryCount + 1}/3)...`);
          setTimeout(() => loadArticles(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        setError(`Erro ao carregar artigos: ${error.message}`);
        toast.error("Erro ao carregar artigos, por favor tente novamente");
        return;
      }

      console.log(`Recuperados ${data?.length || 0} artigos`);
      
      // Mapear os dados para o formato LawArticle
      const lawArticles = (data || []).map((item: any) => ({
        id: item.id ? item.id.toString() : '',
        law_name: tableName || '',
        article_number: item.numero || '',
        article_text: item.artigo || '',
        technical_explanation: item.tecnica,
        formal_explanation: item.formal,
        practical_example: item.exemplo
      }));

      setArticles(lawArticles);
      setFilteredArticles(lawArticles);
      
      // Registrar vizualização bem-sucedida
      if (lawArticles.length > 0) {
        toast.success(`${lawArticles.length} artigos carregados com sucesso`);
      } else {
        toast.info("Nenhum artigo encontrado para esta lei");
      }
    } catch (err) {
      console.error("Erro inesperado em loadArticles:", err);
      setError("Ocorreu um erro inesperado ao carregar os artigos");
      toast.error("Ocorreu um erro inesperado, por favor tente novamente");
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
      const filtered = articles.filter(article => 
        article.article_text.toLowerCase().includes(lowerQuery) ||
        article.article_number.toLowerCase().includes(lowerQuery)
      );
      setFilteredArticles(filtered);
    }
    
    // Resetar o batch quando a pesquisa mudar
    setVisibleBatch(20);
  }, [searchQuery, articles]);
  
  // Efeito para carregar mais artigos quando o usuário rolar até o final da página
  useEffect(() => {
    if (inView && filteredArticles.length > visibleBatch) {
      setVisibleBatch(prev => prev + 20);
    }
  }, [inView, filteredArticles.length, visibleBatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] py-12">
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando artigos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar conteúdo</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button 
                  onClick={() => loadArticles()} 
                  className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const decodedLawName = lawId ? decodeURIComponent(lawId).replace(/_/g, ' ') : '';

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{decodedLawName}</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredArticles.length} artigos disponíveis
          </p>
          <div className="relative">
            <input
              type="search"
              placeholder="Buscar artigos..."
              className="px-4 py-2 border rounded-md w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredArticles.length === 0 && !loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum artigo encontrado para esta lei.</p>
          <button 
            onClick={() => loadArticles()} 
            className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
          >
            Recarregar
          </button>
        </div>
      ) : (
        <VadeMecumArticleList
          isLoading={loading}
          visibleArticles={visibleArticles}
          filteredArticles={filteredArticles}
          visibleBatch={visibleBatch}
          tableName={lawId ? decodeURIComponent(lawId) : ''}
          fontSize={fontSize}
          setFontSize={setFontSize}
          loadMoreRef={loadMoreRef}
        />
      )}
    </div>
  );
};

export default VadeMecumViewer;
