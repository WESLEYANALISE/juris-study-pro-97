
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TopicSelectorProps {
  topics: string[];
  onTopicSelect: (topic: string) => void;
  selectedTopic?: string;
}

export const TopicSelector = ({ topics, onTopicSelect, selectedTopic }: TopicSelectorProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between cursor-pointer p-1"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold text-sm">Tópicos</h3>
        {expanded ? 
          <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        }
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {topics.map(topic => (
                <Button 
                  key={topic} 
                  variant={selectedTopic === topic ? "secondary" : "ghost"} 
                  className="w-full justify-start text-sm"
                  onClick={() => onTopicSelect(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
