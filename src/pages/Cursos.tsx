
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Book, Video, Flag, BarChart, Star, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CursoCategoryFilter } from "@/components/cursos/CursoCategoryFilter";
import { motion } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useDebounce } from "@/hooks/use-debounce";

interface Curso {
  id: number;
  materia: string;
  area: string;
  sobre: string;
  link: string;
  capa: string;
  download: string;
  tipo_acesso: string;
  dificuldade: string;
  sequencia: number;
}

interface MeuCurso {
  id: string;
  curso_id: number;
  progresso: number;
  concluido: boolean;
}

const CursoCard = ({ curso, meuCurso, onClick }: { curso: Curso; meuCurso?: MeuCurso; onClick: () => void }) => {
  const progresso = meuCurso ? meuCurso.progresso : 0;

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card
        className="h-full flex flex-col cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/20"
        onClick={onClick}
      >
        <div className="relative">
          <AspectRatio ratio={16/9}>
            <img
              src={curso.capa || "/placeholder.svg"}
              alt={curso.materia}
              className="w-full h-full object-cover rounded-t-lg"
              loading="lazy"
            />
          </AspectRatio>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium bg-primary rounded-full px-2 py-0.5 text-white">
                {curso.tipo_acesso}
              </span>
              <span className="text-xs font-medium bg-secondary rounded-full px-2 py-0.5">
                {curso.dificuldade}
              </span>
            </div>
          </div>
        </div>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-lg line-clamp-2">{curso.materia}</CardTitle>
          <CardDescription className="line-clamp-1">{curso.area}</CardDescription>
        </CardHeader>
        <CardContent className="pb-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {curso.sobre}
          </p>
        </CardContent>
        <CardFooter className="pt-4">
          {meuCurso && (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span>Progresso</span>
                <span>{progresso}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                ></div>
              </div>
            </div>
          )}
          {!meuCurso && (
            <Button className="w-full" variant="outline">
              Iniciar curso
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Cursos = () => {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const navigate = useNavigate();

  // Fetch cursos using React Query
  const { data: cursos = [], isLoading: isLoadingCursos } = useQuery({
    queryKey: ['cursos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos_narrados")
        .select("*")
        .order("sequencia", { ascending: true });

      if (error) {
        toast.error("Erro ao carregar cursos");
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user progress using React Query
  const { data: meusCursos = [] } = useQuery({
    queryKey: ['curso_progress'],
    queryFn: async () => {
      const { data, error } = await supabase.from('curso_progress').select('*');
      
      if (error) {
        console.error("Error loading user progress:", error);
        return [];
      }
      
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Extract unique areas from cursos
  const areas = useMemo(() => {
    return Array.from(
      new Set(cursos.map((curso) => curso.area))
    ).filter(Boolean) as string[];
  }, [cursos]);

  // Filter cursos based on search, area, and active tab
  const filteredCursos = useMemo(() => {
    return cursos.filter(
      (curso) =>
        (!selectedArea || curso.area === selectedArea) &&
        (!debouncedSearchTerm ||
          curso.materia.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          curso.area.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          curso.sobre.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [cursos, selectedArea, debouncedSearchTerm]);

  // Get my courses data
  const meusCursosData = useMemo(() => {
    return filteredCursos.filter((curso) =>
      meusCursos.some((meuCurso) => meuCurso.curso_id === curso.id)
    );
  }, [filteredCursos, meusCursos]);

  const handleCursoClick = async (curso: Curso) => {
    if (curso.tipo_acesso === "Premium" || curso.tipo_acesso === "Pro") {
      toast("Esta funcionalidade estará disponível em breve!");
      return;
    }

    navigate(`/curso/${curso.id}`);
  };

  if (isLoadingCursos) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cursos Jurídicos</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("favoritos")}
            >
              <Star className="w-4 h-4 mr-2" />
              Favoritos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("meucurso")}
            >
              <Flag className="w-4 h-4 mr-2" />
              Meu Curso
            </Button>
          </div>
        </div>

        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="todos">
              <Book className="w-4 h-4 mr-2" /> Todos os Cursos
            </TabsTrigger>
            <TabsTrigger value="meucurso">
              <BarChart className="w-4 h-4 mr-2" /> Meus Cursos
            </TabsTrigger>
            <TabsTrigger value="videoaulas">
              <Video className="w-4 h-4 mr-2" /> Video Aulas
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar filters */}
            <div className="md:col-span-1 space-y-6">
              <Card className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar cursos..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Card>

              <CursoCategoryFilter
                categories={areas}
                selectedCategory={selectedArea}
                onSelectCategory={setSelectedArea}
              />
            </div>

            {/* Main content */}
            <div className="md:col-span-3">
              <TabsContent value="todos">
                {filteredCursos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCursos.map((curso) => (
                      <CursoCard 
                        key={curso.id} 
                        curso={curso} 
                        meuCurso={meusCursos.find(mc => mc.curso_id === curso.id)} 
                        onClick={() => handleCursoClick(curso)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-xl font-semibold">
                      Nenhum curso encontrado
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Tente ajustar seus filtros ou termos de busca
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="meucurso">
                {meusCursosData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meusCursosData.map((curso) => (
                      <CursoCard 
                        key={curso.id} 
                        curso={curso} 
                        meuCurso={meusCursos.find(mc => mc.curso_id === curso.id)} 
                        onClick={() => handleCursoClick(curso)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold">
                      Você ainda não iniciou nenhum curso
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Explore os cursos disponíveis e comece a aprender!
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setActiveTab("todos")}
                    >
                      Ver todos os cursos
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videoaulas">
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold">
                    Vídeo aulas serão adicionadas em breve!
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Para acessar as vídeo aulas atualmente disponíveis, visite
                    a página de vídeo aulas.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/videoaulas")}
                  >
                    Acessar Vídeo Aulas
                  </Button>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default Cursos;
