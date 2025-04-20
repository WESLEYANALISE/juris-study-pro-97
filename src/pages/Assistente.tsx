
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Paperclip, Trash, RotateCcw, Clock, Lightbulb, Save } from "lucide-react";
import AskAssistant from "@/components/AskAssistant";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  preview: string;
  date: Date;
  messages: Message[];
};

const Assistente = () => {
  const [currentTab, setCurrentTab] = useState("conversa");
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Dúvida sobre usucapião",
      preview: "Quais são os requisitos para usucapião extraordinário?",
      date: new Date(2025, 3, 19),
      messages: [
        {
          id: "1-1",
          content: "Quais são os requisitos para usucapião extraordinário?",
          isUser: true,
          timestamp: new Date(2025, 3, 19, 10, 15)
        },
        {
          id: "1-2",
          content: "O usucapião extraordinário está previsto no art. 1.238 do Código Civil e possui os seguintes requisitos: 1) Posse contínua e incontestada por 15 anos; 2) Exercício da posse com animus domini (intenção de dono); 3) Não há necessidade de justo título ou boa-fé. Se o possuidor houver estabelecido moradia ou realizado obras/serviços de caráter produtivo no imóvel, o prazo é reduzido para 10 anos (parágrafo único do art. 1.238).",
          isUser: false,
          timestamp: new Date(2025, 3, 19, 10, 16)
        }
      ]
    },
    {
      id: "2",
      title: "Consulta sobre habeas corpus",
      preview: "Em quais situações posso impetrar habeas corpus?",
      date: new Date(2025, 3, 18),
      messages: [
        {
          id: "2-1",
          content: "Em quais situações posso impetrar habeas corpus?",
          isUser: true,
          timestamp: new Date(2025, 3, 18, 14, 30)
        },
        {
          id: "2-2",
          content: "O habeas corpus é uma ação constitucional prevista no art. 5º, LXVIII da CF/88, cabível sempre que alguém sofrer ou se achar ameaçado de sofrer violência ou coação em sua liberdade de locomoção, por ilegalidade ou abuso de poder. Situações comuns: prisão ilegal, excesso de prazo na prisão provisória, ausência de fundamentação na decisão que decretou a prisão, incompetência da autoridade que determinou a prisão, entre outras hipóteses em que há constrangimento ilegal à liberdade de ir e vir.",
          isUser: false,
          timestamp: new Date(2025, 3, 18, 14, 32)
        }
      ]
    }
  ]);
  
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const startNewConversation = () => {
    setActiveConversation(null);
    setNewMessage("");
  };

  const selectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Implementação simulada para demonstração
    console.log("Enviando mensagem:", newMessage);
    
    // Limpar campo de mensagem
    setNewMessage("");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-6">
          <MessageSquare className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Assistente Jurídico</h1>
          <p className="text-muted-foreground text-center">
            Tire dúvidas e obtenha informações jurídicas rapidamente
          </p>
        </div>
      </div>

      <Tabs defaultValue="conversa" value={currentTab} onValueChange={setCurrentTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="conversa">Conversa</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
      </Tabs>

      {currentTab === "conversa" && (
        <div className="grid md:grid-cols-4 gap-4">
          {/* Painel lateral */}
          <div className="md:col-span-1 bg-card rounded-lg p-4 border overflow-auto max-h-[calc(100vh-250px)]">
            <div className="flex flex-col h-full">
              <Button onClick={startNewConversation} className="mb-4 w-full">
                Nova Conversa
              </Button>
              
              <div className="text-sm text-muted-foreground mb-2">Conversas recentes</div>
              
              <div className="space-y-2">
                {conversations.map(conversation => (
                  <div 
                    key={conversation.id} 
                    className={`p-2 rounded-md cursor-pointer hover:bg-accent ${activeConversation?.id === conversation.id ? 'bg-accent' : ''}`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="font-medium line-clamp-1">{conversation.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {conversation.preview}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {conversation.date.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Área principal de chat */}
          <div className="md:col-span-3 bg-card rounded-lg p-4 border flex flex-col h-[calc(100vh-250px)]">
            {activeConversation ? (
              <>
                {/* Cabeçalho da conversa */}
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-medium">{activeConversation.title}</h3>
                    <div className="text-xs text-muted-foreground">
                      {activeConversation.messages.length} mensagens • Iniciada em {activeConversation.date.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {activeConversation.messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-accent'} p-3 rounded-lg`}>
                        {!message.isUser && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center">
                                <MessageSquare className="h-3 w-3" />
                              </div>
                            </Avatar>
                            <span className="text-xs font-medium">Assistente Jurídico</span>
                          </div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Input de mensagem */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                      />
                      <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button type="submit" size="icon" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <AskAssistant />
            )}
          </div>
        </div>
      )}

      {currentTab === "historico" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conversations.map(conversation => (
            <Card key={conversation.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
              selectConversation(conversation);
              setCurrentTab("conversa");
            }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                    </Avatar>
                    <div>
                      <h3 className="font-medium line-clamp-1">{conversation.title}</h3>
                      <div className="text-xs text-muted-foreground">
                        {conversation.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {conversation.messages.length} msgs
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {conversation.preview}
                </p>
                <div className="flex justify-between mt-4">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Continuar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Ver insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assistente;
