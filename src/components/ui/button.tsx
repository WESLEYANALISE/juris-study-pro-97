
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl hover:shadow-destructive/20 hover:bg-destructive/90",
        outline: "border-2 border-primary/30 bg-background/50 hover:bg-primary/10 hover:text-accent-foreground shadow-lg hover:shadow-accent/20",
        secondary: "bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:shadow-secondary/20 hover:bg-secondary/90",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white shadow-lg hover:shadow-xl hover:shadow-green-700/20 hover:bg-green-700",
        warning: "bg-yellow-500 text-white shadow-lg hover:shadow-xl hover:shadow-yellow-500/20 hover:bg-yellow-600",
        purple: "bg-[#9b87f5] text-white shadow-lg hover:shadow-xl hover:shadow-[#9b87f5]/25 hover:bg-[#7E69AB]",
        primary: "bg-[#9b87f5] text-white shadow-lg hover:shadow-xl hover:shadow-[#9b87f5]/25 hover:bg-[#7E69AB]",
        gradient: "bg-gradient-to-r from-purple-600 to-purple-900 text-white shadow-lg hover:shadow-xl hover:shadow-purple-600/25 hover:saturate-150 border border-purple-700/20",
        glass: "bg-primary/10 backdrop-blur-md border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/30 hover:text-primary-foreground transition-all duration-300",
        subtle: "bg-background/40 hover:bg-background/60 text-foreground shadow-none transition-colors border border-primary/10",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-12 rounded-md px-10 text-base",
      },
      glow: {
        true: "after:content-[''] after:absolute after:inset-0 after:rounded-lg after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 after:bg-gradient-radial after:from-white/20 after:to-transparent after:z-[-1] relative overflow-hidden",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
