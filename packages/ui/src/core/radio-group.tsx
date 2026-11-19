import * as React from "react";
import * as RadioPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../lib/cn";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root>, "children"> {
  options: RadioOption[];
}

/** Pick exactly one of a few options, all visible at once. */
export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioPrimitive.Root>, RadioGroupProps>(
  ({ className, options, ...props }, ref) => {
    const base = React.useId().replace(/:/g, "");
    return (
      <RadioPrimitive.Root ref={ref} className={cn("grid gap-2.5", className)} {...props}>
        {options.map((o) => {
          const id = `${base}-${o.value}`;
          return (
            <div key={o.value} className="flex items-start gap-2.5">
              <RadioPrimitive.Item
                id={id}
                value={o.value}
                disabled={o.disabled}
                className="peer mt-px grid size-[18px] shrink-0 place-items-center rounded-full border-[1.25px] border-line bg-white transition-colors duration-base hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 data-[state=checked]:border-accent disabled:opacity-50"
              >
                <RadioPrimitive.Indicator className="size-2.5 rounded-full bg-accent" />
              </RadioPrimitive.Item>
              <label htmlFor={id} className="cursor-pointer select-none text-sm leading-[1.35] text-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-60">
                {o.label}
                {o.hint && <span className="mt-0.5 block text-xs text-muted">{o.hint}</span>}
              </label>
            </div>
          );
        })}
      </RadioPrimitive.Root>
    );
  },
);
RadioGroup.displayName = "RadioGroup";
