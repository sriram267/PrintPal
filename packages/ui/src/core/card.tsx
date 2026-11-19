import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const cardVariants = cva("rounded-xl bg-white text-ink", {
  variants: {
    variant: {
      /** The app's standard card: white, hairline border, no shadow. */
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

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

/** A white panel that groups related content. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, padding, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
));
Card.displayName = "Card";

/** Title row of a card, with optional actions on the right. */
export function CardHeader({
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

/** Buttons at the bottom of a card or form, right-aligned. */
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-5 flex items-center justify-end gap-2", className)} {...props} />;
}
