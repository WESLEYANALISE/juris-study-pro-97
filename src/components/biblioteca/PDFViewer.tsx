
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, ChevronRight, Search, BookmarkPlus, Bookmark, Timer, X } from 'lucide-react';
import { TextToSpeechService } from '@/services/textToSpeechService';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  livroId: string;
}

export function PDFViewer({ url, livroId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isReading, setIsReading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user, livroId]);

  const loadProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('livrospro_progresso')
      .select('pagina_atual')
      .eq('livro_id', livroId)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPageNumber(data.pagina_atual);
    }
  };

  const saveProgress = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('livrospro_progresso')
      .upsert({
        livro_id: livroId,
        user_id: user.id,
        pagina_atual: pageNumber
      });

    if (error) {
      console.error('Error saving progress:', error);
    }
  };

  const addBookmark = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar marcadores",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('livrospro_marcadores')
      .insert({
        livro_id: livroId,
        user_id: user.id,
        pagina: pageNumber
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o marcador",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Marcador adicionado"
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    saveProgress();
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            Página {pageNumber} de {numPages || '?'}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.min(numPages || pageNumber, pageNumber + 1))}
            disabled={pageNumber >= (numPages || pageNumber)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar no texto..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-40"
            />
          </div>

          <Slider
            value={[scale * 100]}
            onValueChange={(values) => setScale(values[0] / 100)}
            min={50}
            max={200}
            step={10}
            className="w-32"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsReading(!isReading)}
          >
            <Timer className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={addBookmark}
          >
            <BookmarkPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted p-4">
        <div className="max-w-5xl mx-auto">
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div>Carregando PDF...</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={<div>Carregando página...</div>}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
