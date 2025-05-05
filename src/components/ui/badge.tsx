
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline:
          "text-foreground border-white/10 hover:bg-white/5",
        purple:
          "border-transparent bg-purple-900/50 text-purple-200 shadow hover:bg-purple-900/70",
        gradient:
          "border border-white/10 bg-gradient-to-r from-purple-600 to-purple-900 text-white hover:from-purple-500 hover:to-purple-800",
        glass:
          "border border-white/10 bg-white/5 backdrop-blur-md text-foreground shadow hover:bg-white/10",
        glow: 
          "border-transparent bg-primary/20 text-primary-foreground shadow-[0_0_10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_15px_rgba(139,92,246,0.8)] transition-shadow",
        success:
          "border-transparent bg-success/20 text-success-foreground shadow hover:bg-success/30",
        warning:
          "border-transparent bg-warning/20 text-warning-foreground shadow hover:bg-warning/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
