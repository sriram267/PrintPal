import * as React from "react"
import { cn } from "@/shared/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-[#DCE1E5] bg-white px-3 py-2 text-sm text-[#202428] shadow-none placeholder:text-[#737B84] focus:outline-none focus:border-[#2878D0] focus:ring-0 focus-visible:outline-none focus-visible:border-[#2878D0] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
