import React, { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';
import { useVadeMecumSearch } from "@/hooks/useVadeMecumSearch";
import { useVadeMecumPreferences } from "@/hooks/useVadeMecumPreferences";
import { useInView } from "react-intersection-observer";
import { VadeMecumSearch } from "@/components/vademecum/VadeMecumSearch";
import { VadeMecumArticleList } from "@/components/vademecum/VadeMecumArticleList";
import { VadeMecumSidebar } from "@/components/vademecum/VadeMecumSidebar";

const BATCH_SIZE = 5;

const VadeMecumViewer = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const { fontSize, setFontSize } = useVadeMecumPreferences();
  const { searchQuery, setSearchQuery, searchOptions, setSearchOptions, filterArticles } = useVadeMecumSearch();
  
  const [visibleBatch, setVisibleBatch] = useState(BATCH_SIZE);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Format the table name for display
  const displayName = useMemo(() => 
    tableName ? tableName.replace(/_/g, " ") : "", [tableName]);

  // Fetch articles
  const {
    data: articles = [],
    isLoading
  } = useQuery({
    queryKey: ["vadeMecum", tableName],
    queryFn: async () => {
      if (!tableName) return [];
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order('id');
        
      if (error) {
        console.error("Error fetching articles:", error);
        toast.error("Erro ao carregar artigos");
        throw error;
      }
      
      return data;
    },
    enabled: !!tableName
  });

  // Fetch recent history
  const {
    data: recentHistory = []
  } = useQuery({
    queryKey: ["vadeMecumHistory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vademecum_history')
        .select('*')
        .order('viewed_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error("Error fetching history:", error);
        return [];
      }
      
      return data;
    }
  });

  // Fetch favorites
  const {
    data: favorites = []
  } = useQuery({
    queryKey: ["vadeMecumFavorites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vademecum_favorites')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching favorites:", error);
        return [];
      }
      
      return data;
    }
  });

  // Filter articles based on search
  const filteredArticles = useMemo(() => 
    filterArticles(articles, searchQuery), [articles, searchQuery, searchOptions]);
    
  // Get only the visible articles based on the current batch
  const visibleArticles = useMemo(() => 
    filteredArticles.slice(0, visibleBatch), [filteredArticles, visibleBatch]);

  // Load more articles when scrolling to the bottom
  useEffect(() => {
    if (inView && visibleBatch < filteredArticles.length) {
      setVisibleBatch(prev => Math.min(prev + BATCH_SIZE, filteredArticles.length));
    }
  }, [inView, filteredArticles.length]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 px-3 sm:px-6"
    >
      <motion.div 
        className="flex items-center mb-6"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Button variant="ghost" onClick={() => navigate("/vademecum")} className="mr-2 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <motion.h1 
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {displayName}
        </motion.h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <VadeMecumSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchOptions={searchOptions}
            setSearchOptions={setSearchOptions}
            searchInputFocused={searchInputFocused}
            setSearchInputFocused={setSearchInputFocused}
          />

          <VadeMecumArticleList 
            isLoading={isLoading}
            visibleArticles={visibleArticles}
            filteredArticles={filteredArticles}
            visibleBatch={visibleBatch}
            tableName={tableName || ''}
            fontSize={fontSize}
            setFontSize={setFontSize}
            loadMoreRef={loadMoreRef}
          />
        </div>

        <VadeMecumSidebar 
          favorites={favorites}
          recentHistory={recentHistory}
        />
      </div>

      <motion.div
        className="fixed bottom-6 right-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          className="rounded-full shadow-lg"
          size="icon"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default VadeMecumViewer;
