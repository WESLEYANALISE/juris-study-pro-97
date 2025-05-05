
import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-xl border text-card-foreground shadow-card transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card border-white/5",
        glass: "bg-white/5 backdrop-blur-md border-white/10",
        primary: "bg-gradient-to-br from-primary/10 to-purple-900/10 border-primary/20",
        secondary: "bg-gradient-to-br from-secondary/30 to-secondary/10 border-secondary/20",
        outline: "bg-transparent border-white/10",
        gradient: "bg-gradient-to-br from-purple-800/30 to-purple-900/10 border-purple-800/20",
      },
      hover: {
        true: "hover:shadow-hover hover:-translate-y-1",
        false: "",
      },
      animation: {
        float: "animate-float",
        pulse: "animate-pulse-glow",
        glow: "animate-glow",
        none: "",
      }
    },
    defaultVariants: {
      variant: "default",
      hover: false,
      animation: "none",
    },
  }
)

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, variant, hover, animation, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, hover, animation, className }))}
    {...props}
  />
))
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
      "text-2xl font-semibold leading-none tracking-tight",
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

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
