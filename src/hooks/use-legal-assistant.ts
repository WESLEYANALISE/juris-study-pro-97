
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseLegalAssistantProps {
  initialContext?: string;
}

export function useLegalAssistant({ initialContext }: UseLegalAssistantProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState(initialContext || "");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  
  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to the chat
      setMessages(prev => [...prev, { role: "user", content: prompt }]);
      
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke("legal-assistant", {
        body: { prompt, context }
      });
      
      if (error) throw error;
      
      // Add assistant response to the chat
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      
      return data.response;
    } catch (error) {
      console.error("Error in legal assistant:", error);
      toast.error("Erro ao processar a mensagem. Por favor, tente novamente.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearChat = () => {
    setMessages([]);
  };
  
  const updateContext = (newContext: string) => {
    setContext(newContext);
  };
  
  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    context,
    updateContext
  };
}
