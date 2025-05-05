
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { DocxViewer } from "./DocxViewer";

interface PeticaoViewerProps {
  url: string;
  onBack: () => void;
}

export function PeticaoViewer({ url, onBack }: PeticaoViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());
  
  // Detect if it's a Google Drive document or DOCX file
  const isDocx = url.toLowerCase().endsWith('.docx') || 
                url.toLowerCase().includes('doc') || 
                url.includes('document/d/');
  
  // Fix Google Drive links for preview
  const modifiedUrl = React.useMemo(() => {
    if (url.includes('drive.google.com')) {
      // Always add preview=true parameter to fix Google Drive access issues
      return `${url}${url.includes('?') ? '&' : '?'}preview=true`;
    }
    return url;
  }, [url]);

  // Handle reload
  const handleReload = () => {
    setIsLoading(true);
    setLoadError(false);
    setIframeKey(Date.now());
  };
  
  // If it's a DOCX, use the specialized DocxViewer
  if (isDocx) {
    return <DocxViewer url={url} onBack={onBack} />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-primary/20 to-background/95 p-4 flex items-center justify-between border-b border-white/10 shadow-md"
      >
        <Button 
          onClick={onBack} 
          variant="glass"
          size="sm"
          className="gap-2 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="subtle" 
            size="sm" 
            className="gap-2"
            onClick={handleReload}
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="gap-2"
            onClick={() => window.open(modifiedUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Nova aba
          </Button>
        </div>
      </motion.div>
      
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10"
            >
              <LoadingSpinner size="lg" />
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-sm text-gradient-purple"
              >
                Carregando documento...
              </motion.p>
            </motion.div>
          )}
          
          {loadError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10"
            >
              <p className="text-lg font-semibold mb-2 text-red-400">Erro ao carregar o documento</p>
              <p className="text-sm text-muted-foreground mb-4">O documento pode ter restrições de acesso</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleReload}>Tentar novamente</Button>
                <Button variant="default" size="sm" onClick={() => window.open(modifiedUrl, '_blank')}>
                  Abrir no navegador
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <iframe 
          key={iframeKey}
          src={modifiedUrl} 
          className="w-full h-full"
          title="PDF Viewer"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setLoadError(true);
          }}
        />
      </div>
    </motion.div>
  );
}
