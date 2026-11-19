import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "@/shared/utils"

interface RadioGroupContextValue {
  name?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
}

export function RadioGroup({
  name,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  disabled,
  orientation = "vertical",
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = (val: string) => {
    if (!isControlled) setUncontrolledValue(val)
    onValueChange?.(val)
  }

  return (
    <RadioGroupContext.Provider
      value={{
        name,
        value: currentValue,
        onValueChange: handleValueChange,
        disabled,
      }}
    >
      <div
        role="radiogroup"
        className={cn(
          "grid gap-2",
          orientation === "horizontal" ? "grid-flow-col auto-cols-max" : "grid-flow-row",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, disabled, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    if (!context) {
      throw new Error("RadioGroupItem must be used within a RadioGroup")
    }

    const isChecked = context.value === value
    const isDisabled = disabled || context.disabled

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isChecked}
        disabled={isDisabled}
        onClick={() => !isDisabled && context.onValueChange?.(value)}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center transition-all",
          isChecked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
          className
        )}
        {...props}
      >
        {isChecked && <Circle className="h-2 w-2 fill-current text-current" />}
      </button>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"
