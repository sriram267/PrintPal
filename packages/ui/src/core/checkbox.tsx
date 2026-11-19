import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../lib/cn";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Text next to the box. Clicking it toggles the box. */
  label?: React.ReactNode;
}

/** An 18px square that turns blue when ticked. Supports "some selected" (indeterminate). */
export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const boxId = id ?? `cb${autoId.replace(/:/g, "")}`;
    const box = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={boxId}
        className={cn(
          "peer grid size-[18px] shrink-0 place-items-center rounded-xs border-[1.25px] border-line bg-white text-white transition-colors duration-base",
          "hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
          "data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          {props.checked === "indeterminate" ? (
            <Minus className="size-3" strokeWidth={2.5} />
          ) : (
            <Check className="size-3" strokeWidth={2.5} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
    if (!label) return box;
    return (
      <div className="flex items-start gap-2.5">
        {box}
        <label htmlFor={boxId} className="cursor-pointer select-none text-sm leading-[1.35] text-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-60">
          {label}
        </label>
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
