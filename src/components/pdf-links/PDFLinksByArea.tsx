
import React, { useState, useEffect } from 'react';
import { fetchPDFLinksByArea, fetchPDFAreas } from '@/utils/pdf-links-service';
import { PDFLinkByArea, PDFArea } from '@/types/pdf-links';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, FileText, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';

interface PDFLinksByAreaProps {
  onSelectPDF: (pdf: PDFLinkByArea) => void;
}

export function PDFLinksByArea({ onSelectPDF }: PDFLinksByAreaProps) {
  const [pdfsByArea, setPDFsByArea] = useState<{ [key: string]: PDFLinkByArea[] }>({});
  const [areas, setAreas] = useState<PDFArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  useEffect(() => {
    async function loadPDFData() {
      setLoading(true);
      try {
        const groupedPDFs = await fetchPDFLinksByArea();
        setPDFsByArea(groupedPDFs);
        
        const areasList = await fetchPDFAreas();
        setAreas(areasList);
      } catch (error) {
        console.error('Error loading PDF data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPDFData();
  }, []);
  
  // Filter PDFs based on search query
  const filteredPDFsByArea = React.useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return pdfsByArea;
    }
    
    const searchTerm = debouncedSearchQuery.toLowerCase();
    const filtered: { [key: string]: PDFLinkByArea[] } = {};
    
    Object.entries(pdfsByArea).forEach(([area, pdfs]) => {
      const matchingPDFs = pdfs.filter(pdf => 
        pdf.pdf_name.toLowerCase().includes(searchTerm) || 
        (pdf.description || '').toLowerCase().includes(searchTerm)
      );
      
      if (matchingPDFs.length > 0) {
        filtered[area] = matchingPDFs;
      }
    });
    
    return filtered;
  }, [pdfsByArea, debouncedSearchQuery]);
  
  const handleViewPDF = (pdf: PDFLinkByArea) => {
    onSelectPDF(pdf);
  };
  
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Buscar PDFs por título ou descrição..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* PDFs by area */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas as Áreas</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Carregando PDFs...</p>
            </div>
          ) : Object.keys(filteredPDFsByArea).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum PDF encontrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery ? 
                  `Não encontramos PDFs correspondentes a "${searchQuery}".` : 
                  'Não há PDFs disponíveis no momento.'}
              </p>
            </div>
          ) : (
            <>
              {Object.entries(filteredPDFsByArea).map(([area, pdfs]) => (
                <motion.div 
                  key={area}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold">{area}</h2>
                      <Badge className="ml-2">{pdfs.length}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pdfs.map((pdf) => (
                      <Card 
                        key={pdf.id} 
                        className="overflow-hidden hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleViewPDF(pdf)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                              <CardTitle className="text-base">{pdf.pdf_name}</CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {pdf.area} • {pdf.total_pages ? `${pdf.total_pages} páginas` : 'PDF'}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          {pdf.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {pdf.description}
                            </p>
                          )}
                          <div className="mt-3 flex justify-end">
                            <Button size="sm">Visualizar PDF</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="favorites">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Seus PDFs Favoritos</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Você ainda não adicionou nenhum PDF aos favoritos.
              Marque PDFs como favoritos para acessá-los rapidamente.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">PDFs Visualizados Recentemente</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Os PDFs que você visualizar aparecerão aqui para acesso rápido.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
