
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryItem {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  color: string;
}

interface FeaturedCategoriesProps {
  title: string;
  items: CategoryItem[];
}

export default function FeaturedCategories({ title, items }: FeaturedCategoriesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <div className="w-1 h-5 bg-primary rounded-full mr-2"></div>
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <Link to={item.path} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "relative rounded-lg p-5",
                "bg-background/30 backdrop-blur-sm border border-primary/10",
                "hover:border-primary/30 transition-all duration-300",
                "flex items-center gap-4 group"
              )}
              whileHover={{ y: -5 }}
            >
              <div className={cn(
                "p-3 rounded-full",
                "bg-primary/10 group-hover:bg-primary/20 transition-colors",
                "flex items-center justify-center"
              )}>
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                
                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/40"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
