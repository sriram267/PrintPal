import * as React from "react";
import { cn } from "../lib/cn";

/** Shared look for every text-like field: 36px, 6px corners, blue border on focus, red when invalid. Same as the product. */
export const fieldBase =
  "w-full rounded-[6px] border border-line bg-white text-[14px]/5 text-ink placeholder:text-muted " +
  "focus:outline-none focus:border-accent focus:ring-0 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-0 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "aria-[invalid=true]:border-danger-text aria-[invalid=true]:shadow-[0_0_0_1px_rgb(var(--pp-danger-text))]";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** An icon shown inside the field, on the left (search, phone…). */
  icon?: React.ReactNode;
  /** Marks the field red. Usually set for you by <Field error>. */
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, invalid, type, ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        className={cn(
          fieldBase,
          "flex h-9 px-3 py-1 shadow-none transition-colors file:border-0 file:bg-transparent file:text-[14px]/5 file:font-medium file:text-foreground",
          icon && "pl-9",
          className,
        )}
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
