
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import VadeMecumCodeSection from "@/components/vademecum/VadeMecumCodeSection";
import VadeMecumStatuteSection from "@/components/vademecum/VadeMecumStatuteSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useVadeMecumSearch } from "@/hooks/useVadeMecumSearch";

const VadeMecum = () => {
  const [activeTab, setActiveTab] = useState<"codigos" | "estatutos">("codigos");
  const { searchQuery, setSearchQuery } = useVadeMecumSearch([]);

  // Get list of all Codes tables - FIXED to use information_schema instead of pg_catalog
  const { data: codesTableNames, isLoading: isLoadingCodes } = useQuery({
    queryKey: ["codesTables"],
    queryFn: async () => {
      // Use information_schema.tables instead of pg_catalog.pg_tables
      const { data, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .ilike("table_name", "Código_%");

      if (error) {
        console.error("Error fetching code tables:", error);
        throw error;
      }
      
      return data ? data.map(item => item.table_name) : [];
    },
  });

  // Get list of all Estatutos tables - FIXED to use information_schema
  const { data: statutesTableNames, isLoading: isLoadingStatutes } = useQuery({
    queryKey: ["statutesTables"],
    queryFn: async () => {
      // Use information_schema.tables instead of pg_catalog.pg_tables
      const { data, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .ilike("table_name", "Estatuto_%");
        
      if (error) {
        console.error("Error fetching statute tables:", error);
        throw error;
      }
      
      return data ? data.map(item => item.table_name) : [];
    },
  });

  const isLoading = isLoadingCodes || isLoadingStatutes;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Vade Mecum</h1>
        <p className="text-muted-foreground">
          Consulte códigos e estatutos jurídicos com explicações técnicas e formais
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar em todos os códigos e estatutos..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "codigos" | "estatutos")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="codigos">Códigos</TabsTrigger>
          <TabsTrigger value="estatutos">Estatutos</TabsTrigger>
        </TabsList>

        <TabsContent value="codigos" className="space-y-4">
          {isLoadingCodes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <VadeMecumCodeSection 
              tableNames={codesTableNames || []} 
              searchQuery={searchQuery} 
            />
          )}
        </TabsContent>

        <TabsContent value="estatutos" className="space-y-4">
          {isLoadingStatutes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <VadeMecumStatuteSection 
              tableNames={statutesTableNames || []} 
              searchQuery={searchQuery} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VadeMecum;
