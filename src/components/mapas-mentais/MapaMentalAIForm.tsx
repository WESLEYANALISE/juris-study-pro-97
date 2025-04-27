
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MapaMentalAIFormProps {
  areas: string[];
}

export function MapaMentalAIForm({ areas }: MapaMentalAIFormProps) {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Mapa Mental Gerado!",
        description: `Seu mapa mental "${title}" foi gerado com sucesso.`,
      });
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título do Mapa Mental</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite um título claro"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="area">Área do Direito</Label>
        <Select value={area} onValueChange={setArea} required>
          <SelectTrigger id="area">
            <SelectValue placeholder="Selecione uma área" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((areaOption) => (
              <SelectItem key={areaOption} value={areaOption}>
                {areaOption}
              </SelectItem>
            ))}
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="topic">Descreva o tema específico</Label>
        <Textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Princípios constitucionais aplicados ao Direito Civil"
          required
          rows={3}
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Gerar com IA
          </>
        )}
      </Button>
    </form>
  );
}
