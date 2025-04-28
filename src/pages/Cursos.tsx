
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, SlidersHorizontal, Heart, HeartOff, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Types for Course data
interface Curso {
  id: number;
  area: string;
  materia: string;
  sequencia: number;
  link: string;
  capa: string;
  sobre: string;
  download: string | null;
  dificuldade?: string;
  tipo_acesso?: string;
}

// Levels will be determined by the 'dificuldade' field
type LevelType = "Iniciante" | "Intermediário" | "Avançado" | "Todos";
type PaymentType = "Gratuito" | "Pago" | "Todos";

const Cursos = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("Todos");
  const [levelFilter, setLevelFilter] = useState<LevelType>("Todos");
  const [paymentFilter, setPaymentFilter] = useState<PaymentType>("Todos");
  const [favoriteCursos, setFavoriteCursos] = useState<number[]>(() => {
    const saved = localStorage.getItem("favoriteCursos");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch cursos from the database
  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ["cursos_narrados"],
    queryFn: async () => {
      try {
        console.log("Fetching courses...");
        const { data, error } = await supabase
          .from("cursos_narrados")
          .select("*")
          .order("sequencia", { ascending: true });

        if (error) {
          console.error("Error fetching courses:", error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar cursos",
            description: error.message,
          });
          return [];
        }
        
        console.log(`Fetched ${data?.length || 0} courses`);
        return data as Curso[];
      } catch (err) {
        console.error("Exception while fetching courses:", err);
        toast({
          variant: "destructive",
          title: "Erro ao carregar cursos",
          description: "Ocorreu um erro inesperado",
        });
        return [];
      }
    },
  });

  // Extract unique areas for filter
  const areas = ["Todos", ...Array.from(new Set(cursos.map((curso) => curso.area)))];

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    const newFavorites = favoriteCursos.includes(id)
      ? favoriteCursos.filter((cursoId) => cursoId !== id)
      : [...favoriteCursos, id];

    setFavoriteCursos(newFavorites);
    localStorage.setItem("favoriteCursos", JSON.stringify(newFavorites));

    toast({
      title: favoriteCursos.includes(id)
        ? "Curso removido dos favoritos"
        : "Curso adicionado aos favoritos",
      duration: 2000,
    });
  };

  // Function to determine level from the dificuldade field or fallback to description
  const getCursoLevel = (curso: Curso): LevelType => {
    if (curso.dificuldade) return curso.dificuldade as LevelType;
    
    // Fallback to description parsing for older data
    const desc = curso.sobre?.toLowerCase() || "";
    if (desc.includes("iniciante") || desc.includes("básico")) return "Iniciante";
    if (desc.includes("avançado")) return "Avançado";
    return "Intermediário";
  };

  // Function to determine payment status from tipo_acesso field or fallback to description
  const getCursoPaymentType = (curso: Curso): PaymentType => {
    if (curso.tipo_acesso) return curso.tipo_acesso as PaymentType;
    
    // Fallback to description parsing for older data
    const desc = curso.sobre?.toLowerCase() || "";
    return desc.includes("gratuito") ? "Gratuito" : "Pago";
  };

  // Filter cursos based on search query and filters
  const filteredCursos = cursos.filter((curso) => {
    // Text search
    const matchesSearch =
      searchQuery === "" ||
      curso.materia?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curso.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curso.sobre?.toLowerCase().includes(searchQuery.toLowerCase());

    // Area filter
    const matchesArea = areaFilter === "Todos" || curso.area === areaFilter;

    // Level filter
    const matchesLevel = levelFilter === "Todos" || getCursoLevel(curso) === levelFilter;

    // Payment filter
    const matchesPayment = paymentFilter === "Todos" || getCursoPaymentType(curso) === paymentFilter;

    return matchesSearch && matchesArea && matchesLevel && matchesPayment;
  });

  // Handler for opening a course
  const handleOpenCurso = (curso: Curso) => {
    navigate(`/cursos/${curso.id}`, { state: { curso } });
  };

  return (
    <div className="container py-6 max-w-7xl">
      <PageTransition>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Cursos Jurídicos</h1>
            <p className="text-muted-foreground">
              Explore nossa biblioteca de cursos narrados e aprofunde seus conhecimentos jurídicos
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por título, área ou palavras-chave..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mobile filters */}
              <div className="sm:hidden w-full">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filtrar Cursos</SheetTitle>
                      <SheetDescription>
                        Refine sua busca por área, nível e tipo de acesso
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                      {/* Area filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Área do Direito</label>
                        <select
                          className="w-full p-2 rounded-md border"
                          value={areaFilter}
                          onChange={(e) => setAreaFilter(e.target.value)}
                        >
                          {areas.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Level filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nível</label>
                        <select
                          className="w-full p-2 rounded-md border"
                          value={levelFilter}
                          onChange={(e) => setLevelFilter(e.target.value as LevelType)}
                        >
                          <option value="Todos">Todos</option>
                          <option value="Iniciante">Iniciante</option>
                          <option value="Intermediário">Intermediário</option>
                          <option value="Avançado">Avançado</option>
                        </select>
                      </div>
                      
                      {/* Payment filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Acesso</label>
                        <select
                          className="w-full p-2 rounded-md border"
                          value={paymentFilter}
                          onChange={(e) => setPaymentFilter(e.target.value as PaymentType)}
                        >
                          <option value="Todos">Todos</option>
                          <option value="Gratuito">Gratuito</option>
                          <option value="Pago">Pago</option>
                        </select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop filters */}
              <div className="hidden sm:flex space-x-2">
                <select
                  className="px-3 py-2 rounded-md border text-sm"
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 rounded-md border text-sm"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as LevelType)}
                >
                  <option value="Todos">Todos níveis</option>
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>

                <select
                  className="px-3 py-2 rounded-md border text-sm"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as PaymentType)}
                >
                  <option value="Todos">Todos acessos</option>
                  <option value="Gratuito">Gratuito</option>
                  <option value="Pago">Pago</option>
                </select>
              </div>
            </div>

            {/* Tabs for All Courses vs My Courses */}
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="todos">Todos os Cursos</TabsTrigger>
                <TabsTrigger value="favoritos">Meus Cursos</TabsTrigger>
              </TabsList>
              
              {/* All courses tab */}
              <TabsContent value="todos" className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : filteredCursos.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum curso encontrado</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar seus filtros ou termos de busca
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCursos.map((curso, index) => (
                      <motion.div
                        key={curso.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CursoCard
                          curso={curso}
                          isFavorite={favoriteCursos.includes(curso.id)}
                          toggleFavorite={() => toggleFavorite(curso.id)}
                          onClick={() => handleOpenCurso(curso)}
                          level={getCursoLevel(curso)}
                          paymentType={getCursoPaymentType(curso)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* My courses tab */}
              <TabsContent value="favoritos" className="mt-6">
                {favoriteCursos.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum curso favorito</h3>
                    <p className="text-muted-foreground">
                      Adicione cursos aos favoritos para acessá-los rapidamente
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cursos
                      .filter((curso) => favoriteCursos.includes(curso.id))
                      .map((curso, index) => (
                        <motion.div
                          key={curso.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <CursoCard
                            curso={curso}
                            isFavorite={true}
                            toggleFavorite={() => toggleFavorite(curso.id)}
                            onClick={() => handleOpenCurso(curso)}
                            level={getCursoLevel(curso)}
                            paymentType={getCursoPaymentType(curso)}
                          />
                        </motion.div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

interface CursoCardProps {
  curso: Curso;
  isFavorite: boolean;
  toggleFavorite: () => void;
  onClick: () => void;
  level: LevelType;
  paymentType: PaymentType;
}

const CursoCard = ({
  curso,
  isFavorite,
  toggleFavorite,
  onClick,
  level,
  paymentType,
}: CursoCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <div
        className="aspect-video bg-center bg-cover bg-muted cursor-pointer relative"
        style={{ backgroundImage: `url(${curso.capa || '/placeholder.svg'})` }}
        onClick={onClick}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
        >
          {isFavorite ? (
            <Heart className="h-5 w-5 fill-current" />
          ) : (
            <Heart className="h-5 w-5" />
          )}
        </Button>
      </div>
      <CardContent className="flex-grow flex flex-col p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant={level === "Iniciante" ? "default" : level === "Avançado" ? "destructive" : "secondary"}>
            {level}
          </Badge>
          <Badge variant={paymentType === "Gratuito" ? "outline" : "default"}>
            {paymentType}
          </Badge>
        </div>
        <h3 className="font-semibold line-clamp-2 mb-1" onClick={onClick}>
          {curso.materia}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {curso.sobre ? curso.sobre.substring(0, 100) + (curso.sobre.length > 100 ? '...' : '') : 'Sem descrição disponível.'}
        </p>
        <div className="flex items-center text-xs text-muted-foreground mt-auto">
          <GraduationCap className="h-3.5 w-3.5 mr-1" />
          <span>{curso.area}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={onClick} className="w-full">
          Ver Curso
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Cursos;
