
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Download, PencilLine, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Curso {
  id: number;
  area: string;
  materia: string;
  sequencia: number;
  link: string;
  capa: string;
  sobre: string;
  download: string | null;
}

const CursoViewer = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [curso, setCurso] = useState<Curso | null>(
    location.state?.curso || null
  );
  const [loading, setLoading] = useState(!location.state?.curso);
  const [menuOpen, setMenuOpen] = useState(true);
  const [showCourse, setShowCourse] = useState(false);

  // Get course data if not available from route state
  useEffect(() => {
    const getCurso = async () => {
      if (!curso && id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("cursos_narrados")
            .select("*")
            .eq("id", parseInt(id))
            .single();
            
          if (error) throw error;
          setCurso(data as Curso);
        } catch (error) {
          console.error("Error fetching course:", error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar curso",
            description: "Não foi possível carregar as informações do curso.",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    getCurso();
  }, [curso, id]);

  const handleStartCourse = () => {
    setMenuOpen(false);
    setShowCourse(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <p className="text-lg mb-4">Curso não encontrado</p>
        <Button onClick={() => navigate("/cursos")}>Voltar para Cursos</Button>
      </div>
    );
  }

  if (!showCourse) {
    return (
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{curso.materia}</DialogTitle>
            <DialogDescription>
              {curso.sobre}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={handleStartCourse} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Iniciar agora
            </Button>
            {curso.download && (
              <a
                href={curso.download}
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
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <div className="p-4 flex items-center border-b bg-card">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setShowCourse(false);
            setMenuOpen(true);
          }}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold ml-4 truncate">{curso.materia}</h1>
      </div>

      <div className="flex-grow">
        <iframe
          src={curso.link}
          className="w-full h-full border-0"
          title={curso.materia}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default CursoViewer;
