
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  FileText, 
  Copy, 
  Volume2, 
  Highlighter, 
  PencilLine, 
  Trash2, 
  CircleX 
} from 'lucide-react';
import { toast } from 'sonner';
import { ExplanationDialog } from './ExplanationDialog';
import { PracticalExampleDialog } from './PracticalExampleDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnotationButton } from './AnnotationButton';
import { useAuth } from '@/hooks/use-auth';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

interface ArticleActionsProps {
  articleText: string;
  articleNumber: string;
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  isVisible: boolean;
  lawName: string;
}

const HIGHLIGHT_COLORS = [
  { name: 'Amarelo', class: 'bg-yellow-100 dark:bg-yellow-800/50' },
  { name: 'Verde', class: 'bg-green-100 dark:bg-green-800/50' },
  { name: 'Azul', class: 'bg-blue-100 dark:bg-blue-800/50' },
  { name: 'Roxo', class: 'bg-purple-100 dark:bg-purple-800/50' },
  { name: 'Rosa', class: 'bg-pink-100 dark:bg-pink-800/50' },
];

export const ArticleActions = ({
  articleText,
  articleNumber,
  technicalExplanation,
  formalExplanation,
  practicalExample,
  isVisible,
  lawName
}: ArticleActionsProps) => {
  const { user } = useAuth();
  
  const [isExplanationDialogOpen, setIsExplanationDialogOpen] = useState(false);
  const [isPracticalExampleDialogOpen, setIsPracticalExampleDialogOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(HIGHLIGHT_COLORS[0]);
  const [isHighlightMode, setIsHighlightMode] = useState(false);

  const handleCopy = async (text: string) => {
    if (!text) return;
    setIsCopying(true);
    
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Texto copiado para a área de transferência');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        if (successful) {
          toast.success('Texto copiado para a área de transferência');
        } else {
          toast.error('Não foi possível copiar o texto');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Erro ao copiar texto:", err);
      toast.error('Erro ao copiar texto. Por favor, tente novamente.');
    } finally {
      setIsCopying(false);
    }
  };

  const handleNarration = async () => {
    if (isNarrating) {
      stopNarration();
      return;
    }
    
    try {
      setIsNarrating(true);
      const apiKey = 'AIzaSyCX26cgIpSd-BvtOLDdEQFa28_wh_HX1uk';
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

      const requestBody = {
        input: {
          text: articleText
        },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Wavenet-E'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95, // Slightly slower for better clarity
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const data = await response.json();
      const audioContent = data.audioContent;

      // Create and play audio
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      audio.id = 'narration-audio';
      
      // Handle when audio ends
      audio.onended = () => {
        setIsNarrating(false);
      };
      
      // Clean up existing audio if necessary
      const existingAudio = document.getElementById('narration-audio') as HTMLAudioElement;
      if (existingAudio) {
        existingAudio.pause();
        existingAudio.remove();
      }
      
      document.body.appendChild(audio);
      audio.play();
    } catch (error) {
      console.error("Erro na narração:", error);
      toast.error("Não foi possível iniciar a narração");
      setIsNarrating(false);
    }
  };

  const stopNarration = () => {
    const audio = document.getElementById('narration-audio') as HTMLAudioElement;
    if (audio) {
      audio.pause();
      audio.remove();
    }
    setIsNarrating(false);
  };

  const handleHighlight = (colorClass: string) => {
    const contentElement = document.getElementById(`article-content-${articleNumber}`);
    
    if (contentElement) {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        try {
          // Create a highlight span with selected color
          const range = selection.getRangeAt(0);
          const span = document.createElement("span");
          span.className = `${colorClass} px-0.5 rounded highlight-text`;
          span.dataset.highlighted = "true";
          
          range.surroundContents(span);
          toast.success("Texto destacado com sucesso");
        } catch (e) {
          toast.error("Não foi possível destacar este texto");
          console.error("Erro ao destacar texto:", e);
        } finally {
          setIsHighlightMode(false);
        }
      } else {
        toast.info("Selecione o texto que deseja destacar");
      }
    }
  };

  const handleRemoveHighlights = () => {
    const contentElement = document.getElementById(`article-content-${articleNumber}`);
    if (!contentElement) return;
    
    // Find all highlights
    const highlights = contentElement.querySelectorAll('span[data-highlighted="true"]');
    
    if (highlights.length === 0) {
      toast.info("Não há destaques para remover");
      return;
    }
    
    // Replace each highlight with its text content
    highlights.forEach(highlight => {
      const textNode = document.createTextNode(highlight.textContent || '');
      highlight.parentNode?.replaceChild(textNode, highlight);
    });
    
    // Normalize the DOM (merge adjacent text nodes)
    contentElement.normalize();
    toast.success("Destaques removidos com sucesso");
  };

  return <>
      <AnimatePresence>
        {isVisible && <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/20 shadow-sm"
        >
          <div className="px-3 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
              <Button 
                variant="glass" 
                size="sm" 
                className={cn(
                  "gap-1.5 text-xs font-normal text-primary hover:text-white hover:bg-primary/40",
                  isExplanationDialogOpen && "bg-primary/20"
                )}
                onClick={() => setIsExplanationDialogOpen(true)} 
                disabled={!technicalExplanation && !formalExplanation}
              >
                <Info size={14} />
                <span>Explicação</span>
              </Button>

              {practicalExample && <Button 
                variant="glass" 
                size="sm" 
                className={cn(
                  "gap-1.5 text-xs font-normal text-primary hover:text-white hover:bg-primary/40",
                  isPracticalExampleDialogOpen && "bg-primary/20"
                )}
                onClick={() => setIsPracticalExampleDialogOpen(true)}
              >
                <FileText size={14} />
                <span>Exemplo</span>
              </Button>}

              <Button 
                variant="glass" 
                size="sm" 
                className="gap-1.5 text-xs font-normal text-primary hover:text-white hover:bg-primary/40"
                onClick={() => handleCopy(articleText)} 
                disabled={isCopying}
              >
                <Copy size={14} />
                <span>Copiar</span>
              </Button>
              
              <Button 
                variant="glass" 
                size="sm" 
                className={cn(
                  "gap-1.5 text-xs font-normal text-primary hover:text-white hover:bg-primary/40",
                  isNarrating && "bg-primary/20"
                )}
                onClick={handleNarration}
              >
                <Volume2 size={14} />
                <span>{isNarrating ? "Parar" : "Narrar"}</span>
              </Button>

              <Popover open={isHighlightMode} onOpenChange={setIsHighlightMode}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="glass" 
                    size="sm" 
                    className={cn(
                      "gap-1.5 text-xs font-normal text-primary hover:text-white hover:bg-primary/40",
                      isHighlightMode && "bg-primary/20"
                    )}
                  >
                    <Highlighter size={14} />
                    <span>Destacar</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 bg-background/80 backdrop-blur-lg border border-primary/20">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium">Escolha a cor:</h4>
                    <div className="grid grid-cols-5 gap-1">
                      {HIGHLIGHT_COLORS.map((color) => (
                        <button
                          key={color.name}
                          className={`h-6 w-6 rounded ${color.class} hover:scale-110 transition-transform`}
                          title={color.name}
                          onClick={() => handleHighlight(color.class)}
                        />
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs mt-1 gap-1.5" 
                      onClick={handleRemoveHighlights}
                    >
                      <CircleX size={12} />
                      Remover destaques
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              {user && articleNumber && (
                <AnnotationButton 
                  lawName={lawName} 
                  articleNumber={articleNumber} 
                  articleText={articleText} 
                  showLabel={true} 
                />
              )}
            </div>
          </div>
        </motion.div>}
      </AnimatePresence>

      {/* Explanation Dialog */}
      <ExplanationDialog 
        isOpen={isExplanationDialogOpen} 
        onClose={() => setIsExplanationDialogOpen(false)} 
        articleNumber={articleNumber} 
        technicalExplanation={technicalExplanation} 
        formalExplanation={formalExplanation} 
      />

      {/* Practical Example Dialog */}
      <PracticalExampleDialog 
        isOpen={isPracticalExampleDialogOpen} 
        onClose={() => setIsPracticalExampleDialogOpen(false)} 
        articleNumber={articleNumber} 
        example={practicalExample} 
      />
    </>;
};
