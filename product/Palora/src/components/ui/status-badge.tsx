import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
  {
    variants: {
      status: {
        online: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        busy: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        offline: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
        error: "border-rose-500/30 bg-rose-500/10 text-rose-400",
        cut_active: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
      },
      pulse: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      status: "online",
      pulse: false,
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  label: string
}

export function StatusBadge({ status = "online", pulse = true, label, className, ...props }: StatusBadgeProps) {
  const getDotColor = () => {
    switch (status) {
      case "online":
        return "bg-emerald-400"
      case "busy":
        return "bg-amber-400"
      case "error":
        return "bg-rose-400"
      case "cut_active":
        return "bg-cyan-400"
      case "offline":
      default:
        return "bg-muted-foreground"
    }
  }

  return (
    <div className={cn(statusBadgeVariants({ status }), className)} {...props}>
      <span className="relative flex h-2 w-2">
        {pulse && status !== "offline" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              getDotColor()
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", getDotColor())} />
      </span>
      <span>{label}</span>
    </div>
  )
}
