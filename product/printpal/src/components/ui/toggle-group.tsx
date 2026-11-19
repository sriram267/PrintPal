import * as React from "react"
import { cn } from "@/shared/utils"

interface ToggleGroupContextValue {
  type: "single" | "multiple"
  value: string | string[]
  onValueChange: (val: string) => void
  variant?: "default" | "outline" | "amber"
  size?: "default" | "sm" | "lg"
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null)

export interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: any) => void
  variant?: "default" | "outline" | "amber"
  size?: "default" | "sm" | "lg"
}

export function ToggleGroup({
  type = "single",
  value: controlledValue,
  defaultValue = type === "single" ? "" : [],
  onValueChange,
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ToggleGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = (itemValue: string) => {
    if (type === "single") {
      const next = currentValue === itemValue ? "" : itemValue
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    } else {
      const arrayVal = Array.isArray(currentValue) ? currentValue : []
      const next = arrayVal.includes(itemValue)
        ? arrayVal.filter((v) => v !== itemValue)
        : [...arrayVal, itemValue]
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    }
  }

  return (
    <ToggleGroupContext.Provider
      value={{
        type,
        value: currentValue,
        onValueChange: handleValueChange,
        variant,
        size,
      }}
    >
      <div
        role="group"
        className={cn("inline-flex items-center justify-center gap-1 rounded-md", className)}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

export interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)
    if (!context) {
      throw new Error("ToggleGroupItem must be used within a ToggleGroup")
    }

    const isSelected = Array.isArray(context.value)
      ? context.value.includes(value)
      : context.value === value

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isSelected}
        data-state={isSelected ? "on" : "off"}
        onClick={() => context.onValueChange(value)}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          context.size === "sm" ? "h-8 px-2.5 text-xs" : context.size === "lg" ? "h-11 px-5" : "h-9 px-3",
          context.variant === "outline" && "border border-input",
          isSelected
            ? context.variant === "amber"
              ? "bg-amber-500 text-black font-semibold shadow-sm"
              : "bg-accent text-accent-foreground shadow-sm"
            : "bg-transparent text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
ToggleGroupItem.displayName = "ToggleGroupItem"
