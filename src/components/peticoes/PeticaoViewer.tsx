
import { ArrowLeft, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PeticaoViewerProps {
  url: string;
  onBack: () => void;
}

export function PeticaoViewer({ url, onBack }: PeticaoViewerProps) {
  const { toast } = useToast();
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1);

  // For Google Docs PDF Viewer as fallback
  const getGoogleViewerUrl = () => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  // Handle successful load
  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  // Handle error
  const handleError = () => {
    setLoading(false);
    setError(true);
    
    toast({
      title: "Erro ao carregar documento",
      description: "Tentando visualizador alternativo ou você pode baixá-lo diretamente",
      variant: "destructive",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetZoom} 
              className="text-xs px-2"
            >
              {Math.round(scale * 100)}%
            </Button>
            <Button variant="outline" size="icon" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto rounded-lg border bg-stone-100 dark:bg-stone-800">
          <div className="min-h-full w-full flex items-center justify-center p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-muted-foreground">Carregando documento...</p>
              </div>
            )}
            
            {!error ? (
              // Primary PDF viewer using iframe
              <iframe
                src={url}
                className="w-full h-full rounded-md shadow-md"
                style={{ 
                  height: `calc(100vh - 160px)`,
                  display: loading ? 'none' : 'block',
                  transform: `scale(${scale})`,
                  transformOrigin: 'center top'
                }}
                onLoad={handleLoad}
                onError={handleError}
                title="PDF Viewer"
              >
                Este navegador não suporta visualização de PDF. Por favor, <a href={url} download target="_blank" rel="noopener noreferrer">baixe o PDF</a> para visualizá-lo.
              </iframe>
            ) : (
              // Fallback to Google Viewer when direct embed fails
              <iframe 
                src={getGoogleViewerUrl()}
                className="w-full h-full rounded-md shadow-md"
                style={{ 
                  height: `calc(100vh - 160px)`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'center top'
                }}
                onLoad={handleLoad}
                title="PDF Viewer Fallback"
                frameBorder="0"
              >
                Este navegador não suporta visualização de PDF. Por favor, <a href={url} download target="_blank" rel="noopener noreferrer">baixe o PDF</a> para visualizá-lo.
              </iframe>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
                  <p className="text-destructive font-medium mb-4">Não foi possível carregar o documento</p>
                  <Button asChild>
                    <a href={url} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button asChild className="w-full md:w-auto gap-2 animate-pulse hover:animate-none">
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
