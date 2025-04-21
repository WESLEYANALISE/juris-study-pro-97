
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

type FlashCard = {
  id: number;
  area: string | null;
  tema: string | null;
  pergunta: string | null;
  resposta: string | null;
};

type ViewMode = "manual" | "auto";

export default function Flashcards() {
  const { data: cards, isLoading } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data } = await supabase.from("flash_cards").select("*");
      return (data ?? []) as FlashCard[];
    },
  });

  // Temas disponíveis e seleção
  const temas = useMemo(() => {
    if (!cards) return [];
    return Array.from(new Set(cards.map((c) => c.tema).filter(Boolean)));
  }, [cards]);
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const filtered = useMemo(() => {
    if (!cards) return [];
    if (selectedTemas.length === 0) return cards.slice(0, 12);
    return cards.filter((c) => c.tema && selectedTemas.includes(c.tema));
  }, [cards, selectedTemas]);

  // Exibição manual/automática
  const [viewMode, setViewMode] = useState<ViewMode>("manual");
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (viewMode === "auto" && filtered.length > 1) {
      intervalRef.current = setInterval(
        () => setIndex((i) => (i + 1) % filtered.length),
        3500
      );
      return () => clearInterval(intervalRef.current!);
    }
    return () => {};
  }, [viewMode, filtered.length]);

  useEffect(() => {
    setIndex(0); // sempre reinicia na seleção/tema/mode novo
  }, [selectedTemas, viewMode, filtered.length]);

  return (
    <div className="max-w-xl mx-auto p-4 w-full">
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <div className="flex-1">
          <select
            multiple
            className="rounded border px-2 py-1 w-full min-h-[40px] dark:bg-background"
            value={selectedTemas}
            onChange={e =>
              setSelectedTemas(Array.from(e.target.selectedOptions).map(opt => opt.value))
            }
          >
            {temas.map((tema, i) => (
              <option value={tema ?? ""} key={tema ?? i}>
                {tema}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant={viewMode === "manual" ? "default" : "outline"}
          onClick={() => setViewMode("manual")}
          size="sm"
        >
          Manual
        </Button>
        <Button
          variant={viewMode === "auto" ? "default" : "outline"}
          onClick={() => setViewMode("auto")}
          size="sm"
        >
          Automático
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedTemas([])}
        >
          Limpar Seleção
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">Carregando cards…</div>
      ) : (
        <div className="relative min-h-[280px] flex flex-col items-center">
          <AnimatePresence mode="wait">
            {filtered.length > 0 && (
              <motion.div
                key={filtered[index]?.id}
                initial={{ x: 80, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -40, opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.35 }}
                className="w-full"
              >
                <Card className="bg-gradient-to-t from-[#F1F0FB] via-[#9b87f519] to-card shadow-lg border-primary/30 rounded-xl overflow-hidden transition-all"
                  style={{
                    minHeight: 240,
                    boxShadow: "0 4px 40px #9b87f522"
                  }}
                >
                  <div className="text-primary font-bold px-6 py-3 text-lg border-b">
                    {filtered[index]?.tema} <span className="text-sm text-gray-600">({filtered[index]?.area})</span>
                  </div>
                  <div className="p-6 pt-4 flex flex-col gap-4">
                    <div className="text-base font-semibold min-h-[48px]">{filtered[index]?.pergunta}</div>
                    <div className="text-sm bg-gradient-to-br from-[#D6BCFA44] to-[#FFF] py-2 px-4 rounded-lg text-gray-800 font-medium border">{filtered[index]?.resposta}</div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          {viewMode === "manual" && filtered.length > 1 && (
            <div className="flex gap-4 mt-6">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIndex((i) => (i - 1 + filtered.length) % filtered.length)}
              >
                ←
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIndex((i) => (i + 1) % filtered.length)}
              >
                →
              </Button>
            </div>
          )}
        </div>
      )}
      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">Nenhum flashcard disponível.</div>
      )}
    </div>
  );
}
