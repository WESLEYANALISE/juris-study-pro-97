
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionModalProps {
  question: any;
  onAnswer: (answer: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionModal({ question, onAnswer, open, onOpenChange }: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Reset state when the modal opens with a new question
  if (open && !submitted && question && question.id) {
    setSelectedAnswer("");
    setSubmitted(false);
  }

  const handleSubmit = () => {
    if (selectedAnswer && !submitted) {
      const correct = selectedAnswer === question.correct_answer;
      setIsCorrect(correct);
      setSubmitted(true);
      onAnswer(selectedAnswer);
    }
  };

  const handleContinue = () => {
    setSelectedAnswer("");
    setSubmitted(false);
    onOpenChange(false);
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value && submitted) {
        handleContinue();
      } else if (!submitted) {
        onOpenChange(value);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="py-1 px-2 bg-primary/10 rounded-md text-primary text-sm mr-2">Pergunta</span>
            Responda para continuar
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          
          <div className="space-y-2">
            {question.options.map((option: string, index: number) => (
              <Button
                key={index}
                variant={
                  submitted
                    ? option === question.correct_answer
                      ? "success"
                      : option === selectedAnswer && option !== question.correct_answer
                      ? "destructive"
                      : "outline"
                    : selectedAnswer === option
                    ? "default"
                    : "outline"
                }
                className="w-full justify-start text-left text-wrap h-auto min-h-10 py-2"
                onClick={() => !submitted && setSelectedAnswer(option)}
                disabled={submitted}
              >
                <div className="flex justify-between w-full items-center">
                  <span>{option}</span>
                  {submitted && option === question.correct_answer && (
                    <CheckCircle2 className="h-5 w-5 ml-2 flex-shrink-0" />
                  )}
                  {submitted && option === selectedAnswer && option !== question.correct_answer && (
                    <XCircle className="h-5 w-5 ml-2 flex-shrink-0" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-md ${
                  isCorrect ? "bg-success/10 border border-success/50" : "bg-destructive/10 border border-destructive/50"
                }`}
              >
                <h4 className="font-bold flex items-center">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2 text-success" />
                      Resposta Correta!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2 text-destructive" />
                      Resposta Incorreta
                    </>
                  )}
                </h4>
                <p className="mt-1">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            className="w-full"
            onClick={submitted ? handleContinue : handleSubmit}
            disabled={!selectedAnswer && !submitted}
          >
            {submitted ? "Continuar Assistindo" : "Responder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
