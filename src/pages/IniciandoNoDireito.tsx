
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Book, 
  GraduationCap, 
  HelpCircle, 
  CheckCircle2,
  Calendar,
  Users,
  Trophy,
  TrendingUp,
  Youtube,
  ArrowRight,
  Play
} from "lucide-react";
import { VideoCard } from "@/components/videoaulas/VideoCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PageTransition } from "@/components/PageTransition";

// Mock data - in a real app, these would come from an API
const studyTrackData = [
  {
    id: 1,
    level: "Iniciante",
    title: "Fundamentos do Direito",
    description: "Conceitos básicos e introdução ao mundo jurídico",
    steps: [
      { id: 1, title: "O que é Direito?", completed: false },
      { id: 2, title: "Fontes do Direito", completed: false },
      { id: 3, title: "Ramos do Direito", completed: false },
      { id: 4, title: "Normas Jurídicas", completed: false }
    ]
  },
  {
    id: 2,
    level: "Iniciante",
    title: "Direito Constitucional Básico",
    description: "Princípios fundamentais e organização do Estado",
    steps: [
      { id: 1, title: "O que é uma Constituição", completed: false },
      { id: 2, title: "Direitos Fundamentais", completed: false },
      { id: 3, title: "Organização dos Poderes", completed: false }
    ]
  },
  {
    id: 3,
    level: "Iniciante",
    title: "Introdução ao Direito Civil",
    description: "Conceitos básicos sobre pessoas, bens e negócios jurídicos",
    steps: [
      { id: 1, title: "Pessoa Natural e Jurídica", completed: false },
      { id: 2, title: "Bens e Direitos", completed: false },
      { id: 3, title: "Fatos e Negócios Jurídicos", completed: false }
    ]
  },
  {
    id: 4,
    level: "Intermediário",
    title: "Processo Civil Básico",
    description: "Como funcionam os processos judiciais",
    steps: [
      { id: 1, title: "O que é Processo", completed: false },
      { id: 2, title: "Partes do Processo", completed: false },
      { id: 3, title: "Petição Inicial", completed: false }
    ]
  }
];

const glossaryTerms = [
  {
    id: "1",
    termo: "Constituição",
    definicao: "Lei fundamental e suprema de um país que contém normas sobre a estrutura do Estado, a formação dos poderes públicos, a forma de governo e os direitos e deveres dos cidadãos.",
    exemplo_uso: "A Constituição Federal de 1988 garante o direito à vida, à liberdade e à igualdade.",
    area_direito: "Direito Constitucional"
  },
  {
    id: "2",
    termo: "Jurisprudência",
    definicao: "Conjunto de decisões judiciais sobre casos semelhantes que servem como referência para julgamentos futuros.",
    exemplo_uso: "A jurisprudência do STF tem sido favorável a esta interpretação da lei.",
    area_direito: "Teoria Geral do Direito"
  },
  {
    id: "3",
    termo: "Contrato",
    definicao: "Acordo de vontades entre duas ou mais pessoas que cria, modifica ou extingue direitos e obrigações.",
    exemplo_uso: "O contrato de aluguel estabelece as condições para uso do imóvel.",
    area_direito: "Direito Civil"
  },
  {
    id: "4",
    termo: "Lei",
    definicao: "Norma jurídica elaborada pelo Poder Legislativo, que regula condutas e estabelece direitos e deveres.",
    exemplo_uso: "A lei de trânsito determina as regras para dirigir nas vias públicas.",
    area_direito: "Teoria Geral do Direito"
  },
  {
    id: "5",
    termo: "OAB",
    definicao: "Ordem dos Advogados do Brasil. Entidade responsável por regulamentar a advocacia no Brasil.",
    exemplo_uso: "Para exercer advocacia, é necessário passar no exame da OAB.",
    area_direito: "Prática Jurídica"
  }
];

