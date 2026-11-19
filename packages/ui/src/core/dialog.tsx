import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./button";

/** A centred pop-up that asks for attention. Use Sheet for big forms. */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** An icon badge shown left of the title. */
  icon?: React.ReactNode;
  /** Buttons, shown bottom-right. */
  footer?: React.ReactNode;
  width?: number;
  hideClose?: boolean;
}

export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, title, description, icon, footer, width = 420, hideClose, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/30 animate-fade-in" />
      <DialogPrimitive.Content
        ref={ref}
        style={{ maxWidth: width }}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-line bg-white p-6 shadow-dialog animate-scale-in focus:outline-none",
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-3.5">
          {icon && <div className="grid size-10 shrink-0 place-items-center rounded-full">{icon}</div>}
          <div className="min-w-0 flex-1">
            <DialogPrimitive.Title className="text-md font-semibold leading-snug text-[#0F172A]">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm leading-normal text-[#64748B]">{description}</DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          {!hideClose && (
            <DialogPrimitive.Close className="-mr-1.5 -mt-1.5 grid size-8 place-items-center rounded-sm text-muted hover:bg-black/5 hover:text-ink" aria-label="Close">
              <X className="size-4" />
            </DialogPrimitive.Close>
          )}
        </div>
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
DialogContent.displayName = "DialogContent";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for delete: red button and a warning icon. */
  tone?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
}

/** "Are you sure?" — ready-made, for deletes and other actions that can't be undone. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);
  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title}
        description={description}
        hideClose
        icon={
          tone === "danger" ? (
            <span className="grid size-10 place-items-center rounded-full bg-danger-tint text-danger">
              <AlertTriangle className="size-5" />
            </span>
          ) : undefined
        }
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline">{cancelLabel}</Button>
            </DialogClose>
            <Button variant={tone === "danger" ? "danger" : "primary"} loading={busy} onClick={run}>
              {confirmLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
