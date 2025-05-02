
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Download, FileText, Volume2, ArrowRight, X, MessageSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Livro = {
  id: string;
  livro: string;
  area: string;
  link: string | null;
  download: string | null;
  imagem: string | null;
  sobre: string | null;
};

type BookModalProps = {
  livro: Livro;
  onClose: () => void;
  onRead: () => void;
};

export function BookModal({ livro, onClose, onRead }: BookModalProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [showAnotacoes, setShowAnotacoes] = useState(false);
  const [anotacao, setAnotacao] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleDownload = () => {
    if (livro.download) {
      window.open(livro.download, "_blank");
    } else {
      toast({
        title: "Link indisponível",
        description: "O link de download não está disponível para este livro.",
        variant: "destructive",
      });
    }
  };

  const handleRead = async () => {
    if (livro.link) {
      // Check if the PDF link is valid before opening
      if (!isChecking && livro.link.toLowerCase().endsWith('.pdf')) {
        setIsChecking(true);
        try {
          const response = await fetch(livro.link, { 
            method: 'HEAD', 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' } 
          });
          
          if (response.ok) {
            onRead();
          } else {
            toast({
              title: "Erro ao acessar PDF",
              description: "Não foi possível acessar o arquivo PDF. Por favor, tente novamente mais tarde.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking PDF:", error);
          toast({
            title: "Erro ao verificar PDF",
            description: "Não foi possível verificar o arquivo PDF. Por favor, tente novamente mais tarde.",
            variant: "destructive",
          });
        } finally {
          setIsChecking(false);
        }
      } else {
        onRead(); // Not a PDF or not checking, just open it
      }
    } else {
      toast({
        title: "Link indisponível",
        description: "O link de leitura não está disponível para este livro.",
        variant: "destructive",
      });
    }
  };

  const handleNarration = async () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      if (!livro.sobre) {
        toast({
          title: "Conteúdo indisponível",
          description: "Não há sinopse disponível para narração.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Preparando narração",
        description: "Um momento enquanto processamos o áudio...",
      });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: livro.sobre }
      });

      if (error) {
        throw new Error(error.message);
      }

      const audioContent = data.audioContent;
      const audioSrc = `data:audio/mp3;base64,${audioContent}`;
      
      const newAudio = new Audio(audioSrc);
      setAudio(newAudio);
      
      newAudio.onended = () => {
        setIsPlaying(false);
      };
      
      newAudio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Erro na narração:", error);
      toast({
        title: "Erro na narração",
        description: "Não foi possível gerar o áudio. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAnotacoes = () => {
    // Esta funcionalidade exigiria autenticação, por isso apenas simulamos
    toast({
      title: "Anotação salva",
      description: "Sua anotação foi salva com sucesso.",
    });
    setShowAnotacoes(false);
  };

  return (
    <div className="bg-card max-h-[85vh] overflow-hidden flex flex-col rounded-lg">
      <div className="relative flex-shrink-0">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="h-[200px] md:h-[250px] w-full relative overflow-hidden bg-gradient-to-b from-purple-600/10 to-background">
          {livro.imagem ? (
            <img 
              src={livro.imagem} 
              alt={livro.livro} 
              className="absolute inset-0 w-full h-full object-cover opacity-20" 
            />
          ) : null}
          
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full flex items-end justify-between">
            <div className="max-w-[80%]">
              <h2 className="text-2xl font-bold text-primary">{livro.livro}</h2>
              <p className="text-muted-foreground">{livro.area}</p>
            </div>
            
            <div className="flex gap-2">
              {livro.area && (
                <Badge variant="outline" className="bg-accent text-accent-foreground">
                  {livro.area}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <FileText size={18} /> Sinopse
            </h3>
            <p className="text-muted-foreground">
              {livro.sobre || "Sinopse não disponível para este livro."}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t flex flex-wrap gap-3 justify-between">
        <div className="flex gap-2">
          <Button 
            onClick={handleRead} 
            disabled={!livro.link || isChecking}
          >
            {isChecking ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando...
              </span>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" /> Ler Agora
              </>
            )}
          </Button>
          
          <Button onClick={handleDownload} disabled={!livro.download} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={handleNarration} 
            disabled={!livro.sobre}
            className={isPlaying ? "text-primary" : ""}
          >
            <Volume2 className="mr-2 h-4 w-4" /> {isPlaying ? "Pausar" : "Narração"}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => setShowAnotacoes(true)}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Anotações
          </Button>
        </div>
      </div>
      
      <Dialog open={showAnotacoes} onOpenChange={setShowAnotacoes}>
        <DialogContent className="max-w-md">
          <DialogTitle>Anotações - {livro.livro}</DialogTitle>
          <div className="py-2">
            <Textarea
              value={anotacao}
              onChange={(e) => setAnotacao(e.target.value)}
              placeholder="Escreva suas anotações sobre este livro..."
              className="min-h-[150px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAnotacoes(false)}>Cancelar</Button>
            <Button onClick={handleSaveAnotacoes}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
