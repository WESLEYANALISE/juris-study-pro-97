
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked, Search, Bookmark, FileText, Clock, Book, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

const Vademecum = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dados de exemplo para áreas do direito
  const areas = [
    { id: "constitucional", name: "Direito Constitucional" },
    { id: "civil", name: "Direito Civil" },
    { id: "penal", name: "Direito Penal" },
    { id: "processo-civil", name: "Direito Processual Civil" },
    { id: "processo-penal", name: "Direito Processual Penal" },
    { id: "trabalho", name: "Direito do Trabalho" },
    { id: "administrativo", name: "Direito Administrativo" },
    { id: "tributario", name: "Direito Tributário" },
    { id: "ambiental", name: "Direito Ambiental" },
    { id: "consumidor", name: "Direito do Consumidor" }
  ];
  
  // Dados de exemplo para diplomas legais
  const diplomasLegais = [
    { id: "cf88", name: "Constituição Federal", year: "1988", area: "constitucional" },
    { id: "cc02", name: "Código Civil", year: "2002", area: "civil" },
    { id: "cp40", name: "Código Penal", year: "1940", area: "penal" },
    { id: "cpc15", name: "Código de Processo Civil", year: "2015", area: "processo-civil" },
    { id: "cpp41", name: "Código de Processo Penal", year: "1941", area: "processo-penal" },
    { id: "clt43", name: "Consolidação das Leis do Trabalho", year: "1943", area: "trabalho" },
    { id: "cdc90", name: "Código de Defesa do Consumidor", year: "1990", area: "consumidor" },
    { id: "lei8112", name: "Lei 8.112 - Estatuto do Servidor Público Federal", year: "1990", area: "administrativo" },
    { id: "lei8666", name: "Lei 8.666 - Licitações e Contratos", year: "1993", area: "administrativo" },
    { id: "lei14133", name: "Lei 14.133 - Nova Lei de Licitações", year: "2021", area: "administrativo" },
    { id: "ctn66", name: "Código Tributário Nacional", year: "1966", area: "tributario" }
  ];
  
  // Estado para o diploma selecionado para visualização
  const [selectedDiploma, setSelectedDiploma] = useState<string | null>(null);
  
  // Filtragem de diplomas legais com base na busca
  const filteredDiplomas = diplomasLegais.filter(diploma => 
    diploma.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diploma.year.includes(searchTerm.toLowerCase())
  );
  
  // Conteúdo de exemplo para o diploma selecionado
  const diplomaContent = {
    "cf88": {
      title: "Constituição da República Federativa do Brasil de 1988",
      preambulo: "Nós, representantes do povo brasileiro, reunidos em Assembléia Nacional Constituinte para instituir um Estado Democrático, destinado a assegurar o exercício dos direitos sociais e individuais, a liberdade, a segurança, o bem-estar, o desenvolvimento, a igualdade e a justiça como valores supremos de uma sociedade fraterna, pluralista e sem preconceitos, fundada na harmonia social e comprometida, na ordem interna e internacional, com a solução pacífica das controvérsias, promulgamos, sob a proteção de Deus, a seguinte CONSTITUIÇÃO DA REPÚBLICA FEDERATIVA DO BRASIL.",
      articles: [
        {
          number: "1",
          content: "A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:\nI - a soberania;\nII - a cidadania;\nIII - a dignidade da pessoa humana;\nIV - os valores sociais do trabalho e da livre iniciativa;\nV - o pluralismo político.\nParágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição."
        },
        {
          number: "2",
          content: "São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário."
        },
        {
          number: "3",
          content: "Constituem objetivos fundamentais da República Federativa do Brasil:\nI - construir uma sociedade livre, justa e solidária;\nII - garantir o desenvolvimento nacional;\nIII - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais;\nIV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação."
        },
        {
          number: "4",
          content: "A República Federativa do Brasil rege-se nas suas relações internacionais pelos seguintes princípios:\nI - independência nacional;\nII - prevalência dos direitos humanos;\nIII - autodeterminação dos povos;\nIV - não-intervenção;\nV - igualdade entre os Estados;\nVI - defesa da paz;\nVII - solução pacífica dos conflitos;\nVIII - repúdio ao terrorismo e ao racismo;\nIX - cooperação entre os povos para o progresso da humanidade;\nX - concessão de asilo político.\nParágrafo único. A República Federativa do Brasil buscará a integração econômica, política, social e cultural dos povos da América Latina, visando à formação de uma comunidade latino-americana de nações."
        },
        {
          number: "5",
          content: "Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:\nI - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;\nII - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;\nIII - ninguém será submetido a tortura nem a tratamento desumano ou degradante;\nIV - é livre a manifestação do pensamento, sendo vedado o anonimato;\nV - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem;\n..."
        }
      ]
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <BookMarked className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Vade Mecum Digital</h1>
          <p className="text-muted-foreground text-center">
            Consulta rápida à legislação brasileira
          </p>
        </div>
      </div>

      {!selectedDiploma ? (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                className="pl-10" 
                placeholder="Buscar por diplomas legais..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="diplomas" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="diplomas">Diplomas Legais</TabsTrigger>
              <TabsTrigger value="areas">Por Área</TabsTrigger>
              <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
              <TabsTrigger value="recentes">Recentes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="diplomas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDiplomas.map(diploma => (
                  <Card key={diploma.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle>{diploma.name}</CardTitle>
                      <CardDescription>Ano: {diploma.year}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {areas.find(area => area.id === diploma.area)?.name}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Favorito
                      </Button>
                      <Button size="sm" onClick={() => setSelectedDiploma(diploma.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {filteredDiplomas.length === 0 && (
                <div className="text-center py-12">
                  <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum diploma encontrado</h3>
                  <p className="text-muted-foreground mb-6">
                    Não encontramos resultados para "{searchTerm}". Tente utilizar outros termos.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar busca
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="areas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.map(area => (
                  <Card key={area.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{area.name}</CardTitle>
                      <CardDescription>
                        {diplomasLegais.filter(d => d.area === area.id).length} diplomas legais
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {diplomasLegais.filter(d => d.area === area.id).slice(0, 3).map(diploma => (
                          <li key={diploma.id} className="truncate">• {diploma.name} ({diploma.year})</li>
                        ))}
                        {diplomasLegais.filter(d => d.area === area.id).length > 3 && (
                          <li>• ...</li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Ver todos
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="favoritos">
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum favorito adicionado</h3>
                <p className="text-muted-foreground mb-6">
                  Adicione diplomas legais aos favoritos para acessá-los rapidamente.
                </p>
                <Button variant="outline">
                  Explorar Diplomas Legais
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="recentes">
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Histórico de consultas vazio</h3>
                <p className="text-muted-foreground mb-6">
                  As consultas recentes aparecerão aqui para facilitar o acesso.
                </p>
                <Button variant="outline">
                  Explorar Diplomas Legais
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mb-2" 
                  onClick={() => setSelectedDiploma(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <CardTitle>
                  {diplomaContent[selectedDiploma as keyof typeof diplomaContent]?.title || 
                   diplomasLegais.find(d => d.id === selectedDiploma)?.name}
                </CardTitle>
                <CardDescription>
                  {diplomasLegais.find(d => d.id === selectedDiploma)?.year}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDiploma === "cf88" ? (
              <div className="space-y-6">
                <div className="bg-accent p-4 rounded-md">
                  <h3 className="font-medium mb-2">Preâmbulo</h3>
                  <p className="text-sm text-muted-foreground">
                    {diplomaContent.cf88.preambulo}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {diplomaContent.cf88.articles.map(article => (
                    <div key={article.number} className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Art. {article.number}</h3>
                      <p className="text-sm whitespace-pre-line">
                        {article.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Conteúdo em desenvolvimento</h3>
                <p className="text-muted-foreground mb-6">
                  O conteúdo completo deste diploma legal está em processo de integração ao sistema.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" disabled={true}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button variant="outline" disabled={selectedDiploma !== "cf88"}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Vademecum;