const introVideos = [
  {
    id: "v1",
    title: "Como funciona o Poder Judiciário Brasileiro",
    description: "Vídeo explicativo sobre a estrutura do Judiciário no Brasil",
    thumbnail: "https://img.youtube.com/vi/ZmYwmvAuzqw/hqdefault.jpg",
    videoId: "ZmYwmvAuzqw",
    duration: "10:15",
    channelTitle: "Canal Jurídico",
    publishedAt: "2023-01-15"
  },
  {
    id: "v2",
    title: "Diferença entre Leis, Decretos e Portarias",
    description: "Entenda as diferenças entre os diversos tipos normativos",
    thumbnail: "https://img.youtube.com/vi/oyjlLkm-nUQ/hqdefault.jpg",
    videoId: "oyjlLkm-nUQ",
    duration: "8:42",
    channelTitle: "Canal Jurídico",
    publishedAt: "2023-02-20"
  },
  {
    id: "v3",
    title: "Os 3 Poderes do Estado Explicados",
    description: "Entenda como funcionam os três poderes no Brasil",
    thumbnail: "https://img.youtube.com/vi/SiUE0bw-YBk/hqdefault.jpg",
    videoId: "SiUE0bw-YBk",
    duration: "12:30",
    channelTitle: "Direito Descomplicado",
    publishedAt: "2023-03-10"
  }
];

const faqItems = [
  {
    question: "O que preciso estudar primeiro no Direito?",
    answer: "Recomenda-se começar pelos fundamentos do Direito, entendendo o que é o Direito, suas fontes e principais ramos. Em seguida, é importante estudar Direito Constitucional para compreender a base de todo o ordenamento jurídico. Após isso, Direito Civil e Processo Civil são boas escolhas por serem áreas abrangentes e fundamentais."
  },
  {
    question: "Quanto tempo leva para passar na OAB?",
    answer: "O tempo varia muito de pessoa para pessoa. Em média, os estudantes levam de 6 meses a 1 ano de preparação específica após concluírem a faculdade de Direito. No entanto, há quem passe ainda durante a graduação, com uma boa preparação, e há quem precise de mais tentativas."
  },
  {
    question: "Quais livros são indicados para quem está começando?",
    answer: "Para iniciantes, recomenda-se livros didáticos e esquematizados como 'Manual de Direito Civil' de Flávio Tartuce, 'Curso de Direito Constitucional' de Pedro Lenza, e 'Como Passar na OAB' da editora Foco, que apresentam o conteúdo de forma mais acessível."
  },
  {
    question: "É melhor estudar por livros físicos ou cursos online?",
    answer: "Não existe um método melhor, mas sim aquele que se adapta ao seu estilo de aprendizagem. Cursos online oferecem mais interatividade e atualizações constantes, enquanto livros físicos permitem estudo sem distrações e marcações físicas. O ideal é combinar ambos: usar livros como base teórica e cursos para fixação e atualização."
  },
  {
    question: "Preciso decorar todos os códigos?",
    answer: "Não é necessário nem recomendado decorar todos os códigos. O importante é entender os princípios e a lógica do sistema jurídico, e saber onde encontrar as informações específicas quando necessário. Com o tempo e a prática, você naturalmente memorizará as partes mais utilizadas."
  },
];

const essentialMaterials = [
  {
    title: "Manual de Direito Civil",
    author: "Flávio Tartuce",
    description: "Obra completa e didática que aborda todos os temas do Direito Civil com linguagem acessível.",
    imageUrl: "https://m.media-amazon.com/images/I/71KtUs31YnL._SY466_.jpg",
    type: "Livro"
  },
  {
    title: "Curso de Direito Constitucional",
    author: "Pedro Lenza",
    description: "Apresentação esquematizada do Direito Constitucional, ideal para iniciantes.",
    imageUrl: "https://m.media-amazon.com/images/I/71t31vbCkNL._SY466_.jpg",
    type: "Livro"
  },
  {
    title: "Vade Mecum Acadêmico",
    author: "Diversos",
    description: "Compilação das principais leis e códigos para consulta rápida.",
    imageUrl: "https://m.media-amazon.com/images/I/61XIVm+mu5L._SY466_.jpg",
    type: "Livro"
  },
  {
    title: "Roteiro de Estudos para OAB",
    author: "JurisStudy",
    description: "Guia gratuito com roteiro de estudos para quem está começando na área jurídica.",
    type: "Apostila"
  },
  {
    title: "Resumos de Direito Constitucional",
    author: "JurisStudy",
    description: "Material sintetizado dos principais tópicos de Direito Constitucional.",
    type: "Resumo"
  }
];

