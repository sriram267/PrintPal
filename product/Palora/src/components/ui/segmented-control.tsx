import * as React from "react"
import { cn } from "@/lib/utils"

export interface SegmentedOption {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
}

export interface SegmentedControlProps {
  options: SegmentedOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  size?: "sm" | "default" | "lg"
  variant?: "default" | "blue" | "printpal"
  className?: string
  disabled?: boolean
}

export function SegmentedControl({
  options,
  value: controlledValue,
  defaultValue = options[0]?.value,
  onChange,
  size = "default",
  variant = "default",
  className,
  disabled,
}: SegmentedControlProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : uncontrolledValue

  const handleSelect = (val: string) => {
    if (disabled) return
    if (!isControlled) setUncontrolledValue(val)
    onChange?.(val)
  }

  const heightClass = size === "sm" ? "h-8 p-0.5 text-xs" : size === "lg" ? "h-11 p-1 text-sm" : "h-9 p-1 text-xs"

  const isPrintPalVariant = variant === "blue" || variant === "printpal"

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center rounded-lg text-muted-foreground",
        isPrintPalVariant
          ? "bg-white border border-[#DCE1E5] p-0.5 shadow-sm"
          : "bg-muted/60 border border-border/60",
        heightClass,
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === currentValue

        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md px-3 font-medium transition-all select-none whitespace-nowrap h-full",
              isSelected
                ? isPrintPalVariant
                  ? "bg-[#2878D0] text-white shadow-sm font-semibold"
                  : "bg-background text-foreground shadow-sm font-semibold"
                : isPrintPalVariant
                ? "text-[#737B84] hover:text-[#202428] hover:bg-[#F3F5F7]/80"
                : "hover:text-foreground text-muted-foreground"
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
