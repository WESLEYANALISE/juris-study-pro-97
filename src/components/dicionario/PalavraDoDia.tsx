
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextToSpeechService } from "@/services/textToSpeechService";

interface PalavraDoDiaProps {
  termo: {
    id: string;
    termo: string;
    definicao: string;
    exemplo_uso: string | null;
    area_direito: string | null;
  } | null;
  isLoading: boolean;
}

export const PalavraDoDia: React.FC<PalavraDoDiaProps> = ({ termo, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-0">
        <CardHeader>
          <CardDescription className="text-sm">Palavra do dia</CardDescription>
          <div className="h-6 w-32 bg-muted/50 animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted/50 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-muted/50 animate-pulse rounded w-5/6"></div>
            <div className="h-4 bg-muted/50 animate-pulse rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!termo) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-0">
      <CardHeader className="pb-2">
        <CardDescription className="text-sm">Palavra do dia</CardDescription>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{termo.termo}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => TextToSpeechService.speak(termo.definicao)}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{termo.definicao}</p>
        {termo.exemplo_uso && (
          <div className="mt-4 bg-background/50 p-3 rounded-md">
            <p className="text-xs italic">{termo.exemplo_uso}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
