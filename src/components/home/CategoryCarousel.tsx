
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryItem {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  color: string;
}

interface CategoryCarouselProps {
  title: string;
  items: CategoryItem[];
}

export function CategoryCarousel({ title, items }: CategoryCarouselProps) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <div className="w-1 h-5 bg-primary rounded-full mr-2"></div>
        {title}
      </h2>

      <ScrollArea className="w-full">
        <div className="flex space-x-4 pb-4">
          {items.map((item, index) => (
            <Link
              to={item.path}
              key={index}
              className={cn(
                "min-w-[280px] sm:min-w-[220px] group",
                "flex-shrink-0 cursor-pointer"
              )}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "relative rounded-lg overflow-hidden h-full",
                  "bg-background/30 backdrop-blur-sm border border-primary/10",
                  "hover:border-primary/30 transition-all duration-300",
                  "p-4 group hover:shadow-md"
                )}
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col h-full">
                  <div className={cn(
                    "p-2 rounded-full w-10 h-10",
                    "flex items-center justify-center mb-3",
                    "bg-primary/10 group-hover:bg-primary/20 transition-colors"
                  )}>
                    <item.icon className={cn("h-5 w-5", item.color)} />
                  </div>
                  <h3 className="text-base font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/40"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  );
}
