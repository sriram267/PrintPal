import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../lib/cn";

/* ── Logo ──────────────────────────────────────────── */

export interface LogoProps {
  /** Hide the "PrintPal" word, show only the mark. */
  markOnly?: boolean;
  /** "dark" = for light backgrounds (default). "light" = for dark backgrounds (footer). */
  theme?: "dark" | "light";
  size?: number;
  className?: string;
}

/** The PrintPal logo: ink tile, white P, orange dot. */
export function Logo({ markOnly, theme = "dark", size = 24, className }: LogoProps) {
  const tile = theme === "dark" ? "rgb(var(--pp-ink))" : "#fff";
  const stroke = theme === "dark" ? "#fff" : "#0B0C0E";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 22 22" width={size} height={size} aria-hidden="true">
        <rect width="22" height="22" rx="6" fill={tile} />
        <path d="M8 16.5V5.75h4.25a3.6 3.6 0 0 1 0 7.2H8" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15.6" cy="16.2" r="1.55" fill="rgb(var(--pp-brand))" />
      </svg>
      <span className={cn("text-xl font-semibold", theme === "dark" ? "text-ink" : "text-white", markOnly && "sr-only")}>PrintPal</span>
    </span>
  );
}

/* ── Site navigation ───────────────────────────────── */

export interface SiteNavLink {
  label: string;
  href: string;
}

export interface SiteNavProps {
  links: SiteNavLink[];
  /** Buttons on the right (Sign in, Join the waitlist). */
  actions?: React.ReactNode;
  logoHref?: string;
  /** Stick to the top of the page while scrolling. */
  sticky?: boolean;
}

/** The website's top bar: logo, page links, actions. Collapses into a menu on phones. */
export function SiteNav({ links, actions, logoHref = "#", sticky = true }: SiteNavProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <header className={cn("z-[900] border-b border-[#EBEDF0] bg-white/95 backdrop-blur-md backdrop-saturate-[1.8]", sticky && "sticky top-0")}>
      <div className="flex h-[68px] items-center justify-between px-7 max-sm:h-[60px] max-sm:px-4">
        <div className="flex items-center gap-8">
          <a href={logoHref} aria-label="PrintPal home">
            <Logo />
          </a>
          <nav className="flex items-center gap-0.5 max-lg:hidden" aria-label="Main">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="inline-flex h-9 items-center rounded-lg px-3 text-md font-medium tracking-[-0.012em] text-[#2B2F36] transition-colors hover:bg-[#F4F5F6]">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 max-lg:hidden">{actions}</div>
        <button type="button" className="grid size-10 place-items-center rounded-lg text-ink hover:bg-[#F4F5F6] lg:hidden" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-[#EBEDF0] px-4 pb-4 pt-2 lg:hidden animate-slide-up">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex h-11 items-center rounded-lg px-3 text-md font-medium text-[#2B2F36] hover:bg-[#F4F5F6]">
              {l.label}
            </a>
          ))}
          {actions && <div className="mt-3 grid gap-2 [&>*]:w-full">{actions}</div>}
        </div>
      )}
    </header>
  );
}

/* ── Section ───────────────────────────────────────── */

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** "white", "soft" (off-white #FAFAFA) or "dark" (#0B0C0E). */
  tone?: "white" | "soft" | "dark";
  /** The thin vertical lines down both edges, Attio-style. */
  frame?: boolean;
}

