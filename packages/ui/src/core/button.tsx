import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Spinner } from "./spinner";

/*
 * The PrintPal button. These looks are the finished product's, copied exactly (the product is built from this file).
 * Variant names match what the product screens already use.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-[14px]/5 font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Main action of a page or form (the orange button): Save, Create, Add new. */
        default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow hover:bg-[hsl(var(--primary)/0.9)] focus-visible:ring-[hsl(var(--primary))]",
        /** Same orange, written the way most product screens ask for it. */
        orange: "bg-[#D7440E] text-white font-medium shadow hover:bg-[#c23d0c] focus-visible:ring-[#D7440E]",
        /** Print-related actions. Blue. */
        blue: "bg-[#2878D0] text-white font-medium shadow hover:bg-[#2066b5] focus-visible:ring-[#2878D0]",
        /** Strong neutral action. */
        charcoal: "bg-[#202428] text-white font-medium shadow hover:bg-[#2e343a] focus-visible:ring-[#202428]",
        /** Cancel, Back, quieter actions. White with a border. */
        outline: "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
        /** Orange outline. */
        outlinePrimary:
          "border border-[hsl(var(--primary))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))] focus-visible:ring-[hsl(var(--primary))]",
        "outline-primary":
          "border border-[hsl(var(--primary))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))] focus-visible:ring-[hsl(var(--primary))]",
        /** Blue outline. */
        outlineSecondary:
          "border border-[hsl(var(--secondary))] bg-[hsl(var(--card))] text-[hsl(var(--secondary))] shadow-sm hover:bg-[hsl(var(--secondary)/0.1)] hover:text-[hsl(var(--secondary))] focus-visible:ring-[hsl(var(--secondary))]",
        "outline-secondary":
          "border border-[hsl(var(--secondary))] bg-[hsl(var(--card))] text-[hsl(var(--secondary))] shadow-sm hover:bg-[hsl(var(--secondary)/0.1)] hover:text-[hsl(var(--secondary))] focus-visible:ring-[hsl(var(--secondary))]",
        /** Blue, quieter than orange. */
        secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-sm hover:bg-[hsl(var(--secondary)/0.9)]",
        /** Delete and other actions that can't be undone. */
        destructive: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] shadow-sm hover:bg-[hsl(var(--destructive)/0.9)]",
        /** Inline actions inside cards and toolbars. */
        ghost: "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
        /** Looks like a text link. */
        link: "text-[hsl(var(--primary))] underline-offset-4 hover:underline",
        /** Small square icon button used in table rows (edit, delete). */
        tableAction:
          "h-8 w-8 p-0 rounded-[6px] border border-[#DCE1E5] bg-white text-[#2878D0] hover:bg-[#F3F5F7] hover:border-[#2878D0]/50 shadow-sm",
        /** Dark button with an orange outline (workshop screens). */
        workshop:
          "bg-[#202428] border border-[#D7440E]/40 text-[#D7440E] hover:bg-[#2e343a] hover:border-[#D7440E] shadow-sm font-semibold",
        cyan: "bg-cyan-500 text-slate-950 font-semibold shadow hover:bg-cyan-400 focus-visible:ring-cyan-500",
        amber: "bg-amber-500 text-slate-950 font-semibold shadow hover:bg-amber-400 focus-visible:ring-amber-500",
        emerald: "bg-emerald-500 text-slate-950 font-semibold shadow hover:bg-emerald-400 focus-visible:ring-emerald-500",
        /* Names used by the library's own pages and the website. */
        primary: "bg-[#D7440E] text-white font-medium shadow hover:bg-[#c23d0c] focus-visible:ring-[#D7440E]",
        dark: "bg-night text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(16,18,20,0.2)] hover:bg-night-hover",
        danger: "border border-danger-hover bg-danger text-white hover:bg-danger-hover",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[6px] px-3 text-[12px]/4",
        lg: "h-10 rounded-[6px] px-8",
        icon: "h-9 w-9",
        xs: "h-control-xs rounded-sm px-3 text-xs",
        md: "h-9 px-4 py-2",
      },
      shape: {
        default: "",
        pill: "rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default", shape: "default" },
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
        className={cn(buttonVariants({ variant, size, shape, className }))}
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
