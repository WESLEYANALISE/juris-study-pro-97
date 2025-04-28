
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import ArticleCard from "@/components/vademecum/ArticleCard";

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
  const { lawName } = useParams<{ lawName: string }>();
  const [articles, setArticles] = useState<LawArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    loadArticles();
  }, [lawName]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Reference a table that actually exists (e.g., checking specific codes tables)
      const tableName = lawName?.replace(/-/g, '_');
      
      if (!tableName) {
        setArticles([]);
        setLoading(false);
        return;
      }
      
      // Hard-code allowed table names to prevent SQL injection and type errors
      const allowedTables = ["Código_Civil", "Código_Penal", "Código_de_Processo_Civil", "Código_de_Processo_Penal",
        "Código_de_Defesa_do_Consumidor", "Código_Tributário_Nacional", "Código_Comercial",
        "Código_Eleitoral", "Código_de_Trânsito_Brasileiro", "Código_Brasileiro_de_Telecomunicações",
        "Estatuto_da_Criança_e_do_Adolescente", "Estatuto_do_Idoso", "Estatuto_da_Terra",
        "Estatuto_da_Cidade", "Estatuto_da_Advocacia_e_da_OAB", "Estatuto_do_Desarmamento", 
        "Estatuto_do_Torcedor", "Estatuto_da_Igualdade_Racial", "Estatuto_da_Pessoa_com_Deficiência",
        "Estatuto_dos_Servidores_Públicos_Civis_da_União"];
      
      if (!allowedTables.includes(tableName)) {
        console.error(`Table name ${tableName} is not allowed`);
        setArticles([]);
        setLoading(false);
        return;
      }
      
      // Use type assertion to tell TypeScript that tableName is a valid table name
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('numero', { ascending: true });

      if (error) {
        console.error("Error loading articles:", error);
        return;
      }

      // Map the data to the LawArticle interface
      const lawArticles = (data || []).map(item => ({
        id: item.id.toString(),
        law_name: lawName || '',
        article_number: item.numero || '',
        article_text: item.artigo || '',
        technical_explanation: item.tecnica,
        formal_explanation: item.formal,
        practical_example: item.exemplo
      }));

      setArticles(lawArticles);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{lawName}</h1>
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
