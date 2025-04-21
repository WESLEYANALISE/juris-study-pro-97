
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PencilLine, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Annotation {
  id: string;
  bookId: number;
  text: string;
  createdAt: string;
}

interface Book {
  id: number;
  livro: string | null;
}

interface AnnotationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotations: Annotation[];
  books: Book[];
  editingAnnotation: string | null;
  currentAnnotation: string;
  setEditingAnnotation: (id: string | null) => void;
  setCurrentAnnotation: (val: string) => void;
  updateAnnotation: (id: string, newText: string) => void;
  deleteAnnotation: (id: string) => void;
}

const AnnotationsDialog: React.FC<AnnotationsDialogProps> = ({
  open, onOpenChange, annotations, books, editingAnnotation, currentAnnotation, setEditingAnnotation, setCurrentAnnotation, updateAnnotation, deleteAnnotation
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Minhas Anotações</DialogTitle>
        <DialogDescription>
          Todas as suas anotações de livros
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
        {annotations.length > 0 ? (
          annotations.map((annotation) => {
            const book = books.find((b) => b.id === annotation.bookId);
            return (
              <Card key={annotation.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{book?.livro || "Livro desconhecido"}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(annotation.createdAt).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (editingAnnotation === annotation.id) {
                            updateAnnotation(annotation.id, currentAnnotation);
                          } else {
                            setEditingAnnotation(annotation.id);
                            setCurrentAnnotation(annotation.text);
                          }
                        }}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={() => deleteAnnotation(annotation.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {editingAnnotation === annotation.id ? (
                    <div className="space-y-2">
                      <Input
                        value={currentAnnotation}
                        onChange={(e) => setCurrentAnnotation(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingAnnotation(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => updateAnnotation(annotation.id, currentAnnotation)}>
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{annotation.text}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Você ainda não tem anotações.</p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AnnotationsDialog;
