
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";

interface DocxViewerProps {
  url: string;
  onBack: () => void;
}

export function DocxViewer({ url, onBack }: DocxViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(Date.now()); // Used to force reload when needed
  
  // Cache the Google Docs Viewer URL to avoid re-encoding
  const googleDocsViewerUrl = React.useMemo(() => {
    // Add preview=true parameter to fix Google Drive access issues
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true&preview=true`;
  }, [url]);
  
  // Retry logic for Google Docs Viewer which sometimes fails to load
  useEffect(() => {
    let timeout: number;
    
    // If still loading after 10 seconds, try to reload the iframe
    if (isLoading) {
      timeout = window.setTimeout(() => {
        setIframeKey(Date.now());
      }, 10000);
    }
    
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [isLoading, iframeKey]);
  
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="bg-gradient-to-r from-primary/20 to-background p-4 flex items-center justify-between border-b">
        <Button 
          onClick={onBack} 
          variant="ghost" 
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => window.open(googleDocsViewerUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Abrir em nova janela
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => window.open(url, '_blank')}
          >
            <Download className="h-4 w-4" />
            Baixar
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-muted-foreground">Carregando documento...</p>
          </div>
        )}
        
        <iframe 
          key={iframeKey}
          src={googleDocsViewerUrl}
          className="w-full h-full"
          onLoad={() => setIsLoading(false)}
          title="Documento"
        ></iframe>
      </div>
    </div>
  );
}
