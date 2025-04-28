// Update the import for supabase
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/vademecum/ArticleCard";

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
      const { data, error } = await supabase
        .from('vademecum_articles')
        .select('*')
        .eq('law_name', lawName)
        .order('article_number', { ascending: true });

      if (error) {
        console.error("Error loading articles:", error);
        return;
      }

      setArticles(data || []);
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
