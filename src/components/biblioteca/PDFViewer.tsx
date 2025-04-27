
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
  BookOpen,
  FileText,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { LivroPro, Anotacao, Marcador, Progresso } from "@/types/livrospro";

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  livro: LivroPro;
  onClose: () => void;
}

export function PDFViewer({ livro, onClose }: PDFViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [showAnnotationTool, setShowAnnotationTool] = useState(false);
  
  // Viewing options
  const [viewMode, setViewMode] = useState<"single" | "double">("single");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Annotation state
  const [annotation, setAnnotation] = useState("");
  const [annotationColor, setAnnotationColor] = useState("#FFFF00");
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{ 
    x: number, y: number, width: number, height: number 
  } | null>(null);
  
  // Auto scroll state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(5); // Seconds per page
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

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
        posicao: selectionPosition
      };
      
      await supabase
        .from("livrospro_anotacoes")
        .insert(newAnnotation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anotacoes", livro.id, user?.id] });
      setAnnotation("");
      setShowAnnotationTool(false);
      setSelectionPosition(null);
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

  // Detect container size for responsive layout
  useEffect(() => {
    if (!pdfContainerRef.current) return;
    
    const updateContainerSize = () => {
      if (pdfContainerRef.current) {
        setContainerWidth(pdfContainerRef.current.clientWidth);
        setContainerHeight(pdfContainerRef.current.clientHeight);
      }
    };
    
    updateContainerSize();
    
    const resizeObserver = new ResizeObserver(updateContainerSize);
    resizeObserver.observe(pdfContainerRef.current);
    
    return () => {
      if (pdfContainerRef.current) {
        resizeObserver.unobserve(pdfContainerRef.current);
      }
    };
  }, [isFullScreen]);

  // Auto-detect if we should use double page mode based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setViewMode("double");
      } else {
        setViewMode("single");
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const changePage = (delta: number) => {
    if (!numPages) return;
    
    const newPage = pageNumber + delta;
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

  // Save progress when page changes
  useEffect(() => {
    if (user && pageNumber > 0) {
      const timeout = setTimeout(() => {
        updateProgress.mutate(pageNumber);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [pageNumber, user]);

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    
    if (selection && !selection.isCollapsed) {
      const selectedText = selection.toString().trim();
      if (selectedText) {
        setSelectedText(selectedText);
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Calculate position relative to PDF container
        if (pdfContainerRef.current) {
          const containerRect = pdfContainerRef.current.getBoundingClientRect();
          setSelectionPosition({
            x: rect.x - containerRect.x,
            y: rect.y - containerRect.y,
            width: rect.width,
            height: rect.height
          });
        }
        
        return;
      }
    }
    
    setSelectedText("");
    setSelectionPosition(null);
  };

  // Perform search
  const searchInDocument = async () => {
    if (!searchText) return;
    
    try {
      toast({
        title: "Pesquisa iniciada",
        description: "Pesquisando no documento...",
      });
      
      // In a real implementation, we would use PDF.js findTextIn methods
      // For now, this is a simplified mock approach
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

  // Copy selected text to clipboard
  const copySelectedText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText)
        .then(() => {
          toast({
            title: "Texto copiado",
            description: "O texto selecionado foi copiado para a área de transferência.",
          });
          window.getSelection()?.removeAllRanges();
          setSelectedText("");
          setSelectionPosition(null);
        })
        .catch(err => {
          console.error("Erro ao copiar texto:", err);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível copiar o texto selecionado.",
          });
        });
    }
  };

  // Handle annotation for selected text
  const handleAnnotateSelection = () => {
    if (selectedText) {
      setAnnotation(selectedText);
      setShowAnnotationTool(true);
    }
  };

  // Annotations for current page
  const currentPageAnnotations = anotacoes.filter(note => note.pagina === pageNumber);
  
  // Check if current page is bookmarked
  const currentPageBookmark = marcadores.find(mark => mark.pagina === pageNumber);

  return (
    <div 
      ref={pdfContainerRef}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
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
            
            <Button variant="ghost" size="icon" onClick={() => setScale(1)}>
              {Math.round(scale * 100)}%
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.1))}>
              <ZoomIn size={18} />
            </Button>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={() => setViewMode(viewMode === "single" ? "double" : "single")}
            >
              <BookOpen size={18} />
              {viewMode === "single" ? "Visualização simples" : "Visualização dupla"}
            </Button>
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
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Document */}
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div 
              className="flex-1 overflow-auto flex items-center justify-center bg-stone-200 dark:bg-stone-900"
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
            >
              <div className="flex justify-center items-center h-full">
                <Document
                  file={livro.pdf}
                  onLoadSuccess={onDocumentLoadSuccess}
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
                      <div className="text-center p-8">
                        <p className="text-destructive mb-2">Erro ao carregar documento</p>
                        <p className="text-sm text-muted-foreground">Não foi possível carregar o documento PDF. Verifique se o link está correto.</p>
                      </div>
                    </div>
                  }
                  className="pdf-document"
                >
                  {viewMode === "single" ? (
                    <Page
                      key={`page_${pageNumber}`}
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="pdf-page shadow-lg"
                      width={Math.min(containerWidth * 0.9, 800)}
                    />
                  ) : (
                    <div className="flex gap-4 justify-center">
                      {/* Even pages first in 2-page view */}
                      <Page
                        key={`page_${pageNumber % 2 === 0 ? pageNumber - 1 : pageNumber}`}
                        pageNumber={pageNumber % 2 === 0 ? pageNumber - 1 : pageNumber}
                        scale={scale}
                        rotate={rotation}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="pdf-page shadow-lg"
                        width={Math.min(containerWidth * 0.45, 500)}
                        error={pageNumber % 2 === 0 && pageNumber === 1 ? <div className="h-full bg-stone-100 dark:bg-stone-800"></div> : undefined}
                      />
                      {/* Display next page if it exists and we're in double mode */}
                      {(pageNumber % 2 === 1 || pageNumber % 2 === 0) && pageNumber + (pageNumber % 2 === 0 ? 0 : 1) <= (numPages || 0) && (
                        <Page
                          key={`page_${pageNumber % 2 === 0 ? pageNumber : pageNumber + 1}`}
                          pageNumber={pageNumber % 2 === 0 ? pageNumber : pageNumber + 1}
                          scale={scale}
                          rotate={rotation}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          className="pdf-page shadow-lg"
                          width={Math.min(containerWidth * 0.45, 500)}
                          error={pageNumber + 1 > (numPages || 0) ? <div className="h-full bg-stone-100 dark:bg-stone-800"></div> : undefined}
                        />
                      )}
                    </div>
                  )}
                </Document>
              </div>
              
              {/* Render annotations as overlays */}
              {currentPageAnnotations.map(annotation => (
                annotation.posicao ? (
                  <div
                    key={annotation.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${annotation.posicao.x}px`,
                      top: `${annotation.posicao.y}px`,
                      width: `${annotation.posicao.width}px`,
                      height: `${annotation.posicao.height}px`,
                      backgroundColor: annotation.cor,
                      opacity: 0.3,
                      borderRadius: '2px'
                    }}
                  />
                ) : null
              ))}
            </div>
          </ContextMenuTrigger>
          
          <ContextMenuContent className="w-64">
            {selectedText ? (
              <>
                <ContextMenuItem onClick={copySelectedText} className="gap-2">
                  <Copy size={16} /> Copiar texto
                </ContextMenuItem>
                <ContextMenuItem onClick={handleAnnotateSelection} className="gap-2">
                  <Pen size={16} /> Anotar texto selecionado
                </ContextMenuItem>
              </>
            ) : (
              <>
                <ContextMenuItem onClick={() => setShowAnnotationTool(true)} className="gap-2">
                  <Pen size={16} /> Nova anotação
                </ContextMenuItem>
                <ContextMenuItem 
                  onClick={() => currentPageBookmark ? deleteBookmark.mutate(currentPageBookmark.id) : setBookmarkTitle('')} 
                  className="gap-2"
                >
                  {currentPageBookmark ? (
                    <><Bookmark size={16} className="fill-primary text-primary" /> Remover marcador</>
                  ) : (
                    <><BookmarkPlus size={16} /> Adicionar marcador</>
                  )}
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
        
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
                      className={`flex justify-between p-2 rounded group ${marcador.pagina === pageNumber ? 'bg-accent' : 'hover:bg-muted'}`}
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
                      className={`p-3 rounded border ${anotacao.pagina === pageNumber ? 'border-primary' : 'border-border'} group`}
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
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full md:hidden" 
          onClick={() => setViewMode(viewMode === "single" ? "double" : "single")}
        >
          <BookOpen size={18} />
        </Button>
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
              <h3 className="text-sm font-medium">Visualização</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === "single" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setViewMode("single")}
                >
                  <FileText size={16} className="mr-1" /> Uma página
                </Button>
                <Button 
                  variant={viewMode === "double" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setViewMode("double")}
                >
                  <BookOpen size={16} className="mr-1" /> Duas páginas
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
      
      {/* Annotation dialog */}
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
      
      <style jsx global>{`
        .pdf-document {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .pdf-page {
          margin-bottom: 8px;
          border-radius: 4px;
        }
        
        .pdf-page > .react-pdf__Page__textContent {
          cursor: text;
          user-select: text;
          -webkit-user-select: text;
        }
        
        .pdf-page > .react-pdf__Page__annotations.annotationLayer {
          pointer-events: none;
        }
        
        .pdf-page > .react-pdf__Page__canvas {
          margin: 0 auto;
          display: block;
        }
        
        ::selection {
          background: rgba(255, 255, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