const dailyChallenges = [
  {
    title: "Leia 1 artigo da Constituição",
    description: "Escolha um artigo da Constituição Federal e leia com atenção, buscando entender seu significado.",
    points: 10,
    timeEstimate: "5 minutos"
  },
  {
    title: "Aprenda 3 novos termos jurídicos",
    description: "Pesquise e entenda o significado de 3 novos termos jurídicos que você nunca viu antes.",
    points: 15,
    timeEstimate: "10 minutos"
  },
  {
    title: "Resolva 5 questões básicas",
    description: "Pratique seus conhecimentos resolvendo 5 questões de nível fácil sobre conceitos jurídicos.",
    points: 20,
    timeEstimate: "15 minutos"
  },
  {
    title: "Assista a uma aula introdutória",
    description: "Escolha um vídeo curto sobre algum tema jurídico básico que você não conhece bem.",
    points: 25,
    timeEstimate: "20 minutos"
  }
];

const successStories = [
  {
    name: "Ana Silva",
    achievement: "Aprovada na OAB na primeira tentativa",
    videoId: "dQw4w9WgXcQ",
    quote: "Comecei do zero, sem ninguém na família na área jurídica. A chave foi estudar com consistência e usar bons materiais introdutórios."
  },
  {
    name: "Carlos Mendes",
    achievement: "Passou em concurso público após 1 ano de estudos",
    videoId: "dQw4w9WgXcQ",
    quote: "Organizei meus estudos de forma gradual, começando pelos fundamentos e avançando aos poucos. Consistência foi mais importante que longas horas de estudo."
  }
];

