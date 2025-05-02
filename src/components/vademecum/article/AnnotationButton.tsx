
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnnotationButtonProps {
  lawName: string;
  articleNumber: string;
  articleText: string;
  showLabel?: boolean;
}

export const AnnotationButton = ({
  lawName,
  articleNumber,
  articleText,
  showLabel = false
}: AnnotationButtonProps) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAnnotation = () => {
    // Navigation logic or dialog to add annotation
    console.log("Adding annotation for:", { lawName, articleNumber });
    setIsAdding(true);
    
    // Mock implementation - would typically open a dialog or navigate
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="outline"
        size={showLabel ? "sm" : "icon"}
        onClick={handleAnnotation}
        disabled={isAdding}
        className={showLabel ? "gap-2" : ""}
      >
        <PencilIcon className="h-4 w-4" />
        {showLabel && <span className="hidden sm:inline">Anotar</span>}
      </Button>
    </motion.div>
  );
};

export default AnnotationButton;
