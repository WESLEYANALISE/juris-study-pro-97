
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import ArticleCard from "@/components/vademecum/ArticleCard";
import { toast } from "sonner";

interface LawArticle {
  id: string;
  law_name: string;
  article_number: string;
  article_text: string;
  technical_explanation?: string;
  formal_explanation?: string;
  practical_example?: string;
}

const VadeMecumViewer = () => {
  const { lawId } = useParams<{ lawId: string }>();
  const [articles, setArticles] = useState<LawArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, [lawId]);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Decode the table name from URL parameter
      const rawTableName = lawId ? decodeURIComponent(lawId) : null;
      console.log("Raw table name from URL:", rawTableName);
      
      if (!rawTableName) {
        setError("Identificador da lei não encontrado");
        setArticles([]);
        setLoading(false);
        return;
      }
      
      // Hard-code allowed table names to prevent SQL injection and type errors
      const allowedTables = [
        "Código_Civil", "Código_Penal", "Código_de_Processo_Civil", "Código_de_Processo_Penal",
        "Código_de_Defesa_do_Consumidor", "Código_Tributário_Nacional", "Código_Comercial",
        "Código_Eleitoral", "Código_de_Trânsito_Brasileiro", "Código_Brasileiro_de_Telecomunicações",
        "Estatuto_da_Criança_e_do_Adolescente", "Estatuto_do_Idoso", "Estatuto_da_Terra",
        "Estatuto_da_Cidade", "Estatuto_da_Advocacia_e_da_OAB", "Estatuto_do_Desarmamento", 
        "Estatuto_do_Torcedor", "Estatuto_da_Igualdade_Racial", "Estatuto_da_Pessoa_com_Deficiência",
        "Estatuto_dos_Servidores_Públicos_Civis_da_União"
      ];
      
      if (!allowedTables.includes(rawTableName)) {
        console.error(`Table name "${rawTableName}" is not in the allowed list`);
        setError(`Lei "${rawTableName}" não está disponível ou não existe`);
        setArticles([]);
        setLoading(false);
        toast.error(`Lei "${rawTableName}" não está disponível ou não existe`);
        return;
      }
      
      console.log(`Fetching articles from table: ${rawTableName}`);
      
      // Use the decoded table name for the query
      const { data, error } = await supabase
        .from(rawTableName as any)
        .select('*')
        .order('numero', { ascending: true });

      if (error) {
        console.error("Error loading articles:", error);
        setError(`Erro ao carregar artigos: ${error.message}`);
        toast.error("Erro ao carregar artigos, por favor tente novamente");
        return;
      }

      console.log(`Retrieved ${data?.length || 0} articles`);
      
      // Map the data to the LawArticle interface
      const lawArticles = (data || []).map((item: any) => ({
        id: item.id ? item.id.toString() : '',
        law_name: rawTableName || '',
        article_number: item.numero || '',
        article_text: item.artigo || '',
        technical_explanation: item.tecnica,
        formal_explanation: item.formal,
        practical_example: item.exemplo
      }));

      setArticles(lawArticles);
    } catch (err) {
      console.error("Unexpected error in loadArticles:", err);
      setError("Ocorreu um erro inesperado ao carregar os artigos");
      toast.error("Ocorreu um erro inesperado, por favor tente novamente");
    } finally {
      setLoading(false);
    }
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
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
                  onClick={loadArticles} 
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

  if (articles.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{lawId && decodeURIComponent(lawId)}</h1>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum artigo encontrado para esta lei.</p>
          <button 
            onClick={loadArticles} 
            className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{lawId && decodeURIComponent(lawId).replace(/_/g, ' ')}</h1>
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            lawName={article.law_name}
            articleNumber={article.article_number}
            articleText={article.article_text}
            technicalExplanation={article.technical_explanation}
            formalExplanation={article.formal_explanation}
            practicalExample={article.practical_example}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
          />
        ))}
      </div>
    </div>
  );
};

export default VadeMecumViewer;
