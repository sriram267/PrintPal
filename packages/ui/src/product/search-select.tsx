import * as React from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { cn } from "../lib/cn";
import { fieldBase } from "../core/input";
import { Popover, PopoverContent, PopoverTrigger } from "../core/popover";

export interface SearchSelectOption {
  value: string;
  label: string;
  /** Second grey line (an address, a category). */
  detail?: string;
}

export interface SearchSelectProps {
  options: SearchSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Adds an "Add …" row at the bottom, e.g. to create a new product while picking one. */
  addLabel?: string;
  onAdd?: (typed: string) => void;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/** Pick one from a long list by typing to filter (customers, products, services). Can add a new one. */
export function SearchSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  addLabel,
  onAdd,
  emptyText = "Nothing found",
  disabled,
  id,
  className,
  ...aria
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [hi, setHi] = React.useState(0);
  const listId = React.useId();
  const selected = options.find((o) => o.value === value);
  const shown = options.filter((o) => (o.label + " " + (o.detail ?? "")).toLowerCase().includes(q.trim().toLowerCase()));
  const total = shown.length + (onAdd ? 1 : 0);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setHi(Math.max(0, shown.findIndex((o) => o.value === value)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (i: number) => {
    if (i < shown.length) onValueChange(shown[i].value);
    else onAdd?.(q.trim());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={aria["aria-invalid"]}
          aria-describedby={aria["aria-describedby"]}
          className={cn(fieldBase, "flex h-control items-center justify-between gap-2 px-3 text-left", open && "border-accent", className)}
        >
          <span className={cn("truncate", !selected && "text-faint")}>{selected?.label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="z-50 w-[var(--radix-popover-trigger-width)] min-w-64 overflow-visible rounded-md border-line p-1 text-ink shadow-pop animate-scale-in">
        <div className="relative mb-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setHi(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") (e.preventDefault(), setHi((h) => Math.min(total - 1, h + 1)));
              else if (e.key === "ArrowUp") (e.preventDefault(), setHi((h) => Math.max(0, h - 1)));
              else if (e.key === "Enter" && total) (e.preventDefault(), choose(hi));
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            aria-controls={listId}
            className="h-9 w-full rounded-sm border-0 bg-surface pl-8 pr-2 text-sm outline-none placeholder:text-faint"
          />
        </div>
        <div id={listId} role="listbox" className="max-h-60 overflow-y-auto">
          {shown.length === 0 && !onAdd && <div className="px-2.5 py-3 text-center text-sm text-muted">{emptyText}</div>}
          {shown.map((o, i) => (
            <div
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
              className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-xs px-2.5 py-1.5", hi === i && "bg-surface")}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink">{o.label}</span>
                {o.detail && <span className="block truncate text-xs text-muted">{o.detail}</span>}
              </span>
              {o.value === value && <Check className="size-4 shrink-0 text-accent" />}
            </div>
          ))}
          {onAdd && (
            <div
              role="option"
              aria-selected={false}
              onMouseEnter={() => setHi(shown.length)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(shown.length)}
              className={cn("mt-1 flex cursor-pointer items-center gap-2 rounded-xs border-t border-line px-2.5 py-2 text-sm font-medium text-accent", hi === shown.length && "bg-accent-tint")}
            >
              <Plus className="size-4" />
              {q.trim() ? `${addLabel ?? "Add"} “${q.trim()}”` : addLabel ?? "Add new"}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
