
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Search, Calendar, BookOpen, ExternalLink, Share2, ArrowLeft, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

type Noticia = {
  id: number;
  title: string;
  source: string;
  category: string;
  date: string;
  excerpt: string;
  url: string;
  imageUrl: string;
  tags: string[];
  content?: string;
};

const Noticias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("todas");
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  
  // Dados de exemplo para notícias
  const noticiasData: Noticia[] = [
    {
      id: 1,
      title: "STF decide sobre constitucionalidade da Lei de Improbidade Administrativa",
      source: "Supremo Tribunal Federal",
      category: "Jurisprudência",
      date: "20/04/2025",
      excerpt: "Em julgamento histórico, o Supremo Tribunal Federal decidiu sobre a constitucionalidade das alterações realizadas na Lei de Improbidade Administrativa pela Lei nº 14.230/2021.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
      tags: ["STF", "Improbidade", "Constitucional"],
      content: `
# STF decide sobre constitucionalidade da Lei de Improbidade Administrativa

O Supremo Tribunal Federal (STF) concluiu nesta semana o julgamento sobre a constitucionalidade das alterações realizadas na Lei de Improbidade Administrativa (Lei 8.429/1992) pela Lei nº 14.230/2021. A decisão, acompanhada de perto por juristas e gestores públicos, estabelece parâmetros importantes para a aplicação da norma reformada.

## Principais pontos da decisão

Por maioria, o STF decidiu que:

1. É constitucional a exigência de dolo para a configuração do ato de improbidade administrativa;
2. A prescrição intercorrente introduzida pela nova lei é válida, mas não pode ser aplicada retroativamente em processos já em fase de execução;
3. A necessidade de comprovação de enriquecimento ilícito para caracterização de dano ao erário é compatível com a Constituição;
4. A exclusividade do Ministério Público para propor ações de improbidade é inconstitucional, mantendo-se a legitimidade concorrente da pessoa jurídica interessada.

## Impactos práticos

A decisão traz maior segurança jurídica para administradores públicos e para o sistema de justiça, ao definir os contornos da aplicação da Lei de Improbidade após a reforma legislativa de 2021.

"A exigência de dolo para configuração do ato de improbidade fortalece o princípio da responsabilidade subjetiva no direito sancionador, evitando punições por meros erros administrativos sem intenção de lesar o erário", explicou o ministro relator em seu voto.

Por outro lado, a manutenção da legitimidade concorrente para propositura das ações preserva um importante instrumento de controle da administração pública, permitindo que os próprios entes lesados busquem reparação por atos de improbidade.

## Próximos passos

O acórdão deverá ser publicado nas próximas semanas, quando os efeitos da decisão passarão a vincular os demais órgãos do Poder Judiciário e da administração pública. Estima-se que milhares de processos em tramitação no país serão impactados pela decisão do STF.
      `
    },
    {
      id: 2,
      title: "CNJ publica nova resolução sobre audiências virtuais no pós-pandemia",
      source: "Conselho Nacional de Justiça",
      category: "Legislação",
      date: "19/04/2025",
      excerpt: "O Conselho Nacional de Justiça publicou nova resolução que regulamenta a realização de audiências virtuais no cenário pós-pandemia, estabelecendo diretrizes permanentes.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070",
      tags: ["CNJ", "Audiências", "Virtual"],
      content: `
# CNJ publica nova resolução sobre audiências virtuais no pós-pandemia

O Conselho Nacional de Justiça (CNJ) publicou nesta semana uma nova resolução que regulamenta a realização de audiências virtuais no cenário pós-pandemia, estabelecendo diretrizes permanentes para a utilização dessa modalidade em todos os ramos do Poder Judiciário.

## Principais diretrizes da resolução

A nova normativa estabelece que:

1. As audiências por videoconferência passam a ser uma opção permanente, não limitada a situações emergenciais;
2. Os tribunais devem disponibilizar salas equipadas para permitir o acesso de partes que não dispõem de recursos tecnológicos;
3. A oitiva de testemunhas vulneráveis terá tratamento específico, com preferência para o formato virtual quando isso representar proteção adicional;
4. Audiências de custódia seguem preferencialmente presenciais, conforme jurisprudência do STF;
5. Cada tribunal deverá desenvolver plano de inclusão digital para garantir acesso à justiça.

## Reações e expectativas

A medida foi recebida com aprovação pela maioria dos operadores do Direito, que enxergam a permanência do modelo virtual como um avanço para a eficiência do Judiciário.

"A possibilidade de realizar audiências por videoconferência reduz custos, agiliza procedimentos e facilita a participação de todos os envolvidos, sobretudo em comarcas distantes", afirmou a presidente da Associação dos Magistrados Brasileiros.

Já a Ordem dos Advogados do Brasil manifestou preocupação com a possibilidade de exclusão digital, mas reconheceu os avanços da resolução ao prever mecanismos de inclusão.

## Implementação gradual

A resolução entra em vigor em 90 dias, período durante o qual os tribunais deverão adequar suas estruturas e normativos internos às novas diretrizes do CNJ.

Estima-se que, com a medida, o número de adiamentos de audiências poderá ser reduzido em até 40%, segundo dados preliminares do próprio Conselho.
      `
    },
    {
      id: 3,
      title: "Aprovado projeto de lei que altera regras do processo trabalhista",
      source: "Câmara dos Deputados",
      category: "Legislativo",
      date: "18/04/2025",
      excerpt: "A Câmara dos Deputados aprovou projeto de lei que altera diversos dispositivos da Consolidação das Leis do Trabalho (CLT) relativos ao processo do trabalho.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
      tags: ["Trabalhista", "CLT", "Reforma"],
      content: `
# Aprovado projeto de lei que altera regras do processo trabalhista

A Câmara dos Deputados aprovou na última sessão plenária o Projeto de Lei 4.257/2024, que altera diversos dispositivos da Consolidação das Leis do Trabalho (CLT) relativos ao processo do trabalho. O texto, que segue agora para apreciação do Senado Federal, traz mudanças significativas em procedimentos recursais e na execução trabalhista.

## Principais mudanças aprovadas

Entre as principais alterações do projeto estão:

1. Ampliação do cabimento do recurso de revista, permitindo sua interposição em casos de ofensa à jurisprudência consolidada do TST;
2. Criação de novo procedimento para execução de créditos trabalhistas, privilegiando meios eletrônicos;
3. Estabelecimento de limite para bloqueio de valores em contas de empresas, fixado em 5% do faturamento mensal;
4. Modificação no sistema de custas e honorários periciais, com novas regras para beneficiários da justiça gratuita;
5. Regulamentação do processo judicial eletrônico na Justiça do Trabalho.

## Posicionamentos divergentes

A votação foi marcada por intenso debate. O relator do projeto defendeu que as mudanças "modernizam o processo trabalhista e garantem maior segurança jurídica". Já a oposição criticou as alterações como "retrocesso nos direitos dos trabalhadores" e "privilégio aos interesses empresariais".

Entidades representativas também se manifestaram: a Confederação Nacional da Indústria considerou o projeto "equilibrado e necessário", enquanto centrais sindicais divulgaram nota conjunta apontando "riscos de esvaziamento da efetividade da Justiça do Trabalho".

## Próximos passos

O texto segue agora para o Senado Federal, onde deve ser analisado pelas comissões temáticas antes de ir a plenário. A expectativa é que a tramitação seja concluída ainda neste ano legislativo.

Caso aprovado sem alterações pelo Senado, o projeto seguirá para sanção presidencial. Se houver modificações, retornará à Câmara para nova análise.
      `
    },
    {
      id: 4,
      title: "OAB manifesta preocupação com PEC que limita decisões monocráticas",
      source: "Ordem dos Advogados do Brasil",
      category: "Institucional",
      date: "17/04/2025",
      excerpt: "A Ordem dos Advogados do Brasil manifestou preocupação com a Proposta de Emenda Constitucional que limita as decisões monocráticas dos ministros do STF.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1593115057322-e94b77572f20?q=80&w=2071",
      tags: ["OAB", "PEC", "STF"],
      content: `
# OAB manifesta preocupação com PEC que limita decisões monocráticas

O Conselho Federal da Ordem dos Advogados do Brasil (OAB) emitiu nesta semana uma nota técnica manifestando preocupação com a Proposta de Emenda Constitucional (PEC) 8/2025, que busca limitar o alcance das decisões monocráticas proferidas pelos ministros do Supremo Tribunal Federal (STF) e de outros tribunais superiores.

## Pontos críticos apontados pela OAB

Na análise divulgada pela entidade, são destacados como preocupantes:

1. A proibição total de concessão de liminares monocráticas em ações de controle de constitucionalidade;
2. A obrigatoriedade de referendo colegiado em até 24 horas para medidas urgentes concedidas individualmente;
3. A vedação de suspensão de eficácia de leis por decisão individual;
4. Limitações específicas em decisões contra atos dos presidentes da República, do Senado e da Câmara.

## Argumentos da Ordem

Segundo o presidente da OAB, "embora a entidade reconheça a importância do princípio da colegialidade, a proposta, da forma como está redigida, pode comprometer a celeridade e a efetividade da prestação jurisdicional em casos urgentes."

A nota técnica destaca ainda que "em situações de grave risco de dano irreparável ou de perecimento de direito, a impossibilidade de concessão de medidas liminares monocráticas pode representar, na prática, a negação do acesso à justiça."

## Repercussão e contrapontos

Parlamentares defensores da PEC argumentam que a proposta visa "reequilibrar os poderes da República" e "evitar ativismo judicial". Já juristas alinhados à posição da OAB alertam para riscos de "engessamento do Judiciário" e "demora na proteção de direitos fundamentais".

O debate promete intensificar-se nas próximas semanas, com a previsão de audiências públicas no Congresso Nacional para discutir a proposta.
      `
    },
    {
      id: 5,
      title: "STJ firma tese sobre prazo prescricional em ações de responsabilidade civil",
      source: "Superior Tribunal de Justiça",
      category: "Jurisprudência",
      date: "16/04/2025",
      excerpt: "Em julgamento sob o rito dos recursos repetitivos, o Superior Tribunal de Justiça fixou tese sobre o prazo prescricional aplicável às ações de responsabilidade civil.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070",
      tags: ["STJ", "Prescrição", "Civil"],
      content: `
# STJ firma tese sobre prazo prescricional em ações de responsabilidade civil

A Segunda Seção do Superior Tribunal de Justiça (STJ) fixou, em julgamento realizado sob o rito dos recursos repetitivos, tese jurídica sobre o prazo prescricional aplicável às ações de responsabilidade civil decorrentes de ilícitos contratuais. A decisão, tomada no REsp 1.987.654/SP, deverá ser aplicada a cerca de 4.500 processos que estavam sobrestados aguardando o posicionamento da Corte.

## A tese firmada

Por unanimidade, o colegiado definiu que:

"Nas ações de responsabilidade civil fundamentadas em descumprimento contratual, aplica-se o prazo prescricional de 10 (dez) anos previsto no artigo 205 do Código Civil quando a pretensão envolver apenas o ressarcimento de danos materiais, e o prazo de 3 (três) anos do artigo 206, § 3º, V, do mesmo código, quando a pretensão incluir danos extrapatrimoniais ou quando estes forem pleiteados isoladamente."

## Fundamentação da decisão

O relator do caso, em seu voto, destacou que "a distinção estabelecida visa harmonizar a jurisprudência da Corte e conferir tratamento adequado às diferentes naturezas de danos que podem decorrer do inadimplemento contratual."

Segundo ele, "os danos exclusivamente patrimoniais mantêm relação direta com a natureza da relação contratual, justificando a aplicação do prazo geral. Já os danos extrapatrimoniais, por sua própria natureza, aproximam-se da responsabilidade aquiliana, atraindo o prazo específico."

## Impactos práticos

A decisão traz importantes consequências práticas:

1. Unifica-se o entendimento que estava dividido entre as turmas do STJ;
2. Cria-se critério objetivo baseado na natureza do dano pleiteado;
3. Estabelece-se segurança jurídica para advogados e jurisdicionados;
4. Permite o dessobrestamento dos milhares de processos que aguardavam definição.

Para o presidente da comissão de direito civil do IBDFAM, "a tese adotada pelo STJ representa um importante avanço para a segurança jurídica, permitindo que advogados possam orientar adequadamente seus clientes quanto ao prazo para ajuizamento das ações."
      `
    },
    {
      id: 6,
      title: "Sancionada lei que altera o Código Penal em crimes contra a administração pública",
      source: "Presidência da República",
      category: "Legislação",
      date: "15/04/2025",
      excerpt: "O Presidente da República sancionou lei que altera o Código Penal, tornando mais rigorosas as penas para crimes contra a administração pública.",
      url: "#",
      imageUrl: "https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=2069",
      tags: ["Penal", "Corrupção", "Lei"],
      content: `
# Sancionada lei que altera o Código Penal em crimes contra a administração pública

O Presidente da República sancionou nesta quarta-feira a Lei 14.890/2025, que altera dispositivos do Código Penal relativos aos crimes contra a administração pública. A nova legislação, originada do Projeto de Lei 3.524/2022, torna mais rigorosas as penas para diversos delitos e cria novas figuras penais específicas.

## Principais alterações

A lei sancionada traz as seguintes modificações:

1. **Aumento de penas**: Crimes como peculato, concussão e corrupção passiva e ativa terão penas mínimas elevadas de 2 para 4 anos de reclusão, enquanto as máximas sobem de 12 para 16 anos;

2. **Novas qualificadoras**: Estabelece-se aumento de pena de 1/3 até metade se o crime for praticado por ocupante de cargo eletivo ou em comando de estruturas administrativas;

3. **Novos tipos penais**: Criação dos crimes de "enriquecimento ilícito" e "gestão fraudulenta de contratos públicos";

4. **Prescrição**: Os prazos prescricionais para crimes contra a administração pública são ampliados em um terço;

5. **Efeitos da condenação**: Perda do cargo, função ou mandato eletivo passa a ser efeito automático da condenação por crime contra a administração pública, independentemente da pena aplicada.

## Contexto e justificativas

A sanção ocorre em meio a debates sobre o combate à corrupção e eficiência da máquina pública. Na cerimônia de sanção, o Presidente afirmou que "esta lei representa um compromisso inegociável com a integridade na gestão pública e o uso correto dos recursos dos cidadãos."

O texto teve apoio amplo no Congresso Nacional, sendo aprovado com placar expressivo tanto na Câmara quanto no Senado, evidenciando convergência de posições políticas diversas em torno do tema.

## Vigência e aplicação

A lei entra em vigor após 60 dias de sua publicação oficial, que ocorrerá na edição do Diário Oficial da União de amanhã. Por se tratar de lei penal mais gravosa, as novas disposições não retroagirão para alcançar fatos anteriores à sua vigência.

O Conselho Nacional de Justiça já anunciou que promoverá eventos de capacitação para magistrados sobre as alterações introduzidas pela nova legislação.
      `
    }
  ];

  // Categorias para filtro
  const categorias = ["todas", "jurisprudência", "legislação", "legislativo", "institucional"];

  const filteredNoticias = noticiasData.filter(noticia => 
    (activeCategory === "todas" || noticia.category.toLowerCase() === activeCategory) &&
    (
      noticia.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noticia.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noticia.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedNoticia ? (
          <motion.div 
            key="article-detail"
            className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b p-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedNoticia(null)}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 text-center truncate mx-2">
                <p className="text-sm font-medium">Notícias Jurídicas</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedNoticia(null)}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-4 max-w-3xl mx-auto">
                <div 
                  className="h-56 w-full bg-cover bg-center rounded-lg mb-6" 
                  style={{ backgroundImage: `url(${selectedNoticia.imageUrl})` }}
                />
                
                <Badge variant="outline" className="mb-2">{selectedNoticia.category}</Badge>
                <h1 className="text-2xl font-bold mb-2">{selectedNoticia.title}</h1>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <span>{selectedNoticia.source}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {selectedNoticia.date}
                  </span>
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  {selectedNoticia.content?.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold my-4">{paragraph.substring(2)}</h1>;
                    } else if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-bold my-3">{paragraph.substring(3)}</h2>;
                    } else if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-bold my-2">{paragraph.substring(4)}</h3>;
                    } else {
                      return <p key={index} className="my-3">{paragraph}</p>;
                    }
                  })}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-8 mb-4">
                  {selectedNoticia.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between border-t pt-4 mt-6 mb-8">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <BookOpen className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        ) : (
          <motion.div 
            key="news-list"
            className="container mx-auto py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center mb-8">
              <div className="mb-6">
                <Newspaper className="h-12 w-12 text-primary mx-auto mb-2" />
                <h1 className="text-2xl font-bold text-center mb-1">Notícias Jurídicas</h1>
                <p className="text-muted-foreground text-center">
                  Acompanhe as principais novidades do mundo jurídico
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Buscar notícias, temas, tribunais ou palavras-chave..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="w-full whitespace-nowrap pb-4 mb-4">
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="bg-transparent h-10 flex w-full justify-start overflow-x-auto px-0">
                  {categorias.map(categoria => (
                    <TabsTrigger 
                      key={categoria} 
                      value={categoria}
                      className="px-4 py-2 capitalize"
                    >
                      {categoria}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </ScrollArea>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNoticias.map(noticia => (
                <motion.div 
                  key={noticia.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden h-full flex flex-col">
                    <div 
                      className="h-40 w-full bg-cover bg-center" 
                      style={{ backgroundImage: `url(${noticia.imageUrl})` }}
                    />
                    <CardHeader>
                      <div className="flex gap-2 mb-2">
                        <Badge variant="outline">{noticia.category}</Badge>
                        <Badge variant="secondary" className="text-xs">{noticia.source}</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">{noticia.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {noticia.date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{noticia.excerpt}</p>
                      <div className="flex flex-wrap gap-1">
                        {noticia.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => setSelectedNoticia(noticia)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Ler mais
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredNoticias.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma notícia encontrada com os critérios atuais.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("todas");
                  }}
                >
                  Limpar busca
                </Button>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <Button variant="outline">Carregar mais notícias</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Noticias;
