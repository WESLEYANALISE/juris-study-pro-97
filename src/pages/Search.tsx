
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Book, FileText, Video, GraduationCap, LayoutGrid, Clock } from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Mock data for search results
  const mockResults = {
    videos: [
      { id: 1, title: "Direito Constitucional: Controle de Constitucionalidade", type: "video", duration: "45min", author: "Prof. Lucas Mendes", date: "10/04/2025" },
      { id: 2, title: "Direito Civil: Contratos Atípicos", type: "video", duration: "38min", author: "Profa. Maria Silva", date: "05/04/2025" }
    ],
    documentos: [
      { id: 3, title: "Resumo: Controle de Constitucionalidade no Brasil", type: "resumo", pages: 12, author: "Carlos Oliveira", date: "15/04/2025" },
      { id: 4, title: "Petição: Modelo de Controle Incidental", type: "documento", pages: 5, author: "Dr. Paulo Santos", date: "12/04/2025" }
    ],
    simulados: [
      { id: 5, title: "Simulado OAB - Direito Constitucional (Controle de Constitucionalidade)", type: "simulado", questions: 10, difficulty: "Médio", date: "08/04/2025" }
    ]
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulando busca com timeout
    setTimeout(() => {
      const allResults = [
        ...mockResults.videos,
        ...mockResults.documentos,
        ...mockResults.simulados
      ];
      
      setSearchResults(allResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <SearchIcon className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Pesquisa</h1>
          <p className="text-muted-foreground text-center">
            Encontre conteúdo em toda a plataforma
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Buscar por vídeos, documentos, resumos, questões..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {hasSearched && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Resultados da busca</h2>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Busca realizada em 0.5 segundos</span>
            </div>
          </div>

          {isSearching ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-primary/20 h-12 w-12 mb-4"></div>
                <div className="h-4 bg-primary/20 rounded w-48 mb-2"></div>
                <div className="h-3 bg-primary/20 rounded w-32"></div>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <Tabs defaultValue="todos" className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="todos">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="videos">
                    <Video className="h-4 w-4 mr-2" />
                    Vídeos
                  </TabsTrigger>
                  <TabsTrigger value="documentos">
                    <FileText className="h-4 w-4 mr-2" />
                    Documentos
                  </TabsTrigger>
                  <TabsTrigger value="simulados">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Simulados
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="todos">
                  <div className="space-y-4">
                    {searchResults.map(result => (
                      <ResultCard key={result.id} result={result} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="videos">
                  <div className="space-y-4">
                    {mockResults.videos.map(result => (
                      <ResultCard key={result.id} result={result} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="documentos">
                  <div className="space-y-4">
                    {mockResults.documentos.map(result => (
                      <ResultCard key={result.id} result={result} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="simulados">
                  <div className="space-y-4">
                    {mockResults.simulados.map(result => (
                      <ResultCard key={result.id} result={result} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Não encontramos resultados para "{searchQuery}". Tente utilizar palavras-chave diferentes.
              </p>
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-medium mb-2">Sugestões:</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Verifique a ortografia das palavras-chave</li>
                  <li>Tente usar termos mais genéricos</li>
                  <li>Tente usar sinônimos</li>
                  <li>Reduza o número de palavras na sua busca</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Busque por conteúdo</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Digite termos de busca no campo acima para encontrar vídeos, documentos, resumos,
            simulados e outros conteúdos em toda a plataforma.
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
            <Badge variant="outline" onClick={() => setSearchQuery("direito constitucional")} className="cursor-pointer">direito constitucional</Badge>
            <Badge variant="outline" onClick={() => setSearchQuery("contratos")} className="cursor-pointer">contratos</Badge>
            <Badge variant="outline" onClick={() => setSearchQuery("habeas corpus")} className="cursor-pointer">habeas corpus</Badge>
            <Badge variant="outline" onClick={() => setSearchQuery("oab")} className="cursor-pointer">oab</Badge>
            <Badge variant="outline" onClick={() => setSearchQuery("processo civil")} className="cursor-pointer">processo civil</Badge>
          </div>
        </div>
      )}
    </div>
  );
};

interface ResultCardProps {
  result: {
    id: number;
    title: string;
    type: string;
    duration?: string;
    pages?: number;
    questions?: number;
    author?: string;
    date: string;
    difficulty?: string;
  };
}

const ResultCard = ({ result }: ResultCardProps) => {
  const getIcon = () => {
    switch (result.type) {
      case 'video':
        return <Video className="h-10 w-10 text-blue-500 p-2 bg-blue-100 dark:bg-blue-950 rounded-md" />;
      case 'resumo':
        return <FileText className="h-10 w-10 text-green-500 p-2 bg-green-100 dark:bg-green-950 rounded-md" />;
      case 'documento':
        return <FileText className="h-10 w-10 text-amber-500 p-2 bg-amber-100 dark:bg-amber-950 rounded-md" />;
      case 'simulado':
        return <GraduationCap className="h-10 w-10 text-purple-500 p-2 bg-purple-100 dark:bg-purple-950 rounded-md" />;
      default:
        return <Book className="h-10 w-10 text-gray-500 p-2 bg-gray-100 dark:bg-gray-800 rounded-md" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {getIcon()}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{result.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                  </Badge>
                  {result.author && (
                    <span className="text-xs text-muted-foreground">por {result.author}</span>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {result.date}
              </Badge>
            </div>
            <div className="mt-3 flex gap-4">
              <div className="flex flex-col text-sm">
                {result.duration && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {result.duration}
                  </span>
                )}
                {result.pages && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {result.pages} páginas
                  </span>
                )}
                {result.questions && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <GraduationCap className="h-3 w-3" />
                    {result.questions} questões
                  </span>
                )}
                {result.difficulty && (
                  <span className="text-muted-foreground">
                    Dificuldade: {result.difficulty}
                  </span>
                )}
              </div>
              <div className="ml-auto">
                <Button size="sm">Acessar</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Search;
