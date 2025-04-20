
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookmarkPlus, MessageSquare } from "lucide-react";
import { type YouTubeVideo } from "@/lib/youtube-service";

interface VideoPlayerProps {
  videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
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
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {showNotes ? "Ocultar notas" : "Mostrar notas"}
        </Button>
      </div>
    </div>
  );
}
