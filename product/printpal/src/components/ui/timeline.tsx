import * as React from "react"
import { CheckCircle2, Clock, AlertTriangle, Circle } from "lucide-react"
import { cn } from "@/shared/utils"

export interface TimelineItem {
  id: string | number
  title: string
  description?: string
  timestamp?: string
  status?: "completed" | "current" | "pending" | "warning"
  icon?: React.ReactNode
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-6 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border", className)}>
      {items.map((item) => {
        const isCompleted = item.status === "completed"
        const isCurrent = item.status === "current"
        const isWarning = item.status === "warning"

        return (
          <div key={item.id} className="relative group">
            {/* Node Icon */}
            <div
              className={cn(
                "absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-xs",
                isCompleted && "border-emerald-500 bg-emerald-500/10 text-emerald-400",
                isCurrent && "border-cyan-500 bg-cyan-500/20 text-cyan-400 ring-4 ring-cyan-500/20",
                isWarning && "border-amber-500 bg-amber-500/20 text-amber-400",
                !isCompleted && !isCurrent && !isWarning && "border-border text-muted-foreground"
              )}
            >
              {item.icon || (
                isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isCurrent ? (
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                ) : isWarning ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-2 w-2 fill-current" />
                )
              )}
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-sm font-semibold", isCurrent ? "text-cyan-400" : "text-foreground")}>
                  {item.title}
                </span>
                {item.timestamp && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {item.timestamp}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
