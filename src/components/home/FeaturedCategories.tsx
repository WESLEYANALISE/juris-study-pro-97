
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CategoryItem {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
}

interface FeaturedCategoriesProps {
  title: string;
  items: CategoryItem[];
}

const FeaturedCategories = ({
  title,
  items
}: FeaturedCategoriesProps) => {
  const navigate = useNavigate();

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-primary">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="h-full"
            onClick={() => navigate(item.path)}
          >
            <Card className="card-premium shadow-lg card-highlight h-full cursor-pointer transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`p-3 rounded-lg ${item.color} bg-opacity-20 flex items-center justify-center`}>
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                </div>
                <p className="text-muted-foreground mt-2 mb-4">{item.description}</p>
                <div className="mt-auto">
                  <div className="text-sm font-medium text-primary flex items-center">
                    Acessar
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
