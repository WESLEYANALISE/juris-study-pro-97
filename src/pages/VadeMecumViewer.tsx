
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import ArticleCard from "@/components/vademecum/ArticleCard";
import { TextToSpeechService } from "@/services/textToSpeechService";

interface Article {
  id: string;
  numero?: string;
  artigo: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
}

const VadeMecumViewer = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);

  // Format the table name for display (replace underscores with spaces)
  const displayName = tableName ? tableName.replace(/_/g, " ") : "";

  // Fetch articles from the selected table
  const { data: articles, isLoading } = useQuery({
    queryKey: ["vadeMecum", tableName],
    queryFn: async () => {
      if (!tableName) return [];
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("id");
        
      if (error) {
        throw error;
      }
      
      return data as Article[];
    },
    enabled: !!tableName,
  });

  // Filter articles based on search query
  const filteredArticles = articles?.filter(article => 
    article.artigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.numero && article.numero.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle narration
  const handleNarration = (article: Article) => {
    if (isNarrating && currentArticle?.id === article.id) {
      // Stop narration
      TextToSpeechService.stop();
      setIsNarrating(false);
      setCurrentArticle(null);
    } else {
      // Start new narration
      if (isNarrating) {
        TextToSpeechService.stop();
      }
      setCurrentArticle(article);
      setIsNarrating(true);
      TextToSpeechService.speak(article.artigo);
    }
  };

  // Stop narration when component unmounts
  useEffect(() => {
    return () => {
      TextToSpeechService.stop();
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{displayName}</h1>
        <p className="text-muted-foreground">
          Consulte artigos e obtenha explicações técnicas e formais
        </p>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder={`Buscar em ${displayName}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : filteredArticles?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              Nenhum artigo encontrado com os critérios de busca.
            </p>
          </div>
        ) : (
          filteredArticles?.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              isCurrentlyNarrating={isNarrating && currentArticle?.id === article.id}
              onNarrate={() => handleNarration(article)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default VadeMecumViewer;
