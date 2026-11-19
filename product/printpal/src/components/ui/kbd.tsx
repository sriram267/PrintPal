import * as React from "react"
import { cn } from "@/shared/utils"

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "default" | "lg"
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, size = "default", children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(
          "pointer-events-none inline-flex select-none items-center gap-1 rounded border border-border bg-muted font-mono font-medium text-muted-foreground shadow-[0_1px_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_1px_rgba(255,255,255,0.05)]",
          size === "sm" ? "h-5 px-1.5 text-[10px]" : size === "lg" ? "h-7 px-2.5 text-sm" : "h-6 px-2 text-xs",
          className
        )}
        {...props}
      >
        {children}
      </kbd>
    )
  }
)
Kbd.displayName = "Kbd"
