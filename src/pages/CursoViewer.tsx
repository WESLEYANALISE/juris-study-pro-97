
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CourseMenu } from "@/components/cursos/CourseMenu";
import { CourseViewer } from "@/components/cursos/CourseViewer";
import { useCursoViewer } from "@/hooks/use-curso-viewer";

const CursoViewer = () => {
  const {
    curso,
    loading,
    menuOpen,
    showCourse,
    setMenuOpen,
    handleStartCourse,
    handleBack,
    handleNavigateBack
  } = useCursoViewer();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!curso) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <p className="text-lg mb-4">Curso não encontrado</p>
        <Button onClick={handleNavigateBack}>Voltar para Cursos</Button>
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
      onBack={handleBack}
    />
  );
};

export default CursoViewer;
