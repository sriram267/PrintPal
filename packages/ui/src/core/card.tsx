import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/* ── Card: the finished product's card, copied exactly (the product is built from this) ───────────── */

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow", className)} {...props} />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-[14px]/5 text-[hsl(var(--muted-foreground))]", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

/* ── Panel: a lighter panel with ready-made title row and footer, for new screens ──────────────────── */

const panelVariants = cva("rounded-xl bg-white text-ink", {
  variants: {
    variant: {
      /** The app's standard panel: white, hairline border, no shadow. */
      plain: "border border-line",
      /** Slightly lifted: empty states, floating panels. */
      raised: "border border-line shadow-card",
      /** Website mock UI: soft ring + shadow, no hard border. */
      soft: "shadow-pop",
    },
    padding: { none: "", sm: "p-2", md: "px-5 py-[18px]", lg: "p-8" },
  },
  defaultVariants: { variant: "plain", padding: "md" },
});

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof panelVariants> {}

/** A white panel that groups related content. */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(({ className, variant, padding, ...props }, ref) => (
  <div ref={ref} className={cn(panelVariants({ variant, padding }), className)} {...props} />
));
Panel.displayName = "Panel";

/** Title row of a panel, with optional actions on the right. */
export function PanelHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Buttons at the bottom of a panel or form, right-aligned. */
export function PanelFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-5 flex items-center justify-end gap-2", className)} {...props} />;
}
