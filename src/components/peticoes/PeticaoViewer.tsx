
import { ArrowLeft, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface PeticaoViewerProps {
  url: string;
  onBack: () => void;
}

export function PeticaoViewer({ url, onBack }: PeticaoViewerProps) {
  const { toast } = useToast();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadingState, setLoadingState] = useState<"loading" | "direct" | "fallback">("loading");
  const [loadError, setLoadError] = useState(false);
  
  // Update container width when the window resizes
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth);
    
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Attempt direct viewing first, then fallback to Google Viewer if needed
  useEffect(() => {
    // Start with loading state
    setLoadingState("loading");
    setLoadError(false);
    
    // Try direct first after a short delay
    const timer = setTimeout(() => {
      setLoadingState("direct");
    }, 500);
    
    return () => clearTimeout(timer);
  }, [url]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1);

  // For Google Docs PDF Viewer as fallback
  const getGoogleViewerUrl = () => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  // Handle error in the primary viewer
  const handlePrimaryViewerError = () => {
    console.log("Primary PDF viewer failed, switching to fallback");
    setLoadingState("fallback");
    
    // Notify user
    toast({
      title: "Visualizador alternativo",
      description: "Usando visualizador alternativo para exibir o documento",
      duration: 3000,
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
        
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto rounded-lg border bg-stone-100 dark:bg-stone-800"
        >
          <div className="min-h-full w-full flex items-center justify-center p-4">
            {loadingState === "loading" && (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-muted-foreground">Carregando documento...</p>
              </div>
            )}
            
            {loadingState === "direct" && (
              <iframe 
                src={url}
                className="w-full h-full rounded-md shadow-md"
                style={{ 
                  height: `calc(100vh - 160px)`,
                }}
                title="PDF Viewer"
                frameBorder="0"
                onError={handlePrimaryViewerError}
                onLoad={(e) => {
                  try {
                    // Try to access the iframe content
                    const iframe = e.currentTarget;
                    const iframeDoc = iframe.contentWindow?.document;
                    
                    // Check if iframe loaded an error page or empty content
                    if (!iframeDoc || 
                        iframeDoc.body.innerHTML === "" || 
                        iframeDoc.body.innerHTML.includes('Error') ||
                        iframeDoc.body.innerHTML.includes('error')) {
                      console.log("Empty or error content detected");
                      handlePrimaryViewerError();
                      return;
                    }
                    
                    console.log("PDF loaded successfully");
                  } catch (error) {
                    // If we can't access the contentWindow, it's likely due to CORS
                    // This is normal and we should continue showing the PDF
                    console.log("Could not access iframe content due to security restrictions, but PDF may still be loading");
                  }
                }}
              />
            )}
            
            {loadingState === "fallback" && (
              <iframe 
                src={getGoogleViewerUrl()}
                className="w-full h-full rounded-md shadow-md"
                style={{ 
                  height: `calc(100vh - 160px)`,
                }}
                title="PDF Viewer Fallback"
                frameBorder="0"
                onError={() => {
                  setLoadError(true);
                  console.error("Even fallback viewer failed");
                }}
              >
                Este navegador não suporta visualização de PDF. Por favor, <a href={url} download target="_blank" rel="noopener noreferrer">baixe o PDF</a> para visualizá-lo.
              </iframe>
            )}
            
            {loadError && (
              <div className="text-center p-8">
                <p className="text-destructive mb-4">Não foi possível carregar o documento</p>
                <Button asChild>
                  <a href={url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </a>
                </Button>
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
