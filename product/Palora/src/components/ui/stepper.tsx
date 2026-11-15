import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  title: string
  description?: string
}

export interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  className,
}: StepperProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        orientation === "vertical" ? "flex-col space-y-4" : "flex-row items-center justify-between",
        className
      )}
    >
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep
        const isCurrent = idx === currentStep
        const isPending = idx > currentStep

        return (
          <React.Fragment key={idx}>
            <div
              onClick={() => onStepClick?.(idx)}
              className={cn(
                "flex items-center gap-3",
                onStepClick && "cursor-pointer select-none group",
                orientation === "horizontal" && "flex-1"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all",
                  isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                  isCurrent && "border-cyan-500 bg-cyan-500/10 text-cyan-400 ring-4 ring-cyan-500/20 font-bold",
                  isPending && "border-border bg-muted/40 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
              </div>

              <div className="min-w-0">
                <div
                  className={cn(
                    "text-xs font-semibold truncate",
                    isCurrent ? "text-cyan-400" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-[10px] text-muted-foreground truncate">
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {orientation === "horizontal" && idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1 mx-3 transition-colors",
                  idx < currentStep ? "bg-emerald-500" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
