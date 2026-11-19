import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/components/ui/button"

export interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "default"
  onConfirm?: () => void
  onCancel?: () => void
  children?: React.ReactNode
}

export function AlertDialog({
  open: controlledOpen,
  onOpenChange,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "destructive",
  onConfirm,
  onCancel,
  children,
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = (val: boolean) => {
    if (!isControlled) setUncontrolledOpen(val)
    onOpenChange?.(val)
  }

  return (
    <>
      {children && (
        <span onClick={() => setOpen(true)} className="inline-block">
          {children}
        </span>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in-0"
            onClick={() => {
              onCancel?.()
              setOpen(false)
            }}
          />
          <div className="relative z-50 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 fade-in-0">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "rounded-full p-2.5 shrink-0",
                  variant === "destructive" && "bg-rose-500/10 text-rose-500",
                  variant === "warning" && "bg-amber-500/10 text-amber-500",
                  variant === "default" && "bg-cyan-500/10 text-cyan-400"
                )}
              >
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onCancel?.()
                  setOpen(false)
                }}
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === "destructive" ? "destructive" : "default"}
                size="sm"
                onClick={() => {
                  onConfirm?.()
                  setOpen(false)
                }}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
