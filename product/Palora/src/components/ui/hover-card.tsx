import * as React from "react"
import { cn } from "@/lib/utils"

export interface HoverCardProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function HoverCard({ trigger, children, className }: HoverCardProps) {
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<number | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setOpen(false)
    }, 150)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="inline-block cursor-pointer">{trigger}</span>

      {open && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
