
import React from "react";
import { Button } from "@/components/ui/button";
import { PencilLine, X } from "lucide-react";

interface Annotation {
  id: string;
  bookId: number;
  text: string;
  createdAt: string;
}

interface AnnotationListProps {
  bookId: number;
  annotations: Annotation[];
  setEditingAnnotation: (id: string | null) => void;
  setCurrentAnnotation: (v: string) => void;
  deleteAnnotation: (id: string) => void;
}

const AnnotationList: React.FC<AnnotationListProps> = ({
  bookId,
  annotations,
  setEditingAnnotation,
  setCurrentAnnotation,
  deleteAnnotation
}) => {
  const bookAnnotations = annotations.filter(a => a.bookId === bookId);
  if (bookAnnotations.length === 0) return null;
  return (
    <div className="mt-3 max-h-[150px] overflow-y-auto space-y-2">
      {bookAnnotations.map(annotation => (
        <div key={annotation.id} className="p-2 text-sm border rounded-md">
          <p className="line-clamp-2">{annotation.text}</p>
          <div className="flex justify-end mt-1 space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingAnnotation(annotation.id);
                setCurrentAnnotation(annotation.text);
              }}
              className="h-7 px-2"
            >
              <PencilLine className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteAnnotation(annotation.id)}
              className="h-7 px-2 text-red-500 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnotationList;
