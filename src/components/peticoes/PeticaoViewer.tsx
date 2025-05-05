
import React, { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DocxViewer } from "./DocxViewer";

interface PeticaoViewerProps {
  url: string;
  onBack: () => void;
}

export function PeticaoViewer({ url, onBack }: PeticaoViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Detect if it's a Google Drive document or DOCX file
  const isDocx = url.toLowerCase().endsWith('.docx') || 
                url.toLowerCase().includes('doc') || 
                url.includes('document/d/');
  
  // Fix Google Drive links for preview
  const modifiedUrl = url.includes('drive.google.com') && !url.includes('preview=true') 
    ? `${url}${url.includes('?') ? '&' : '?'}preview=true` 
    : url;

  if (isDocx) {
    return <DocxViewer url={url} onBack={onBack} />;
  }
  
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
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => window.open(modifiedUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Abrir em nova aba
        </Button>
      </div>
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <LoadingSpinner size="lg" />
          </div>
        )}
        <iframe 
          src={modifiedUrl} 
          className="w-full h-full"
          title="PDF Viewer"
          onLoad={() => setIsLoading(false)}
        ></iframe>
      </div>
    </div>
  );
}
