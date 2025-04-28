
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

const FeaturedCategories = ({
  title,
  items
}: FeaturedCategoriesProps) => {
  const navigate = useNavigate();
  
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="h-full cursor-pointer hover:shadow-md transition-all border"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-md ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{item.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="ml-auto">
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
