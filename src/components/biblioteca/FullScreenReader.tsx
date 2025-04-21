
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Music } from "lucide-react";
import RelaxMusicPlayer from "./RelaxMusicPlayer";

interface FullScreenReaderProps {
  bookTitle?: string | null;
  link?: string | null;
  onExit: () => void;
}

const FullScreenReader: React.FC<FullScreenReaderProps> = ({
  bookTitle,
  link,
  onExit
}) => {
  const [showPlayer, setShowPlayer] = useState(false);

  // Ajusta body para esconder overflow (plantão mobile)
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Garantir que realmente remova todos os elementos da tela exceto a leitura + botão
  return (
    <div className="fixed inset-0 bg-background z-[50] flex flex-col items-stretch overflow-auto">
      <div className="flex items-center justify-between p-2 bg-background/90 border-b">
        <span className="font-semibold text-lg truncate">{bookTitle}</span>
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="Fechar leitura" className="rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {link ? (
          <iframe
            src={link}
            className="w-full h-full min-h-[65vh] sm:min-h-[75vh] rounded-none border-0"
            title={bookTitle || "Leitura"}
            style={{ background: "#17171b" }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Link de leitura não disponível para este livro.</p>
          </div>
        )}
      </div>
      {/* Botão flutuante na base do mobile/desktop */}
      <div className="fixed bottom-4 right-0 left-0 flex justify-center z-[60] pointer-events-none">
        <Button
          className="pointer-events-auto bg-primary text-white shadow-lg font-semibold rounded-full flex items-center gap-2 px-6 py-2"
          style={{ boxShadow: "0 2px 12px 2px rgba(94,66,150,0.15)" }}
          size="lg"
          onClick={() => setShowPlayer(v => !v)}
        >
          <Music className="w-5 h-5" />
          Relaxar com música
        </Button>
      </div>
      <RelaxMusicPlayer open={showPlayer} onClose={() => setShowPlayer(false)} />
    </div>
  );
};

export default FullScreenReader;
