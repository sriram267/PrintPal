import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/components/ui/button"

export interface CarouselProps {
  items: React.ReactNode[]
  autoPlay?: boolean
  interval?: number
  className?: string
}

export function Carousel({
  items,
  autoPlay = false,
  interval = 4000,
  className,
}: CarouselProps) {
  const [current, setCurrent] = React.useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1))
  const next = React.useCallback(() => {
    setCurrent((c) => (c === items.length - 1 ? 0 : c + 1))
  }, [items.length])

  React.useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, next])

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {items.map((item, idx) => (
          <div key={idx} className="w-full shrink-0 min-w-full">
            {item}
          </div>
        ))}
      </div>

      {/* Prev / Next controls */}
      <div className="absolute inset-y-0 left-2 flex items-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={prev}
          className="h-8 w-8 rounded-full p-0 shadow-md backdrop-blur-sm bg-background/80 hover:bg-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-2 flex items-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={next}
          className="h-8 w-8 rounded-full p-0 shadow-md backdrop-blur-sm bg-background/80 hover:bg-background"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              current === idx ? "w-6 bg-cyan-400" : "w-1.5 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  )
}
