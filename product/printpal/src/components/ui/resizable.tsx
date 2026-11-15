import * as React from "react"
import { GripVertical, GripHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical"
  initialSplit?: number // percentage 0-100
  left: React.ReactNode
  right: React.ReactNode
}

export function ResizablePanelGroup({
  direction = "horizontal",
  initialSplit = 50,
  left,
  right,
  className,
}: ResizablePanelGroupProps) {
  const [split, setSplit] = React.useState(initialSplit)
  const isDragging = React.useRef(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    isDragging.current = true
    document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      if (direction === "horizontal") {
        const offset = e.clientX - rect.left
        const percent = Math.min(Math.max((offset / rect.width) * 100, 15), 85)
        setSplit(percent)
      } else {
        const offset = e.clientY - rect.top
        const percent = Math.min(Math.max((offset / rect.height) * 100, 15), 85)
        setSplit(percent)
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const isHoriz = direction === "horizontal"

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex rounded-lg border border-border bg-card overflow-hidden",
        isHoriz ? "flex-row h-64" : "flex-col h-80",
        className
      )}
    >
      <div
        style={{ [isHoriz ? "width" : "height"]: `${split}%` }}
        className="overflow-auto p-4"
      >
        {left}
      </div>

      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "flex items-center justify-center bg-muted/80 hover:bg-cyan-500/30 transition-colors z-10",
          isHoriz ? "w-2.5 cursor-col-resize hover:w-3" : "h-2.5 cursor-row-resize hover:h-3"
        )}
      >
        {isHoriz ? (
          <GripVertical className="h-3 w-3 text-muted-foreground opacity-60" />
        ) : (
          <GripHorizontal className="h-3 w-3 text-muted-foreground opacity-60" />
        )}
      </div>

      <div
        style={{ [isHoriz ? "width" : "height"]: `${100 - split}%` }}
        className="overflow-auto p-4"
      >
        {right}
      </div>
    </div>
  )
}
