
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  SearchIcon, BookOpenIcon, ScrollTextIcon, 
  BookIcon, ScaleIcon, LandmarkIcon, ScrollText, 
  GavelIcon, FileTextIcon
} from "lucide-react";
import VadeMecumCodeSection from "@/components/vademecum/VadeMecumCodeSection";
import VadeMecumStatuteSection from "@/components/vademecum/VadeMecumStatuteSection";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { Card } from "@/components/ui/card";

// Define the interface for the data returned by list_tables
interface TableNameResponse {
  table_name: string;
}

const VadeMecum = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("codigos");
  const [searchInputFocused, setSearchInputFocused] = useState(false);

  // Query to fetch available tables (laws)
  const { data: tablesData, isLoading, error } = useQuery({
    queryKey: ["vademecum-tables"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('list_tables', { prefix: '' });
        
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error("Error fetching table names:", err);
        toast.error("Erro ao buscar lista de leis. Tente novamente.");
        return [];
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Extract table names from the response
  const tables: string[] = Array.isArray(tablesData) 
    ? tablesData.map((item: TableNameResponse) => item.table_name) 
    : [];

  // Check if Constituição Federal exists in tables, if not, add it
  const hasConstituicao = tables.some(table => 
    table === 'Constituicao_Federal' || table === 'Constituição_Federal'
  );

  // Filter tables to separate codes and statutes
  const codes = tables.filter(table => 
    table.startsWith('Código_') || 
    table === 'Constituicao_Federal' || 
    table === 'Constituição_Federal'
  );
  
  const statutes = tables.filter(table => table.startsWith('Estatuto_'));

  return (
    <JuridicalBackground variant="books" opacity={0.04}>
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <div className="relative mb-2">
                <BookOpenIcon className="h-12 w-12 text-primary mx-auto" />
                <motion.div 
                  className="absolute -inset-3 rounded-full opacity-20 bg-primary blur-md"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </div>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Vade Mecum Digital
            </h1>
            <p className="text-muted-foreground">
              Acesse códigos, estatutos e leis atualizados
            </p>
          </div>
          
          <Card className={`p-5 md:p-6 max-w-lg mx-auto ${searchInputFocused ? "shadow-glow" : ""}`}>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar leis e códigos..."
                className="pl-9 py-6"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchInputFocused(true)}
                onBlur={() => setSearchInputFocused(false)}
              />
            </div>
          </Card>
        </motion.div>

        {error ? (
          <div className="text-center p-10">
            <p className="text-destructive">Erro ao carregar leis. Tente novamente mais tarde.</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="codigos" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="codigos" className="gap-2">
                <BookIcon className="h-4 w-4" />
                <span className="sm:inline">Códigos e Constituição</span>
              </TabsTrigger>
              <TabsTrigger value="estatutos" className="gap-2">
                <ScrollTextIcon className="h-4 w-4" />
                <span className="sm:inline">Estatutos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="codigos" className="py-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="h-32 bg-muted/20 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <VadeMecumCodeSection tableNames={codes} searchQuery={search} />
              )}
            </TabsContent>

            <TabsContent value="estatutos" className="py-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="h-32 bg-muted/20 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <VadeMecumStatuteSection tableNames={statutes} searchQuery={search} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </JuridicalBackground>
  );
};

export default VadeMecum;
