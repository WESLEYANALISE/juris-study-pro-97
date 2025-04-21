
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, BookAudio, FileText, User2 } from "lucide-react";

type Livro = {
  id: string;
  titulo: string;
  autor: string | null;
  editora: string | null;
  area: string;
  ano_publicacao: number | null;
  capa_url: string | null;
  sinopse: string | null;
  link_leitura: string | null;
  link_download: string | null;
  tags: string[] | null;
};

type BookModalProps = {
  livro: Livro;
  onClose: () => void;
  onRead: () => void;
}

export function BookModal({ livro, onClose, onRead }: BookModalProps) {
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);

  async function handleNarra() {
    setTtsLoading(true);
    setTtsUrl(null);
    try {
      // Google TTS API por fetch direto (SOMENTE PARA DEMO NO BROWSER, NÃO USAR EM PRODUÇÃO)
      const resp = await fetch(
        "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyBCPCIV9jUxa4sD6TrlR74q3KTKqDZjoT8",
        {
          method: "POST",
          body: JSON.stringify({
            input: { text: livro.sinopse?.slice(0, 250) || livro.titulo || "Sem texto" },
            voice: {
              languageCode: "pt-BR",
              name: "pt-BR-Wavenet-A",
              ssmlGender: "NEUTRAL"
            },
            audioConfig: { audioEncoding: "MP3" }
          }),
          headers: { "Content-Type": "application/json" }
        }
      );
      const data = await resp.json();
      setTtsUrl(data.audioContent ? `data:audio/mp3;base64,${data.audioContent}` : null);
    } finally {
      setTtsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="flex gap-6 p-6">
        <div className="w-1/3 max-w-[180px]">
          {livro.capa_url ? (
            <div className="w-full aspect-[2/3] relative rounded-md overflow-hidden shadow-lg">
              <img
                src={livro.capa_url}
                alt={livro.titulo}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 flex items-end">
                <div className="p-3 w-full">
                  <h3 className="font-semibold text-sm text-white">{livro.titulo}</h3>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-800 rounded-md overflow-hidden shadow-lg flex items-end">
              <div className="p-3 w-full">
                <h3 className="font-semibold text-sm text-white">{livro.titulo}</h3>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col">
          <h2 className="font-bold text-xl mb-1">{livro.titulo}</h2>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {livro.area}
            </Badge>
            {livro.autor && (
              <Badge variant="secondary" className="text-xs">
                <User2 className="h-3 w-3 mr-1" /> {livro.autor}
              </Badge>
            )}
            {livro.ano_publicacao && (
              <Badge variant="secondary" className="text-xs">
                {livro.ano_publicacao}
              </Badge>
            )}
            {livro.editora && (
              <Badge variant="secondary" className="text-xs">
                {livro.editora}
              </Badge>
            )}
          </div>
          
          <div className="text-sm mb-4 overflow-y-auto max-h-[200px] pr-2">
            {livro.sinopse || (
              <span className="text-muted-foreground italic">Nenhuma sinopse disponível</span>
            )}
          </div>
          
          {livro.tags && livro.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {livro.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 mt-auto flex-wrap">
            <Button size="sm" onClick={onRead} disabled={!livro.link_leitura}>
              <BookOpen size={16} className="mr-1" /> Ler Agora
            </Button>
            {livro.link_download && (
              <Button
                size="sm"
                variant="secondary"
                asChild
              >
                <a href={livro.link_download} target="_blank" rel="noopener noreferrer">
                  <Download size={16} className="mr-1" /> Download
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNarra}
              disabled={ttsLoading}
            >
              <BookAudio size={16} className="mr-1" /> Narração
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => alert("Funcionalidade de anotações em breve.")}
            >
              <FileText size={16} className="mr-1" /> Anotações
            </Button>
          </div>
          {ttsLoading && (
            <div className="text-xs mt-2 text-muted-foreground">Gerando áudio…</div>
          )}
          {ttsUrl && (
            <audio className="mt-2 w-full" controls src={ttsUrl} autoPlay />
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </CardFooter>
    </Card>
  );
}
