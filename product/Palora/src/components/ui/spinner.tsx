import * as React from "react"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const spinnerVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      sm: "h-3.5 w-3.5",
      default: "h-5 w-5",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-muted-foreground",
      cyan: "text-cyan-400",
      amber: "text-amber-500",
      primary: "text-primary",
      white: "text-white",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
})

export interface SpinnerProps
  extends React.HTMLAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

export function Spinner({ size, variant, label, className, ...props }: SpinnerProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Loader2 className={cn(spinnerVariants({ size, variant }), className)} {...props} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}
