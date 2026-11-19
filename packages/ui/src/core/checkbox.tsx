import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/*
 * The PrintPal checkbox. The looks are the finished product's, copied exactly (the product is built from this file).
 * Blue when ticked (default), or orange with variant="primary".
 */
export const checkboxVariants = cva(
  "peer shrink-0 rounded-[4px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--secondary)/0.7)] data-[state=checked]:bg-[hsl(var(--secondary))] data-[state=checked]:border-[hsl(var(--secondary))] data-[state=checked]:text-[hsl(var(--secondary-foreground))] focus-visible:ring-[hsl(var(--secondary)/0.3)]",
        secondary:
          "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--secondary)/0.7)] data-[state=checked]:bg-[hsl(var(--secondary))] data-[state=checked]:border-[hsl(var(--secondary))] data-[state=checked]:text-[hsl(var(--secondary-foreground))] focus-visible:ring-[hsl(var(--secondary)/0.3)]",
        primary:
          "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.7)] data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:border-[hsl(var(--primary))] data-[state=checked]:text-[hsl(var(--primary-foreground))] focus-visible:ring-[hsl(var(--primary)/0.3)]",
      },
      size: {
        default: "h-[18px] w-[18px]",
        sm: "h-4 w-4 rounded-[4px]",
        lg: "h-5 w-5 rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  /** Text next to the box. Clicking it toggles the box. */
  label?: React.ReactNode;
}

/** A square that turns blue when ticked. Supports "some selected" (indeterminate). */
export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, variant, size, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const boxId = id ?? (label ? `cb${autoId.replace(/:/g, "")}` : undefined);
    const box = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={boxId}
        className={cn(checkboxVariants({ variant, size, className }))}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
          {props.checked === "indeterminate" ? (
            <Minus
              className={cn(size === "sm" ? "h-2.5 w-2.5 stroke-[2.25]" : size === "lg" ? "h-3.5 w-3.5 stroke-[2.25]" : "h-3 w-3 stroke-[2.25]")}
            />
          ) : (
            <Check
              className={cn(size === "sm" ? "h-2.5 w-2.5 stroke-[2.25]" : size === "lg" ? "h-3.5 w-3.5 stroke-[2.25]" : "h-3 w-3 stroke-[2.25]")}
            />
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
