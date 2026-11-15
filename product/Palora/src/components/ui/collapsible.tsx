import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CollapsibleProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  title,
  children,
  className,
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const handleToggle = () => {
    const next = !isOpen
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between p-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-cyan-400"
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border/60 p-3.5 text-xs text-muted-foreground animate-in fade-in-50">
          {children}
        </div>
      )}
    </div>
  )
}
