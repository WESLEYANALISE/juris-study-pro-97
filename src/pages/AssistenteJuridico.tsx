
import React, { useState, useRef, useEffect } from 'react'
import { supabase } from "@/integrations/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const AssistenteJuridico: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [context, setContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const newMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, newMessage])
    setIsLoading(true)
    setInput('')

    try {
      const response = await supabase.functions.invoke('legal-assistant', {
        body: JSON.stringify({ prompt: input, context })
      })

      if (response.error) throw response.error

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível processar sua pergunta. Tente novamente.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col flex-1">
        <CardHeader>
          <CardTitle>Assistente Jurídico</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user' 
                  ? 'bg-primary/10 self-end ml-auto' 
                  : 'bg-muted self-start'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </ScrollArea>
          <div className="space-y-2">
            <Textarea 
              placeholder="Contextualização (opcional)"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Input 
                placeholder="Faça sua pergunta jurídica..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssistenteJuridico
