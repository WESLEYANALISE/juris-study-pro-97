import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Filter, SlidersHorizontal, Heart, HeartOff, BookOpen, GraduationCap, Play, Download, PencilLine, Star } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
          toast.error("Erro ao carregar cursos: " + error.message);
          return [];
        }
        
        console.log(`Fetched ${data?.length || 0} courses`);
        return data as Curso[];
      } catch (err) {
        console.error("Exception while fetching courses:", err);
        toast.error("Erro ao carregar cursos: Ocorreu um erro inesperado");
        return [];
      }
    },
  });

  const areas = ["Todos", ...Array.from(new Set(cursos.map((curso) => curso.area)))];

  const toggleFavorite = (id: number) => {
    const newFavorites = favoriteCursos.includes(id)
      ? favoriteCursos.filter((cursoId) => cursoId !== id)
      : [...favoriteCursos, id];

    setFavoriteCursos(newFavorites);
    localStorage.setItem("favoriteCursos", JSON.stringify(newFavorites));

    toast.success(favoriteCursos.includes(id)
      ? "Curso removido dos favoritos"
      : "Curso adicionado aos favoritos");
  };

  const getCursoLevel = (curso: Curso): LevelType => {
    if (curso.dificuldade) return curso.dificuldade as LevelType;
    
    const desc = curso.sobre?.toLowerCase() || "";
    if (desc.includes("iniciante") || desc.includes("básico")) return "Iniciante";
    if (desc.includes("avançado")) return "Avançado";
    return "Intermediário";
  };

  const getCursoPaymentType = (curso: Curso): PaymentType => {
    if (curso.tipo_acesso) return curso.tipo_acesso as PaymentType;
    
    const desc = curso.sobre?.toLowerCase() || "";
    return desc.includes("gratuito") ? "Gratuito" : "Pago";
  };

  const filteredCursos = cursos.filter((curso) => {
    const matchesSearch =
      searchQuery === "" ||
      curso.materia?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curso.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curso.sobre?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea = areaFilter === "Todos" || curso.area === areaFilter;

    const matchesLevel = levelFilter === "Todos" || getCursoLevel(curso) === levelFilter;

    const matchesPayment = paymentFilter === "Todos" || getCursoPaymentType(curso) === paymentFilter;

    return matchesSearch && matchesArea && matchesLevel && matchesPayment;
  });

  const handleOpenCurso = (curso: Curso) => {
    setSelectedCurso(curso);
    setMenuOpen(true);
  };

  const handleStartCourse = () => {
    if (selectedCurso) {
      setMenuOpen(false);
      navigate(`/cursos/${selectedCurso.id}`, { state: { curso: selectedCurso } });
    }
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
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Área do Direito</label>
                        <select
                          className="w-full p-2 rounded-md border"
                          value={areaFilter}
                          onChange={(e) => setAreaFilter(e.target.value)}
                        >
                          {areas.map((area) => (
                            <option key={area as React.Key} value={area as string}>
                              {area as React.ReactNode}
                            </option>
                          ))}
                        </select>
                      </div>
                      
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

            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="todos">Todos os Cursos</TabsTrigger>
                <TabsTrigger value="favoritos">Meus Cursos</TabsTrigger>
              </TabsList>
              
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
                          key={curso.id as React.Key}
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

            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{selectedCurso?.materia}</DialogTitle>
                  <DialogDescription>
                    {selectedCurso?.sobre}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button onClick={handleStartCourse} className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar agora
                  </Button>
                  {selectedCurso?.download && (
                    <a
                      href={selectedCurso.download}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download de material de apoio
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" onClick={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento" })}>
                    <PencilLine className="mr-2 h-4 w-4" />
                    Anotações
                  </Button>
                  <Button variant="outline" onClick={() => toast({ title: "Em breve!", description: "Funcionalidade em desenvolvimento" })}>
                    <Star className="mr-2 h-4 w-4" />
                    Avaliar curso
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
