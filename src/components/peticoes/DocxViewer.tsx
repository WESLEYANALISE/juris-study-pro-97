
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Download, RefreshCw, X } from "lucide-react";

interface DocxViewerProps {
  url: string;
  onBack: () => void;
}

export function DocxViewer({ url, onBack }: DocxViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [iframeKey, setIframeKey] = useState(Date.now()); // Used to force reload when needed
  
  // Cache the Google Docs Viewer URL to avoid re-encoding
  const googleDocsViewerUrl = React.useMemo(() => {
    // Always add preview=true parameter to fix Google Drive access issues
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true&preview=true`;
  }, [url]);
  
  // Handle reload request
  const handleReload = () => {
    setIsLoading(true);
    setLoadAttempts(prev => prev + 1);
    setIframeKey(Date.now());
  };
  
  // Retry logic for Google Docs Viewer which sometimes fails to load
  useEffect(() => {
    let timeout: number;
    
    // If still loading after 10 seconds, try to reload the iframe
    if (isLoading) {
      timeout = window.setTimeout(() => {
        if (loadAttempts < 3) { // Limit auto-retries
          setIframeKey(Date.now());
          setLoadAttempts(prev => prev + 1);
        }
      }, 10000);
    }
    
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [isLoading, loadAttempts, iframeKey]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      <div className="bg-gradient-to-r from-primary/20 to-background/95 p-4 flex items-center justify-between border-b border-white/10 shadow-md">
        <div className="flex gap-2">
          <Button 
            onClick={onBack} 
            variant="glass"
            size="sm"
            className="gap-2 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleReload}
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => window.open(googleDocsViewerUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Nova janela
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="gap-2"
            onClick={() => window.open(url, '_blank')}
          >
            <Download className="h-4 w-4" />
            Baixar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="gap-2"
            onClick={onBack}
          >
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      </div>
      
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
                className="mt-4 text-sm text-muted-foreground"
              >
                Carregando documento...
              </motion.p>
              {loadAttempts > 0 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 text-xs text-muted-foreground"
                >
                  Tentativa {loadAttempts + 1} de carregamento
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <iframe 
          key={iframeKey}
          src={googleDocsViewerUrl}
          className="w-full h-full"
          onLoad={() => setIsLoading(false)}
          title="Documento"
        />
      </div>
    </motion.div>
  );
}
