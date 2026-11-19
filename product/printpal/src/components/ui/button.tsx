import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-[14px]/5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:ring-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border bg-card text-foreground shadow-sm hover:bg-muted hover:text-foreground",
        outlinePrimary:
          "border border-primary bg-card text-primary shadow-sm hover:bg-primary/10 hover:text-primary focus-visible:ring-primary",
        "outline-primary":
          "border border-primary bg-card text-primary shadow-sm hover:bg-primary/10 hover:text-primary focus-visible:ring-primary",
        outlineSecondary:
          "border border-secondary bg-card text-secondary shadow-sm hover:bg-secondary/10 hover:text-secondary focus-visible:ring-secondary",
        "outline-secondary":
          "border border-secondary bg-card text-secondary shadow-sm hover:bg-secondary/10 hover:text-secondary focus-visible:ring-secondary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        orange:
          "bg-[#D7440E] text-white font-medium shadow hover:bg-[#c23d0c] focus-visible:ring-[#D7440E]",
        blue:
          "bg-[#2878D0] text-white font-medium shadow hover:bg-[#2066b5] focus-visible:ring-[#2878D0]",
        charcoal:
          "bg-[#202428] text-white font-medium shadow hover:bg-[#2e343a] focus-visible:ring-[#202428]",
        tableAction:
          "h-8 w-8 p-0 rounded-[6px] border border-[#DCE1E5] bg-white text-[#2878D0] hover:bg-[#F3F5F7] hover:border-[#2878D0]/50 shadow-sm",
        cyan:
          "bg-cyan-500 text-slate-950 font-semibold shadow hover:bg-cyan-400 focus-visible:ring-cyan-500",
        amber:
          "bg-amber-500 text-slate-950 font-semibold shadow hover:bg-amber-400 focus-visible:ring-amber-500",
        emerald:
          "bg-emerald-500 text-slate-950 font-semibold shadow hover:bg-emerald-400 focus-visible:ring-emerald-500",
        workshop:
          "bg-[#202428] border border-[#D7440E]/40 text-[#D7440E] hover:bg-[#2e343a] hover:border-[#D7440E] shadow-sm font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[6px] px-3 text-[12px]/4",
        lg: "h-10 rounded-[6px] px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
