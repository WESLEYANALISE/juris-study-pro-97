
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Peticao } from "@/types/peticoes";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PeticaoCardProps {
  peticao: Peticao;
}

export const PeticaoCard: React.FC<PeticaoCardProps> = ({ peticao }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const displayArea = peticao.sub_area || peticao.area;

  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{displayArea}</CardTitle>
        <CardDescription>{peticao.tipo}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm mb-2">{peticao.descricao}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {peticao.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Visualizar Petição</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{displayArea} - {peticao.tipo}</DialogTitle>
            </DialogHeader>
            <div className="overflow-auto w-full h-full">
              <Document 
                file={peticao.link}
                onLoadSuccess={onDocumentLoadSuccess}
                className="w-full h-full"
              >
                <Page 
                  pageNumber={pageNumber} 
                  width={window.innerWidth * 0.8} 
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                />
              </Document>
              <div className="flex justify-center items-center mt-4 space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                >
                  Anterior
                </Button>
                <span>Página {pageNumber} de {numPages}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber >= numPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
