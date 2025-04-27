
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ArticleCard from "@/components/vademecum/ArticleCard";
import { TextToSpeechService } from "@/services/textToSpeechService";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Article {
  id: string;
  numero?: string;
  artigo: string;
  tecnica?: string;
  formal?: string;
  exemplo?: string;
}

const ITEMS_PER_PAGE = 12;

const VadeMecumViewer = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Format the table name for display (replace underscores with spaces)
  const displayName = tableName ? tableName.replace(/_/g, " ") : "";

  // Fetch articles from the selected table
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["vadeMecum", tableName],
    queryFn: async () => {
      if (!tableName) return [];
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .order('id');
          
        if (error) {
          console.error("Error fetching articles:", error);
          throw error;
        }
        
        return data as Article[];
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        toast({
          title: "Erro ao carregar artigos",
          description: "Não foi possível carregar os artigos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!tableName,
  });

  // Filter articles based on search query
  const filteredArticles = articles?.filter(article => 
    article.artigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.numero && article.numero.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Pagination
  const totalPages = Math.ceil((filteredArticles?.length || 0) / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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

  // Reset current page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Stop narration when component unmounts
  useEffect(() => {
    return () => {
      TextToSpeechService.stop();
    };
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate("/vademecum")} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Erro</h1>
        </div>
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <p>Ocorreu um erro ao carregar os artigos. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => navigate("/vademecum")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Consulte artigos e obtenha explicações técnicas e formais
      </p>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={`Buscar em ${displayName}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
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
          paginatedArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              isCurrentlyNarrating={isNarrating && currentArticle?.id === article.id}
              onNarrate={() => handleNarration(article)}
            />
          ))
        )}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
              </PaginationItem>
            )}
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    isActive={currentPage === pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default VadeMecumViewer;
