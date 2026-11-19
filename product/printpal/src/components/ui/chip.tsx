import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils"

export const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-border text-foreground hover:bg-muted",
        amber: "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
        cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
        emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
        rose: "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        default: "text-xs px-2.5 py-1",
        lg: "text-sm px-3.5 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  onRemove?: () => void
  selected?: boolean
}

export function Chip({
  className,
  variant,
  size,
  onRemove,
  selected,
  children,
  onClick,
  ...props
}: ChipProps) {
  return (
    <div
      className={cn(
        chipVariants({ variant, size }),
        selected && "ring-2 ring-cyan-500 ring-offset-1 ring-offset-background",
        onClick && "cursor-pointer select-none",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 -mr-1 h-3.5 w-3.5 rounded-full hover:bg-black/20 dark:hover:bg-white/20 inline-flex items-center justify-center p-0.5 transition-colors"
        >
          <X className="h-2.5 w-2.5" />
          <span className="sr-only">Remove</span>
        </button>
      )}
    </div>
  )
}
