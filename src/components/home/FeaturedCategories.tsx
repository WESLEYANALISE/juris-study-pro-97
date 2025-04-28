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
  return <section className="mb-8">
      
      
    </section>;
};
export default FeaturedCategories;