import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Volume2, Heart, BookOpenCheck, PencilLine, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import FullScreenReader from "./FullScreenReader";

interface Book {
  id: number;
  livro: string | null;
  area: string | null;
  sobre: string | null;
  imagem: string | null;
  download: string | null;
  link: string | null;
}

interface Annotation {
  id: string;
  bookId: number;
  text: string;
  createdAt: string;
}

interface BookDetailsDialogProps {
  selectedBook: Book | null;
  readingMode: boolean;
  isNarrating: boolean;
  narrationVolume: number;
  setReadingMode: (val: boolean) => void;
  onClose: () => void;
  onFavorite: (id: number) => void;
  onRead: (id: number) => void;
  isFavorite: boolean;
  isRead: boolean;
  onNarrate: (text: string) => void;
  setNarrationVolume: (volume: number) => void;
  annotations: Annotation[];
  currentAnnotation: string;
  setCurrentAnnotation: (v: string) => void;
  saveAnnotation: (bookId: number) => void;
  editingAnnotation: string | null;
  setEditingAnnotation: (id: string | null) => void;
  updateAnnotation: (id: string, text: string) => void;
  deleteAnnotation: (id: string) => void;
  openAnnotationsDialog: () => void;
}

const BookDetailsDialog: React.FC<BookDetailsDialogProps> = (props) => {
  const {
    selectedBook,
    readingMode,
    setReadingMode,
    isNarrating,
    narrationVolume,
    onClose,
    onFavorite,
    onRead,
    isFavorite,
    isRead,
    onNarrate,
    setNarrationVolume,
    annotations,
    currentAnnotation,
    setCurrentAnnotation,
    saveAnnotation,
    editingAnnotation,
    setEditingAnnotation,
    updateAnnotation,
    deleteAnnotation,
    openAnnotationsDialog,
  } = props;

  if (!selectedBook) return null;

  if (selectedBook && readingMode) {
    return (
      <FullScreenReader
        bookTitle={selectedBook.livro}
        link={selectedBook.link}
        onExit={() => setReadingMode(false)}
      />
    );
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh]">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl">{selectedBook.livro}</DialogTitle>
          <DialogClose className="rounded-full h-6 w-6 flex items-center justify-center">
            <X className="h-4 w-4" />
          </DialogClose>
        </div>
        <DialogDescription className="text-primary">
          {selectedBook.area}
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-[150px] h-[220px] rounded-md overflow-hidden shadow-lg"
            style={{
              backgroundImage: selectedBook.imagem
                ? `url(${selectedBook.imagem})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "rgba(var(--primary), 0.2)",
            }}
          >
            {!selectedBook.imagem && (
              <div className="w-full h-full flex items-center justify-center p-2 text-center">
                <span className="text-sm font-medium">
                  {selectedBook.livro}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={e => {
                e.stopPropagation();
                onFavorite(selectedBook.id);
              }}
              className={isFavorite
                ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : ""
              }
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={e => {
                e.stopPropagation();
                onRead(selectedBook.id);
              }}
              className={isRead
                ? "bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : ""
              }
            >
              <BookOpenCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Sinopse
            </h3>
            <div className="relative">
              <p className="text-sm">{selectedBook.sobre || "Sinopse não disponível"}</p>
              {selectedBook.sobre && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0"
                  onClick={() => onNarrate(selectedBook.sobre || "")}
                >
                  <Volume2 className={`h-4 w-4 ${isNarrating ? "text-primary" : ""}`} />
                </Button>
              )}
            </div>
            {isNarrating && (
              <div className="mt-2">
                <p className="text-xs mb-1">
                  Volume: {narrationVolume}%
                </p>
                <Slider
                  value={[narrationVolume]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={value => setNarrationVolume(value[0])}
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Anotações</h3>
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
                onClick={() => saveAnnotation(selectedBook.id)}
                disabled={!currentAnnotation.trim()}
              >
                Salvar anotação
              </Button>
            </div>
            {annotations.filter(a => a.bookId === selectedBook.id).length > 0 && (
              <div className="mt-3 max-h-[150px] overflow-y-auto space-y-2">
                {annotations
                  .filter(a => a.bookId === selectedBook.id)
                  .map(annotation => (
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
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
      <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between mt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={openAnnotationsDialog}
          >
            <PencilLine className="h-4 w-4 mr-2" />
            Ver todas anotações
          </Button>
        </div>
        <div className="flex gap-2">
          {selectedBook.download && (
            <Button variant="outline" asChild>
              <a href={selectedBook.download} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          )}
          {selectedBook.link && (
            <Button onClick={() => setReadingMode(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Ler Agora
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default BookDetailsDialog;
