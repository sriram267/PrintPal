import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeGroupVariants = cva(
  "inline-flex items-center rounded-full border text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        green: "bg-[#DCF9EE] border-[#99E6C9] text-[#047857]",
        primary: "bg-[#FFF2ED] border-[#FFD6C7] text-[#D7440E]",
        secondary: "bg-[#EDF5FD] border-[#BADBF7] text-[#2878D0]",
        orange: "bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]",
        blue: "bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]",
        outline: "bg-[#F3F5F7] border-[#DCE1E5] text-[#202428]",
      },
      size: {
        sm: "pl-2 pr-0.5 py-0.5 gap-1.5 text-[11px]",
        default: "pl-2.5 pr-0.5 py-0.5 gap-1.5 text-xs",
        lg: "pl-3 pr-1 py-1 gap-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "green",
      size: "default",
    },
  }
)

const badgeGroupCounterVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        green: "bg-[#BFF2DE] text-[#065F46]",
        primary: "bg-[#FFD9CC] text-[#BF3806]",
        secondary: "bg-[#CCE5F9] text-[#1B64B3]",
        orange: "bg-[#FED7AA] text-[#9A3412]",
        blue: "bg-[#BAE6FD] text-[#075985]",
        outline: "bg-[#E4E7EB] text-[#202428]",
      },
      size: {
        sm: "px-1.5 py-[1px] text-[10px]",
        default: "px-2 py-[2px] text-[11px]",
        lg: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "green",
      size: "default",
    },
  }
)

export interface BadgeGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeGroupVariants> {
  label?: React.ReactNode
  counter?: React.ReactNode
}

export function BadgeGroup({
  className,
  variant = "green",
  size = "default",
  label,
  counter,
  children,
  ...props
}: BadgeGroupProps) {
  return (
    <div
      className={cn(badgeGroupVariants({ variant, size }), className)}
      {...props}
    >
      {label && <span className="font-medium whitespace-nowrap">{label}</span>}
      {children}
      {counter !== undefined && counter !== null && (
        <span className={cn(badgeGroupCounterVariants({ variant, size }), "whitespace-nowrap")}>
          {counter}
        </span>
      )}
    </div>
  )
}

export function BadgeGroupLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("font-medium whitespace-nowrap", className)} {...props}>
      {children}
    </span>
  )
}

export function BadgeGroupCounter({
  className,
  variant = "green",
  size = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeGroupCounterVariants>) {
  return (
    <span
      className={cn(badgeGroupCounterVariants({ variant, size }), "whitespace-nowrap", className)}
      {...props}
    >
      {children}
    </span>
  )
}

export { badgeGroupVariants, badgeGroupCounterVariants }

