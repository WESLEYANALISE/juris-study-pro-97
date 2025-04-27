
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ContextPanelProps {
  context: string;
  onContextChange: (context: string) => void;
}

export function ContextPanel({ context, onContextChange }: ContextPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localContext, setLocalContext] = useState(context);
  
  const handleSave = () => {
    onContextChange(localContext);
    setIsOpen(false);
  };
  
  const handleCancel = () => {
    setLocalContext(context);
    setIsOpen(false);
  };
  
  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer flex flex-row items-center justify-between p-4">
            <div>
              <CardTitle className="text-base">Contexto Jurídico</CardTitle>
              <CardDescription>
                Adicione contexto para obter respostas mais precisas
              </CardDescription>
            </div>
            {isOpen ? 
              <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            <Textarea
              placeholder="Insira informações relevantes sobre o caso ou situação jurídica..."
              value={localContext}
              onChange={(e) => setLocalContext(e.target.value)}
              className="mb-3 min-h-[150px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Contexto
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
