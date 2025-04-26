
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AreaSelector } from "@/components/videoaulas/AreaSelector";
import { TopicSelector } from "@/components/videoaulas/TopicSelector";
import { Filter, SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

interface VideoFilterProps {
  areas: string[];
  selectedArea: string;
  onAreaSelect: (area: string) => void;
  topics: string[];
  selectedTopic?: string;
  onTopicSelect: (topic: string) => void;
}

export const VideoFilter = ({
  areas,
  selectedArea,
  onAreaSelect,
  topics,
  selectedTopic,
  onTopicSelect,
}: VideoFilterProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  return (
    <>
      {/* Mobile filter sheet */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <span>Filtros</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{selectedArea}</span>
                {selectedTopic && <span> • {selectedTopic}</span>}
                <ChevronDown className="h-4 w-4 ml-2" />
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Selecione a área e o tópico de interesse
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Área do Direito</h3>
                <AreaSelector areas={areas} selectedArea={selectedArea} onAreaSelect={onAreaSelect} />
              </div>
              
              <div className="space-y-2">
                <TopicSelector topics={topics} selectedTopic={selectedTopic} onTopicSelect={onTopicSelect} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop filter sidebar */}
      <div className="hidden lg:block">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Filtros</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Área do Direito</h4>
                    <AreaSelector areas={areas} selectedArea={selectedArea} onAreaSelect={onAreaSelect} />
                  </div>
                  
                  <div>
                    <TopicSelector topics={topics} selectedTopic={selectedTopic} onTopicSelect={onTopicSelect} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </>
  );
};
