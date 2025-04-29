
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { VadeMecumArticleList } from "@/components/vademecum/VadeMecumArticleList";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [visibleBatch, setVisibleBatch] = useState(10); // Reduced initial batch for faster loading
  const isMobile = useIsMobile();
  
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
          setTimeout(() => loadArticles(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        setError(`Erro ao carregar artigos: ${error.message}`);
        toast.error("Erro ao carregar artigos, por favor tente novamente");
        return;
      }

      // Mapear os dados para o formato LawArticle, garantindo valores defaults
      const lawArticles = (data || []).map((item: any) => ({
        id: item.id ? item.id.toString() : '',
        law_name: tableName || '',
        article_number: item.numero || '',
        article_text: item.artigo || '',
        technical_explanation: item.tecnica || '',
        formal_explanation: item.formal || '',
        practical_example: item.exemplo || ''
      }));

      setArticles(lawArticles);
      setFilteredArticles(lawArticles);
      
      // Registrar vizualização bem-sucedida
      if (lawArticles.length > 0) {
        toast.success(`${lawArticles.length} artigos carregados`);
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
      const filtered = articles.filter(article => {
        if (!article.article_text && !article.article_number) return false;
        
        return (
          (article.article_text?.toLowerCase().includes(lowerQuery) || false) ||
          (article.article_number?.toLowerCase().includes(lowerQuery) || false)
        );
      });
      setFilteredArticles(filtered);
    }
    
    // Resetar o batch quando a pesquisa mudar
    setVisibleBatch(10);
  }, [searchQuery, articles]);
  
  // Efeito para carregar mais artigos quando o usuário rolar até o final da página
  useEffect(() => {
    if (inView && filteredArticles.length > visibleBatch) {
      const batchSize = isMobile ? 5 : 10;
      setVisibleBatch(prev => prev + batchSize);
    }
  }, [inView, filteredArticles.length, visibleBatch, isMobile]);

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
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Erro ao carregar conteúdo</h3>
              <div className="mt-2 text-sm">
                <p>{error}</p>
                <Button 
                  onClick={() => loadArticles()} 
                  className="mt-4 gap-2"
                  variant="outline"
                >
                  <ReloadIcon className="h-4 w-4" />
                  Tentar novamente
                </Button>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-muted-foreground">
            {filteredArticles.length} artigos disponíveis
          </p>
          <div className="relative">
            <input
              type="search"
              placeholder="Buscar artigos..."
              className="px-4 py-2 border rounded-md w-full bg-background border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredArticles.length === 0 && !loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum artigo encontrado para esta lei.</p>
          <Button 
            onClick={() => loadArticles()} 
            className="mt-4 gap-2"
            variant="outline"
          >
            <ReloadIcon className="h-4 w-4" />
            Recarregar
          </Button>
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
