import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium select-none " +
    "transition-[background-color,border-color,color,box-shadow,transform] duration-base ease-out active:scale-[0.975] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1 " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Main action of a page or form: Save, Create, Add new. Orange. */
        primary: "bg-brand text-white hover:bg-brand-hover hover:shadow-brand",
        /** Second-most important action, or print-related actions. Blue. */
        secondary: "bg-accent text-white hover:bg-accent-hover",
        /** Strong neutral action on light pages (website "Join the waitlist"). */
        dark: "bg-night text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(16,18,20,0.2)] hover:bg-night-hover",
        /** Cancel, Back, quieter actions. White with a border. */
        outline: "border border-line bg-white text-ink hover:border-line-strong hover:bg-surface",
        /** Inline actions inside cards and toolbars. */
        ghost: "text-ink-2 hover:bg-surface hover:text-ink",
        /** Delete and other actions that can't be undone. */
        danger: "border border-danger-hover bg-danger text-white hover:bg-danger-hover",
        /** Looks like a text link. */
        link: "h-auto px-0 text-accent underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        xs: "h-control-xs rounded-sm px-3 text-xs",
        sm: "h-control-sm rounded-sm px-3 text-xs",
        md: "h-control rounded-sm px-4 text-sm",
        lg: "h-control-lg rounded-lg px-[18px] text-md",
        icon: "size-control rounded-sm p-0",
      },
      shape: {
        default: "",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md", shape: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the styles on a child element instead (e.g. a link). */
  asChild?: boolean;
  /** Shows a spinner and blocks clicks while an action runs. */
  loading?: boolean;
}

/** The PrintPal button. One component for every clickable action. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Spinner size={14} />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
