import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export const Modal = DialogPrimitive.Root
export const ModalTrigger = DialogPrimitive.Trigger
export const ModalPortal = DialogPrimitive.Portal
export const ModalClose = DialogPrimitive.Close

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Overlay
───────────────────────────────────────────────────────────────────────────── */
export const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[#0C111D]/70 backdrop-blur-sm transition-opacity duration-200",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ModalOverlay.displayName = "ModalOverlay"

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Content Container
───────────────────────────────────────────────────────────────────────────── */
export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  showClose?: boolean
}

const sizeClasses = {
  sm: "max-w-[360px]",
  md: "max-w-[420px]",
  lg: "max-w-[500px]",
  xl: "max-w-[600px]",
  "2xl": "max-w-[760px]",
}

export const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, size = "md", showClose = true, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] overflow-hidden",
        "bg-white rounded-2xl border border-[#EAECF0] shadow-2xl transition-all duration-200 focus:outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-[#98A2B3] transition-colors hover:bg-[#F2F4F7] hover:text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#7F56D9]">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </ModalPortal>
))
ModalContent.displayName = "ModalContent"

/* ─────────────────────────────────────────────────────────────────────────────
   Untitled UI Dual-Ring Icon Badge
───────────────────────────────────────────────────────────────────────────── */
export interface ModalIconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "destructive" | "brand" | "gray"
  shape?: "circle" | "square"
}

const badgeVariants = {
  success: {
    outer: "bg-[#D1FADF]/50",
    inner: "bg-[#ECFDF3] text-[#12B76A] border-[#D1FADF]",
  },
  warning: {
    outer: "bg-[#FEDF89]/50",
    inner: "bg-[#FEF0C7] text-[#F79009] border-[#FEDF89]",
  },
  destructive: {
    outer: "bg-[#FECDCA]/50",
    inner: "bg-[#FEE4E2] text-[#F04438] border-[#FECDCA]",
  },
  brand: {
    outer: "bg-[#E9D7FE]/50",
    inner: "bg-[#F4EBFF] text-[#7F56D9] border-[#E9D7FE]",
  },
  gray: {
    outer: "bg-[#EAECF0]/60",
    inner: "bg-[#F9FAFB] text-[#667085] border-[#EAECF0]",
  },
}

export function ModalIconBadge({
  variant = "brand",
  shape = "circle",
  className,
  children,
  ...props
}: ModalIconBadgeProps) {
  const styles = badgeVariants[variant]
  const isCircle = shape === "circle"

  return (
    <div
      className={cn(
        "inline-flex p-1.5 transition-transform",
        styles.outer,
        isCircle ? "rounded-full" : "rounded-2xl",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center border shadow-xs text-lg",
          styles.inner,
          isCircle ? "rounded-full" : "rounded-xl"
        )}
      >
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Avatar Group (Centered 3-Avatar Overlap)
───────────────────────────────────────────────────────────────────────────── */
export function ModalAvatarGroup({
  avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  ],
  className,
}: {
  avatars?: string[]
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-center -space-x-3 py-2", className)}>
      {avatars.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Team member ${i + 1}`}
          className={cn(
            "h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-black/5",
            i === 1 ? "h-14 w-14 z-10 scale-105" : "z-0"
          )}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Header & Text
───────────────────────────────────────────────────────────────────────────── */
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center"
}

export function ModalHeader({
  align = "left",
  className,
  children,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 p-6 pb-2",
        align === "center" ? "text-center items-center" : "text-left items-start",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[18px] font-semibold tracking-tight text-[#101828] leading-snug",
        className
      )}
      {...props}
    />
  )
}

export function ModalDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[14px] font-normal text-[#475467] leading-relaxed", className)}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Body
───────────────────────────────────────────────────────────────────────────── */
export function ModalBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-3 space-y-4", className)} {...props} />
}

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Footer & Buttons
───────────────────────────────────────────────────────────────────────────── */
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: "horizontal" | "stacked" | "split"
}

export function ModalFooter({
  layout = "horizontal",
  className,
  ...props
}: ModalFooterProps) {
  return (
    <div
      className={cn(
        "p-6 pt-3",
        layout === "horizontal" &&
          "flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3",
        layout === "stacked" && "flex flex-col gap-3",
        layout === "split" &&
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[#EAECF0] mt-2 pt-4",
        className
      )}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Action Buttons
───────────────────────────────────────────────────────────────────────────── */
export interface ModalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "brand"
  fullWidth?: boolean
}

export const ModalButton = React.forwardRef<HTMLButtonElement, ModalButtonProps>(
  ({ className, variant = "secondary", fullWidth = false, ...props }, ref) => {
    const variantStyles = {
      primary:
        "bg-[#7F56D9] text-white hover:bg-[#6941C6] border border-transparent shadow-xs focus-visible:ring-[#7F56D9]",
      brand:
        "bg-[#7F56D9] text-white hover:bg-[#6941C6] border border-transparent shadow-xs focus-visible:ring-[#7F56D9]",
      destructive:
        "bg-[#D92D20] text-white hover:bg-[#B42318] border border-transparent shadow-xs focus-visible:ring-[#D92D20]",
      secondary:
        "bg-white text-[#344054] border border-[#D0D5DD] hover:bg-[#F9FAFB] shadow-xs focus-visible:ring-[#98A2B3]",
      outline:
        "bg-transparent text-[#344054] border border-[#D0D5DD] hover:bg-[#F9FAFB] focus-visible:ring-[#98A2B3]",
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    )
  }
)
ModalButton.displayName = "ModalButton"

/* ─────────────────────────────────────────────────────────────────────────────
   Modal Checkbox Option ("Don't show again", "Remember me")
───────────────────────────────────────────────────────────────────────────── */
export function ModalCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  className,
}: {
  id: string
  label: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none text-[13px] text-[#475467] hover:text-[#101828] transition-colors",
        className
      )}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-[#D0D5DD] text-[#7F56D9] focus:ring-0 focus:ring-offset-0 cursor-pointer"
      />
      <span>{label}</span>
    </label>
  )
}
