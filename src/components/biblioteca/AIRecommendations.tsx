import { useState } from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lamp } from "lucide-react";
import { motion } from "framer-motion";
interface Book {
  id: number;
  livro: string | null;
  area: string | null;
  sobre: string | null;
  imagem: string | null;
  download: string | null;
  link: string | null;
}
interface AIRecommendationsProps {
  askAiForRecommendation: (query: string) => Promise<{
    result: string;
    books: Book[];
  }>;
  books: Book[];
  openBookDialog: (book: Book) => void;
}
const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  askAiForRecommendation,
  books,
  openBookDialog
}) => {
  const [aiPopoverOpen, setAiPopoverOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const handleAsk = async () => {
    if (!aiQuery.trim()) return;
    setLoading(true);
    const res = await askAiForRecommendation(aiQuery);
    setAiResult(res.result);
    setAiRecommendations(res.books);
    setLoading(false);
  };
  return <Popover open={aiPopoverOpen} onOpenChange={setAiPopoverOpen}>
      
      <PopoverContent className="w-[450px] p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <motion.div animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }} transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1
          }}>
              <Lamp className="h-5 w-5 text-amber-500" />
            </motion.div>
            <h3 className="text-lg font-semibold">
              Assistente de Recomendação
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Descreva o assunto que você quer estudar e receba recomendações de livros.
          </p>
          <div className="flex items-center gap-2">
            <Input value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="Ex: Quero aprender sobre contratos de trabalho" className="flex-1" />
            <Button onClick={handleAsk} disabled={loading || !aiQuery.trim()} size="sm">
              {loading ? "Buscando..." : "Perguntar"}
            </Button>
          </div>
          {aiResult && <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-2">Resposta do Assistente:</p>
              <p>{aiResult}</p>
            </div>}
          {aiRecommendations.length > 0 && <div className="mt-4">
              <h4 className="font-medium mb-2">
                Livros relacionados em nossa biblioteca:
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {aiRecommendations.map(book => <div key={book.id} className="p-2 border rounded-md cursor-pointer hover:bg-accent" onClick={() => {
              openBookDialog(book);
              setAiPopoverOpen(false);
            }}>
                    <p className="text-xs font-medium truncate">{book.livro}</p>
                    <p className="text-xs text-muted-foreground">{book.area}</p>
                  </div>)}
              </div>
            </div>}
        </div>
      </PopoverContent>
    </Popover>;
};
export default AIRecommendations;