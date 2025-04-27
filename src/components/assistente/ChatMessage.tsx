
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div 
      className={cn(
        "flex w-full my-4",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "flex gap-3 max-w-[80%]",
          message.role === "user" ? "flex-row-reverse" : "flex-row"
        )}
      >
        <Avatar className="h-8 w-8">
          {message.role === "assistant" ? (
            <>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>AI</AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>VE</AvatarFallback>
            </>
          )}
        </Avatar>
        
        <Card className={cn(
          message.role === "assistant" ? "bg-accent" : "bg-primary text-primary-foreground"
        )}>
          <CardContent className="p-3 relative">
            {message.role === "assistant" && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 opacity-50 hover:opacity-100"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
