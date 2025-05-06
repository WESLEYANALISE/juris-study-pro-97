import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Folder, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const {
    user
  } = useAuth();
  const {
    recentItems,
    addRecentItem
  } = useRecentPeticoes();

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
  const filteredPeticoes = peticoes?.filter(peticao => peticao.area.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  return <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar pastas de petições..." className="pl-10 bg-card/30 backdrop-blur-sm border-white/10" value={searchQuery} onChange={handleSearchChange} />
      </div>
      
      {/* Breadcrumb */}
      <PeticaoBreadcrumb items={[{
      label: "Pastas"
    }]} />
      
      {/* Stats */}
      
      
      {/* Recent folders */}
      {recentItems && recentItems.length > 0}
      
      {/* Main folders grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Todas as áreas</h2>
        
        {isLoading ? <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div> : <AnimatePresence mode="wait">
            <motion.div key="folder-grid" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.3
        }}>
              <PeticaoFolderGrid peticoes={filteredPeticoes} onFolderClick={handleFolderClick} />
            </motion.div>
          </AnimatePresence>}
      </section>
    </div>;
}

// Icons to avoid direct imports
const FolderIcon = ({
  className
}: {
  className?: string;
}) => {
  return <Folder className={className} />;
};
const FileTextIcon = ({
  className
}: {
  className?: string;
}) => {
  return <FileText className={className} />;
};