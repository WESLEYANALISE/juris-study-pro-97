import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { BookOpen, Download, Search, Heart, ListCheck, Volume2, PencilLine, X, Bookmark, BookOpenCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent } from "@/components/ui/animated-tabs";
import { motion } from "framer-motion";
import { AskAssistant } from "@/components/AskAssistant";
import { askGemini } from "@/services/ai-assistant";
import { useToast } from "@/hooks/use-toast";
interface Book {
  id: number;
  livro: string | null;
  area: string | null;
  sobre: string | null;
  imagem: string | null;
  download: string | null;
  link: string | null;
}
interface ReadBook {
  id: number;
  isRead: boolean;
}
interface FavoriteBook {
  id: number;
  isFavorite: boolean;
}
const Biblioteca = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [readBooks, setReadBooks] = useState<ReadBook[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<FavoriteBook[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<Book[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const [narrationVolume, setNarrationVolume] = useState(70);
  const [isNarrating, setIsNarrating] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('biblioteca_juridica').select('*');
        if (error) {
          throw error;
        }
        const loadedBooks = data as Book[];
        setBooks(loadedBooks);
        setFilteredBooks(loadedBooks);
        const uniqueAreas = [...new Set(loadedBooks.map(book => book.area))].filter(Boolean) as string[];
        setAreas(uniqueAreas);
        const savedReadBooks = localStorage.getItem('readBooks');
        if (savedReadBooks) {
          setReadBooks(JSON.parse(savedReadBooks));
        }
        const savedFavoriteBooks = localStorage.getItem('favoriteBooks');
        if (savedFavoriteBooks) {
          setFavoriteBooks(JSON.parse(savedFavoriteBooks));
        }
        const savedRecentBooks = localStorage.getItem('recentBooks');
        if (savedRecentBooks) {
          const recentIds = JSON.parse(savedRecentBooks);
          const recentBooksData = loadedBooks.filter(book => recentIds.includes(book.id)).slice(0, 5);
          setRecentBooks(recentBooksData);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        const exampleBooks = [{
          id: 1,
          livro: "Constituição Federal Comentada",
          area: "Direito Constitucional",
          sobre: "Análise completa da Constituição Federal com comentários doutrinários e jurisprudenciais.",
          imagem: "https://placehold.co/200x300/7933ff/ffffff?text=Constituição+Federal",
          download: "https://example.com/download/constituicao.pdf",
          link: "https://example.com/read/constituicao"
        }, {
          id: 2,
          livro: "Manual de Direito Civil",
          area: "Direito Civil",
          sobre: "Abordagem sistemática dos principais institutos do Direito Civil brasileiro.",
          imagem: "https://placehold.co/200x300/3366ff/ffffff?text=Direito+Civil",
          download: "https://example.com/download/civil.pdf",
          link: "https://example.com/read/civil"
        }, {
          id: 3,
          livro: "Código Penal Comentado",
          area: "Direito Penal",
          sobre: "Comentários ao Código Penal com análise de jurisprudência atualizada.",
          imagem: "https://placehold.co/200x300/ff3366/ffffff?text=Direito+Penal",
          download: "https://example.com/download/penal.pdf",
          link: "https://example.com/read/penal"
        }];
        setBooks(exampleBooks);
        setFilteredBooks(exampleBooks);
        setAreas([...new Set(exampleBooks.map(book => book.area))].filter(Boolean) as string[]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => book.livro?.toLowerCase().includes(searchQuery.toLowerCase()) || book.area?.toLowerCase().includes(searchQuery.toLowerCase()) || book.sobre?.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);
  const toggleReadStatus = (bookId: number) => {
    const updatedReadBooks = readBooks.some(item => item.id === bookId) ? readBooks.filter(item => item.id !== bookId) : [...readBooks, {
      id: bookId,
      isRead: true
    }];
    setReadBooks(updatedReadBooks);
    localStorage.setItem('readBooks', JSON.stringify(updatedReadBooks));
    toast({
      title: readBooks.some(item => item.id === bookId) ? "Livro removido da lista de lidos" : "Livro marcado como lido",
      description: "Sua biblioteca foi atualizada",
      duration: 2000
    });
  };
  const toggleFavoriteStatus = (bookId: number) => {
    const updatedFavoriteBooks = favoriteBooks.some(item => item.id === bookId) ? favoriteBooks.filter(item => item.id !== bookId) : [...favoriteBooks, {
      id: bookId,
      isFavorite: true
    }];
    setFavoriteBooks(updatedFavoriteBooks);
    localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavoriteBooks));
    toast({
      title: favoriteBooks.some(item => item.id === bookId) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: "Suas preferências foram atualizadas",
      duration: 2000
    });
  };
  const addToRecentBooks = (book: Book) => {
    const existingRecentBooks = localStorage.getItem('recentBooks');
    let recentIds: number[] = existingRecentBooks ? JSON.parse(existingRecentBooks) : [];
    recentIds = recentIds.filter(id => id !== book.id);
    recentIds.unshift(book.id);
    recentIds = recentIds.slice(0, 5);
    localStorage.setItem('recentBooks', JSON.stringify(recentIds));
    const updatedRecentBooks = recentIds.map(id => books.find(book => book.id === id)).filter(Boolean) as Book[];
    setRecentBooks(updatedRecentBooks);
  };
  const openBookDialog = (book: Book) => {
    setSelectedBook(book);
    setIsBookDialogOpen(true);
    addToRecentBooks(book);
  };
  const handleNarration = (text: string) => {
    if (!text) return;
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.volume = narrationVolume / 100;
    utterance.onend = () => setIsNarrating(false);
    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };
  const askAiForRecommendation = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const prompt = `Estou procurando livros para estudar sobre: ${aiQuery}. 
      Por favor, sugira até 3 livros que podem me ajudar, considerando que estou na área jurídica.`;
      const response = await askGemini(prompt);
      if (response.error) {
        throw new Error(response.error);
      }
      setAiResult(response.text);
      const keywords = aiQuery.toLowerCase().split(' ');
      const recommendedBooks = books.filter(book => keywords.some(keyword => book.livro?.toLowerCase().includes(keyword) || book.area?.toLowerCase().includes(keyword) || book.sobre?.toLowerCase().includes(keyword))).slice(0, 5);
      setAiRecommendations(recommendedBooks);
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      setAiResult("Desculpe, não foi possível obter recomendações. Por favor, tente novamente.");
    } finally {
      setIsAiLoading(false);
    }
  };
  const renderBookCard = (book: Book) => {
    const isRead = readBooks.some(item => item.id === book.id);
    const isFavorite = favoriteBooks.some(item => item.id === book.id);
    return <motion.div whileHover={{
      scale: 1.05
    }} transition={{
      type: "spring",
      stiffness: 400,
      damping: 17
    }} className="relative cursor-pointer" onClick={() => openBookDialog(book)}>
        <div className="relative w-[150px] h-[220px] rounded-md overflow-hidden shadow-lg group">
          <div className="w-full h-full bg-gradient-to-b from-primary/20 to-primary/40 flex items-center justify-center text-center p-2" style={{
          backgroundImage: book.imagem ? `url(${book.imagem})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
            {!book.imagem && <span className="text-sm font-medium text-primary-foreground">
                {book.livro || "Livro sem título"}
              </span>}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0">
            <p className="text-xs text-white font-medium truncate">
              {book.livro || "Livro sem título"}
            </p>
          </div>
          
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            {isRead && <div className="bg-green-500 rounded-full p-1 shadow-md">
                <BookOpenCheck size={14} className="text-white" />
              </div>}
            {isFavorite && <div className="bg-red-500 rounded-full p-1 shadow-md">
                <Heart size={14} className="text-white" />
              </div>}
          </div>
        </div>
      </motion.div>;
  };
  const booksByArea = areas.reduce((acc, area) => {
    if (!area) return acc;
    acc[area] = filteredBooks.filter(book => book.area === area);
    return acc;
  }, {} as Record<string, Book[]>);
  const favoriteBooksData = books.filter(book => favoriteBooks.some(fav => fav.id === book.id));
  const readBooksData = books.filter(book => readBooks.some(rb => rb.id === book.id));
  return <div className="container py-4 mx-[18px] px-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Biblioteca Jurídica</h1>
        </div>
        
        <div className="relative w-full max-w-sm ml-4">
          <Input type="text" placeholder="Pesquisar livros..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-2">
              Recomendações da IA
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[450px] p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assistente de Recomendação</h3>
              <p className="text-sm text-muted-foreground">
                Descreva o assunto que você quer estudar e receba recomendações de livros.
              </p>
              
              <div className="flex items-center gap-2">
                <Input value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="Ex: Quero aprender sobre contratos de trabalho" className="flex-1" />
                <Button onClick={askAiForRecommendation} disabled={isAiLoading || !aiQuery.trim()} size="sm">
                  {isAiLoading ? "Buscando..." : "Perguntar"}
                </Button>
              </div>
              
              {aiResult && <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <p className="font-medium mb-2">Resposta do Assistente:</p>
                  <p>{aiResult}</p>
                </div>}
              
              {aiRecommendations.length > 0 && <div className="mt-4">
                  <h4 className="font-medium mb-2">Livros relacionados em nossa biblioteca:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {aiRecommendations.map(book => <div key={book.id} className="p-2 border rounded-md cursor-pointer hover:bg-accent" onClick={() => {
                  openBookDialog(book);
                  setIsAiPopoverOpen(false);
                }}>
                        <p className="text-xs font-medium truncate">{book.livro}</p>
                        <p className="text-xs text-muted-foreground">{book.area}</p>
                      </div>)}
                  </div>
                </div>}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <AnimatedTabs defaultValue="areas" className="w-full">
        <AnimatedTabsList className="w-full justify-start mb-4">
          <AnimatedTabsTrigger value="areas">Por Área</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="recentes">Recentes</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="lidos">Lidos</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="favoritos">Favoritos</AnimatedTabsTrigger>
        </AnimatedTabsList>
        
        <AnimatedTabsContent value="areas" slideDirection="right">
          {isLoading ? <div className="flex justify-center p-12">
              <p>Carregando biblioteca...</p>
            </div> : areas.length > 0 ? <div className="space-y-10">
              {areas.map(area => area && booksByArea[area]?.length > 0 && <div key={area} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{area}</h2>
                    <Carousel>
                      <CarouselContent>
                        {booksByArea[area].map(book => <CarouselItem key={book.id} className="basis-auto md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                            {renderBookCard(book)}
                          </CarouselItem>)}
                      </CarouselContent>
                      <CarouselPrevious className="left-0" />
                      <CarouselNext className="right-0" />
                    </Carousel>
                  </div>)}
            </div> : <p className="text-center py-12 text-muted-foreground">
              Nenhuma área encontrada na biblioteca.
            </p>}
        </AnimatedTabsContent>
        
        <AnimatedTabsContent value="recentes" slideDirection="right">
          {recentBooks.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
              {recentBooks.map(book => <div key={book.id} className="flex justify-center">
                  {renderBookCard(book)}
                </div>)}
            </div> : <p className="text-center py-12 text-muted-foreground">
              Você ainda não acessou nenhum livro recentemente.
            </p>}
        </AnimatedTabsContent>
        
        <AnimatedTabsContent value="lidos" slideDirection="right">
          {readBooksData.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
              {readBooksData.map(book => <div key={book.id} className="flex justify-center">
                  {renderBookCard(book)}
                </div>)}
            </div> : <p className="text-center py-12 text-muted-foreground">
              Você ainda não marcou nenhum livro como lido.
            </p>}
        </AnimatedTabsContent>
        
        <AnimatedTabsContent value="favoritos" slideDirection="right">
          {favoriteBooksData.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
              {favoriteBooksData.map(book => <div key={book.id} className="flex justify-center">
                  {renderBookCard(book)}
                </div>)}
            </div> : <p className="text-center py-12 text-muted-foreground">
              Você ainda não adicionou nenhum livro aos favoritos.
            </p>}
        </AnimatedTabsContent>
      </AnimatedTabs>
      
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedBook && <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedBook.livro}</DialogTitle>
                  <DialogClose className="rounded-full h-6 w-6 flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </DialogClose>
                </div>
                <DialogDescription className="text-primary">
                  {selectedBook.area}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-[150px] h-[220px] rounded-md overflow-hidden shadow-lg" style={{
                backgroundImage: selectedBook.imagem ? `url(${selectedBook.imagem})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: 'rgba(var(--primary), 0.2)'
              }}>
                    {!selectedBook.imagem && <div className="w-full h-full flex items-center justify-center p-2 text-center">
                        <span className="text-sm font-medium">
                          {selectedBook.livro}
                        </span>
                      </div>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={e => {
                  e.stopPropagation();
                  toggleFavoriteStatus(selectedBook.id);
                }} className={favoriteBooks.some(fav => fav.id === selectedBook.id) ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 dark:bg-red-900/30 dark:text-red-400" : ""}>
                      <Heart className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="icon" onClick={e => {
                  e.stopPropagation();
                  toggleReadStatus(selectedBook.id);
                }} className={readBooks.some(rb => rb.id === selectedBook.id) ? "bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-600 dark:bg-green-900/30 dark:text-green-400" : ""}>
                      <BookOpenCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sinopse</h3>
                    <div className="relative">
                      <p className="text-sm">{selectedBook.sobre || "Sinopse não disponível"}</p>
                      
                      {selectedBook.sobre && <Button variant="ghost" size="icon" className="absolute top-0 right-0" onClick={() => handleNarration(selectedBook.sobre || "")}>
                          <Volume2 className={`h-4 w-4 ${isNarrating ? "text-primary" : ""}`} />
                        </Button>}
                    </div>
                    
                    {isNarrating && <div className="mt-2">
                        <p className="text-xs mb-1">Volume: {narrationVolume}%</p>
                        <Slider value={[narrationVolume]} min={0} max={100} step={5} onValueChange={value => setNarrationVolume(value[0])} />
                      </div>}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between mt-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                toast({
                  title: "Anotações",
                  description: "Funcionalidade de anotações em desenvolvimento"
                });
              }}>
                    <PencilLine className="h-4 w-4 mr-2" />
                    Anotações
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  {selectedBook.download && <Button variant="outline" asChild>
                      <a href={selectedBook.download} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>}
                  
                  {selectedBook.link && <Button asChild>
                      <a href={selectedBook.link} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Ler Agora
                      </a>
                    </Button>}
                </div>
              </DialogFooter>
            </>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default Biblioteca;