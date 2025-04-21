
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, BookAudio, FileText, User2, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

type UserLivroInfo = {
  favorito: boolean;
  lido: boolean;
  progresso_leitura: number;
  anotacoes: string | null;
};

type BookModalProps = {
  livro: Livro;
  onClose: () => void;
  onRead: () => void;
  userId?: string | null;
}

export function BookModal({ livro, onClose, onRead, userId }: BookModalProps) {
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const [userLivroInfo, setUserLivroInfo] = useState<UserLivroInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserLivroInfo();
    }
  }, [userId, livro.id]);

  async function fetchUserLivroInfo() {
    try {
      const { data, error } = await supabase
        .from('user_biblioteca')
        .select('*')
        .eq('user_id', userId)
        .eq('livro_id', livro.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setUserLivroInfo({
          favorito: data.favorito || false,
          lido: data.lido || false,
          progresso_leitura: data.progresso_leitura || 0,
          anotacoes: data.anotacoes
        });
      } else {
        setUserLivroInfo({
          favorito: false,
          lido: false,
          progresso_leitura: 0,
          anotacoes: null
        });
      }
    } catch (error) {
      console.error('Error fetching user book info:', error);
    }
  }

  async function toggleFavorite() {
    if (!userId) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar livros.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newFavoriteState = !(userLivroInfo?.favorito || false);
      
      const { data, error } = await supabase
        .from('user_biblioteca')
        .upsert({
          user_id: userId,
          livro_id: livro.id,
          favorito: newFavoriteState,
          lido: userLivroInfo?.lido || false,
          progresso_leitura: userLivroInfo?.progresso_leitura || 0,
          anotacoes: userLivroInfo?.anotacoes || null
        })
        .select();

      if (error) throw error;
      
      setUserLivroInfo({
        ...userLivroInfo || {
          lido: false,
          progresso_leitura: 0,
          anotacoes: null
        },
        favorito: newFavoriteState
      });

      toast({
        title: newFavoriteState ? "Livro favoritado" : "Livro removido dos favoritos",
        description: livro.titulo,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro ao favoritar",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

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

  async function handleMarkAsRead() {
    if (!userId) {
      toast({
        title: "Login necessário",
        description: "Faça login para marcar livros como lidos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newReadState = !(userLivroInfo?.lido || false);
      
      const { data, error } = await supabase
        .from('user_biblioteca')
        .upsert({
          user_id: userId,
          livro_id: livro.id,
          favorito: userLivroInfo?.favorito || false,
          lido: newReadState,
          progresso_leitura: newReadState ? 100 : userLivroInfo?.progresso_leitura || 0,
          anotacoes: userLivroInfo?.anotacoes || null
        })
        .select();

      if (error) throw error;
      
      setUserLivroInfo({
        ...userLivroInfo || {
          favorito: false,
          progresso_leitura: newReadState ? 100 : 0,
          anotacoes: null
        },
        lido: newReadState
      });

      toast({
        title: newReadState ? "Livro marcado como lido" : "Livro marcado como não lido",
        description: livro.titulo,
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

          {userId && (
            <div className="mt-4 flex flex-col gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={toggleFavorite}
                disabled={isLoading}
              >
                <Bookmark 
                  size={16} 
                  className={`mr-2 ${userLivroInfo?.favorito ? "fill-yellow-400 text-yellow-400" : ""}`} 
                />
                {userLivroInfo?.favorito ? "Remover favorito" : "Favoritar"}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleMarkAsRead}
                disabled={isLoading}
              >
                <BookOpen size={16} className="mr-2" />
                {userLivroInfo?.lido ? "Marcar como não lido" : "Marcar como lido"}
              </Button>
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
