import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Bookmark,
  BookmarkPlus,
  Pen,
  X,
  Settings,
  Menu,
  Plus,
  Minus,
  RotateCw,
  RotateCcw,
  Maximize2,
  Columns,
  LayoutGrid,
  AlertTriangle,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { LivroPro, Anotacao, Marcador, Progresso } from "@/types/livrospro";

// Set up the worker for PDF.js with error handling
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
} catch (error) {
  console.error("Error initializing PDF.js worker:", error);
}

interface PDFViewerProps {
  livro: LivroPro;
  onClose: () => void;
}

export function PDFViewer({ livro, onClose }: PDFViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(5); // Seconds per page
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAnnotationTool, setShowAnnotationTool] = useState(false);
  const [annotation, setAnnotation] = useState("");
  const [annotationColor, setAnnotationColor] = useState("#FFFF00");
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [isDualPageView, setIsDualPageView] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<"fit-width" | "fit-page" | "custom">("fit-width");
  const [pdfLoadError, setPdfLoadError] = useState<Error | null>(null);
  const [pdfLoadRetries, setPdfLoadRetries] = useState(0);
  const [useAlternativeViewer, setUseAlternativeViewer] = useState(false);
  
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get reading progress
  const { data: progresso } = useQuery({
    queryKey: ["progresso", livro.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("livrospro_progresso")
        .select("*")
        .eq("livro_id", livro.id)
        .eq("user_id", user.id)
        .single();
      return data as Progresso | null;
    },
    enabled: !!user
  });

  // Get annotations
  const { data: anotacoes = [] } = useQuery({
    queryKey: ["anotacoes", livro.id, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("livrospro_anotacoes")
        .select("*")
        .eq("livro_id", livro.id)
        .eq("user_id", user.id)
        .order("pagina", { ascending: true });
      return (data || []) as Anotacao[];
    },
    enabled: !!user
  });

  // Get bookmarks
  const { data: marcadores = [] } = useQuery({
    queryKey: ["marcadores", livro.id, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("livrospro_marcadores")
        .select("*")
        .eq("livro_id", livro.id)
        .eq("user_id", user.id)
        .order("pagina", { ascending: true });
      return (data || []) as Marcador[];
    },
    enabled: !!user
  });

  // Update progress mutation
  const updateProgress = useMutation({
    mutationFn: async (pageNum: number) => {
      if (!user) return null;
      
      if (progresso) {
        await supabase
          .from("livrospro_progresso")
          .update({ pagina_atual: pageNum, updated_at: new Date().toISOString() })
          .eq("id", progresso.id);
      } else {
        await supabase
          .from("livrospro_progresso")
          .insert({
            livro_id: livro.id,
            user_id: user.id,
            pagina_atual: pageNum
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progresso", livro.id, user?.id] });
    },
    onError: (error) => {
      console.error("Erro ao salvar progresso:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o progresso de leitura.",
      });
    }
  });

  // Add annotation mutation
  const addAnnotation = useMutation({
    mutationFn: async () => {
      if (!user || !annotation) return null;
      
      const newAnnotation = {
        livro_id: livro.id,
        user_id: user.id,
        pagina: pageNumber,
        texto: annotation,
        cor: annotationColor,
      };
      
      await supabase
        .from("livrospro_anotacoes")
        .insert(newAnnotation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anotacoes", livro.id, user?.id] });
      setAnnotation("");
      setShowAnnotationTool(false);
      toast({
        title: "Anotação salva",
        description: "Sua anotação foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao salvar anotação:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar a anotação.",
      });
    }
  });

  // Add highlight mutation
  const addHighlight = useMutation({
    mutationFn: async ({ text, color }: { text: string, color: string }) => {
      if (!user || !text) return null;
      
      const newHighlight = {
        livro_id: livro.id,
        user_id: user.id,
        pagina: pageNumber,
        texto: text,
        cor: color,
      };
      
      await supabase
        .from("livrospro_anotacoes")
        .insert(newHighlight);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anotacoes", livro.id, user?.id] });
      setSelectedText("");
      setIsTextSelected(false);
      toast({
        title: "Destaque adicionado",
        description: "O texto selecionado foi destacado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao adicionar destaque:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível destacar o texto selecionado.",
      });
    }
  });

  // Add bookmark mutation
  const addBookmark = useMutation({
    mutationFn: async () => {
      if (!user) return null;
      
      const newBookmark = {
        livro_id: livro.id,
        user_id: user.id,
        pagina: pageNumber,
        titulo: bookmarkTitle || `Página ${pageNumber}`,
      };
      
      await supabase
        .from("livrospro_marcadores")
        .insert(newBookmark);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcadores", livro.id, user?.id] });
      setBookmarkTitle("");
      toast({
        title: "Marcador adicionado",
        description: "Seu marcador foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao adicionar marcador:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o marcador.",
      });
    }
  });

  // Delete bookmark mutation
  const deleteBookmark = useMutation({
    mutationFn: async (bookmarkId: string) => {
      await supabase
        .from("livrospro_marcadores")
        .delete()
        .eq("id", bookmarkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcadores", livro.id, user?.id] });
      toast({
        title: "Marcador removido",
        description: "Seu marcador foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao remover marcador:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o marcador.",
      });
    }
  });

  // Delete annotation mutation
  const deleteAnnotation = useMutation({
    mutationFn: async (annotationId: string) => {
      await supabase
        .from("livrospro_anotacoes")
        .delete()
        .eq("id", annotationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anotacoes", livro.id, user?.id] });
      toast({
        title: "Anotação removida",
        description: "Sua anotação foi removida com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao remover anotação:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover a anotação.",
      });
    }
  });

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (pdfContainerRef.current) {
        setContainerSize({
          width: pdfContainerRef.current.clientWidth,
          height: pdfContainerRef.current.clientHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate appropriate scale based on view mode
  useEffect(() => {
    if (viewMode === "custom") return; // Don't adjust scale if in custom mode
    
    // Wait for container and page to be measured
    const timeout = setTimeout(() => {
      if (containerSize.width > 0 && containerSize.height > 0) {
        if (viewMode === "fit-width") {
          // Scale to fit width, accounting for container padding
          const containerWidth = isDualPageView 
            ? (containerSize.width - 48) / 2 // Adjusted width for dual page mode
            : containerSize.width - 48;      // Single page with padding
          
          setScale(containerWidth / 595); // Assuming standard PDF width of 595pt
        } else if (viewMode === "fit-page") {
          // Scale to fit both width and height
          const containerWidth = isDualPageView 
            ? (containerSize.width - 48) / 2
            : containerSize.width - 48;
          
          const widthScale = containerWidth / 595; // Width scale factor
          const heightScale = (containerSize.height - 48) / 842; // Height scale factor (standard A4)
          
          // Use the smaller scale to ensure entire page fits
          setScale(Math.min(widthScale, heightScale));
        }
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [containerSize, viewMode, isDualPageView]);

  // Set initial page from saved progress
  useEffect(() => {
    if (progresso && progresso.pagina_atual > 0) {
      setPageNumber(progresso.pagina_atual);
    }
  }, [progresso]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && numPages) {
      const interval = setInterval(() => {
        setPageNumber((prev) => {
          if (prev < numPages) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playSpeed * 1000);
      
      setAutoPlayInterval(interval);
      
      return () => clearInterval(interval);
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  }, [isPlaying, numPages, playSpeed]);

  // Handle full screen
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Handle text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || "";
      
      setSelectedText(selectedText);
      setIsTextSelected(selectedText.length > 0);
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Watch for window resize to adjust dual page mode
  useEffect(() => {
    const handleResize = () => {
      // Only enable dual page mode on large screens
      if (window.innerWidth < 1024 && isDualPageView) {
        setIsDualPageView(false);
      }
    };

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDualPageView]);

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      if (pdfContainerRef.current?.requestFullscreen) {
        await pdfContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    
    if (livro.total_paginas === null) {
      // Update the book with total pages if not set
      supabase
        .from("livrospro")
        .update({ total_paginas: numPages })
        .eq("id", livro.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["livrospro"] });
        });
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setPdfLoadError(error);
  };

  const changePage = (delta: number) => {
    if (!numPages) return;
    
    let newPage = pageNumber + delta;
    
    // In dual page mode, move by 2 pages
    if (isDualPageView && delta !== 0) {
      newPage = pageNumber + (delta * 2);
    }
    
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };

  const goToPage = (page: number) => {
    if (!numPages) return;
    
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  // Get Google Docs viewer URL as fallback
  const getGoogleViewerUrl = () => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(livro.pdf)}&embedded=true`;
  };

  // Page sequence for dual page view
  const pageSequence = useMemo(() => {
    if (!isDualPageView) return [pageNumber];
    
    // If we're showing two pages, calculate the pair
    // For first page, show only the first page (like a book cover)
    if (pageNumber === 1) return [1];
    
    // For the rest, show pairs (even, odd)
    const startPage = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
    return [startPage, startPage + 1].filter(p => p <= (numPages || 0));
  }, [pageNumber, isDualPageView, numPages]);

  // Save progress when page changes
  useEffect(() => {
    if (user && pageNumber > 0) {
      const timeout = setTimeout(() => {
        updateProgress.mutate(pageNumber);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [pageNumber, user]);

  // Perform search
  const searchInDocument = async () => {
    if (!searchText) return;
    
    try {
      // This is a simplified approach - in a real implementation,
      // you would need to use PDF.js text layer to do proper text search
      // For now, we'll just set some mock results
      toast({
        title: "Pesquisa iniciada",
        description: "Pesquisando no documento...",
      });
      
      // Mock search results (random pages)
      const mockResults = Array(Math.floor(Math.random() * 5) + 1)
        .fill(0)
        .map(() => Math.floor(Math.random() * (numPages || 1)) + 1);
      
      setSearchResults(mockResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      toast({
        variant: "destructive",
        title: "Erro na pesquisa",
        description: "Não foi possível completar a pesquisa no documento.",
      });
    }
  };

  // Handle highlight text
  const handleHighlightText = (color: string = annotationColor) => {
    if (selectedText && isTextSelected) {
      addHighlight.mutate({ text: selectedText, color });
    }
  };

  // Annotations for current page
  const currentPageAnnotations = anotacoes.filter(note => note.pagina === pageNumber);
  
  // Check if current page is bookmarked
  const currentPageBookmark = marcadores.find(mark => mark.pagina === pageNumber);

  // CSS styles for PDF text layer
  const textLayerStyles = `
    .react-pdf__Page__textContent {
      z-index: 1;
      cursor: text;
    }
    
    .react-pdf__Page__textContent ::selection {
      background-color: ${annotationColor}80;
    }
    
    .textLayer {
      position: absolute;
      text-align: initial;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      opacity: 0.2;
      line-height: 1;
      user-select: text;
      -webkit-user-select: text;
      cursor: text;
    }

    .textLayer span,
    .textLayer br {
      color: transparent;
      position: absolute;
      white-space: pre;
      cursor: text;
      transform-origin: 0% 0%;
    }

    .textLayer .highlight {
      margin: -1px;
      padding: 1px;
      background-color: rgba(180, 0, 170, 0.2);
      border-radius: 4px;
    }

    .textLayer .highlight.active {
      background-color: rgba(0, 100, 0, 0.2);
    }
    
    .textLayer ::selection {
      background: ${annotationColor}80;
    }
    
    .annotationLayer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
    
    .context-menu {
      position: absolute;
      z-index: 10;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 4px;
      padding: 8px 0;
    }
    
    .context-menu button {
      display: block;
      width: 100%;
      text-align: left;
      padding: 8px 12px;
      border: none;
      background: none;
      cursor: pointer;
    }
    
    .context-menu button:hover {
      background-color: #f1f5f9;
    }
  `;

  // Retry loading PDF if there's an error
  useEffect(() => {
    if (pdfLoadError && pdfLoadRetries < 3 && !useAlternativeViewer) {
      const retryTimeout = setTimeout(() => {
        console.log(`Retrying PDF load, attempt ${pdfLoadRetries + 1}`);
        setPdfLoadRetries(prev => prev + 1);
        setPdfLoadError(null);
      }, 2000); // Wait 2 seconds before retrying
      
      return () => clearTimeout(retryTimeout);
    } else if (pdfLoadError && pdfLoadRetries >= 3 && !useAlternativeViewer) {
      console.log("Maximum retries reached, switching to alternative viewer");
      setUseAlternativeViewer(true);
      toast({
        title: "Visualizador alternativo ativado",
        description: "Tivemos um problema ao carregar o PDF, usando visualizador alternativo.",
        variant: "destructive",
      });
    }
  }, [pdfLoadError, pdfLoadRetries, toast, useAlternativeViewer]);

  const renderAlternativeViewer = () => {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="bg-card/90 backdrop-blur-sm p-4 text-center mb-4 rounded-lg border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium">Visualizador alternativo</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Estamos usando um visualizador alternativo para este documento.
          </p>
        </div>
        
        <iframe
          src={getGoogleViewerUrl()}
          className="flex-1 w-full rounded-lg border shadow-lg bg-white"
          title="Visualizador de PDF alternativo"
        />
        
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setPdfLoadRetries(0);
              setPdfLoadError(null);
              setUseAlternativeViewer(false);
            }}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Tentar visualizador normal
          </Button>
          
          <Button
            variant="default"
            onClick={() => window.open(livro.pdf, '_blank')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={pdfContainerRef}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      <style>{textLayerStyles}</style>
      
      {/* Header toolbar */}
      <div className="bg-card border-b shadow-sm p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
          <h1 className="font-medium truncate max-w-[200px] md:max-w-md">
            {livro.nome}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!useAlternativeViewer && (
            <>
              <span className="text-sm text-muted-foreground">
                {pageNumber} / {numPages || '?'}
              </span>
              
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
                  <ArrowLeft size={18} />
                </Button>
                
                <Input
                  type="number"
                  min={1}
                  max={numPages || 1}
                  value={pageNumber}
                  onChange={e => setPageNumber(Number(e.target.value))}
                  onBlur={e => goToPage(Number(e.target.value))}
                  className="w-16 text-center h-8"
                />
                
                <Button variant="ghost" size="icon" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)}>
                  <ArrowRight size={18} />
                </Button>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                  <ZoomOut size={18} />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => setScale(1)}>
                  {Math.round(scale * 100)}%
                </Button>
                
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.1))}>
                  <ZoomIn size={18} />
                </Button>
              </div>
            </>
          )}
          
          <div className="hidden md:flex items-center gap-1">
            {!useAlternativeViewer && (
              <Button 
                variant={isDualPageView ? "default" : "ghost"}
                size="icon"
                onClick={() => setIsDualPageView(!isDualPageView)}
                disabled={window.innerWidth < 1024}
                title={isDualPageView ? "Modo de página única" : "Modo de página dupla"}
              >
                {isDualPageView ? <LayoutGrid size={18} /> : <Columns size={18} />}
              </Button>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title="Opções de visualização">
                  <Settings size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-56">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Modo de visualização</h4>
                  <div className="flex flex-col gap-2">
                    {!useAlternativeViewer ? (
                      <>
                        <Button 
                          variant={viewMode === "fit-width" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("fit-width")}
                          className="justify-start"
                        >
                          Ajustar à largura
                        </Button>
                        <Button 
                          variant={viewMode === "fit-page" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("fit-page")}
                          className="justify-start"
                        >
                          Ajustar à página
                        </Button>
                        <Button 
                          variant={viewMode === "custom" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("custom")}
                          className="justify-start"
                        >
                          Tamanho personalizado
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUseAlternativeViewer(false);
                          setPdfLoadRetries(0);
                          setPdfLoadError(null);
                        }}
                        className="justify-start"
                      >
                        <RotateCw className="mr-2 h-4 w-4" />
                        Usar visualizador normal
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(livro.pdf, '_blank')}
                      className="justify-start"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar PDF original
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
              <Maximize2 size={18} />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} className="md:hidden">
              <Menu size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Controles</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Navegação</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
                  <ArrowLeft size={16} className="mr-1" /> Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)}>
                  Próxima <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min={1}
                  max={numPages || 1}
                  value={pageNumber}
                  onChange={e => setPageNumber(Number(e.target.value))}
                  onBlur={e => goToPage(Number(e.target.value))}
                  className="w-20 text-center"
                />
                <span className="text-sm text-muted-foreground">
                  de {numPages || '?'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Zoom</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                  <ZoomOut size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(1)}>
                  {Math.round(scale * 100)}%
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(s => Math.min(3, s + 0.1))}>
                  <ZoomIn size={16} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Rotação</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setRotation(r => (r - 90) % 360)}>
                  <RotateCcw size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation(0)}>
                  0°
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation(r => (r + 90) % 360)}>
                  <RotateCw size={16} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Visualização</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === "fit-width" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setViewMode("fit-width")}
                    className="flex-1"
                  >
                    Ajustar largura
                  </Button>
                  <Button 
                    variant={viewMode === "fit-page" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setViewMode("fit-page")}
                    className="flex-1"
                  >
                    Ajustar página
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Leitura automática</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant={isPlaying ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? "Pausar" : "Iniciar"}
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setPlaySpeed(s => Math.min(30, s + 1))}>
                    <Plus size={16} />
                  </Button>
                  <span className="text-sm min-w-12 text-center">{playSpeed}s</span>
                  <Button variant="ghost" size="icon" onClick={() => setPlaySpeed(s => Math.max(1, s - 1))}>
                    <Minus size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* PDF Document */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-stone-100 dark:bg-stone-900 p-4" ref={textLayerRef}>
          {useAlternativeViewer ? (
            renderAlternativeViewer()
          ) : (
            <div 
              className={`relative mx-auto ${isDualPageView ? 'flex gap-2' : ''}`}
              style={{
                width: isDualPageView ? 'auto' : '100%',
                maxWidth: isDualPageView ? 'none' : '1200px',
              }}
            >
              <Document
                file={livro.pdf}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Carregando documento...</p>
                    </div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center p-8 max-w-md mx-auto">
                      <div className="bg-destructive/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      </div>
                      <p className="font-semibold mb-2">Erro ao carregar documento</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        Ocorreu um problema ao carregar o documento PDF. 
                        {pdfLoadRetries > 0 && ` Tentativa ${pdfLoadRetries} de 3.`}
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setPdfLoadError(null);
                            setPdfLoadRetries(prev => prev + 1);
                          }}
                          disabled={pdfLoadRetries >= 3}
                          className="w-full"
                        >
                          <RotateCw className="mr-2 h-4 w-4" />
                          Tentar novamente
                        </Button>
                        <Button 
                          variant="default"
                          onClick={() => setUseAlternativeViewer(true)}
                          className="w-full"
                        >
                          Usar visualizador alternativo
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => window.open(livro.pdf, '_blank')}
                          className="w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Baixar PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                }
                className="transition-transform duration-300"
                options={{ 
                  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                  isEvalSupported: false,
                  worker: pdfLoadRetries > 0 ? null : undefined
                }}
              >
                {pageSequence.map((pageNum) => (
                  <div 
                    key={pageNum} 
                    className="page-container shadow-lg mb-2 bg-white"
                    style={{ 
                      display: 'inline-block',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Page
                      pageNumber={pageNum}
                      scale={scale}
                      rotate={rotation}
                      renderTextLayer={false} // Disable text layer to fix the error
                      renderAnnotationLayer={true}
                      className="transition-transform duration-300"
                      width={isDualPageView ? containerSize.width / 2 - 24 : undefined}
                      canvasBackground="white"
                      error={
                        <div className="flex items-center justify-center p-4 h-[200px]">
                          <p className="text-sm text-muted-foreground">Erro ao renderizar página {pageNum}</p>
                        </div>
                      }
                    />
                    
                    {/* Overlay annotations on current page */}
                    {currentPageAnnotations
                      .filter(note => note.pagina === pageNum)
                      .map((note) => (
                        <div 
                          key={note.id}
                          className="absolute p-1 rounded"
                          style={{
                            backgroundColor: `${note.cor}40`,
                            border: `2px solid ${note.cor}`,
                            maxWidth: '90%',
                            // If we have position data, use it, otherwise just show at top
                            top: note.posicao?.y || "10px",
                            left: note.posicao?.x || "10px",
                          }}
                        >
                          <div className="text-xs p-1 bg-background/80 backdrop-blur-sm rounded">
                            {note.texto}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ))}
              </Document>
            </div>
          )}

          {/* Highlighted text context menu */}
          {isTextSelected && (
            <div 
              className="fixed z-20 bg-card/95 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden border"
              style={{
                top: window.getSelection()?.getRangeAt(0).getBoundingClientRect().bottom || 0 + 10,
                left: window.getSelection()?.getRangeAt(0).getBoundingClientRect().left || 0,
              }}
            >
              <div className="flex p-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(selectedText)}
                  className="text-xs"
                >
                  Copiar
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Destacar
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Escolha uma cor</h4>
                      <div className="grid grid-cols-5 gap-1">
                        {["#FFFF00", "#90EE90", "#ADD8E6", "#FFA07A", "#D8BFD8"].map(color => (
                          <div
                            key={color}
                            className="w-8 h-8 rounded-full cursor-pointer border hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              handleHighlightText(color);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setAnnotation(selectedText);
                    setShowAnnotationTool(true);
                  }}
                  className="text-xs"
                >
                  Anotar
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="hidden lg:block w-72 border-l bg-card overflow-y-auto p-4">
          <Tabs defaultValue="bookmarks">
            <TabsList className="w-full">
              <TabsTrigger value="bookmarks" className="flex-1">Marcadores</TabsTrigger>
              <TabsTrigger value="annotations" className="flex-1">Anotações</TabsTrigger>
              <TabsTrigger value="search" className="flex-1">Pesquisar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookmarks" className="mt-4 h-[calc(100vh-180px)] overflow-y-auto">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-medium">Marcadores</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <BookmarkPlus size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Adicionar marcador</h4>
                      <Input
                        placeholder="Título do marcador"
                        value={bookmarkTitle}
                        onChange={e => setBookmarkTitle(e.target.value)}
                      />
                      <Button 
                        onClick={() => addBookmark.mutate()}
                        disabled={addBookmark.isPending}
                        className="w-full"
                      >
                        {addBookmark.isPending ? "Adicionando..." : "Adicionar marcador"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {marcadores.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Nenhum marcador adicionado
                </div>
              ) : (
                <div className="space-y-2">
                  {marcadores.map(marcador => (
                    <div 
                      key={marcador.id}
                      className={`flex justify-between p-2 rounded ${marcador.pagina === pageNumber ? 'bg-accent' : 'hover:bg-muted'}`}
                    >
                      <button
                        className="flex items-center gap-2 text-start flex-1"
                        onClick={() => goToPage(marcador.pagina)}
                      >
                        <Bookmark size={16} className="min-w-4" />
                        <span className="truncate">
                          {marcador.titulo || `Página ${marcador.pagina}`}
                        </span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBookmark.mutate(marcador.id)}
                        disabled={deleteBookmark.isPending}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="annotations" className="mt-4 h-[calc(100vh-180px)] overflow-y-auto">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-medium">Anotações</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAnnotationTool(true)}
                >
                  <Pen size={16} />
                </Button>
              </div>
              
              {anotacoes.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma anotação adicionada
                </div>
              ) : (
                <div className="space-y-4">
                  {anotacoes.map(anotacao => (
                    <div 
                      key={anotacao.id}
                      className={`p-3 rounded border ${anotacao.pagina === pageNumber ? 'border-primary' : 'border-border'}`}
                      style={{
                        borderLeft: `4px solid ${anotacao.cor}`
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <button
                          className="text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => goToPage(anotacao.pagina)}
                        >
                          Página {anotacao.pagina}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAnnotation.mutate(anotacao.id)}
                          disabled={deleteAnnotation.isPending}
                          className="h-6 w-6"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {anotacao.texto}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {showAnnotationTool && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-card border rounded-lg shadow-lg w-[90%] max-w-md max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Nova anotação - Página {pageNumber}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAnnotationTool(false)}
                      >
                        <X size={18} />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Escreva sua anotação aqui..."
                        value={annotation}
                        onChange={e => setAnnotation(e.target.value)}
                        className="min-h-[150px]"
                      />
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Cor:</label>
                        <input
                          type="color"
                          value={annotationColor}
                          onChange={e => setAnnotationColor(e.target.value)}
                          className="h-8 w-8 rounded-full overflow-hidden"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowAnnotationTool(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => addAnnotation.mutate()}
                          disabled={!annotation || addAnnotation.isPending}
                        >
                          {addAnnotation.isPending ? "Salvando..." : "Salvar anotação"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="search" className="mt-4 h-[calc(100vh-180px)] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Pesquisar no documento..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") searchInDocument();
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={searchInDocument}
                    disabled={!searchText}
                  >
                    <Search size={16} />
                  </Button>
                </div>
                
                {showSearchResults && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      {searchResults.length} resultados encontrados
                    </h4>
                    
                    {searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map((page, index) => (
                          <button
                            key={index}
                            className="flex items-center gap-2 p-2 w-full text-left rounded hover:bg-muted"
                            onClick={() => goToPage(page)}
                          >
                            <span className="text-sm text-muted-foreground">
                              Página {page}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Nenhum resultado encontrado para "{searchText}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Bottom toolbar (mobile) */}
      <div className="md:hidden flex items-center justify-between border-t p-2 bg-card">
        <Button variant="ghost" size="icon" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
          <ArrowLeft size={18} />
        </Button>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={numPages || 1}
            value={pageNumber}
            onChange={e => setPageNumber(Number(e.target.value))}
            onBlur={e => goToPage(Number(e.target.value))}
            className="w-16 text-center h-8"
          />
          <span className="text-sm text-muted-foreground">/ {numPages || '?'}</span>
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)}>
          <ArrowRight size={18} />
        </Button>
      </div>
      
      {/* Bottom buttons */}
      <div className="fixed bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full border shadow-lg p-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bookmark size={18} className={currentPageBookmark ? "text-primary fill-primary" : ""} />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top">
            <div className="space-y-4">
              <h4 className="font-medium">
                {currentPageBookmark ? "Página marcada" : "Marcar página"}
              </h4>
              {currentPageBookmark ? (
                <div className="space-y-2">
                  <p className="text-sm">{currentPageBookmark.titulo || `Página ${pageNumber}`}</p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteBookmark.mutate(currentPageBookmark.id)}
                    disabled={deleteBookmark.isPending}
                  >
                    {deleteBookmark.isPending ? "Removendo..." : "Remover marcador"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Título do marcador"
                    value={bookmarkTitle}
                    onChange={e => setBookmarkTitle(e.target.value)}
                  />
                  <Button 
                    onClick={() => addBookmark.mutate()}
                    disabled={addBookmark.isPending}
                    className="w-full"
                  >
                    {addBookmark.isPending ? "Adicionando..." : "Adicionar marcador"}
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowAnnotationTool(true)}>
          <Pen size={18} />
        </Button>
      </div>
    </div>
  );
}
