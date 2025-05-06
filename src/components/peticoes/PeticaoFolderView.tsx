
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PeticaoFolderGrid } from "./PeticaoFolderGrid";
import { PeticaoBreadcrumb } from "./PeticaoBreadcrumb";
import { usePeticoes } from "@/hooks/usePeticoes";
import { useRecentPeticoes } from "@/hooks/useRecentPeticoes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataCard } from "@/components/ui/data-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { JuridicalCard } from "@/components/ui/juridical-card";
import { toast } from "sonner";

export function PeticaoFolderView() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { recentItems, addRecentItem } = useRecentPeticoes();
  
  // Use the existing hook to get the petições data
  const {
    peticoes,
    isLoading,
    refetch,
    totalPeticoes,
    totalAreas
  } = usePeticoes({
    initialFilters: {
      area: "",
      subArea: "",
      tipo: "",
      tags: [],
      search: searchQuery
    }
  });

  // Handle folder click
  const handleFolderClick = async (peticao: any) => {
    // Track access if user is logged in
    if (user && peticao.id) {
      try {
        await supabase.from("peticoes_acessos").insert({
          user_id: user.id,
          peticao_id: peticao.id,
          accessed_at: new Date().toISOString()
        });
        
        // Add to recent items
        addRecentItem({
          id: peticao.id,
          title: peticao.area,
          area: "Petições",
          url: peticao.link
        });
        
      } catch (error) {
        console.error("Error tracking folder access:", error);
      }
    }
    
    // Open link in new window/tab
    if (peticao.link) {
      window.open(peticao.link, "_blank");
      toast.success(`Abrindo pasta ${peticao.area} no Google Drive`);
    } else {
      toast.error("Link da pasta não encontrado");
    }
  };

  // Filter petições based on search query
  const filteredPeticoes = peticoes?.filter(peticao => 
    peticao.area.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pastas de petições..."
          className="pl-10 bg-card/30 backdrop-blur-sm border-white/10"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* Breadcrumb */}
      <PeticaoBreadcrumb 
        items={[{ label: "Pastas" }]}
      />
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DataCard 
          title="Total de áreas" 
          icon={<FolderIcon className="h-4 w-4" />}
          variant="primary"
        >
          <div className="text-2xl font-bold">{totalAreas || filteredPeticoes.length}</div>
          <p className="text-sm text-muted-foreground">Áreas do direito disponíveis</p>
        </DataCard>
        
        <DataCard 
          title="Total de petições" 
          icon={<FileTextIcon className="h-4 w-4" />}
          variant="default"
        >
          <div className="text-2xl font-bold">{totalPeticoes}</div>
          <p className="text-sm text-muted-foreground">Modelos de documentos</p>
        </DataCard>
        
        <DataCard 
          title="Acesso rápido" 
          icon={<Clock className="h-4 w-4" />}
          variant="primary"
        >
          <p className="text-sm">Clique em uma pasta para acessar os documentos no Google Drive</p>
        </DataCard>
      </div>
      
      {/* Recent folders */}
      {recentItems && recentItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pastas recentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentItems.slice(0, 3).map(item => (
              <JuridicalCard
                key={item.id}
                title={item.title}
                description="Pasta de petições"
                icon="folder"
                variant="primary"
                onClick={() => window.open(item.url, "_blank")}
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Acessado em {new Date(item.viewedAt).toLocaleDateString()} 
                </p>
                <Button className="w-full" variant="default" onClick={() => window.open(item.url, "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Acessar pasta
                </Button>
              </JuridicalCard>
            ))}
          </div>
        </section>
      )}
      
      {/* Main folders grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Todas as áreas</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="folder-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PeticaoFolderGrid
                peticoes={filteredPeticoes}
                onFolderClick={handleFolderClick}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}

// Icons to avoid direct imports
const FolderIcon = ({ className }: { className?: string }) => {
  return <Folder className={className} />;
};

const FileTextIcon = ({ className }: { className?: string }) => {
  return <FileText className={className} />;
};

const Clock = ({ className }: { className?: string }) => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
};

const ExternalLink = ({ className }: { className?: string }) => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>;
};

import { Button } from "@/components/ui/button";
