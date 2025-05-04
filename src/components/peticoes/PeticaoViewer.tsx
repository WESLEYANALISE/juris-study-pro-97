
import React from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DocxViewer } from "./DocxViewer";

interface PeticaoViewerProps {
  url: string;
  onBack: () => void;
}

export function PeticaoViewer({ url, onBack }: PeticaoViewerProps) {
  const isDocx = url.toLowerCase().endsWith('.docx') || 
                url.toLowerCase().includes('doc') || 
                url.includes('document/d/');

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
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Abrir em nova aba
        </Button>
      </div>
      
      <div className="flex-1 relative">
        <iframe 
          src={url} 
          className="w-full h-full"
          title="PDF Viewer"
        ></iframe>
      </div>
    </div>
  );
}
