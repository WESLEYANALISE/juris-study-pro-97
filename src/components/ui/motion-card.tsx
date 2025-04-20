
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

// Define a type that extends HTMLMotionProps for the div element
type MotionCardProps = HTMLMotionProps<"div"> & {
  hoverScale?: number;
};

const MotionCard = React.forwardRef<
  HTMLDivElement,
  MotionCardProps
>(({ className, hoverScale = 1.02, initial, whileInView, transition, viewport, whileHover, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={initial || { opacity: 0, y: 10 }}
    whileInView={whileInView || { opacity: 1, y: 0 }}
    viewport={viewport || { once: true, margin: "-50px" }}
    transition={transition || { 
      type: "spring", 
      stiffness: 260, 
      damping: 20, 
      duration: 0.3
    }}
    whileHover={whileHover || { scale: hoverScale, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
      className
    )}
    {...props}
  />
));
MotionCard.displayName = "MotionCard";

// Define props for each subcomponent
type MotionCardElementProps = React.HTMLAttributes<HTMLDivElement>;
type MotionCardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
type MotionCardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const MotionCardHeader = React.forwardRef<
  HTMLDivElement,
  MotionCardElementProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
MotionCardHeader.displayName = "MotionCardHeader";

const MotionCardTitle = React.forwardRef<
  HTMLParagraphElement,
  MotionCardTitleProps
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
MotionCardTitle.displayName = "MotionCardTitle";

const MotionCardDescription = React.forwardRef<
  HTMLParagraphElement,
  MotionCardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
MotionCardDescription.displayName = "MotionCardDescription";

const MotionCardContent = React.forwardRef<
  HTMLDivElement,
  MotionCardElementProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
MotionCardContent.displayName = "MotionCardContent";

const MotionCardFooter = React.forwardRef<
  HTMLDivElement,
  MotionCardElementProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
MotionCardFooter.displayName = "MotionCardFooter";

export { 
  MotionCard, 
  MotionCardHeader, 
  MotionCardFooter, 
  MotionCardTitle, 
  MotionCardDescription, 
  MotionCardContent 
};
