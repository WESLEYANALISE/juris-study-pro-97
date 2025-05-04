
import React, { useState } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";

interface DocxViewerProps {
  url: string;
  onBack: () => void;
}

export function DocxViewer({ url, onBack }: DocxViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  
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
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        <iframe 
          src={googleDocsViewerUrl}
          className="w-full h-full"
          onLoad={() => setIsLoading(false)}
          title="Documento"
        ></iframe>
      </div>
    </div>
  );
}
