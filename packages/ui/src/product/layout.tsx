import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { Avatar } from "../core/misc";

/* ── Page header ───────────────────────────────────── */

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Buttons and toggles on the right (e.g. Customer | Enquiry, Add new). */
  actions?: React.ReactNode;
  className?: string;
}

/** The title block at the top of every app page. */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="m-0 text-xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex min-w-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

/* ── Top bar ───────────────────────────────────────── */

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TopBarProps {
  items: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  /** Right side, usually <UserPill>. */
  right?: React.ReactNode;
  brand?: React.ReactNode;
}

/** The app's top navigation: brand, main sections, and the signed-in user. */
export function TopBar({ items, active, onNavigate, right, brand = "PrintPal" }: TopBarProps) {
  return (
    <nav className="flex h-14 min-w-max items-center justify-between gap-8 bg-surface px-8" aria-label="Main">
      <div className="flex items-center">
        <span className="mr-9 select-none text-xl font-semibold text-ink">{brand}</span>
        <div className="flex items-center gap-6">
          {items.map((it) => {
            const on = it.id === active;
            return (
              <button
                key={it.id}
                type="button"
                aria-current={on ? "page" : undefined}
                onClick={() => onNavigate(it.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-0.5 py-[17px] text-base font-book transition-colors duration-base [&_svg]:size-[18px] [&_svg]:stroke-[1.8]",
                  "focus-visible:outline-none focus-visible:text-brand",
                  on ? "text-brand after:absolute after:inset-x-0 after:bottom-2 after:h-0.5 after:rounded-full after:bg-brand" : "text-ink hover:text-brand",
                )}
              >
                {it.icon}
                {it.label}
              </button>
            );
          })}
        </div>
      </div>
      {right}
    </nav>
  );
}

/** The signed-in person, as a rounded pill. Opens the account menu when wrapped in a DropdownMenu. */
export const UserPill = React.forwardRef<HTMLButtonElement, { name: string; src?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ name, src, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex items-center gap-2.5 rounded-full border border-line bg-white py-1 pl-1.5 pr-3.5 text-sm font-medium text-ink transition-[border-color,box-shadow] duration-base hover:border-[#CBD5E1] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
      {...props}
    >
      <Avatar name={name} src={src} size={26} />
      {name}
      <ChevronDown className="size-3.5 text-muted" />
    </button>
  ),
);
UserPill.displayName = "UserPill";

/* ── Settings menu ─────────────────────────────────── */

export interface SettingsNavGroup {
  label: string;
  items: NavItem[];
}

/** The left menu on the Settings page, grouped (Business, Products & Finishes, Quotation & Taxes…). */
export function SettingsNav({ groups, active, onNavigate, className }: { groups: SettingsNavGroup[]; active: string; onNavigate: (id: string) => void; className?: string }) {
  return (
    <nav aria-label="Settings" className={cn("w-60 shrink-0 border-r border-line bg-white px-3 py-4", className)}>
      {groups.map((g) => (
        <div key={g.label} className="mb-4 last:mb-0">
          <div className="px-2.5 pb-1.5 text-2xs font-semibold uppercase tracking-wide text-muted">{g.label}</div>
          {g.items.map((it) => {
            const on = it.id === active;
            return (
              <button
                key={it.id}
                type="button"
                aria-current={on ? "page" : undefined}
                onClick={() => onNavigate(it.id)}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-sm transition-colors duration-fast [&_svg]:size-4",
                  on ? "bg-accent-tint font-medium text-accent" : "text-ink-2 hover:bg-surface hover:text-ink",
                )}
              >
                {it.icon && <span className={on ? "text-accent" : "text-muted"}>{it.icon}</span>}
                {it.label}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/* ── Empty state ───────────────────────────────────── */

export interface EmptyStateProps {
  /** A small illustration or icon. */
  art?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Usually one primary Button. */
  action?: React.ReactNode;
  className?: string;
}

/** What a list shows when it has nothing yet — explains what goes here and how to add the first one. */
export function EmptyState({ art, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("mx-auto flex w-full max-w-[440px] flex-col items-center rounded-2xl border border-line bg-white px-8 pb-7 pt-8 text-center shadow-card transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_32px_-4px_rgba(32,36,40,0.08)]", className)}>
      {art && <div className="mb-4">{art}</div>}
      <h3 className="m-0 mb-1.5 text-md font-semibold tracking-[-0.01em] text-[#1E2227]">{title}</h3>
      {description && <p className="m-0 max-w-[380px] text-sm leading-normal text-[#64748B]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Section card (collapsible) ────────────────────── */

export interface SectionCardProps {
  title: React.ReactNode;
  /** Small things after the title (a count badge…). */
  meta?: React.ReactNode;
  /** Icon buttons on the right of the header (delete, more…). */
  tools?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** A card with a grey header bar that opens and closes — one per site, service or address. */
export function SectionCard({ title, meta, tools, defaultOpen = true, children, className }: SectionCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const bodyId = React.useId();
  return (
    <section className={cn("w-full rounded-xl border border-line bg-white p-2", className)}>
      <div className="flex h-10 items-center justify-between rounded-md bg-surface pl-1 pr-2 transition-colors hover:bg-[#EDF0F3]">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-md px-3 text-left text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform duration-base", !open && "-rotate-90")} />
          <span className="truncate">{title}</span>
          {meta}
        </button>
        {tools && <div className="flex items-center gap-1">{tools}</div>}
      </div>
      {open && (
        <div id={bodyId} className="px-3 pb-2 pt-4 animate-fade-in">
          {children}
        </div>
      )}
    </section>
  );
}
