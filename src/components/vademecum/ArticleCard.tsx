
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  BookOpen,
  VolumeUp, 
  VolumeX, 
  Star, 
  Pencil, 
  Info,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { TextToSpeechService } from "@/services/textToSpeechService";

interface ArticleCardProps {
  article: {
    id: number;
    numero: string;
    artigo: string;
    tecnica: string;
    formal: string;
    exemplo: string;
  };
  isCurrentlyNarrating: boolean;
  onNarrate: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isCurrentlyNarrating,
  onNarrate,
}) => {
  const { toast } = useToast();
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [explanationType, setExplanationType] = useState<"formal" | "tecnica" | "ia">("formal");
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotation, setAnnotation] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState("");

  // Function to toggle favorite
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `Artigo ${article.numero} ${isFavorited ? "removido dos" : "adicionado aos"} favoritos.`,
    });
  };

  // Function to handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    }
  };

  // Function to highlight text
  const highlightText = () => {
    if (selectedText && !highlights.includes(selectedText)) {
      setHighlights([...highlights, selectedText]);
      setSelectedText("");
      toast({
        title: "Texto destacado",
        description: "O texto selecionado foi destacado com sucesso.",
      });
    }
  };

  // Get the article text with highlights
  const getHighlightedText = () => {
    if (highlights.length === 0) return article.artigo;
    
    let highlightedText = article.artigo;
    highlights.forEach((highlight) => {
      highlightedText = highlightedText.replace(
        new RegExp(highlight, "g"),
        `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${highlight}</mark>`
      );
    });
    return highlightedText;
  };

  // Function to narrate explanation
  const narrateExplanation = (type: "formal" | "tecnica" | "exemplo") => {
    let textToNarrate = "";
    
    switch (type) {
      case "formal":
        textToNarrate = `Explicação formal do artigo ${article.numero}: ${article.formal}`;
        break;
      case "tecnica":
        textToNarrate = `Explicação técnica do artigo ${article.numero}: ${article.tecnica}`;
        break;
      case "exemplo":
        textToNarrate = `Exemplo prático do artigo ${article.numero}: ${article.exemplo}`;
        break;
      default:
        break;
    }
    
    if (textToNarrate) {
      TextToSpeechService.speak(textToNarrate)
        .catch((error) => {
          console.error("Error narrating explanation:", error);
          toast({
            title: "Erro na narração",
            description: "Não foi possível narrar esta explicação.",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={`p-4 ${!article.numero ? "text-center" : ""}`}>
            {article.numero && (
              <div className="font-bold text-primary mb-2">Art. {article.numero}</div>
            )}
            
            <div 
              className="mb-4" 
              onMouseUp={handleTextSelection}
              dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
            />
            
            {selectedText && (
              <div className="mt-2 mb-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Texto selecionado:</span>
                <Button size="sm" variant="secondary" onClick={highlightText}>
                  Destacar
                </Button>
              </div>
            )}
            
            {showAnnotation && (
              <div className="mt-4 mb-4">
                <textarea
                  className="w-full p-2 border rounded-md bg-muted/50"
                  placeholder="Adicione sua anotação aqui..."
                  rows={3}
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                />
              </div>
            )}
            
            {annotation && !showAnnotation && (
              <div className="mt-2 mb-4 p-2 bg-muted/30 border border-border rounded-md">
                <div className="text-sm font-medium mb-1">Sua anotação:</div>
                <div className="text-sm italic">{annotation}</div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center p-2 bg-muted/30 border-t border-border">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={onNarrate}
                title={isCurrentlyNarrating ? "Parar narração" : "Narrar artigo"}
              >
                {isCurrentlyNarrating ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <VolumeUp className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 ${isFavorited ? "text-yellow-500" : ""}`}
                onClick={toggleFavorite}
                title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                {isFavorited ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 ${showAnnotation || annotation ? "text-primary" : ""}`}
                onClick={() => setShowAnnotation(!showAnnotation)}
                title={showAnnotation ? "Fechar anotação" : "Adicionar anotação"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            
            {(article.formal || article.tecnica || article.exemplo) && (
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => setIsExplanationOpen(true)}
              >
                <Info className="h-4 w-4 mr-1" />
                Explicação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Explanation Dialog */}
      <Dialog open={isExplanationOpen} onOpenChange={setIsExplanationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Explicação do Artigo {article.numero}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={explanationType} onValueChange={(v) => setExplanationType(v as any)}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="formal" disabled={!article.formal}>Formal</TabsTrigger>
              <TabsTrigger value="tecnica" disabled={!article.tecnica}>Técnica</TabsTrigger>
              <TabsTrigger value="ia">Personalizada (IA)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formal">
              <div className="bg-muted/30 p-4 rounded-md">
                {article.formal ? (
                  <p>{article.formal}</p>
                ) : (
                  <p className="text-muted-foreground">Explicação formal não disponível para este artigo.</p>
                )}
              </div>
              
              {article.formal && (
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={() => narrateExplanation("formal")}>
                    <VolumeUp className="h-4 w-4 mr-2" />
                    Narrar
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tecnica">
              <div className="bg-muted/30 p-4 rounded-md">
                {article.tecnica ? (
                  <p>{article.tecnica}</p>
                ) : (
                  <p className="text-muted-foreground">Explicação técnica não disponível para este artigo.</p>
                )}
              </div>
              
              {article.tecnica && (
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={() => narrateExplanation("tecnica")}>
                    <VolumeUp className="h-4 w-4 mr-2" />
                    Narrar
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ia">
              <div className="bg-muted/30 p-4 rounded-md">
                <p>Esta funcionalidade permite gerar explicações personalizadas usando Inteligência Artificial.</p>
                <p className="mt-2 text-sm text-muted-foreground">Digite sua pergunta específica sobre o artigo para obter uma explicação personalizada.</p>
                
                <div className="mt-4">
                  <textarea
                    className="w-full p-2 border rounded-md"
                    placeholder="Ex: Explique este artigo em termos simples..."
                    rows={3}
                  />
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button>Gerar Explicação</Button>
                </div>
              </div>
            </TabsContent>
            
            {article.exemplo && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Exemplo Prático:</h4>
                <div className="bg-muted/30 p-4 rounded-md">
                  <p>{article.exemplo}</p>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={() => narrateExplanation("exemplo")}>
                    <VolumeUp className="h-4 w-4 mr-2" />
                    Narrar Exemplo
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArticleCard;
