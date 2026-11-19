import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils"

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-border",
        orange: "border-[#D7440E]/30 bg-[#D7440E]/10 text-[#D7440E] hover:bg-[#D7440E]/20",
        blue: "border-[#2878D0]/30 bg-[#2878D0]/10 text-[#2878D0] hover:bg-[#2878D0]/20",
        charcoal: "border-[#202428] bg-[#202428] text-white shadow-sm",
        slate: "border-[#DCE1E5] bg-[#F3F5F7] text-[#737B84]",
        light: "border-[#DCE1E5] bg-[#F3F5F7] text-[#202428]",
        cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
        amber: "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
        emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
        rose: "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
        workshop: "border-[#D7440E]/40 bg-[#D7440E] text-white font-bold shadow-sm",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, shape, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, shape }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
