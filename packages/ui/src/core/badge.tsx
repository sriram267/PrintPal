import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../lib/cn";

const badgeVariants = cva("inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-medium", {
  variants: {
    tone: {
      neutral: "border-neutral-line bg-neutral-tint text-neutral-text",
      brand: "border-brand-line bg-brand-tint text-brand",
      accent: "border-accent-line bg-accent-tint text-accent",
      success: "border-success/20 bg-success-tint text-success",
      warning: "border-warning/20 bg-warning-tint text-warning",
      danger: "border-danger-line bg-danger-tint text-danger",
    },
    shape: {
      /** Squared label with a border — statuses in tables. */
      status: "rounded-sm border px-2 py-0.5 text-xs",
      /** Round, borderless — counts and small highlights ("2 services"). */
      pill: "rounded-full border-0 px-2 py-0.5 text-2xs font-semibold",
    },
  },
  defaultVariants: { tone: "neutral", shape: "status" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** A small coloured label for a state or a count. */
export function Badge({ className, tone, shape, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, shape }), className)} {...props} />;
}

/** The quotation statuses used in Quotation Reports, with their fixed colours. */
export type QuoteStatus = "open" | "renegotiated" | "invoice";
const STATUS: Record<QuoteStatus, { tone: BadgeProps["tone"]; label: string }> = {
  open: { tone: "brand", label: "Open" },
  renegotiated: { tone: "neutral", label: "Renegotiated" },
  invoice: { tone: "accent", label: "Invoice" },
};
export function StatusBadge({ status, className }: { status: QuoteStatus; className?: string }) {
  const s = STATUS[status];
  return (
    <Badge tone={s.tone} className={className}>
      {s.label}
    </Badge>
  );
}

/** Grey label for a category or a service name. */
export function Tag({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-xs bg-neutral-line px-2 py-0.5 text-2xs font-medium text-ink", className)}
      {...props}
    />
  );
}

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Shows an × that calls this when clicked. */
  onRemove?: () => void;
  removeLabel?: string;
}

/** A rounded blue chip for a chosen value (a selected finish, a picked location). Can be removable. */
export function Chip({ className, children, onRemove, removeLabel = "Remove", ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-accent-tint px-2.5 py-[3px] text-xs font-medium leading-tight text-[#1D4ED8]",
        onRemove && "pr-1.5",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="grid size-4 place-items-center rounded-full text-accent hover:bg-accent/15"
        >
          <X className="size-3" strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
