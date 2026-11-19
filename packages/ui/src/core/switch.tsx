import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../lib/cn";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
}

/** An on / off setting that takes effect immediately (e.g. "Show suppliers"). */
export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    const autoId = React.useId();
    const swId = id ?? `sw${autoId.replace(/:/g, "")}`;
    const control = (
      <SwitchPrimitive.Root
        ref={ref}
        id={swId}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-line transition-colors duration-base",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 data-[state=checked]:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb className="block size-4 rounded-full bg-white shadow-xs transition-transform duration-base ease-spring data-[state=checked]:translate-x-4" />
      </SwitchPrimitive.Root>
    );
    if (!label) return control;
    return (
      <div className="flex items-start justify-between gap-4">
        <label htmlFor={swId} className="cursor-pointer select-none text-sm text-ink">
          {label}
          {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
        </label>
        {control}
      </div>
    );
  },
);
Switch.displayName = "Switch";
