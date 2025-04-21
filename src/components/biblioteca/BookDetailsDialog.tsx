
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Volume2, Heart, BookOpenCheck, X, ArrowLeft, Lamp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { askGemini } from "@/services/ai-assistant";

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

// Mini hook para buscar recomendação da IA
function useBriefRecommendation(book: Book | null) {
  const [loading, setLoading] = React.useState(false);
  const [rec, setRec] = React.useState<string | null>(null);
  const getRec = async () => {
    if (!book) return;
    setLoading(true);
    // Prompt: livros pré ou pós esse tema
    const prompt = `Me sugira brevemente (em 1 frase) um ou dois temas de livros para estudar antes ou depois do tema: "${book.livro}", para seguir uma linha de aprendizagem jurídica para concursos.`;
    const result = await askGemini(prompt);
    setRec(result.text || "Não foi possível obter recomendação.");
    setLoading(false);
  };
  return { loading, rec, getRec, setRec };
}

const cardVariants = {
  enter: { opacity: 0, y: 40, scale: 0.97 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.97 },
  flipped: { rotateY: 180, opacity: 1, scale: 1 },
};

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
  const [flipped, setFlipped] = useState(false);
  const { loading, rec, getRec, setRec } = useBriefRecommendation(selectedBook);

  // "Modo leitura" ocupa toda a tela com botão "Voltar"
  if (!selectedBook) return null;
  if (readingMode) {
    return (
      <DialogContent className="fixed inset-0 max-w-full max-h-full h-screen rounded-none p-0">
        <div className="flex flex-col h-full w-full bg-background">
          <div className="flex items-center p-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReadingMode(false)}
              className="!px-2 !py-1 mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-base text-muted-foreground">Lendo: <b>{selectedBook.livro}</b></span>
            <div className="flex-1" />
            <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center border">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <div className="flex-1 w-full h-full min-h-[60vh]">
            {selectedBook.link ? (
              <iframe
                src={selectedBook.link}
                className="w-full h-full rounded-none border-0"
                title={selectedBook.livro || "Leitura"}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p>Link de leitura não disponível para este livro.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-md w-full p-0 overflow-visible bg-transparent border-none shadow-2xl rounded-xl">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={flipped ? "back" : "front"}
          initial={flipped ? { rotateY: 180, opacity: 0 } : { y: 20, opacity: 0, scale: 0.97 }}
          animate={flipped ? { rotateY: 180, opacity: 1, scale: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={flipped ? { rotateY: 0, opacity: 0 } : { y: -20, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.38, 0.54, 0.32, 0.98] }}
          className={`relative w-full min-h-[280px] rounded-xl bg-background shadow-xl flex flex-col justify-between ${flipped ? "backface-hidden" : ""}`}
          style={{ perspective: 1200, transformStyle: "preserve-3d" }}
        >
          {!flipped ? (
            <>
              {/* Botão virar para recomendação */}
              <button
                className="absolute top-2 right-2 z-10 rounded-full bg-background/80 hover:bg-accent transition-colors p-1 border shadow-md"
                onClick={async () => {
                  setFlipped(true);
                  if (!rec) await getRec();
                }}
                aria-label="Ver recomendação rápida"
              >
                <Lamp className="h-5 w-5 text-juris-purple" />
              </button>
              <DialogClose className="absolute top-2 left-2 z-10 rounded-full bg-background/50 hover:bg-accent p-1 border">
                <X className="h-4 w-4" />
              </DialogClose>
              
              {/* Título como destaque centralizado com fundo fosco/fosco na base */}
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="flex flex-col w-full h-full">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-extrabold text-center mt-4 mb-2">{selectedBook.livro}</h1>
                    <div className="w-full mt-auto">
                      <div className="w-full rounded-b-xl py-5 px-4 bg-gradient-to-t from-black/50 to-transparent text-white">
                        <div className="flex items-center justify-between">
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
                          {selectedBook.link && (
                            <Button
                              onClick={() => setReadingMode(true)}
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/80"
                            >
                              Ler Agora
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Parte traseira/virada com recomendação de IA
            <div className="flex flex-col h-full px-4 py-4 justify-between" style={{ backfaceVisibility: "hidden" }}>
              <button
                className="absolute top-2 left-2 z-10 rounded-full bg-background/80 hover:bg-accent transition-colors p-1 border shadow-md"
                onClick={() => setFlipped(false)}
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center justify-center h-full">
                <Lamp className="h-7 w-7 text-juris-purple mb-2 animate-pulse" />
                <h2 className="text-lg font-semibold text-center mb-3">Recomendação da IA</h2>
                <div className="w-full bg-muted/60 rounded p-3 min-h-[64px] text-center">
                  {loading ? (
                    <span className="text-muted-foreground">Consultando IA...</span>
                  ) : (
                    <span className="text-muted-foreground">{rec}</span>
                  )}
                </div>
                {/* Narração breve */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => rec && onNarrate(rec)}
                  disabled={loading || !rec}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Narrar indicação
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sinopse, anotações, etc. - layout mais compacto */}
      {!flipped && (
        <div className="mt-2 px-3">
          <div className="mb-2 text-sm text-muted-foreground">Sinopse</div>
          <div className="relative">
            <p className="text-[13px]">{selectedBook.sobre || "Sinopse não disponível"}</p>
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
          {/* Anotações rápidas */}
          <div className="mt-3">
            <div className="text-sm font-medium mb-1">Anotações</div>
            <div className="space-y-2 mb-2">
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
              <div className="max-h-[80px] overflow-y-auto space-y-1">
                {annotations
                  .filter(a => a.bookId === selectedBook.id)
                  .map(annotation => (
                    <div key={annotation.id} className="p-2 text-xs border rounded-md">
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
                          <span className="sr-only">Editar</span>
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
          <DialogFooter className="gap-2 flex justify-between mt-3">
            <Button
              variant="outline"
              onClick={openAnnotationsDialog}
            >
              Ver todas anotações
            </Button>
            {selectedBook.download && (
              <Button variant="outline" asChild>
                <a href={selectedBook.download} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
            )}
          </DialogFooter>
        </div>
      )}
    </DialogContent>
  );
};

export default BookDetailsDialog;
