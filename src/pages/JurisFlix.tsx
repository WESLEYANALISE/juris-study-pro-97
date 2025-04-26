
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Import our new components
import { FeaturedContent } from "@/components/jurisflix/FeaturedContent";
import { ContentFilters } from "@/components/jurisflix/ContentFilters";
import { ContentGrid } from "@/components/jurisflix/ContentGrid";
import { ContentModal } from "@/components/jurisflix/ContentModal";

interface JurisFlixItem {
  id: number;
  nome: string;
  ano: string;
  sinopse: string;
  nota: string;
  plataforma: string;
  link: string;
  capa: string;
  beneficios: string;
  trailer: string;
  tipo: string;
}

const mockData: JurisFlixItem[] = [
  {
    id: 1,
    nome: "O Julgamento de Chicago 7",
    ano: "2020",
    sinopse: "O filme retrata o julgamento dos manifestantes que protestaram contra a Guerra do Vietnã durante a Convenção Nacional Democrata de 1968.",
    nota: "8.5",
    plataforma: "Netflix",
    link: "https://www.netflix.com/title/81043755",
    capa: "https://m.media-amazon.com/images/M/MV5BYjYzOGE1MjUtODgyMy00ZDAxLTljYTgtNzk0Njg2YWQwMTZhXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg",
    beneficios: "Excelente para entender conceitos de direito processual e liberdade de expressão.",
    trailer: "https://www.youtube.com/embed/FVb6EdKDBfU",
    tipo: "filme"
  },
  {
    id: 2,
    nome: "Justiça Sem Limites",
    ano: "2019",
    sinopse: "Série que aborda casos jurídicos complexos e dilemas éticos enfrentados por advogados.",
    nota: "7.9",
    plataforma: "Amazon Prime",
    link: "https://www.primevideo.com",
    capa: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB9I1XGPVhUmlnZ6X0Fzy4nyrFNvZIZTAQiq4pKtbYQt2H5XAYMbjPwYpxqhu8axyDBuo&usqp=CAU",
    beneficios: "Apresenta casos de diversas áreas do direito e discute ética profissional.",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tipo: "serie"
  }
];

const JurisFlix = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<JurisFlixItem | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const queryClient = useQueryClient();

  // Query with improved configuration for debugging and caching
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["jurisflix"],
    queryFn: async () => {
      console.log("Fetching JurisFlix data from Supabase...");
      try {
        // Insert small delay to prevent rapid refetching
        await new Promise(r => setTimeout(r, 100));
        
        const { data, error } = await supabase
          .from("Jurisflix")
          .select("*");

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.log("No data returned from Supabase, using mock data");
          setUseMockData(true);
          return mockData;
        }
        
        return data as JurisFlixItem[];
      } catch (error) {
        console.error("Error fetching JurisFlix data:", error);
        toast.error("Erro ao carregar dados. Usando dados locais.");
        setUseMockData(true);
        return mockData;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  
  const handleSelectItem = (item: JurisFlixItem) => {
    // Handle reset type event from ContentGrid
    if (item.id === -1 && item.tipo === "reset") {
      setSelectedType(null);
      return;
    }
    
    setSelectedItem(item);
  };

  return (
    <div className="container mx-auto px-4 md:p-4 space-y-6 pb-20">
      <motion.header 
        className="space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center">JurisFlix</h1>
        <p className="text-center text-muted-foreground">
          Descubra filmes, séries e documentários jurídicos
        </p>
      </motion.header>
      
      <FeaturedContent onSelectItem={handleSelectItem} />
      
      <ContentFilters 
        search={search}
        setSearch={setSearch}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <ContentGrid 
        items={items}
        search={search}
        selectedType={selectedType}
        onSelectItem={handleSelectItem}
        isLoading={isLoading}
      />

      <ContentModal 
        item={selectedItem}
        isOpen={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />

      {/* Rodapé de informação quando dados mock estão sendo usados */}
      {useMockData && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-200 rounded-lg text-center">
          <p className="text-amber-800 dark:text-amber-300">
            Exibindo dados de demonstração. Alguns recursos podem estar limitados.
          </p>
        </div>
      )}
    </div>
  );
};

export default JurisFlix;
