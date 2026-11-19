import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils"

export const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-xl transition ease-in-out duration-300 border-border",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b animate-in slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t animate-in slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r animate-in slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l animate-in slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

export interface SheetProps extends VariantProps<typeof sheetVariants> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  trigger?: React.ReactNode
}

export function Sheet({
  open: controlledOpen,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  trigger,
}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = (val: boolean) => {
    if (!isControlled) setUncontrolledOpen(val)
    onOpenChange?.(val)
  }

  return (
    <>
      {trigger && (
        <span onClick={() => setOpen(true)} className="inline-block cursor-pointer">
          {trigger}
        </span>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
            onClick={() => setOpen(false)}
          />
          <div className={cn(sheetVariants({ side }))}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            {(title || description) && (
              <div className="space-y-1 mb-4">
                {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            )}

            <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}
