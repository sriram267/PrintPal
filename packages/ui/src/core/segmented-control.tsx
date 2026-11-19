import * as React from "react";
import { cn } from "../lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** "box": the app's joined buttons (Customer | Enquiry). "pill": the website's soft toggle. */
  variant?: "box" | "pill";
  className?: string;
  "aria-label"?: string;
}

/** Switch between two to four views of the same thing. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  variant = "box",
  className,
  ...rest
}: SegmentedControlProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + options.length) % options.length;
    onValueChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={rest["aria-label"]}
      className={cn(
        variant === "box"
          ? "inline-flex h-control overflow-hidden rounded-sm border border-line bg-white"
          : "inline-grid auto-cols-fr grid-flow-col gap-1 rounded-[13px] bg-[#EEF0F2] p-1 shadow-[inset_0_0_0_1px_rgba(16,18,20,0.04)]",
        className,
      )}
    >
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onValueChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-base ease-out active:scale-[0.975] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40",
              variant === "box"
                ? cn("px-4 text-sm font-book", i > 0 && "border-l border-line", on ? "bg-surface font-medium text-ink" : "text-ink-3 hover:bg-surface-2 hover:text-ink")
                : cn("h-9 rounded-[10px] px-4 text-base", on ? "bg-white text-ink shadow-[0_0_0_1px_rgba(16,18,20,0.06),0_1px_3px_rgba(16,18,20,0.1)]" : "text-ink-3 hover:text-ink"),
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
