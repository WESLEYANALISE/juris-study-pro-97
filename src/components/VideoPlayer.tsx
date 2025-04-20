
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookmarkPlus, MessageSquare, FileText, Brain, Send, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VideoPlayerProps {
  videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showAITools, setShowAITools] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  // Calcular a altura do player com base na largura (proporção 16:9)
  const calculatePlayerHeight = () => {
    const containerWidth = document.querySelector(".video-container")?.clientWidth || 640;
    return (containerWidth * 9) / 16;
  };

  const [playerHeight, setPlayerHeight] = useState(calculatePlayerHeight());

  // Atualizar a altura do player quando a janela for redimensionada
  useEffect(() => {
    const handleResize = () => {
      setPlayerHeight(calculatePlayerHeight());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full">
      <div className="video-container w-full">
        <iframe
          ref={playerRef}
          width="100%"
          height={playerHeight}
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="border-0"
        ></iframe>
      </div>
      
      <div className="flex justify-end mt-4 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {showNotes ? "Ocultar notas" : "Mostrar notas"}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAITools(!showAITools)}
        >
          <Brain className="h-4 w-4 mr-2" />
          {showAITools ? "Ocultar IA" : "Ferramentas IA"}
        </Button>
      </div>
      
      {showNotes && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-3">Minhas anotações</h3>
            <Textarea
              className="min-h-[150px] bg-background"
              placeholder="Digite suas anotações sobre este vídeo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setNotes("")}>
                Limpar
              </Button>
              <Button size="sm">
                Salvar anotações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showAITools && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <Tabs defaultValue="resumo">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
                <TabsTrigger value="mapa">Mapa Mental</TabsTrigger>
                <TabsTrigger value="duvidas">Dúvidas</TabsTrigger>
                <TabsTrigger value="enviar">Enviar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resumo">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Gerar resumo do vídeo</h3>
                  <p className="text-sm text-muted-foreground">Nossa IA irá analisar o conteúdo deste vídeo e gerar um resumo detalhado dos principais pontos abordados.</p>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar resumo
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="mapa">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Criar mapa mental</h3>
                  <p className="text-sm text-muted-foreground">A IA irá organizar o conteúdo do vídeo em um mapa mental para facilitar seus estudos.</p>
                  <Button>
                    <Brain className="h-4 w-4 mr-2" />
                    Criar mapa mental
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="duvidas">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tire suas dúvidas</h3>
                  <p className="text-sm text-muted-foreground">Digite sua pergunta sobre o conteúdo deste vídeo:</p>
                  <Textarea placeholder="Qual é o conceito principal abordado neste vídeo?" />
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar pergunta
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="enviar">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Enviar por email</h3>
                  <p className="text-sm text-muted-foreground">Receba o resumo e o mapa mental no seu email:</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
