
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ResponsiveCarouselProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveCarousel: React.FC<ResponsiveCarouselProps> = ({
  children,
  className,
}) => {
  const isMobile = useIsMobile();

  return (
    <Carousel className={`w-full ${className}`}>
      <CarouselContent>
        {children}
      </CarouselContent>
      {!isMobile && (
        <>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </>
      )}
    </Carousel>
  );
};

export default ResponsiveCarousel;
