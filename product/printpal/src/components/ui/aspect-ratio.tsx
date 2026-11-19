import * as React from "react"
import { cn } from "@/shared/utils"

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number // e.g. 16/9, 4/3, 1/1
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 16 / 9, className, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden", className)}
        style={{
          paddingBottom: `${(1 / ratio) * 100}%`,
          ...style,
        }}
        {...props}
      >
        <div className="absolute inset-0 [&>*]:h-full [&>*]:w-full [&>*]:object-cover">
          {children}
        </div>
      </div>
    )
  }
)
AspectRatio.displayName = "AspectRatio"
