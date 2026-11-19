import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { AlertCircle } from "lucide-react";
import { cn } from "../lib/cn";

/** The small grey label above a field. */
export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("mb-1.5 block text-xs font-medium tracking-[-0.006em] text-muted", className)}
    {...props}
  />
));
Label.displayName = "Label";

export interface FieldProps {
  label?: React.ReactNode;
  /** Adds a red * after the label. */
  required?: boolean;
  /** Grey help text under the field. */
  hint?: React.ReactNode;
  /** Red message under the field; also marks the field red. */
  error?: React.ReactNode;
  /** Connects the label to the field. Generated if left out. */
  id?: string;
  className?: string;
  /** One form control (Input, Textarea, Select…). */
  children: React.ReactElement;
}

/**
 * A form field: label + control + hint or error.
 * Wires up `id`, `aria-invalid` and `aria-describedby` for you.
 */
export function Field({ label, required, hint, error, id, className, children }: FieldProps) {
  const autoId = React.useId();
  const fieldId = id ?? (children.props as { id?: string }).id ?? `f${autoId.replace(/:/g, "")}`;
  const msgId = `${fieldId}-msg`;
  const control = React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    id: fieldId,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error || hint ? msgId : undefined,
  });
  return (
    <div className={cn("min-w-0", className)}>
      {label && (
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="ml-0.5 text-danger-text">*</span>}
        </Label>
      )}
      {control}
      {error ? (
        <p id={msgId} className="mt-1 flex items-center gap-1 text-2xs font-medium text-danger-text">
          <AlertCircle className="size-3" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="mt-1 text-2xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Lays fields out side by side: 2 or 3 columns that stack on small screens. */
export function FieldRow({ cols = 2, className, children }: { cols?: 2 | 3; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid gap-4", cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3", className)}>{children}</div>
  );
}
