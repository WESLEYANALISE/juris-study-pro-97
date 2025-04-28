
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CourseMenu } from "@/components/cursos/CourseMenu";
import { CourseViewer } from "@/components/cursos/CourseViewer";
import { useCursoViewer } from "@/hooks/use-curso-viewer";
import { useState } from "react";

const CursoViewer = () => {
  const {
    curso,
    loading,
    menuOpen,
    showCourse,
    setMenuOpen,
    handleStartCourse,
    handleBack,
    handleNavigateBack,
    progress,
    updateProgress,
    hasNotes,
    notes,
    saveNotes,
    isComplete,
    toggleBookmark,
    isBookmarked,
    videoRef
  } = useCursoViewer();

  const [showNotesPanel, setShowNotesPanel] = useState(false);

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
        progress={progress}
        isComplete={isComplete}
        hasNotes={hasNotes}
        onOpenNotes={() => {
          handleStartCourse();
          setShowNotesPanel(true);
        }}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
      />
    );
  }

  return (
    <CourseViewer
      title={curso.materia}
      videoUrl={curso.link}
      onBack={handleBack}
      progress={progress}
      updateProgress={updateProgress}
      downloadUrl={curso.download}
      savedNotes={notes}
      onSaveNotes={saveNotes}
      isBookmarked={isBookmarked}
      onToggleBookmark={toggleBookmark}
      videoRef={videoRef}
    />
  );
};

export default CursoViewer;
