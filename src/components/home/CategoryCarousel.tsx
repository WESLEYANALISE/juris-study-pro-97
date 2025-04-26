
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

export const CategoryCarousel = ({ title, items }: CategoryCarouselProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button 
          variant="link" 
          className="text-sm font-medium text-primary"
          onClick={() => navigate("/ver-tudo")}
        >
          Ver tudo
        </Button>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((feature, index) => (
            <CarouselItem 
              key={index} 
              className="pl-2 md:pl-4 basis-[65%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Card className="h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm mt-2">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-3">
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={() => navigate(feature.path)}
                    >
                      Acessar
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex">
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </div>
      </Carousel>
    </div>
  );
};
