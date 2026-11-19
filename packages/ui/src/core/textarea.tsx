import * as React from "react";
import { cn } from "../lib/cn";
import { fieldBase } from "./input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Multi-line text, for notes and addresses. Same look as Input. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cn(fieldBase, "flex min-h-[60px] px-3 py-2", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
