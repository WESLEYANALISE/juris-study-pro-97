
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Peticao } from "@/types/peticoes";
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from "framer-motion";
import { Download, ZoomIn, ZoomOut, RotateCw, Printer, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PeticaoCardProps {
  peticao: Peticao;
}

export const PeticaoCard: React.FC<PeticaoCardProps> = ({ peticao }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  const handleZoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handlePrint = () => {
    window.open(peticao.link, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const displayArea = peticao.sub_area || peticao.area;
  const formattedDate = peticao.created_at 
    ? format(parseISO(peticao.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  const getBadgeVariant = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'urgente') return "destructive";
    if (tagLower === 'importante') return "warning";
    if (tagLower === 'modelo') return "default";
    return "secondary";
  };

  return (
    <Card className="flex flex-col justify-between h-full overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{displayArea}</span>
          {formattedDate && (
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          )}
        </CardTitle>
        <CardDescription>{peticao.tipo}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm mb-4">{peticao.descricao}</p>
        <motion.div 
          className="flex flex-wrap gap-2 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {peticao.tags?.map((tag, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <Badge variant={getBadgeVariant(tag)}>{tag}</Badge>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              className="transition-all duration-300 hover:shadow-md w-full"
            >
              Visualizar Petição
            </Button>
          </DialogTrigger>
          <DialogContent className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl h-[80vh]'} transition-all duration-300`}>
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>{displayArea} - {peticao.tipo}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={toggleFullscreen}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => window.open(peticao.link, '_blank')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto w-full h-full bg-zinc-50 rounded-md p-2">
              <Document 
                file={peticao.link}
                onLoadSuccess={onDocumentLoadSuccess}
                className="w-full h-full"
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  rotate={rotation}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  width={isFullscreen ? window.innerWidth * 0.9 : window.innerWidth * 0.7}
                />
              </Document>
              <div className="flex justify-center items-center mt-4 gap-4 bg-white rounded-md p-2 shadow-sm">
                <Button 
                  variant="outline" 
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
                </Button>
                <span className="px-4 py-2 bg-muted rounded-md">
                  Página {pageNumber} de {numPages}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber >= numPages}
                >
                  Próxima <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
