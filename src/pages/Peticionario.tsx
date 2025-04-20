
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FilePlus, Search, Clock, Download, Filter, Plus } from "lucide-react";

const Peticionario = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dados de exemplo para modelos de petições
  const modelosData = [
    {
      id: 1,
      title: "Petição Inicial - Ação de Indenização",
      category: "Cível",
      area: "Responsabilidade Civil",
      description: "Modelo completo de petição inicial para ação de indenização por danos morais e materiais.",
      downloads: 589,
      date: "15/04/2025",
      keywords: ["indenização", "danos morais", "responsabilidade civil"]
    },
    {
      id: 2,
      title: "Habeas Corpus",
      category: "Criminal",
      area: "Processual Penal",
      description: "Modelo de habeas corpus para casos de prisão ilegal, com fundamentação completa.",
      downloads: 432,
      date: "12/04/2025",
      keywords: ["habeas corpus", "liberdade", "prisão ilegal"]
    },
    {
      id: 3,
      title: "Recurso de Apelação - Tributário",
      category: "Tributário",
      area: "Contencioso Tributário",
      description: "Modelo de apelação contra sentença em execução fiscal, com argumentos de defesa.",
      downloads: 325,
      date: "10/04/2025",
      keywords: ["apelação", "tributário", "execução fiscal"]
    },
    {
      id: 4,
      title: "Contestação - Direito do Consumidor",
      category: "Consumidor",
      area: "Relações de Consumo",
      description: "Modelo de contestação para processos envolvendo relações de consumo, com argumentos comuns.",
      downloads: 411,
      date: "08/04/2025",
      keywords: ["contestação", "consumidor", "CDC"]
    },
    {
      id: 5,
      title: "Mandado de Segurança - Administrativo",
      category: "Administrativo",
      area: "Direito Administrativo",
      description: "Modelo de mandado de segurança contra ato administrativo ilegal.",
      downloads: 356,
      date: "05/04/2025",
      keywords: ["mandado de segurança", "administrativo", "ato ilegal"]
    },
    {
      id: 6,
      title: "Embargos de Declaração",
      category: "Processual",
      area: "Recursos",
      description: "Modelo de embargos de declaração para casos de omissão, contradição e obscuridade.",
      downloads: 278,
      date: "03/04/2025",
      keywords: ["embargos", "declaração", "recurso"]
    }
  ];

  const filteredModelos = modelosData.filter(modelo => 
    modelo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modelo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modelo.keywords.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Categorias para filtro
  const categorias = ["Todos", "Cível", "Criminal", "Tributário", "Consumidor", "Administrativo", "Processual", "Trabalhista"];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <FilePlus className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Peticionário</h1>
          <p className="text-muted-foreground text-center">
            Modelos e templates de peças jurídicas para sua prática profissional
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Buscar por tipo de petição, área ou palavras-chave..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="flex gap-2">
          <Plus className="h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      <Tabs defaultValue="todos" className="mb-6">
        <TabsList className="mb-4 flex flex-wrap">
          {categorias.map(categoria => (
            <TabsTrigger key={categoria} value={categoria.toLowerCase()}>
              {categoria}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModelos.map(modelo => (
          <Card key={modelo.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">{modelo.category}</Badge>
                <Badge variant="secondary">{modelo.area}</Badge>
              </div>
              <CardTitle className="text-lg">{modelo.title}</CardTitle>
              <CardDescription className="text-xs">
                Atualizado em {modelo.date} • {modelo.downloads} downloads
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">{modelo.description}</p>
              <div className="flex flex-wrap gap-1">
                {modelo.keywords.map(keyword => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">Visualizar</Button>
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
          <p className="text-muted-foreground">Nenhum modelo encontrado com os critérios atuais.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setSearchTerm("")}
          >
            Limpar busca
          </Button>
        </div>
      )}
    </div>
  );
};

export default Peticionario;
