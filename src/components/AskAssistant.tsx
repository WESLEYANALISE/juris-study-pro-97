
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";
import { askGemini } from "@/services/ai-assistant";
import { motion, AnimatePresence } from "framer-motion";

export const AskAssistant = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const result = await askGemini(question);
      if (result.error) {
        throw new Error(result.error);
      }
      setResponse(result.text);
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Assistente AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Digite sua pergunta..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Textarea
                    value={response}
                    readOnly
                    className="min-h-[200px] bg-muted"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Perguntar ao Assistente'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
