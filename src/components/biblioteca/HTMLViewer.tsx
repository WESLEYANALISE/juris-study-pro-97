
import { useState, useEffect, useRef } from 'react';
import { LivroPro } from '@/types/livrospro';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { FloatingControls } from '@/components/vademecum/FloatingControls';

interface HTMLViewerProps {
  livro: LivroPro;
  onClose: () => void;
}

export function HTMLViewer({ livro, onClose }: HTMLViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use the existing touch gestures hook for pinch-to-zoom
  const { scale } = useTouchGestures({
    onZoomChange: (scale) => {
      const newFontSize = Math.round(16 * scale);
      setFontSize(Math.max(12, Math.min(32, newFontSize)));
    },
    minScale: 0.75,
    maxScale: 2.0
  });

  // Monitor scroll position for "back to top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch and convert PDF to HTML
  useEffect(() => {
    const convertPdfToHtml = async () => {
      try {
        setIsLoading(true);
        
        // In a production environment, you would want to:
        // 1. Check if we already have HTML content in the database
        // 2. If not, send the PDF URL to a server function to convert it
        // 3. Store the HTML result in the database for future use
        
        // For now, we'll simulate conversion with a placeholder
        const mockHtmlContent = await simulatePdfToHtmlConversion(livro.pdf);
        setHtmlContent(mockHtmlContent);
      } catch (error) {
        console.error("Error converting PDF to HTML:", error);
        toast.error("Não foi possível converter o PDF para HTML.");
      } finally {
        setIsLoading(false);
      }
    };
    
    convertPdfToHtml();
  }, [livro.pdf]);

  // Simulate PDF to HTML conversion (in production, this would be a real conversion)
  const simulatePdfToHtmlConversion = async (pdfUrl: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock HTML content based on the book information
    return `
      <div class="book-content">
        <h1>${livro.nome}</h1>
        ${livro.descricao ? `<p class="description">${livro.descricao}</p>` : ''}
        <div class="chapter">
          <h2>Capítulo 1</h2>
          <p>Este é um exemplo de conteúdo convertido do PDF para HTML. Em uma implementação real, 
          este conteúdo seria extraído do arquivo PDF utilizando uma biblioteca como pdf.js ou 
          um serviço de conversão no servidor.</p>
          <p>O livro "${livro.nome}" seria convertido página a página, preservando formatação,
          imagens e outros elementos do documento original.</p>
          <p>A conversão para HTML permite uma melhor experiência de leitura em dispositivos móveis,
          com suporte a funcionalidades como zoom em pinça, seleção de texto, e personalização
          do layout.</p>
        </div>
        <div class="chapter">
          <h2>Capítulo 2</h2>
          <p>Aqui teríamos mais conteúdo do livro, com parágrafos, imagens, tabelas e outros
          elementos do documento original.</p>
          <p>A estrutura seria preservada de forma semântica, facilitando a navegação e
          melhorando a acessibilidade.</p>
        </div>
      </div>
    `;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="mr-2" size={18} />
            Voltar
          </Button>
          <h1 className="font-semibold text-lg truncate max-w-[200px] md:max-w-md">
            {livro.nome}
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 lg:max-w-4xl lg:mx-auto"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div 
            className="prose dark:prose-invert max-w-none"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>

      {/* Floating Controls */}
      <FloatingControls 
        fontSize={fontSize}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        showBackToTop={showBackToTop}
        scrollToTop={scrollToTop}
      />
    </div>
  );
}
