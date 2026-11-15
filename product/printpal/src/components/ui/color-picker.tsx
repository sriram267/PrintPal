import * as React from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  presets?: string[]
  className?: string
  disabled?: boolean
}

const DEFAULT_PRESETS = [
  "#0f172a", // Slate
  "#06b6d4", // Cyan
  "#f59e0b", // Workshop Amber
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#e2e8f0", // White/Silver
  "#ef4444", // Red
  "#22c55e", // Green
]

export function ColorPicker({
  value = "#06b6d4",
  onChange,
  presets = DEFAULT_PRESETS,
  className,
  disabled,
}: ColorPickerProps) {
  const [color, setColor] = React.useState(value)

  React.useEffect(() => {
    setColor(value)
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange?.(newColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start gap-2 text-left font-normal", className)}
        >
          <div
            className="h-4 w-4 rounded border border-white/20 shadow-sm shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-xs uppercase">{color}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex h-8 flex-1 rounded border border-input bg-transparent px-2 text-xs font-mono uppercase"
            />
          </div>

          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 tracking-wider">
              Workshop Presets
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  style={{ backgroundColor: preset }}
                  onClick={() => handleColorChange(preset)}
                  className={cn(
                    "h-6 w-full rounded border border-white/10 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500",
                    color.toLowerCase() === preset.toLowerCase() && "ring-2 ring-cyan-500"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
