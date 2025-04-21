
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AnnotationEditorProps {
  bookId: number;
  currentAnnotation: string;
  setCurrentAnnotation: (v: string) => void;
  saveAnnotation: (bookId: number) => void;
}

const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  bookId,
  currentAnnotation,
  setCurrentAnnotation,
  saveAnnotation
}) => (
  <div className="space-y-2">
    <Input
      placeholder="Adicione sua anotação sobre este livro..."
      value={currentAnnotation}
      onChange={e => setCurrentAnnotation(e.target.value)}
    />
    <Button
      size="sm"
      variant="outline"
      className="w-full"
      onClick={() => saveAnnotation(bookId)}
      disabled={!currentAnnotation.trim()}
    >
      Salvar anotação
    </Button>
  </div>
);

export default AnnotationEditor;
