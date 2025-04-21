
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Volume2, Heart, BookOpenCheck, PencilLine, X, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

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
import ReadingMusicFAB from "./ReadingMusicFAB";

const BookDetailsDialog: React.FC<BookDetailsDialogProps> = ({
  selectedBook,
  readingMode,
  isNarrating,
  narrationVolume,
  setReadingMode,
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
}) => {
  const [showRecommendationBack, setShowRecommendationBack] = useState(false);

  if (!selectedBook) return null;

  // Modo Leitura tela cheia
  if (readingMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-2 md:p-3">
          <button
            className="rounded-full bg-card border border-muted px-3 py-1 font-semibold text-muted-foreground text-xs shadow hover:bg-accent"
            onClick={() => setReadingMode(false)}
          >
            Voltar
          </button>
        </div>
        <div className="flex-1 w-full h-full min-h-[60vh] overflow-auto">
          {selectedBook.link ? (
            <>
              <iframe
                src={selectedBook.link}
                className="w-full h-[90vh] md:h-full rounded-none m-0 border-none"
                title={selectedBook.livro || "Leitura"}
                allow="autoplay"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
              <ReadingMusicFAB />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p>Link de leitura não disponível para este livro.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <DialogContent className="max-w-lg animate-fade-in relative">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl">{selectedBook.livro}</DialogTitle>
          <div className="flex gap-2 items-center">
            {/* Botão para virar card e mostrar recomendações */}
            <button
              className="rounded-full p-1 bg-accent/50 text-foreground hover:bg-primary/30 transition-colors"
              style={{border: 'none'}}
              onClick={() => setShowRecommendationBack(s => !s)}
              aria-label="Ver recomendações"
              title="Ver recomendações"
            >
              <ArrowRight className="h-5 w-5 rotate-90" />
            </button>
            <DialogClose className="rounded-full h-6 w-6 flex items-center justify-center">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        </div>
      </DialogHeader>
      {/* Card frente/verso animado */}
      <div className={`transition-transform duration-300 ${showRecommendationBack ? "rotate-y-180" : ""} relative`}>
        {/* Frente - Detalhes do Livro compactos */}
        {!showRecommendationBack && (
          <div className="flex flex-col gap-2 min-h-[180px]">
            {/* Removeu a imagem/capa do livro */}
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
              {selectedBook.download && (
                <Button variant="outline" asChild>
                  <a href={selectedBook.download} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            {/* Nome do livro grande e abaixo descrição */}
            <div>
              <span className="block text-lg font-bold">{selectedBook.livro}</span>
              {selectedBook.sobre && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm flex-1">{selectedBook.sobre.substring(0, 80)}...</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className=""
                    onClick={() => onNarrate(selectedBook.sobre || "")}
                  >
                    <Volume2 className={`h-4 w-4 ${isNarrating ? "text-primary" : ""}`} />
                  </Button>
                </div>
              )}
              {isNarrating && (
                <div className="mt-2">
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
            {/* Área de Anotações compacta */}
            <div>
              <Input
                placeholder="Adicionar anotação curta..."
                value={currentAnnotation}
                onChange={e => setCurrentAnnotation(e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => saveAnnotation(selectedBook.id)}
                disabled={!currentAnnotation.trim()}
              >
                Salvar nota
              </Button>
              {annotations.filter(a => a.bookId === selectedBook.id).length > 0 && (
                <div className="mt-2 max-h-[90px] overflow-y-auto space-y-1">
                  {annotations
                    .filter(a => a.bookId === selectedBook.id)
                    .map(annotation => (
                      <div key={annotation.id} className="p-1 text-xs border rounded">
                        <span>{annotation.text}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              {selectedBook.link && (
                <Button onClick={() => setReadingMode(true)} size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ler agora
                </Button>
              )}
            </div>
          </div>
        )}
        {/* Verso - Recomendações IA */}
        {showRecommendationBack && (
          <div className="absolute left-0 top-0 w-full h-full bg-card p-3 z-20 rounded-md flex flex-col justify-between animate-fade-in">
            {/* Aqui você pode integrar a recomendação IA via prop/callback, por demo apenas texto: */}
            <div className="flex-1 flex flex-col justify-center items-center text-center text-sm opacity-80">
              <span className="text-primary font-semibold mb-1">Leia antes ou depois:</span>
              <span>
                {/* Placeholder; troque por recomendação da IA */}
                Outros livros interessantes relacionados aparecerão aqui.
              </span>
            </div>
            <Button onClick={() => setShowRecommendationBack(false)} variant="ghost" size="sm" className="mx-auto mt-2">
              Voltar
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default BookDetailsDialog;
