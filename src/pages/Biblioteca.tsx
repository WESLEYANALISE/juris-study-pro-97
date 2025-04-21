
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookAudio, Download, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";

type Livro = {
  id: number;
  area: string | null;
  livro: string | null;
  link: string | null;
  imagem: string | null;
  sobre: string | null;
  download: string | null;
};

type State =
  | { mode: "carousel" }
  | { mode: "list" }
  | { mode: "reading"; livro: Livro }
  | { mode: "modal"; livro: Livro };

export default function Biblioteca() {
  const [state, setState] = useState<State>({ mode: "carousel" });
  const [searchTerm, setSearchTerm] = useState("");
  const [aiDialog, setAiDialog] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState<Livro[] | null>(null);
  const { data: livros, isLoading } = useQuery({
    queryKey: ["biblioteca"],
    queryFn: async () => {
      const { data } = await supabase.from("biblioteca_juridica").select("*");
      return (data ?? []) as Livro[];
    }
  });

  // Filtro para barra de pesquisa
  const filteredLivros = useMemo(() => {
    if (!livros) return [];
    if (!searchTerm) return livros;
    return livros.filter((livro) =>
      (livro.livro || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, livros]);

  // Autocomplete para pesquisa
  const autocompleteTitles = useMemo(
    () =>
      Array.from(
        new Set(
          (livros ?? [])
            .map((l) => l.livro)
            .filter(Boolean)
            .filter((nome) =>
              nome!.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
      ),
    [livros, searchTerm]
  );

  // IA Ajuda
  async function handleAIHelp() {
    if (!aiQuery.trim()) return;
    setAiResult(["buscando"] as any); // placeholder
    // Simulação IA: encontra primeiro(s) livros cujos títulos, áreas ou sinopses batam com tema
    if (livros) {
      const res = livros.filter(
        (l) =>
          (l.area ?? "")
            .toLowerCase()
            .includes(aiQuery.toLowerCase()) ||
          (l.livro ?? "")
            .toLowerCase()
            .includes(aiQuery.toLowerCase()) ||
          (l.sobre ?? "")
            .toLowerCase()
            .includes(aiQuery.toLowerCase())
      );
      setAiResult(res);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex-1 flex flex-col gap-2">
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar livro..."
              className="pr-20"
              list="autocomplete-titulos"
            />
            <datalist id="autocomplete-titulos">
              {autocompleteTitles.map((title, i) => (
                <option key={i} value={title ?? ""} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setState(
                state.mode === "carousel" ? { mode: "list" } : { mode: "carousel" }
              )
            }
          >
            {state.mode === "carousel" ? (
              <>
                <ArrowRight className="mr-1" size={16} /> Ver Lista
              </>
            ) : (
              <>
                <ArrowLeft className="mr-1" size={16} /> Ver Carousel
              </>
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAiDialog(true)}>
            Ajuda IA
          </Button>
        </div>
      </div>
      {/* Lista ou carousel de livros */}
      {isLoading ? (
        <div className="text-center py-20">Carregando…</div>
      ) : state.mode === "carousel" ? (
        <Carousel className="w-full">
          <CarouselContent>
            {filteredLivros.map(livro => (
              <CarouselItem
                key={livro.id}
                className="basis-1/2 lg:basis-1/4"
                onClick={() => setState({ mode: "modal", livro })}
              >
                <BookCard livro={livro} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : state.mode === "list" ? (
        <div className="grid md:grid-cols-3 gap-5">
          {filteredLivros.map(livro => (
            <div key={livro.id} onClick={() => setState({ mode: "modal", livro })}>
              <BookCard livro={livro} />
            </div>
          ))}
        </div>
      ) : state.mode === "reading" ? (
        <div className="fixed inset-0 bg-background z-50">
          <iframe
            src={state.livro.link ?? ""}
            className="w-full h-full"
            title={state.livro.livro || "Leitura"}
            allowFullScreen
          />
          <Button
            variant="secondary"
            className="fixed top-4 left-4 z-60 shadow-lg"
            onClick={() => setState({ mode: "carousel" })}
          >
            <ArrowLeft className="mr-1" size={20} /> Voltar
          </Button>
        </div>
      ) : null}

      {/* Detalhes Modal */}
      <AnimatePresence>
        {state.mode === "modal" && (
          <Dialog open onOpenChange={() => setState({ mode: "carousel" })}>
            <DialogContent className="max-w-lg p-0 overflow-hidden animate-fade-in" asChild>
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-lg bg-card"
              >
                <BookModal
                  livro={state.livro}
                  onClose={() => setState({ mode: "carousel" })}
                  onRead={() => setState({ mode: "reading", livro: state.livro })}
                />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Ajuda IA Modal */}
      <Dialog open={aiDialog} onOpenChange={setAiDialog}>
        <DialogContent className="max-w-md">
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FileText size={18} /> Ajuda por IA
            </h3>
            <p className="text-sm mb-2">
              Descreva o tema/assunto que deseja estudar e a IA sugerirá livros relevantes.
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                value={aiQuery}
                type="text"
                className="flex-1"
                placeholder="Ex: Direito Penal, contrato, recursos..."
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => (e.key === "Enter" ? handleAIHelp() : undefined)}
              />
              <Button size="sm" onClick={handleAIHelp}>Buscar</Button>
            </div>
            <div>
              {aiResult === null ? null : aiResult === (["buscando"] as any) ? (
                <div className="text-center py-6 text-muted-foreground">Buscando sugestões…</div>
              ) : aiResult.length === 0 ? (
                <div className="text-center py-6 text-destructive">Nenhum livro encontrado.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {aiResult.map(lv => (
                    <div
                      key={lv.id}
                      className="flex items-center gap-3 cursor-pointer border rounded-lg p-2 hover:shadow bg-muted"
                      onClick={() => {
                        setState({ mode: "modal", livro: lv });
                        setAiDialog(false);
                      }}
                    >
                      {lv.imagem ? (
                        <img
                          src={lv.imagem}
                          alt={lv.livro ?? "Capa"}
                          className="h-12 w-9 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-9 bg-gray-300 rounded" />
                      )}
                      <div>
                        <div className="font-semibold">{lv.livro}</div>
                        <div className="text-xs text-muted-foreground">{lv.area}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente cartão do livro (estilo Amazon)
function BookCard({ livro }: { livro: Livro }) {
  return (
    <Card className="flex flex-col items-center p-3 bg-gradient-to-t from-gray-900/10 to-card hover:shadow-lg transition-transform hover:scale-105 cursor-pointer min-h-[300px]">
      {livro.imagem ? (
        <img
          src={livro.imagem}
          alt={livro.livro ?? "Capa"}
          className="h-40 w-28 object-cover rounded shadow mb-3"
        />
      ) : (
        <div className="h-40 w-28 rounded bg-gray-200 mb-3" />
      )}
      <CardTitle className="text-base text-center line-clamp-2">{livro.livro}</CardTitle>
      <CardDescription className="text-xs text-center">{livro.area}</CardDescription>
    </Card>
  );
}

// Modal/Detalhe do Livro
function BookModal({
  livro,
  onClose,
  onRead,
}: {
  livro: Livro;
  onClose: () => void;
  onRead: () => void;
}) {
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
            input: { text: livro.sobre?.slice(0, 250) || livro.livro || "Sem texto" },
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
      <CardContent className="flex gap-4 p-6">
        {livro.imagem ? (
          <img
            src={livro.imagem}
            alt={livro.livro ?? "Capa"}
            className="h-44 w-32 object-cover rounded shadow-lg"
          />
        ) : (
          <div className="h-44 w-32 rounded bg-gray-200" />
        )}
        <div className="flex-1 flex flex-col">
          <h2 className="font-bold text-xl mb-1">{livro.livro}</h2>
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {livro.area}
          </div>
          <div className="text-sm mb-2 line-clamp-3">{livro.sobre}</div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onRead}>
              <ArrowRight size={16} className="mr-1" /> Ler Agora
            </Button>
            {livro.download && (
              <Button
                size="sm"
                variant="secondary"
                asChild
              >
                <a href={livro.download} target="_blank" rel="noopener noreferrer">
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
            <audio className="mt-2" controls src={ttsUrl} autoPlay />
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
