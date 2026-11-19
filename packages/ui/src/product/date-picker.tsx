import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "../lib/cn";
import { fieldBase } from "../core/input";
import { Popover, PopoverContent, PopoverTrigger } from "../core/popover";

export interface MonthCalendarProps {
  value?: Date;
  onChange: (date: Date) => void;
  /** Days that can't be picked. */
  isDisabled?: (date: Date) => boolean;
  className?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** A month grid. Arrow keys move between days, Enter picks. */
export function MonthCalendar({ value, onChange, isDisabled, className }: MonthCalendarProps) {
  const [month, setMonth] = React.useState(() => startOfMonth(value ?? new Date()));
  const [focus, setFocus] = React.useState<Date>(() => value ?? new Date());
  const gridRef = React.useRef<HTMLDivElement | null>(null);

  const days: Date[] = [];
  for (let d = startOfWeek(startOfMonth(month)); d <= endOfWeek(endOfMonth(month)); d = addDays(d, 1)) days.push(d);

  const move = (n: number) => {
    const next = addDays(focus, n);
    setFocus(next);
    if (!isSameMonth(next, month)) setMonth(startOfMonth(next));
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>('[data-focus="true"]')?.focus());
  };
  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      move(map[e.key]);
    }
  };

  return (
    <div className={cn("w-[252px] select-none", className)}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))} className="grid size-7 place-items-center rounded-sm text-muted hover:bg-surface hover:text-ink">
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-sm font-semibold text-ink" aria-live="polite">
          {format(month, "MMMM yyyy")}
        </div>
        <button type="button" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))} className="grid size-7 place-items-center rounded-sm text-muted hover:bg-surface hover:text-ink">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-2xs font-medium text-muted">
        {DAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div ref={gridRef} role="grid" className="grid grid-cols-7 gap-0.5" onKeyDown={onKey}>
        {days.map((d) => {
          const selected = value && isSameDay(d, value);
          const outside = !isSameMonth(d, month);
          const disabled = isDisabled?.(d);
          const focused = isSameDay(d, focus);
          return (
            <button
              key={d.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={selected || undefined}
              data-focus={focused}
              tabIndex={focused ? 0 : -1}
              disabled={disabled}
              onClick={() => {
                setFocus(d);
                onChange(d);
              }}
              className={cn(
                "grid h-8 place-items-center rounded-sm text-sm transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                selected ? "bg-accent font-semibold text-white" : outside ? "text-faint hover:bg-surface" : "text-ink hover:bg-surface",
                !selected && isToday(d) && "font-semibold text-accent",
                disabled && "pointer-events-none opacity-35",
              )}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface DateFieldProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  isDisabled?: (date: Date) => boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/** A field that opens a calendar (follow-up dates, quote dates). Shows "20 Nov 2026". */
export function DateField({ value, onChange, placeholder = "Pick a date", disabled, invalid, isDisabled, id, className, ...aria }: DateFieldProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={invalid || aria["aria-invalid"] || undefined}
          aria-describedby={aria["aria-describedby"]}
          className={cn(fieldBase, "flex h-control items-center gap-2 px-3 text-left", open && "border-accent", className)}
        >
          <CalendarDays className="size-4 shrink-0 text-muted" />
          {value ? <span>{format(value, "dd MMM yyyy")}</span> : <span className="text-faint">{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-auto overflow-visible rounded-md border-line p-3 text-ink shadow-pop animate-scale-in">
        <MonthCalendar
          value={value}
          isDisabled={isDisabled}
          onChange={(d) => {
            onChange(d);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
