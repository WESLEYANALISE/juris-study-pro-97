import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { PeticaoSearch } from "@/components/peticoes/PeticaoSearch";
import { Button } from "@/components/ui/button";
import { FileText, DownloadCloud, Eye, BookOpen, Filter, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DataCard } from "@/components/ui/data-card";
import { JuridicalCard } from "@/components/ui/juridical-card";
import { PeticaoCard } from "@/components/peticoes/PeticaoCard";
import { PeticaoViewer } from "@/components/peticoes/PeticaoViewer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Peticao {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  arquivo_url: string;
  created_at?: string;
  area: string;
  tipo: string;
}

interface AreaStats {
  area: string;
  count: number;
}

// Define the actual structure of the database record
interface PeticaoRecord {
  id: string;
  area: string;
  tipo: string;
  documento: string;
  // Other fields might be present but not required for our mapping
}

const Peticoes = () => {
  const [peticoes, setPeticoes] = useState<Peticao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeticao, setSelectedPeticao] = useState<Peticao | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch petitions from the database
  useEffect(() => {
    loadPeticoes();
  }, []);

  const loadPeticoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("peticoes")
        .select("*");

      if (error) {
        throw error;
      }

      // Map the data to match our interface
      const mappedPeticoes = (data as PeticaoRecord[] || []).map(item => ({
        id: item.id || '',
        titulo: item.tipo || '',
        // Since descricao doesn't exist in the database, provide a default value
        descricao: 'Modelo de petição jurídica para uso profissional',
        categoria: item.area || '',
        arquivo_url: item.documento || '',
        created_at: new Date().toISOString(),
        area: item.area || '',
        tipo: item.tipo || '',
      }));

      setPeticoes(mappedPeticoes);
    } catch (error) {
      console.error("Error loading peticoes:", error);
      toast.error("Erro ao carregar petições");
    } finally {
      setLoading(false);
    }
  };

  // Filter petitions by search query and area
  const filteredPeticoes = useMemo(() => {
    return peticoes.filter((peticao) => {
      const matchesSearch = peticao.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            peticao.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = areaFilter ? peticao.area === areaFilter : true;
      return matchesSearch && matchesArea;
    });
  }, [peticoes, searchQuery, areaFilter]);

  // Group petitions by area
  const peticoesByArea = useMemo(() => {
    const groupedPeticoes: Record<string, Peticao[]> = {};
    
    filteredPeticoes.forEach(peticao => {
      if (!groupedPeticoes[peticao.area]) {
        groupedPeticoes[peticao.area] = [];
      }
      groupedPeticoes[peticao.area].push(peticao);
    });
    
    return groupedPeticoes;
  }, [filteredPeticoes]);

  // Calculate statistics for each area
  const areaStats: AreaStats[] = useMemo(() => {
    const stats: Record<string, number> = {};
    
    peticoes.forEach(peticao => {
      if (!stats[peticao.area]) {
        stats[peticao.area] = 0;
      }
      stats[peticao.area]++;
    });
    
    return Object.entries(stats).map(([area, count]) => ({ area, count }));
  }, [peticoes]);
  
  // Handle document view and download
  const handleViewPeticao = (peticao: Peticao) => {
    setSelectedPeticao(peticao);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedPeticao(null);
  };

  const handleDownload = (arquivo_url: string) => {
    window.open(arquivo_url, "_blank");
  };

  // Calculate total count of petitions
  const totalPeticoes = peticoes.length;
  const totalAreas = Object.keys(peticoesByArea).length;
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      {viewerOpen && selectedPeticao && (
        <PeticaoViewer url={selectedPeticao.arquivo_url} onBack={handleCloseViewer} />
      )}
      
      <div className="relative">
        {/* Background texture */}
        <div className="absolute inset-0 bg-texture-dots opacity-5 pointer-events-none"></div>
        
        {/* Header section */}
        <div className="relative z-10">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4 items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Petições e Modelos Jurídicos
                </h1>
                <p className="text-muted-foreground mt-2">
                  Acesse modelos de petições para agilizar seu trabalho jurídico
                </p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
                <Button variant="primary" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estatísticas
                </Button>
              </motion.div>
            </div>
            
            {/* Statistics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <DataCard 
                title="Total de Petições"
                icon={<FileText className="h-4 w-4" />}
                variant="primary"
              >
                <div className="text-2xl font-bold">{totalPeticoes}</div>
                <p className="text-sm text-muted-foreground">Modelos disponíveis</p>
              </DataCard>
              
              <DataCard 
                title="Áreas do Direito"
                icon={<BookOpen className="h-4 w-4" />}
                variant="default"
              >
                <div className="text-2xl font-bold">{totalAreas}</div>
                <p className="text-sm text-muted-foreground">Categorias disponíveis</p>
              </DataCard>
              
              <DataCard 
                title="Últimas atualizações"
                icon={<DownloadCloud className="h-4 w-4" />}
                variant="primary"
              >
                <div className="text-sm">Novos modelos adicionados recentemente</div>
              </DataCard>
            </div>

            {/* Search bar */}
            <div className="mt-6 mb-4">
              <PeticaoSearch
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
              />
            </div>
          </div>
          
          {/* Tabs for different views */}
          <Tabs defaultValue="areas" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="areas">Por Área</TabsTrigger>
              <TabsTrigger value="recentes">Recentes</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="areas">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : Object.keys(peticoesByArea).length === 0 ? (
                <div className="text-center py-12 bg-card/30 backdrop-blur-sm rounded-lg border border-white/5 shadow-lg">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhuma petição encontrada</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Tente ajustar seus termos de busca ou limpar os filtros para ver mais resultados
                  </p>
                  {areaFilter && (
                    <Button 
                      variant="link" 
                      onClick={() => setAreaFilter(null)}
                      className="mt-4"
                    >
                      Limpar filtro de área
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(peticoesByArea).map(([area, areaPeticoes]) => (
                    <motion.section 
                      key={area}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">{area}</h2>
                          <Badge variant="secondary" className="ml-2">
                            {areaPeticoes.length} {areaPeticoes.length === 1 ? 'modelo' : 'modelos'}
                          </Badge>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setAreaFilter(area === areaFilter ? null : area)}
                          className="text-xs"
                        >
                          {area === areaFilter ? 'Limpar filtro' : 'Filtrar por esta área'}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {areaPeticoes.map((peticao) => (
                          <PeticaoCard
                            key={peticao.id}
                            peticao={{
                              id: peticao.id,
                              area: peticao.area,
                              tipo: peticao.tipo,
                              link: peticao.arquivo_url,
                              descricao: peticao.descricao || '',
                            }}
                            onView={() => handleViewPeticao(peticao)}
                          />
                        ))}
                      </div>
                    </motion.section>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recentes">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredPeticoes.slice(0, 9).map((peticao) => (
                  <JuridicalCard
                    key={peticao.id}
                    title={peticao.tipo}
                    description={peticao.area}
                    icon="scroll"
                    variant="primary"
                    onClick={() => handleViewPeticao(peticao)}
                  >
                    <div className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {peticao.descricao || "Modelo de petição para uso profissional."}
                    </div>
                    <Button
                      onClick={() => handleViewPeticao(peticao)}
                      className="w-full"
                      variant="gradient"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                  </JuridicalCard>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="todos">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPeticoes.map((peticao) => (
                  <Card key={peticao.id} className="h-full flex flex-col bg-gradient-to-br from-background/60 to-background/90 border-white/5 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle>{peticao.titulo}</CardTitle>
                      <CardDescription>{peticao.categoria}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {peticao.descricao || "Modelo de petição para uso profissional."}
                    </CardContent>
                    <CardFooter className="border-t border-white/5 bg-black/20 pt-4">
                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={() => handleViewPeticao(peticao)}
                          className="flex-1"
                          variant="default"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button
                          onClick={() => handleDownload(peticao.arquivo_url)}
                          variant="outline"
                        >
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Peticoes;
