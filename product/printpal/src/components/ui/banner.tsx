import * as React from "react"
import { X, ChevronRight } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils"

export const bannerVariants = cva(
  "relative flex w-full items-center justify-between gap-3 px-4 py-2.5 text-xs font-medium border-b",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/40 text-foreground",
        cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
        amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  actionLabel?: string
  onAction?: () => void
  onDismiss?: () => void
}

export function Banner({
  variant,
  children,
  actionLabel,
  onAction,
  onDismiss,
  className,
  ...props
}: BannerProps) {
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed) return null

  return (
    <div className={cn(bannerVariants({ variant }), className)} {...props}>
      <div className="flex items-center gap-2 flex-1 justify-center truncate">
        <span>{children}</span>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:opacity-80"
          >
            <span>{actionLabel}</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={() => {
            setDismissed(true)
            onDismiss()
          }}
          className="rounded p-1 hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Dismiss</span>
        </button>
      )}
    </div>
  )
}
