
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Scale, BookOpen, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

const assistantTypes = [
  {
    id: "doubt",
    title: "Tirar Dúvidas",
    description: "Esclareça suas dúvidas sobre conceitos e procedimentos jurídicos",
    icon: MessageSquare,
  },
  {
    id: "case-analysis",
    title: "Análise de Casos",
    description: "Obtenha uma análise detalhada de casos jurídicos",
    icon: Scale,
  },
  {
    id: "references",
    title: "Referências Legais",
    description: "Encontre leis e jurisprudências relevantes",
    icon: BookOpen,
  },
  {
    id: "study-plan",
    title: "Plano de Estudos",
    description: "Receba sugestões para seu plano de estudos",
    icon: Brain,
  }
];

export default function AssistenteJuridico() {
  const [selectedType, setSelectedType] = useState<string>("doubt");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite sua pergunta",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('legal-assistant', {
        body: { prompt, type: selectedType },
      });

      if (error) throw error;
      setResponse(data.text);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.h1 
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Assistente Jurídico
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {assistantTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all ${
                selectedType === type.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <CardHeader>
                <type.icon className="h-6 w-6 mb-2 text-primary" />
                <CardTitle className="text-lg">{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sua Pergunta</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Digite sua pergunta aqui..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleSubmit} 
              className="mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Processando..." : "Enviar"}
            </Button>
          </CardContent>
        </Card>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {response}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
