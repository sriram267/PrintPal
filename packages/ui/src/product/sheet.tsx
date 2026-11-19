import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** Buttons in the header, right of the title (Cancel / Save). */
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Space left above the sheet, so the top bar stays visible. */
  top?: number;
  className?: string;
}

/**
 * A big panel that slides up from the bottom for long forms (New customer, New supplier).
 * Grey background so white cards stand out; header with title and actions.
 */
export function Sheet({ open, onOpenChange, title, actions, children, top = 70, className }: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/10 animate-fade-in" />
        <DialogPrimitive.Content
          style={{ top }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-line bg-surface shadow-dialog animate-sheet-up focus:outline-none",
            className,
          )}
        >
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-[18px]">
            <DialogPrimitive.Title className="m-0 text-lg font-bold text-ink">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            <div className="flex items-center gap-2">
              {actions}
              <DialogPrimitive.Close aria-label="Close" className="ml-1 grid size-8 place-items-center rounded-sm text-muted hover:bg-black/5 hover:text-ink">
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
