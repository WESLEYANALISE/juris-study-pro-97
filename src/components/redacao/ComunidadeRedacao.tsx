
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, Share2, Flag, Search, Send } from "lucide-react";

export const ComunidadeRedacao = () => {
  const [activeTab, setActiveTab] = useState("forum");
  
  // Dados de exemplo para a comunidade
  const publicacoes = [
    {
      id: "1",
      autor: {
        nome: "Maria Silva",
        avatar: "",
        nivel: "Avançado"
      },
      titulo: "Dúvida sobre formatação de petição inicial",
      conteudo: "Olá colegas! Estou com dificuldade para formatar corretamente a seção de pedidos em uma petição inicial. Alguém poderia compartilhar um exemplo de como organizar múltiplos pedidos de forma clara e objetiva?",
      tags: ["Petição Inicial", "Formatação"],
      data: "Há 2 dias",
      curtidas: 12,
      comentarios: 8
    },
    {
      id: "2",
      autor: {
        nome: "Carlos Mendes",
        avatar: "",
        nivel: "Intermediário"
      },
      titulo: "Como melhorar argumentação em contestações?",
      conteudo: "Percebi que minhas contestações estão muito repetitivas e com argumentação fraca. Quais técnicas vocês utilizam para estruturar melhor os argumentos? Alguma dica de leitura ou método específico?",
      tags: ["Contestação", "Argumentação"],
      data: "Há 4 dias",
      curtidas: 24,
      comentarios: 15
    }
  ];
  
  const comentarios = [
    {
      id: "c1",
      publicacaoId: "1",
      autor: {
        nome: "Pedro Alves",
        avatar: "",
        nivel: "Avançado"
      },
      conteudo: "Maria, uma boa prática é enumerar os pedidos em tópicos, utilizando letras (a, b, c...) e mantendo uma sequência lógica. Começo sempre com o pedido principal e depois os acessórios. Além disso, use parágrafos curtos e evite subordinações excessivas.",
      data: "Há 1 dia",
      curtidas: 5
    },
    {
      id: "c2",
      publicacaoId: "1",
      autor: {
        nome: "Ana Luiza",
        avatar: "",
        nivel: "Intermediário"
      },
      conteudo: "Complementando o que o Pedro disse, recomendo usar negrito apenas nos pontos principais de cada pedido, isso facilita a leitura pelo magistrado. Também é importante alinhar os pedidos com a causa de pedir exposta anteriormente.",
      data: "Há 12 horas",
      curtidas: 3
    }
  ];

  // Publicação expandida
  const [publicacaoAtual, setPublicacaoAtual] = useState<any>(null);
  // Comentário sendo escrito
  const [novoComentario, setNovoComentario] = useState("");

  const handleEnviarComentario = () => {
    if (!novoComentario.trim()) return;
    // Lógica para adicionar comentário
    alert("Comentário enviado!");
    setNovoComentario("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium">Comunidade de Redação Jurídica</h3>
          <p className="text-sm text-muted-foreground">
            Troque experiências, tire dúvidas e aprenda com outros profissionais
          </p>
        </div>
        <Button>Nova Publicação</Button>
      </div>

      <div className="flex items-center max-w-md mx-auto mb-4">
        <Input 
          placeholder="Buscar na comunidade..." 
          className="rounded-r-none focus:ring-0 border-r-0" 
        />
        <Button variant="default" size="icon" className="rounded-l-none h-10 px-3">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="forum">Fórum de Dúvidas</TabsTrigger>
          <TabsTrigger value="compartilhamentos">Compartilhamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="space-y-4">
          {publicacoes.map((publicacao) => (
            <Card key={publicacao.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={publicacao.autor.avatar} />
                      <AvatarFallback>{publicacao.autor.nome.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{publicacao.autor.nome}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {publicacao.data}
                        <Badge variant="outline" className="text-xs">{publicacao.autor.nivel}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {publicacao.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{publicacao.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{publicacao.conteudo}</p>
              </CardContent>
              <CardFooter className="flex justify-between py-2 bg-muted/50">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{publicacao.curtidas}</span>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-1 h-8"
                        onClick={() => setPublicacaoAtual(publicacao)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{publicacao.comentarios}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      {publicacaoAtual && (
                        <>
                          <DialogHeader>
                            <DialogTitle>{publicacaoAtual.titulo}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="mt-4">
                            <div className="flex items-start space-x-2 mb-4">
                              <Avatar>
                                <AvatarFallback>{publicacaoAtual.autor.nome.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{publicacaoAtual.autor.nome}</div>
                                  <span className="text-xs text-muted-foreground">{publicacaoAtual.data}</span>
                                </div>
                                <Badge variant="outline" className="text-xs mt-1">{publicacaoAtual.autor.nivel}</Badge>
                                <p className="mt-2">{publicacaoAtual.conteudo}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  {publicacaoAtual.tags.map((tag: string, i: number) => (
                                    <Badge key={i} variant="secondary">{tag}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <h4 className="font-medium mb-4">{comentarios.filter(c => c.publicacaoId === publicacaoAtual.id).length} Comentários</h4>
                            
                            <div className="space-y-4">
                              {comentarios
                                .filter(c => c.publicacaoId === publicacaoAtual.id)
                                .map((comentario) => (
                                  <div key={comentario.id} className="flex items-start space-x-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback>{comentario.autor.nome.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-muted p-3 rounded-md">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium">{comentario.autor.nome}</div>
                                        <span className="text-xs text-muted-foreground">{comentario.data}</span>
                                      </div>
                                      <p className="text-sm mt-1">{comentario.conteudo}</p>
                                      <div className="flex items-center space-x-2 mt-2">
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                          <ThumbsUp className="h-3 w-3 mr-1" />
                                          {comentario.curtidas}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                          Responder
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 flex items-start space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>EU</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <Textarea 
                                  placeholder="Escreva um comentário..." 
                                  value={novoComentario}
                                  onChange={(e) => setNovoComentario(e.target.value)}
                                  className="min-h-[100px]"
                                />
                                <div className="flex justify-end mt-2">
                                  <Button 
                                    size="sm" 
                                    onClick={handleEnviarComentario}
                                    disabled={!novoComentario.trim()}
                                  >
                                    <Send className="h-4 w-4 mr-1" />
                                    Enviar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-8">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartilhar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8">
                    <Flag className="h-4 w-4 mr-1" />
                    Reportar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          <div className="flex justify-center mt-4">
            <Button variant="outline">Carregar mais</Button>
          </div>
        </TabsContent>

        <TabsContent value="compartilhamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compartilhamentos</CardTitle>
              <CardDescription>
                Compartilhe suas redações para receber feedback da comunidade
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">
                Esta funcionalidade estará disponível em breve!
              </p>
              <Button variant="outline" className="mt-4">
                Seja notificado quando disponível
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
