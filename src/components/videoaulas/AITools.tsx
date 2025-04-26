
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Brain, BookOpen, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface AIToolsProps {
  videoTitle: string;
  videoId: string;
}

export const AITools = ({ videoTitle, videoId }: AIToolsProps) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    summary: "",
    mindmap: "",
    notes: "",
    questions: ""
  });

  // This would use the Gemini API in a real implementation
  const generateContent = async (type: keyof typeof content) => {
    if (content[type]) return;
    
    setLoading(true);
    toast.info(`Gerando ${type === 'summary' ? 'resumo' : 
      type === 'mindmap' ? 'mapa mental' : 
      type === 'notes' ? 'anotações' : 'perguntas'} para o vídeo`);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let generatedContent = "";
      
      // Mock responses based on content type
      switch (type) {
        case "summary":
          generatedContent = `Resumo da aula: ${videoTitle}\n\nEste é um resumo gerado por IA que destacaria os principais pontos abordados neste vídeo. Em uma implementação real, a API do Gemini seria utilizada para analisar o vídeo ou sua transcrição e identificar os conceitos principais, definições importantes e conclusões apresentadas durante a aula.\n\nTópicos principais:\n- Conceituação e fundamentos teóricos\n- Aplicações práticas na jurisprudência\n- Desafios e controvérsias atuais\n- Pontos relevantes para provas e concursos`;
          break;
        case "mindmap":
          generatedContent = `# Mapa Mental: ${videoTitle}\n\n- Conceito Central\n  - Subdivisão 1\n    - Ponto importante 1.1\n    - Ponto importante 1.2\n  - Subdivisão 2\n    - Ponto importante 2.1\n    - Ponto importante 2.2\n      - Detalhe relevante\n  - Subdivisão 3\n    - Ponto importante 3.1\n    - Ponto importante 3.2\n\nEm uma implementação real, este seria um mapa mental estruturado com base no conteúdo do vídeo, identificando relações entre conceitos.`;
          break;
        case "notes":
          generatedContent = `# Anotações de Estudo: ${videoTitle}\n\n## Introdução\n- Contextualização do tema\n- Importância para o estudo do Direito\n\n## Desenvolvimento\n- Ponto 1: [Conceito principal]\n  - Fundamentos teóricos\n  - Base legal: [referências]\n- Ponto 2: [Aplicação prática]\n  - Exemplos da jurisprudência\n  - Casos emblemáticos\n\n## Conclusão\n- Síntese dos conceitos apresentados\n- Dicas para aplicação em provas\n\n## Referências Adicionais\n- [Lista de fontes complementares]`;
          break;
        case "questions":
          generatedContent = `# Perguntas para Estudo: ${videoTitle}\n\n1. Qual é o conceito principal abordado no vídeo e como ele se relaciona com [tema relacionado]?\n\n2. Explique a diferença entre [conceito A] e [conceito B] conforme apresentado na aula.\n\n3. Como a jurisprudência atual tem aplicado os princípios discutidos?\n\n4. Quais são os principais argumentos contra e a favor da posição defendida no vídeo?\n\n5. Em uma questão de concurso sobre este tema, quais pontos seriam mais relevantes para abordar?\n\nEssas perguntas ajudariam na fixação do conteúdo e na preparação para avaliações sobre o tema.`;
          break;
      }
      
      setContent(prev => ({
        ...prev,
        [type]: generatedContent
      }));
      
      toast.success(`${type === 'summary' ? 'Resumo' : 
        type === 'mindmap' ? 'Mapa mental' : 
        type === 'notes' ? 'Anotações' : 'Perguntas'} gerado com sucesso!`);
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`Erro ao gerar conteúdo. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Conteúdo copiado para a área de transferência!");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4 bg-accent">
        <CardTitle className="text-base">Ferramentas de IA</CardTitle>
        <CardDescription>Geração automática de conteúdo para estudo</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
            <TabsTrigger value="summary" className="text-xs md:text-sm" onClick={() => generateContent("summary")}>
              <FileText className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Resumo</span>
            </TabsTrigger>
            <TabsTrigger value="mindmap" className="text-xs md:text-sm" onClick={() => generateContent("mindmap")}>
              <Brain className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Mapa Mental</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs md:text-sm" onClick={() => generateContent("notes")}>
              <BookOpen className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Anotações</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs md:text-sm" onClick={() => generateContent("questions")}>
              <MessageSquare className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Perguntas</span>
            </TabsTrigger>
          </TabsList>
          
          {["summary", "mindmap", "notes", "questions"].map((tab) => (
            <TabsContent 
              key={tab} 
              value={tab} 
              className="p-4"
            >
              {loading && activeTab === tab ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Gerando {tab === 'summary' ? 'resumo' : 
                      tab === 'mindmap' ? 'mapa mental' : 
                      tab === 'notes' ? 'anotações' : 'perguntas'}...
                  </p>
                </div>
              ) : content[tab as keyof typeof content] ? (
                <div className="space-y-4">
                  <Textarea 
                    value={content[tab as keyof typeof content]} 
                    className="min-h-[200px] font-mono text-sm whitespace-pre-wrap"
                    readOnly
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(content[tab as keyof typeof content])}
                    >
                      Copiar texto
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Button 
                    onClick={() => generateContent(tab as keyof typeof content)}
                    className="mb-2"
                  >
                    Gerar {tab === 'summary' ? 'resumo' : 
                      tab === 'mindmap' ? 'mapa mental' : 
                      tab === 'notes' ? 'anotações' : 'perguntas'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Utilize a IA para criar material de estudo personalizado
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
