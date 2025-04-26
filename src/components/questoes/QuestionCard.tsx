
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  id: number;
  area: string | null;
  tema: string | null;
  pergunta: string;
  respostas: { [key: string]: string | null };
  respostaCorreta: string | null;
  onAnswer: (questionId: number, answer: string, correct: boolean) => void;
}

export const QuestionCard = ({
  id,
  area,
  tema,
  pergunta,
  respostas,
  respostaCorreta,
  onAnswer,
}: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSubmit = () => {
    if (!selectedAnswer || hasAnswered) return;
    const isCorrect = selectedAnswer === respostaCorreta;
    setHasAnswered(true);
    onAnswer(id, selectedAnswer, isCorrect);
  };

  const getAnswerStyle = (answer: string) => {
    if (!hasAnswered) return "";
    if (answer === respostaCorreta) return "border-success text-success";
    if (answer === selectedAnswer) return "border-destructive text-destructive";
    return "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          {area && <span>{area}</span>}
          {tema && (
            <>
              <span>•</span>
              <span>{tema}</span>
            </>
          )}
        </div>
        <CardTitle className="text-lg font-medium">{pergunta}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
          disabled={hasAnswered}
        >
          {Object.entries(respostas)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center space-x-2 rounded-lg border p-4 transition-colors",
                  getAnswerStyle(key)
                )}
              >
                <RadioGroupItem value={key} id={`answer-${key}`} />
                <Label htmlFor={`answer-${key}`} className="flex-grow cursor-pointer">
                  {value}
                </Label>
                {hasAnswered && key === respostaCorreta && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
                {hasAnswered && key === selectedAnswer && key !== respostaCorreta && (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || hasAnswered}
          className="w-full"
        >
          Responder
        </Button>
      </CardFooter>
    </Card>
  );
};
