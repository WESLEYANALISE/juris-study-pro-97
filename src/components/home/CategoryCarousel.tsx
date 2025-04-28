
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
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
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
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
              className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <motion.div 
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Card 
                  className="h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow border-border/50 card-premium cursor-pointer"
                  onClick={() => navigate(feature.path)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                      <h3 className="text-base font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="mt-4 text-xs font-medium text-primary flex items-center">
                      Acessar
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex">
          <CarouselPrevious className="left-0 bg-secondary border-border/50 text-primary hover:bg-secondary/80" />
          <CarouselNext className="right-0 bg-secondary border-border/50 text-primary hover:bg-secondary/80" />
        </div>
      </Carousel>
    </div>
  );
};