const IniciandoNoDireito = () => {
  const [selectedTab, setSelectedTab] = useState("trilha");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // For study track progress simulation
  const [tracks, setTracks] = useState(studyTrackData);
  
  const handleCompleteStep = (trackId: number, stepId: number) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId 
          ? {
              ...track,
              steps: track.steps.map(step => 
                step.id === stepId ? { ...step, completed: !step.completed } : step
              )
            }
          : track
      )
    );
  };
  
  // Calculate progress percentages
  const calculateProgress = (track: typeof tracks[0]) => {
    const completed = track.steps.filter(step => step.completed).length;
    return Math.round((completed / track.steps.length) * 100);
  };

  // Handle video selection
  const handleVideoSelect = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Iniciando no Direito</h1>
          <p className="text-muted-foreground">
            Guia completo para quem está começando os estudos na área jurídica
          </p>
        </div>

        <Tabs defaultValue="trilha" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
            <TabsTrigger value="trilha" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Trilha de Estudo</span>
              <span className="inline sm:hidden">Trilha</span>
            </TabsTrigger>
            <TabsTrigger value="glossario" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Glossário Jurídico</span>
              <span className="inline sm:hidden">Glossário</span>
            </TabsTrigger>
            <TabsTrigger value="minicursos" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Mini-cursos</span>
              <span className="inline sm:hidden">Cursos</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span>FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="materiais" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Materiais Essenciais</span>
              <span className="inline sm:hidden">Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="avancado" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Recursos Avançados</span>
              <span className="inline sm:hidden">Avançado</span>
            </TabsTrigger>
          </TabsList>

          {/* Trilha de Estudo */}
          <TabsContent value="trilha" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tracks.map((track) => {
                const progress = calculateProgress(track);
                
                return (
                  <Card key={track.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2">
                          {track.level}
                        </Badge>
                        <Badge variant="outline" className="ml-auto">
                          {progress}% concluído
                        </Badge>
                      </div>
                      <CardTitle>{track.title}</CardTitle>
                      <CardDescription>{track.description}</CardDescription>
                      
                      <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3">
                        {track.steps.map((step) => (
                          <li key={step.id} className="flex items-center justify-between">
                            <span className="flex items-center">
                              <span className={`mr-2 ${step.completed ? "text-primary" : "text-muted-foreground"}`}>
                                {step.id}.
                              </span>
                              <span className={step.completed ? "text-primary font-medium" : ""}>
                                {step.title}
                              </span>
                            </span>
                            <Button 
                              variant={step.completed ? "outline" : "secondary"} 
                              size="sm" 
                              onClick={() => handleCompleteStep(track.id, step.id)}
                              className="ml-2"
                            >
                              {step.completed ? "Concluído" : "Iniciar"}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Próximos passos</CardTitle>
                <CardDescription>
                  Comece pela trilha "Fundamentos do Direito" e avance gradualmente para as trilhas mais específicas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <p className="text-muted-foreground">
                    Recomendamos a seguinte ordem de estudos para iniciantes:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Fundamentos do Direito (conceitos básicos)</li>
                    <li>Direito Constitucional Básico</li>
                    <li>Introdução ao Direito Civil</li>
                    <li>Processo Civil Básico</li>
                  </ol>
                  <Button className="mt-4 w-full sm:w-auto">
                    <span>Ver plano de estudos detalhado</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Glossário Jurídico */}
          <TabsContent value="glossario" className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {glossaryTerms.map(term => (
                  <motion.div 
                    key={term.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{term.termo}</CardTitle>
                        </div>
                        <Badge variant="outline">{term.area_direito}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-base mb-2">{term.definicao}</p>
                        
                        {term.exemplo_uso && (
                          <div className="bg-muted p-3 rounded-md mt-3">
                            <p className="text-sm italic">
                              <span className="font-medium">Exemplo: </span>
                              {term.exemplo_uso}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Expanda seu vocabulário jurídico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Entender a terminologia jurídica é essencial para uma boa formação.
                    Visite nosso dicionário jurídico completo para explorar mais de 2.000 termos.
                  </p>
                  <Button>Ver dicionário completo</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mini-cursos */}
          <TabsContent value="minicursos" className="space-y-6">
            {selectedVideo ? (
              <div className="mb-6">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video">
                      <VideoPlayer videoId={selectedVideo} />
                    </div>
                  </CardContent>
                </Card>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setSelectedVideo(null)}
                >
                  Voltar para lista de vídeos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {introVideos.map(video => (
                  <VideoCard 
                    key={video.id} 
                    video={video}
                    onClick={() => handleVideoSelect(video.videoId)}
                  />
                ))}
              </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Playlists recomendadas para iniciantes</CardTitle>
                <CardDescription>Cursos introdutórios gratuitos disponíveis no YouTube</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span>Introdução ao Direito Constitucional</span>
                    <Button variant="outline" size="sm">Acessar</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Noções de Direito Civil para iniciantes</span>
                    <Button variant="outline" size="sm">Acessar</Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Como funciona o Sistema Judiciário</span>
                    <Button variant="outline" size="sm">Acessar</Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>
                  Dúvidas comuns de quem está iniciando na área jurídica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          {item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Tem uma pergunta específica?</h3>
                  <p className="text-muted-foreground mb-4">
                    Não encontrou resposta para sua dúvida? Use nosso assistente jurídico para obter respostas personalizadas.
                  </p>
                  <Button>Perguntar ao assistente</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Guias Rápidos</CardTitle>
                <CardDescription>Tutoriais práticos para quem está começando</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                    <GraduationCap className="h-8 w-8 mb-2" />
                    <span>Como estudar para a OAB</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                    <BookOpen className="h-8 w-8 mb-2" />
                    <span>Técnicas de leitura jurídica</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 mb-2" />
                    <span>Como resolver questões</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                    <Calendar className="h-8 w-8 mb-2" />
                    <span>Organizando seus estudos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materiais Essenciais */}
          <TabsContent value="materiais" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {essentialMaterials.map((material, index) => (
                <Card key={index} className="overflow-hidden flex flex-col">
                  <div className="flex-1">
                    {material.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={material.imageUrl} 
                          alt={material.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <Book className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                      </div>
                      <CardDescription>{material.author}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{material.description}</p>
                      <Badge className="mt-3" variant="outline">{material.type}</Badge>
                    </CardContent>
                  </div>
                  
                  <div className="p-4 pt-0">
                    <Button variant="outline" className="w-full">
                      {material.type === "Livro" ? "Ver na Biblioteca" : "Acessar"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Montando sua Biblioteca Básica</CardTitle>
                <CardDescription>Sugestões para criar uma biblioteca jurídica essencial para estudantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Como estudante de Direito iniciante, você não precisa investir em muitos livros logo de início.
                    Comece com estes materiais básicos e expanda conforme seu avanço nos estudos.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                    <li>Um bom Vade Mecum atualizado</li>
                    <li>Um livro introdutório de Teoria Geral do Direito</li>
                    <li>Um livro didático de Direito Constitucional</li>
                    <li>Um manual de Direito Civil</li>
                    <li>Acesso a plataformas de questões online</li>
                  </ul>
                  <div className="mt-4">
                    <Button>Ver recomendações completas</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recursos Avançados */}
          <TabsContent value="avancado" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Planner/Cronograma */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Planner de Estudos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Crie um cronograma personalizado para organizar seus estudos jurídicos.
                  </p>
                  <Button className="w-full">Criar meu cronograma</Button>
                </CardContent>
              </Card>
              
              {/* Comunidade */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Comunidade</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Conecte-se com outros estudantes iniciantes e troque experiências.
                  </p>
                  <Button className="w-full">Acessar comunidade</Button>
                </CardContent>
              </Card>
              
              {/* Simulados */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <CardTitle>Simulados Iniciais</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Pratique com simulados de nível básico com explicações detalhadas.
                  </p>
                  <Button className="w-full">Iniciar simulado</Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Desafios diários */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <CardTitle>Desafios Diários</CardTitle>
                </div>
                <CardDescription>
                  Pequenas atividades para praticar diariamente e avançar nos estudos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dailyChallenges.map((challenge, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 bg-card hover:border-primary transition-colors cursor-pointer"
                    >
                      <h3 className="font-medium mb-1">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-primary font-medium">{challenge.points} pontos</span>
                        <span>{challenge.timeEstimate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Histórias de sucesso */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Youtube className="h-5 w-5 text-primary" />
                  <CardTitle>Histórias de Sucesso</CardTitle>
                </div>
                <CardDescription>
                  Depoimentos de pessoas que começaram do zero e conquistaram seu espaço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {successStories.map((story, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        <img 
                          src={`https://img.youtube.com/vi/${story.videoId}/hqdefault.jpg`}
                          alt={story.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Play className="h-12 w-12 text-white opacity-80" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{story.name}</h3>
                        <p className="text-sm text-primary mb-2">{story.achievement}</p>
                        <p className="text-sm text-muted-foreground italic">"{story.quote}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Perfil de Evolução */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Seu Progresso</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Trilhas de estudo</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Termos aprendidos</span>
                      <span className="text-sm font-medium">10/100</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Questões resolvidas</span>
                      <span className="text-sm font-medium">32/200</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "16%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Vídeo-aulas assistidas</span>
                      <span className="text-sm font-medium">5/30</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "16.6%" }}></div>
                    </div>
                  </div>
                  
                  <Button className="w-full">Ver estatísticas completas</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default IniciandoNoDireito;
