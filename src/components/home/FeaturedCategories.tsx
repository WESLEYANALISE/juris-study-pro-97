
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const FeaturedCategories = ({ title, items }: FeaturedCategoriesProps) => {
  const navigate = useNavigate();
  
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`${item.color} p-2 rounded-full`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <CardDescription className="pt-2">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Additional content could be added here */}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(item.path)}
                >
                  Acessar
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
