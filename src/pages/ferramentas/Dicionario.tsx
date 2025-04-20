
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bookmark, Volume2, Book, ArrowRight, History, Plus } from "lucide-react";

const Dicionario = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Dados de exemplo para termos jurídicos
  const termosJuridicos = [
    {
      id: 1,
      termo: "Habeas Corpus",
      origem: "Latim",
      significado: "\"Que tenhas o corpo\". Garantia constitucional que visa proteger o direito de ir e vir do indivíduo, sendo cabível sempre que alguém sofrer ou se achar ameaçado de sofrer violência ou coação em sua liberdade de locomoção, por ilegalidade ou abuso de poder.",
      areas: ["Direito Constitucional", "Direito Processual Penal"],
      exemplo: "Impetrou habeas corpus para garantir a liberdade do cliente preso ilegalmente."
    },
    {
      id: 2,
      termo: "Abuso de Direito",
      origem: "Português",
      significado: "Exercício de um direito de forma excessiva, extrapolando os limites impostos pelo seu fim econômico ou social, pela boa-fé ou pelos bons costumes. Está previsto no art. 187 do Código Civil como ato ilícito.",
      areas: ["Direito Civil"],
      exemplo: "O proprietário que constrói algo em seu terreno com o único intuito de prejudicar o vizinho comete abuso de direito."
    },
    {
      id: 3,
      termo: "Ad Referendum",
      origem: "Latim",
      significado: "\"Para ser referendado\". Expressão que indica que determinado ato, decisão ou deliberação depende de aprovação posterior de uma autoridade ou órgão para ter validade definitiva.",
      areas: ["Direito Administrativo", "Direito Processual"],
      exemplo: "O presidente do conselho tomou a decisão ad referendum, que será apreciada na próxima reunião."
    },
    {
      id: 4,
      termo: "Caput",
      origem: "Latim",
      significado: "\"Cabeça\". Refere-se à parte principal de um artigo de lei, que fica no início, antes dos parágrafos, incisos ou alíneas, contendo a regra geral.",
      areas: ["Técnica Legislativa"],
      exemplo: "O caput do art. 5º da Constituição Federal estabelece a igualdade perante a lei."
    },
    {
      id: 5,
      termo: "Erga Omnes",
      origem: "Latim",
      significado: "\"Contra todos\" ou \"em relação a todos\". Expressa que uma norma, um direito ou uma decisão é válida contra todos, produzindo efeitos jurídicos em relação a todas as pessoas, não apenas às partes envolvidas.",
      areas: ["Direito Civil", "Direito Constitucional"],
      exemplo: "As decisões em ações de controle concentrado de constitucionalidade têm efeito erga omnes."
    }
  ];
  
  // Termos mais buscados
  const termosPopulares = ["Habeas Corpus", "Jusnaturalismo", "Pacta Sunt Servanda", "Erga Omnes", "Mutatis Mutandis", "Jus Postulandi", "Data Venia"];
  
  // Histórico de consultas recentes
  const consultasRecentes = ["Caput", "Ad Referendum", "Abuso de Direito"];
  
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulando busca com timeout
    setTimeout(() => {
      const results = termosJuridicos.filter(termo => 
        termo.termo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        termo.significado.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const narrarTexto = (texto: string) => {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <Book className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Dicionário Jurídico</h1>
          <p className="text-muted-foreground text-center">
            Consulta de termos e expressões jurídicas
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Buscar termos, expressões ou conceitos jurídicos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
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
        <div className="space-y-6">
          {searchResults.map(termo => (
            <Card key={termo.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{termo.termo}</CardTitle>
                      <Badge variant="outline">{termo.origem}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {termo.areas.map(area => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => narrarTexto(`${termo.termo}. ${termo.significado}`)}>
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Significado</h3>
                    <p className="text-sm text-muted-foreground">{termo.significado}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Exemplo de uso</h3>
                    <p className="text-sm text-muted-foreground italic">"{termo.exemplo}"</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" size="sm">
                  Ver mais detalhes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-12">
          <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum termo encontrado</h3>
          <p className="text-muted-foreground mb-6">
            Não encontramos o termo "{searchTerm}" em nosso dicionário jurídico.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button variant="outline">Limpar busca</Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Sugerir adição deste termo
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Termos Populares</CardTitle>
              <CardDescription>Expressões mais consultadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {termosPopulares.map(termo => (
                  <Badge 
                    key={termo} 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => {
                      setSearchTerm(termo);
                      handleSearch();
                    }}
                  >
                    {termo}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Ver todos</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Consultas Recentes</CardTitle>
              <CardDescription>Seus últimos termos consultados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consultasRecentes.map(termo => (
                  <div 
                    key={termo} 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSearchTerm(termo);
                      handleSearch();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <span>{termo}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-xs">Limpar histórico</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Idiomas de Origem</CardTitle>
              <CardDescription>Fontes de expressões jurídicas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-accent cursor-pointer">
                  <span>Latim</span>
                  <Badge>42 termos</Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-accent cursor-pointer">
                  <span>Português</span>
                  <Badge>36 termos</Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-accent cursor-pointer">
                  <span>Francês</span>
                  <Badge>18 termos</Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md hover:bg-accent cursor-pointer">
                  <span>Inglês</span>
                  <Badge>15 termos</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Explorar</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dicionario;
