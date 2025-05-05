
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AlphabeticIndexProps {
  onSelectLetter: (letter: string) => void;
  currentLetter: string | null;
  availableLetters?: string[];
  className?: string;
}

export const AlphabeticIndex: React.FC<AlphabeticIndexProps> = ({
  onSelectLetter,
  currentLetter,
  availableLetters = [],
  className
}) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className={cn("rounded-lg border bg-card shadow-sm", className)}>
      <div className="p-3 border-b">
        <h3 className="font-medium text-sm">Índice Alfabético</h3>
      </div>
      <ScrollArea className="px-1 py-2">
        <div className="grid grid-cols-5 gap-1 p-2">
          {alphabet.map((letter) => {
            const isAvailable = availableLetters.length === 0 || 
              availableLetters.includes(letter) || 
              availableLetters.includes(letter.toLowerCase());
            
            return (
              <Button
                key={letter}
                variant={currentLetter === letter ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
                disabled={!isAvailable}
                onClick={() => onSelectLetter(letter)}
              >
                {letter}
              </Button>
            );
          })}
          <Button
            variant={currentLetter === null ? "default" : "outline"}
            size="sm"
            className="col-span-5 mt-1"
            onClick={() => onSelectLetter('')}
          >
            Todos
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};