/** A page section with the website's width, padding and optional edge lines. */
export function Section({ tone = "white", frame = false, className, children, ...props }: SectionProps) {
  const line = tone === "dark" ? "rgba(255,255,255,0.08)" : "#E8EAED";
  return (
    <section
      className={cn("relative py-[clamp(64px,8vw,112px)]", tone === "white" && "bg-white", tone === "soft" && "bg-[#FAFAFA]", tone === "dark" && "bg-[#0B0C0E] text-white", className)}
      style={
        frame
          ? {
              backgroundImage: `linear-gradient(${line},${line}),linear-gradient(${line},${line})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "1px 100%, 1px 100%",
              backgroundPosition: "20px 0, calc(100% - 20px) 0",
            }
          : undefined
      }
      {...props}
    >
      <div className="mx-auto w-full max-w-[1364px] px-7 max-sm:px-4">{children}</div>
    </section>
  );
}

/** The small blue label above a section heading ("Product", "FAQ"). */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex h-[26px] items-center rounded-[7px] bg-[#EAF3FC] px-[9px] text-[13.5px] font-medium tracking-[-0.01em] text-accent", className)}>{children}</span>;
}

export interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
  /** The dark first part of the heading. */
  title: React.ReactNode;
  /** The grey second part, continuing the sentence. */
  muted?: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}

/** A section heading: eyebrow, then a big title whose second half is grey. */
export function SectionHeading({ eyebrow, title, muted, tone = "light", className }: SectionHeadingProps) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className={cn("mt-[18px] max-w-[800px] text-display font-semibold", tone === "light" ? "text-[#1C1D1F]" : "text-[#F7F8F9]")}>
        {title} {muted && <span className={tone === "light" ? "text-[#7B8189]" : "text-[#8B929A]"}>{muted}</span>}
      </h2>
    </div>
  );
}

/* ── Tab rail ──────────────────────────────────────── */

export interface TabRailProps {
  items: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
  className?: string;
}

/** The big vertical step list next to the product showcase (Leads, Quotation, Invoicing, Catalogue). */
export function TabRail({ items, active, onSelect, className }: TabRailProps) {
  return (
    <nav className={cn("flex flex-col pt-1.5", className)} aria-label="Steps">
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            aria-current={on ? "step" : undefined}
            onClick={() => onSelect(it.id)}
            className={cn(
              "relative py-2.5 pl-[22px] text-left text-[22px] font-medium tracking-[-0.025em] transition-colors duration-300",
              "before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:transition-colors before:duration-300 focus-visible:outline-none focus-visible:text-ink",
              on ? "text-[#1C1D1F] before:bg-accent" : "text-[#9AA0A8] before:bg-[#E6E8EB] hover:text-ink-3",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}

/* ── CTA band ──────────────────────────────────────── */

export interface CtaBandProps {
  tag?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** The form or buttons under the text. */
  children?: React.ReactNode;
  className?: string;
}

/** The dark closing panel with a warm glow ("Join the pilot"). */
export function CtaBand({ tag, title, subtitle, children, className }: CtaBandProps) {
  return (
    <div
      className={cn("relative flex flex-col items-center overflow-hidden rounded-[clamp(20px,2.4vw,32px)] px-6 py-[clamp(56px,8vw,108px)] text-center", className)}
      style={{ background: "radial-gradient(120% 90% at 50% 120%, rgba(215,68,14,0.55), rgba(215,68,14,0.08) 55%, transparent 75%), #141518" }}
    >
      {tag && <span className="inline-flex h-7 items-center rounded-full px-3 text-[13.5px] font-semibold text-[#E6E9EC] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">{tag}</span>}
      <h2 className="mt-[22px] max-w-[760px] text-[clamp(32px,4.4vw,58px)] font-semibold leading-[1.06] tracking-[-0.042em] text-[#F7F8F9]">{title}</h2>
      {subtitle && <p className="mt-4 text-[clamp(16px,1.4vw,19px)] tracking-[-0.012em] text-[#B4BAC1]">{subtitle}</p>}
      {children && <div className="mt-[30px] w-full max-w-[460px]">{children}</div>}
    </div>
  );
}

/* ── Window frame ──────────────────────────────────── */

/** A soft app-window frame for product pictures on the website. */
export function WindowFrame({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-white shadow-window", className)}>
      <div className="flex h-9 items-center gap-1.5 border-b border-line-soft bg-[#FAFAFB] px-3.5">
        <span className="size-2.5 rounded-full bg-[#E4E6E9]" />
        <span className="size-2.5 rounded-full bg-[#E4E6E9]" />
        <span className="size-2.5 rounded-full bg-[#E4E6E9]" />
        {title && <span className="ml-3 truncate text-xs font-medium text-muted">{title}</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ── Mini UI (redrawn app screens) ─────────────────── */

/** A small floating card used inside website pictures of the app. */
export function MiniCard({ label, children, className }: { label?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full rounded-xl bg-white p-3 text-[11.5px] leading-[1.35] tracking-[-0.003em] text-ink shadow-pop", className)}>
      {label && <div className="mb-[7px] text-[10px] font-bold uppercase tracking-[0.05em] text-muted">{label}</div>}
      {children}
    </div>
  );
}

/** A small read-only field inside a MiniCard. */
export function MiniField({ label, value, icon, focused }: { label?: React.ReactNode; value: React.ReactNode; icon?: React.ReactNode; focused?: boolean }) {
  return (
    <div className="min-w-0">
      {label && <div className="mb-1 text-[10.5px] text-muted">{label}</div>}
      <div className={cn("flex h-[30px] items-center gap-[7px] overflow-hidden whitespace-nowrap rounded-sm border border-line bg-white px-[9px] font-medium [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted", focused && "border-accent shadow-[0_0_0_3px_rgba(40,120,208,0.1)]")}>
        {icon}
        <span className="min-w-0 flex-1 truncate">{value}</span>
      </div>
    </div>
  );
}

/* ── Footer ────────────────────────────────────────── */

export interface SiteFooterProps {
  blurb?: React.ReactNode;
  columns: { title: string; links: SiteNavLink[] }[];
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
}

/** The dark website footer: logo and blurb, link columns, bottom line. */
export function SiteFooter({ blurb, columns, bottomLeft, bottomRight }: SiteFooterProps) {
  return (
    <footer className="bg-[#0B0C0E] pb-7 text-[#F4F5F6]">
      <div className="mx-auto max-w-[1364px] px-7 max-sm:px-4">
        <div className="flex flex-wrap items-start justify-between gap-10 border-t border-white/[0.08] pb-[clamp(32px,4vw,48px)] pt-[clamp(36px,4.5vw,56px)]">
          <div>
            <Logo theme="light" />
            {blurb && <p className="mt-3.5 max-w-[300px] text-[14.5px] leading-normal text-[#8B929A]">{blurb}</p>}
          </div>
          <div className="flex flex-wrap gap-[clamp(40px,8vw,120px)]">
            {columns.map((c) => (
              <div key={c.title} className="flex min-w-[130px] flex-col items-start gap-2.5">
                <h4 className="mb-1 text-[13.5px] font-semibold">{c.title}</h4>
                {c.links.map((l) => (
                  <a key={l.href + l.label} href={l.href} className="text-[14.5px] font-book text-[#8B929A] transition-colors hover:text-white">
                    {l.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] pt-[22px] text-[13.5px] text-[#6C737B]">
          <span>{bottomLeft}</span>
          <span>{bottomRight}</span>
        </div>
      </div>
    </footer>
  );
}
