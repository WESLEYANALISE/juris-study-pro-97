
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MotionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hoverScale?: number;
    initial?: any;
    whileInView?: any;
    transition?: any;
    viewport?: any;
  }
>(({ className, hoverScale = 1.02, initial, whileInView, transition, viewport, ...props }, ref) => (
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
    whileHover={{ scale: hoverScale, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
      className
    )}
    {...props}
  />
));
MotionCard.displayName = "MotionCard";

const MotionCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
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
  React.HTMLAttributes<HTMLHeadingElement>
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
  React.HTMLAttributes<HTMLParagraphElement>
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
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
MotionCardContent.displayName = "MotionCardContent";

const MotionCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
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
