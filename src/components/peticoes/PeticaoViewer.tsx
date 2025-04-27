
import { ArrowLeft, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface PeticaoViewerProps {
  url: string;
  onBack: () => void;
}

export function PeticaoViewer({ url, onBack }: PeticaoViewerProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1);

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
            <iframe 
              src={`${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              className="w-full h-full rounded-md shadow-md"
              style={{ 
                transform: `scale(${scale})`,
                transformOrigin: 'center top',
                transition: 'transform 0.2s ease',
                height: `calc(100vh - 160px)`,
              }}
              title="PDF Viewer"
              allowFullScreen
            />
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
