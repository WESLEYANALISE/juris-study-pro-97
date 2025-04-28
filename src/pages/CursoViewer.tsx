import { useLocation, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CourseMenu } from "@/components/cursos/CourseMenu";
import { CourseViewer } from "@/components/cursos/CourseViewer";

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
  const [curso, setCurso] = useState<Curso | null>(location.state?.curso || null);
  const [loading, setLoading] = useState(!location.state?.curso);
  const [menuOpen, setMenuOpen] = useState(true);
  const [showCourse, setShowCourse] = useState(false);

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
    return <LoadingSpinner />;
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
      <CourseMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onStartCourse={handleStartCourse}
        title={curso.materia}
        description={curso.sobre}
        downloadUrl={curso.download}
      />
    );
  }

  return (
    <CourseViewer
      title={curso.materia}
      videoUrl={curso.link}
      onBack={() => {
        setShowCourse(false);
        setMenuOpen(true);
      }}
    />
  );
};

export default CursoViewer;
