
import { useState } from "react";
import { useLegalAssistant } from "@/hooks/use-legal-assistant";
import { ChatMessage } from "@/components/assistente/ChatMessage";
import { ChatInput } from "@/components/assistente/ChatInput";
import { ContextPanel } from "@/components/assistente/ContextPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trash2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AssistenteJuridico() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("chat");
  const {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    context,
    updateContext
  } = useLegalAssistant();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assistente Jurídico</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Alert variant="default" className="bg-primary/10 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Assistente Jurídico</AlertTitle>
            <AlertDescription>
              Este assistente utiliza IA para auxiliar em consultas jurídicas. 
              As respostas devem ser verificadas por um profissional qualificado.
            </AlertDescription>
          </Alert>

          <Card className="overflow-hidden">
            <CardHeader className="bg-card p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversa</CardTitle>
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>
              <CardDescription>
                Faça perguntas sobre leis, procedimentos ou conceitos jurídicos
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              {isMobile ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="context">Contexto</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat" className="p-0">
                    <div className="flex flex-col h-[60vh]">
                      <ScrollArea className="flex-1 p-4">
                        {messages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center p-8">
                            <div className="max-w-md space-y-2">
                              <h3 className="text-lg font-medium">Bem-vindo ao Assistente Jurídico</h3>
                              <p className="text-muted-foreground">
                                Faça uma pergunta sobre qualquer tema jurídico para começar.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((message, index) => (
                              <ChatMessage key={index} message={message} />
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                      
                      <div className="border-t p-4">
                        <ChatInput 
                          onSendMessage={handleSendMessage} 
                          isLoading={isLoading}
                          placeholder="Digite sua pergunta jurídica..."
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="context" className="p-4">
                    <ContextPanel context={context} onContextChange={updateContext} />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col h-[60vh]">
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center p-8">
                        <div className="max-w-md space-y-2">
                          <h3 className="text-lg font-medium">Bem-vindo ao Assistente Jurídico</h3>
                          <p className="text-muted-foreground">
                            Faça uma pergunta sobre qualquer tema jurídico para começar.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => (
                          <ChatMessage key={index} message={message} />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="border-t p-4">
                    <ChatInput 
                      onSendMessage={handleSendMessage} 
                      isLoading={isLoading}
                      placeholder="Digite sua pergunta jurídica..."
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!isMobile && (
          <div className="space-y-6">
            <ContextPanel context={context} onContextChange={updateContext} />
          </div>
        )}
      </div>
    </div>
  );
}
