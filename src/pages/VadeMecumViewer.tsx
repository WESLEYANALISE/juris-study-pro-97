
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  BookOpen, 
  Search,
  VolumeUp, 
  VolumeX,
  Star,
  Pencil,
  File,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { PageTransition } from "@/components/PageTransition";
import ArticleCard from "@/components/vademecum/ArticleCard";
import { TextToSpeechService } from "@/services/textToSpeechService";
import { useToast } from "@/components/ui/use-toast";

const VadeMecumViewer = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  
  const displayName = tableName?.replace(/_/g, " ") || "";
  
  // Get articles from table
  const { data: articles, isLoading } = useQuery({
    queryKey: ["vademecum", tableName],
    queryFn: async () => {
      if (!tableName) return [];
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("id");
        
      if (error) {
        throw error;
      }
      return data;
    },
  });

  // Filter articles based on search query
  const filteredArticles = articles?.filter((article) => {
    if (!searchQuery) return true;
    
    // Search in article text or number
    return (
      (article.numero && article.numero.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (article.artigo && article.artigo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Handle narration
  const handleNarration = (article: any) => {
    if (isNarrating) {
      TextToSpeechService.stop();
      setIsNarrating(false);
      setCurrentArticle(null);
      return;
    }
    
    setIsNarrating(true);
    setCurrentArticle(article);
    
    const textToNarrate = `Artigo ${article.numero}. ${article.artigo}`;
    
    TextToSpeechService.speak(textToNarrate)
      .then(() => {
        setIsNarrating(false);
        setCurrentArticle(null);
      })
      .catch((error) => {
        console.error("Error narrating text:", error);
        toast({
          title: "Erro na narração",
          description: "Não foi possível narrar este artigo.",
          variant: "destructive",
        });
        setIsNarrating(false);
        setCurrentArticle(null);
      });
  };

  return (
    <PageTransition>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/vademecum")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            <p className="text-muted-foreground text-sm">
              Navegue pelos artigos e consulte explicações
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={`Buscar no ${displayName}...`}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            filteredArticles && filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isCurrentlyNarrating={isNarrating && currentArticle?.id === article.id}
                  onNarrate={() => handleNarration(article)}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <File className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium">Nenhum artigo encontrado</h3>
                <p className="text-muted-foreground">
                  Tente uma busca diferente ou volte para a tela anterior
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default VadeMecumViewer;
