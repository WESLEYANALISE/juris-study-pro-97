
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
        // Using the improved list_tables function that handles special characters
        const { data, error } = await supabase.rpc('list_tables', { prefix: '' });
        
        if (error) {
          console.error("Error fetching tables:", error);
          throw error;
        }
        
        console.log("Tables fetched:", data);
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

  // Filter tables to separate codes and statutes
  const codes = tables.filter(table => 
    table.startsWith('Código_') || 
    table === 'Constituicao_Federal' || 
    table === 'Constituição_Federal'
  );
  
  const statutes = tables.filter(table => table.startsWith('Estatuto_'));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <JuridicalBackground variant="books" opacity={0.04}>
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className="inline-block relative mb-4"
          >
            <div className="relative">
              <BookOpenIcon className="h-16 w-16 text-primary mx-auto" />
              <motion.div 
                className="absolute -inset-4 rounded-full opacity-20 bg-primary blur-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.3 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 1
                }}
              />
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            Vade Mecum Digital
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Acesse códigos, estatutos e leis atualizados com facilidade
          </p>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className={`p-6 md:p-7 max-w-xl mx-auto backdrop-blur-sm bg-background/50 border-primary/20 ${searchInputFocused ? "shadow-lg shadow-primary/10" : ""}`}>
            <div className="relative">
              <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${searchInputFocused ? "text-primary" : "text-muted-foreground"} h-5 w-5 transition-colors`} />
              <Input
                placeholder="Pesquisar leis e códigos..."
                className="pl-10 py-6 text-lg border-primary/20 focus-visible:ring-primary bg-background/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchInputFocused(true)}
                onBlur={() => setSearchInputFocused(false)}
              />
            </div>
          </Card>
        </motion.div>

        {error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-10"
          >
            <p className="text-destructive">Erro ao carregar leis. Tente novamente mais tarde.</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Tentar Novamente
            </Button>
          </motion.div>
        ) : (
          <Tabs defaultValue="codigos" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 mb-8 p-1.5 bg-background/50 backdrop-blur-sm border border-primary/20">
                <TabsTrigger value="codigos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <BookIcon className="h-4 w-4" />
                  <span className="sm:inline">Códigos e Constituição</span>
                </TabsTrigger>
                <TabsTrigger value="estatutos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <ScrollTextIcon className="h-4 w-4" />
                  <span className="sm:inline">Estatutos</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="py-4"
            >
              <TabsContent value="codigos" className="mt-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <motion.div 
                        key={i}
                        variants={itemVariants}
                        className="h-32 bg-muted/20 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <VadeMecumCodeSection tableNames={codes} searchQuery={search} />
                )}
              </TabsContent>

              <TabsContent value="estatutos" className="mt-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <motion.div 
                        key={i}
                        variants={itemVariants}
                        className="h-32 bg-muted/20 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <VadeMecumStatuteSection tableNames={statutes} searchQuery={search} />
                )}
              </TabsContent>
            </motion.div>
          </Tabs>
        )}
      </div>
    </JuridicalBackground>
  );
};

export default VadeMecum;
