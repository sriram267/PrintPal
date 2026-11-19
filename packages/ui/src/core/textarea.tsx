import * as React from "react";
import { cn } from "../lib/cn";
import { fieldBase } from "./input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Multi-line text, for notes and addresses. Same look as Input. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cn(fieldBase, "min-h-16 resize-y px-3 py-2.5 leading-normal", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
