
import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean
}

// Helper function to extract motion props from regular props
function extractMotionProps(props: any) {
  const {
    // Extract standard motion props you might use
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    whileDrag,
    whileInView,
    variants,
    // Get all other props
    ...otherProps
  } = props;

  return {
    motionProps: {
      initial,
      animate,
      exit,
      transition,
      whileHover,
      whileTap,
      whileDrag,
      whileInView,
      variants
    },
    otherProps
  };
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, animated = false, ...props }, ref) => {
  const cardClass = cn(
    "rounded-lg border bg-card text-card-foreground shadow-card transition-all duration-200 hover:shadow-hover data-[state=active]:shadow-hover",
    className
  );
  
  if (animated) {
    // Extract motion props to prevent type errors
    const { motionProps, otherProps } = extractMotionProps(props);
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
        whileHover={{ y: -5 }}
        className={cardClass}
        {...motionProps}
        {...otherProps}
      />
    )
  }
  
  return (
    <div
      ref={ref}
      className={cardClass}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Fix the AnimatedCard component using the same approach
const AnimatedCard = React.forwardRef<HTMLDivElement, CardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    // Extract motion props to prevent type errors
    const { motionProps, otherProps } = extractMotionProps(props);
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.4,
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        whileHover={{ y: -5 }}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-card transition-all duration-200 hover:shadow-hover",
          className
        )}
        {...motionProps}
        {...otherProps}
      >
        {children}
      </motion.div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, AnimatedCard }
