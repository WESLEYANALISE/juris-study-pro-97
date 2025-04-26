
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      <h2 className="text-xl font-semibold px-2">{title}</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {items.map((feature, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
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
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
