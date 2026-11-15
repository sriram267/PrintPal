import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RatingProps {
  max?: number
  value?: number
  onChange?: (val: number) => void
  readOnly?: boolean
  size?: "sm" | "default" | "lg"
  className?: string
}

export function Rating({
  max = 5,
  value = 0,
  onChange,
  readOnly = false,
  size = "default",
  className,
}: RatingProps) {
  const [hoverVal, setHoverVal] = React.useState<number | null>(null)

  const activeVal = hoverVal !== null ? hoverVal : value

  const starSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4 w-4"

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, idx) => {
        const starNumber = idx + 1
        const isFilled = starNumber <= activeVal

        return (
          <button
            key={idx}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(starNumber)}
            onMouseEnter={() => !readOnly && setHoverVal(starNumber)}
            onMouseLeave={() => !readOnly && setHoverVal(null)}
            className={cn(
              "rounded-sm transition-transform focus:outline-none focus:ring-1 focus:ring-cyan-500",
              !readOnly && "hover:scale-110 cursor-pointer",
              readOnly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                starSize,
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30 fill-transparent"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
