
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookmarkPlus, MessageSquare } from "lucide-react";
import { YouTubeVideo } from "@/lib/youtube-service";

interface VideoPlayerProps {
  video: YouTubeVideo;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
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
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={onClose}>
          Voltar para lista de vídeos
        </Button>
        <div className="flex gap-2">
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
          >
            <BookmarkPlus className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="video-container w-full">
              <iframe
                ref={playerRef}
                width="100%"
                height={playerHeight}
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              ></iframe>
            </div>
            <CardContent className="p-4">
              <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <span className="mr-4">{video.channelTitle}</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{video.duration}</span>
                </div>
              </div>
              <p className="text-sm whitespace-pre-line">{video.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className={`${showNotes ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-3">Minhas anotações</h3>
              <Textarea
                className="min-h-[300px] bg-background"
                placeholder="Digite suas anotações sobre este vídeo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Limpar
                </Button>
                <Button size="sm">
                  Salvar anotações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
