
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileSymlink, Search, Download, Filter, Plus, Eye, Clock, Star, List, Folder } from "lucide-react";

const Modelos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dados de exemplo para modelos de documentos
  const modelosData = [
    {
      id: 1,
      title: "Petição Inicial - Ação de Indenização",
      category: "Cível",
      type: "Petição",
      description: "Modelo completo de petição inicial para ação de indenização por danos morais e materiais.",
      downloads: 2453,
      rating: 4.8,
      date: "15/04/2025",
      author: "Dr. Paulo Santos",
      formato: "DOCX"
    },
    {
      id: 2,
      title: "Contrato de Prestação de Serviços Advocatícios",
      category: "Contratos",
      type: "Contrato",
      description: "Modelo padrão de contrato para prestação de serviços advocatícios, com cláusulas essenciais.",
      downloads: 1876,
      rating: 4.7,
      date: "12/04/2025",
      author: "Dra. Cláudia Oliveira",
      formato: "DOCX"
    },
    {
      id: 3,
      title: "Contestação - Direito do Consumidor",
      category: "Consumidor",
      type: "Contestação",
      description: "Modelo de contestação para processos envolvendo relações de consumo, com argumentos comuns.",
      downloads: 1543,
      rating: 4.5,
      date: "10/04/2025",
      author: "Dr. André Lima",
      formato: "DOCX"
    },
    {
      id: 4,
      title: "Recurso de Apelação - Tributário",
      category: "Tributário",
      type: "Recurso",
      description: "Modelo de apelação contra sentença em execução fiscal, com argumentos de defesa.",
      downloads: 985,
      rating: 4.6,
      date: "08/04/2025",
      author: "Dra. Mariana Costa",
      formato: "DOCX"
    },
    {
      id: 5,
      title: "Procuração Ad Judicia",
      category: "Instrumentos",
      type: "Procuração",
      description: "Modelo de procuração ad judicia et extra para representação em processos judiciais.",
      downloads: 3241,
      rating: 4.9,
      date: "05/04/2025",
      author: "Dr. Roberto Mendes",
      formato: "DOCX"
    },
    {
      id: 6,
      title: "Notificação Extrajudicial",
      category: "Extrajudicial",
      type: "Notificação",
      description: "Modelo de notificação extrajudicial para constituição em mora.",
      downloads: 1432,
      rating: 4.4,
      date: "03/04/2025",
      author: "Dra. Fernanda Sousa",
      formato: "DOCX"
    }
  ];

  const filteredModelos = modelosData.filter(modelo => 
    modelo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modelo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modelo.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modelo.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categorias para filtro
  const categorias = ["Todos", "Cível", "Penal", "Trabalhista", "Tributário", "Consumidor", "Contratos", "Extrajudicial", "Instrumentos"];
  
  // Tipos de documentos para filtro
  const tipos = ["Todos", "Petição", "Contestação", "Recurso", "Contrato", "Procuração", "Notificação", "Parecer", "Acordo"];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <FileSymlink className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Modelos de Documentos</h1>
          <p className="text-muted-foreground text-center">
            Templates prontos para uso profissional
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Buscar por tipo de documento, área ou palavra-chave..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button className="flex gap-2">
            <Plus className="h-4 w-4" />
            Novo Modelo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-base">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-0">
              <div className="space-y-1">
                {categorias.map(categoria => (
                  <div 
                    key={categoria} 
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${categoria === "Todos" ? "bg-accent" : "hover:bg-accent"}`}
                  >
                    <span className="text-sm">{categoria}</span>
                    {categoria !== "Todos" && (
                      <Badge variant="outline" className="text-xs">
                        {modelosData.filter(m => m.category === categoria).length}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-base">Tipos de Documento</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-0">
              <div className="space-y-1">
                {tipos.map(tipo => (
                  <div 
                    key={tipo} 
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${tipo === "Todos" ? "bg-accent" : "hover:bg-accent"}`}
                  >
                    <span className="text-sm">{tipo}</span>
                    {tipo !== "Todos" && (
                      <Badge variant="outline" className="text-xs">
                        {modelosData.filter(m => m.type === tipo).length}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-base">Formato</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-0">
              <div className="space-y-1">
                <div className="flex items-center p-2">
                  <input type="checkbox" id="docx" className="mr-2" defaultChecked />
                  <label htmlFor="docx" className="text-sm">DOCX</label>
                </div>
                <div className="flex items-center p-2">
                  <input type="checkbox" id="pdf" className="mr-2" defaultChecked />
                  <label htmlFor="pdf" className="text-sm">PDF</label>
                </div>
                <div className="flex items-center p-2">
                  <input type="checkbox" id="rtf" className="mr-2" />
                  <label htmlFor="rtf" className="text-sm">RTF</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-5">
          <Tabs defaultValue="grade">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grade">
                  <List className="h-4 w-4 mr-2" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="pastas">
                  <Folder className="h-4 w-4 mr-2" />
                  Pastas
                </TabsTrigger>
              </TabsList>
              <div className="text-sm text-muted-foreground">
                {filteredModelos.length} modelos encontrados
              </div>
            </div>
            
            <TabsContent value="grade">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModelos.map(modelo => (
                  <Card key={modelo.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex gap-2 mb-1">
                        <Badge>{modelo.category}</Badge>
                        <Badge variant="outline">{modelo.type}</Badge>
                      </div>
                      <CardTitle className="text-lg">{modelo.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{modelo.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          {modelo.rating}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {modelo.date}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{modelo.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {modelo.downloads} downloads
                        </span>
                        <span className="flex items-center gap-1">
                          <FileSymlink className="h-3 w-3" />
                          {modelo.formato}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {filteredModelos.length === 0 && (
                <div className="text-center py-12">
                  <FileSymlink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum modelo encontrado</h3>
                  <p className="text-muted-foreground mb-6">
                    Não encontramos modelos para "{searchTerm}". Tente outros termos ou filtros.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar busca
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pastas">
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Visualização por pastas</h3>
                <p className="text-muted-foreground mb-6">
                  Organize seus modelos em pastas para facilitar o acesso.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Pasta
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Modelos;
