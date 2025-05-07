
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CourseMenu } from "@/components/cursos/CourseMenu";
import { CourseViewer } from "@/components/cursos/CourseViewer";
import { useCursoViewer } from "@/hooks/use-curso-viewer";
import { useState, useEffect } from "react";
import "../styles/courseViewer.css"; // Import the course viewer styles

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
  const [mounted, setMounted] = useState(false);

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
    
    // Add the viewing-course class to hide navigation
    if (showCourse) {
      document.body.classList.add('viewing-course');
    }
    
    return () => {
      setMounted(false);
      document.body.classList.remove('viewing-course');
    };
  }, [showCourse]);

  // If not mounted yet, show loading spinner
  if (!mounted) {
    return <LoadingSpinner />;
  }

  // During loading, show loading spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // If no course data, show error UI
  if (!curso) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <p className="text-lg mb-4">Curso não encontrado</p>
        <Button onClick={handleNavigateBack}>Voltar para Cursos</Button>
      </div>
    );
  }

  // If not in course view yet, show menu
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

  // Show fullscreen course content
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
      initialShowNotes={showNotesPanel}
      onNotesVisibilityChange={setShowNotesPanel}
    />
  );
};

export default CursoViewer;
