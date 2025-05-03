
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export const LoadingArticleCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-l-4 border-l-primary/30">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-20 rounded-md mb-4" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full rounded-md mb-2" />
          <Skeleton className="h-4 w-3/4 rounded-md mb-2" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </CardContent>
      </Card>
    </motion.div>
  );
};

