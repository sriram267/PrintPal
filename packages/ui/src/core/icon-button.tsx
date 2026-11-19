import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const iconButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-sm transition-[background-color,border-color,color,transform] duration-base ease-out " +
    "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      tone: {
        /** Close, more, collapse: no box until hovered. */
        plain: "text-muted hover:bg-black/5 hover:text-ink",
        /** Edit actions in table rows. */
        edit: "border border-line bg-[#F9FAFB] text-accent hover:border-accent-line hover:bg-accent-tint hover:text-accent-hover",
        /** Delete actions in table rows. */
        delete: "border border-line bg-[#F9FAFB] text-danger hover:border-danger-line hover:bg-danger-tint hover:text-danger-hover",
        /** Neutral boxed icon action. */
        boxed: "border border-line bg-white text-ink-2 hover:border-line-strong hover:bg-surface",
      },
      size: { sm: "size-7", md: "size-8", lg: "size-control" },
    },
    defaultVariants: { tone: "plain", size: "md" },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Required: icon buttons have no visible text, so this is what screen readers say. */
  label: string;
}

/** A square button that holds only an icon (edit, delete, close…). */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, tone, size, label, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ tone, size }), className)}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";
