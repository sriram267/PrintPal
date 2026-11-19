import * as React from "react";
import { cn } from "../lib/cn";

/** Shared look for every text-like field: 36px, 6px corners, blue border on focus, red when invalid. */
export const fieldBase =
  "w-full rounded-sm border border-line bg-white text-sm text-ink placeholder:text-faint " +
  "transition-[border-color,box-shadow] duration-base ease-out hover:border-line-strong " +
  "focus:border-accent focus:outline-none focus-visible:border-accent " +
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted " +
  "aria-[invalid=true]:border-danger-text aria-[invalid=true]:shadow-[0_0_0_1px_rgb(var(--pp-danger-text))]";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** An icon shown inside the field, on the left (search, phone…). */
  icon?: React.ReactNode;
  /** Marks the field red. Usually set for you by <Field error>. */
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, invalid, type = "text", ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        className={cn(fieldBase, "h-control px-3", icon && "pl-9", className)}
        {...props}
      />
    );
    if (!icon) return input;
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted [&_svg]:size-4">
          {icon}
        </span>
        {input}
      </div>
    );
  },
);
Input.displayName = "Input";
