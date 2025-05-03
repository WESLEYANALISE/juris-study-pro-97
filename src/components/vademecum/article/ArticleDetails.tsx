
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ArticleDetailsProps {
  technicalExplanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  onClose: () => void;
}

export const ArticleDetails: React.FC<ArticleDetailsProps> = ({
  technicalExplanation,
  formalExplanation,
  practicalExample,
  onClose
}) => {
  return (
    <motion.div
      className="mt-4 bg-muted/50 rounded-lg p-4 relative"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={onClose}
      >
        <X size={16} />
      </Button>

      <Tabs defaultValue="technical" className="w-full mt-2">
        <TabsList className="mb-4">
          {technicalExplanation && <TabsTrigger value="technical">Técnica</TabsTrigger>}
          {formalExplanation && <TabsTrigger value="formal">Formal</TabsTrigger>}
          {practicalExample && <TabsTrigger value="practical">Exemplo</TabsTrigger>}
        </TabsList>

        {technicalExplanation && (
          <TabsContent value="technical" className="text-sm">
            <h4 className="font-medium mb-2">Explicação Técnica</h4>
            <p className="whitespace-pre-line">{technicalExplanation}</p>
          </TabsContent>
        )}

        {formalExplanation && (
          <TabsContent value="formal" className="text-sm">
            <h4 className="font-medium mb-2">Explicação Formal</h4>
            <p className="whitespace-pre-line">{formalExplanation}</p>
          </TabsContent>
        )}

        {practicalExample && (
          <TabsContent value="practical" className="text-sm">
            <h4 className="font-medium mb-2">Exemplo Prático</h4>
            <p className="whitespace-pre-line">{practicalExample}</p>
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
};

