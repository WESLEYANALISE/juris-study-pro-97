import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Book, Video, Flag, BarChart, Star, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Curso {
  id: number;
  materia: string;
  area: string;
  sobre: string;
  link: string;
  capa: string;
  download: string;
  tipo_acesso?: string;  // Added this property
  dificuldade?: string;
  sequencia: number;
}

interface MeuCurso {
  id: string;
  curso_id: number;
  progresso: number;
  concluido: boolean;
}

const Cursos = () => {
  const [activeTab, setActiveTab] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [meusCursos, setMeusCursos] = useState<MeuCurso[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const navigate = useNavigate();
  const {
    data: userProgress
  } = useQuery({
    queryKey: ["curso_progress"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('curso_progress').select('*');
      if (error) {
        console.error("Error loading user progress:", error);
        return [];
      }
      return data;
    }
  });
  useEffect(() => {
    loadCursos();
  }, []);
  const loadCursos = async () => {
    setIsLoading(true);
    try {
      // Fetch available courses
      const {
        data,
        error
      } = await supabase.from("cursos_narrados").select("*").order("sequencia", {
        ascending: true
      });
      if (error) {
        throw error;
      }
      if (data) {
        // Transform data to match Curso interface with proper default values
        const formattedCursos: Curso[] = data.map(curso => ({
          id: curso.id,
          materia: curso.materia || "",
          area: curso.area || "",
          sobre: curso.sobre || "",
          link: curso.link || "",
          capa: curso.capa || "",
          download: curso.download || "",
          tipo_acesso: curso.tipo_acesso || "Free", // Add default value
          dificuldade: curso.dificuldade || "Iniciante", // Add default value
          sequencia: typeof curso.sequencia === 'string' ? parseInt(curso.sequencia) : curso.sequencia || 0
        }));
        setCursos(formattedCursos);

        // Extract unique areas
        const uniqueAreas = Array.from(new Set(formattedCursos.map(curso => curso.area))).filter(Boolean) as string[];
        setAreas(uniqueAreas);

        // Extract unique difficulties
        const uniqueDifficulties = Array.from(new Set(formattedCursos.map(curso => curso.dificuldade))).filter(Boolean) as string[];
        setDifficulties(uniqueDifficulties);
      }

      // Fetch user's course progress
      const user = await supabase.auth.getUser();
      if (user && user.data && user.data.user) {
        const {
          data: progressData,
          error: progressError
        } = await supabase.from("curso_progress").select("*").eq("user_id", user.data.user.id);
        if (progressError) {
          toast.error("Erro ao carregar seu progresso dos cursos");
          console.error(progressError);
        } else {
          setMeusCursos(progressData || []);
        }
      }
    } catch (error: any) {
      toast.error("Erro ao carregar cursos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCursoClick = async (curso: Curso) => {
    if (curso.tipo_acesso === "Premium" || curso.tipo_acesso === "Pro") {
      toast("Esta funcionalidade estará disponível em breve!");
      return;
    }
    navigate(`/curso/${curso.id}`, {
      state: {
        curso
      }
    });
  };
  const filteredCursos = cursos.filter(curso => (!selectedArea || curso.area === selectedArea) && (!selectedDifficulty || curso.dificuldade === selectedDifficulty) && (!searchTerm || curso.materia.toLowerCase().includes(searchTerm.toLowerCase()) || curso.area.toLowerCase().includes(searchTerm.toLowerCase())));
  const meusCursosData = filteredCursos.filter(curso => meusCursos.some(meuCurso => meuCurso.curso_id === curso.id));
  const resetFilters = () => {
    setSelectedArea(null);
    setSelectedDifficulty(null);
    setSearchTerm("");
  };
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>;
  }
  const renderCursoCard = (curso: Curso) => {
    const meuCurso = meusCursos.find(mc => mc.curso_id === curso.id);
    const progresso = meuCurso ? meuCurso.progresso : 0;
    return <Card key={curso.id} className="h-full flex flex-col cursor-pointer hover:shadow-md transition-all" onClick={() => handleCursoClick(curso)}>
        <div className="aspect-video relative">
          <img src={curso.capa || "/placeholder.svg"} alt={curso.materia} className="w-full h-full object-cover" />
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
          {meuCurso && <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span>Progresso</span>
                <span>{progresso}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{
              width: `${progresso}%`
            }}></div>
              </div>
            </div>}
          {!meuCurso && <Button className="w-full" variant="outline">
              Iniciar curso
            </Button>}
        </CardFooter>
      </Card>;
  };
  return <PageTransition>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Cursos Jurídicos</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("favoritos")}>
              <Star className="w-4 h-4 mr-2" />
              Favoritos
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("meucurso")}>
              <Flag className="w-4 h-4 mr-2" />
              Meu Curso
            </Button>
          </div>
        </div>

        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 overflow-x-auto flex whitespace-nowrap w-full">
            <TabsTrigger value="todos">
              <Book className="w-4 h-4 mr-2" /> Todos os Cursos
            </TabsTrigger>
            <TabsTrigger value="meucurso">
              <BarChart className="w-4 h-4 mr-2" /> Meus Cursos
            </TabsTrigger>
            
          </TabsList>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input type="text" placeholder="Buscar por título ou área..." className="w-full px-4 py-2 border rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <select className="w-full px-4 py-2 border rounded-lg" value={selectedArea || ""} onChange={e => setSelectedArea(e.target.value || null)}>
                  <option value="">Todas as Áreas</option>
                  {areas.map(area => <option key={area} value={area}>
                      {area}
                    </option>)}
                </select>
              </div>
              <div>
                <select className="w-full px-4 py-2 border rounded-lg" value={selectedDifficulty || ""} onChange={e => setSelectedDifficulty(e.target.value || null)}>
                  <option value="">Todas as Dificuldades</option>
                  {difficulties.map(difficulty => <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>)}
                </select>
              </div>
            </div>
            
            {(selectedArea || selectedDifficulty || searchTerm) && <div className="flex justify-end mt-2">
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Limpar filtros
                </Button>
              </div>}
          </div>

          <TabsContent value="todos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCursos.length > 0 ? filteredCursos.map(curso => renderCursoCard(curso)) : <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-semibold">
                    Nenhum curso encontrado
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Tente ajustar seus filtros ou termos de busca
                  </p>
                </div>}
            </div>
          </TabsContent>

          <TabsContent value="meucurso">
            {meusCursosData.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meusCursosData.map(curso => renderCursoCard(curso))}
              </div> : <div className="text-center py-12">
                <h3 className="text-xl font-semibold">
                  Você ainda não iniciou nenhum curso
                </h3>
                <p className="text-muted-foreground mt-2">
                  Explore os cursos disponíveis e comece a aprender!
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("todos")}>
                  Ver todos os cursos
                </Button>
              </div>}
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
              <Button className="mt-4" onClick={() => navigate("/videoaulas")}>
                Acessar Vídeo Aulas
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>;
};

export default Cursos;
