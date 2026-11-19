import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../lib/cn";

/* ── Avatar ─────────────────────────────────────────── */

export interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

/** A round picture, or the person's initials when there is no picture. */
export function Avatar({ name, src, size = 28, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <AvatarPrimitive.Root
      className={cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#EEF0F2] font-semibold text-ink-2", className)}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }}
    >
      {src && <AvatarPrimitive.Image src={src} alt={name} className="size-full object-cover" />}
      <AvatarPrimitive.Fallback delayMs={src ? 400 : 0}>{initials}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

/* ── Separator ──────────────────────────────────────── */

/** A thin line between groups of content. */
export function Separator({ orientation = "horizontal", className }: { orientation?: "horizontal" | "vertical"; className?: string }) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn("shrink-0 bg-line", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    />
  );
}

/* ── Skeleton ───────────────────────────────────────── */

/** A grey placeholder shown while content loads. Give it the size of the real content. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-sm bg-[linear-gradient(90deg,rgb(var(--pp-surface))_0%,#E9ECEF_50%,rgb(var(--pp-surface))_100%)] bg-[length:400px_100%] animate-shimmer",
        className,
      )}
      {...props}
    />
  );
}

/* ── Kbd ────────────────────────────────────────────── */

/** A keyboard key, for shortcuts ("Press Esc to close"). */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-line bg-white px-1 font-sans text-2xs font-medium text-ink-3 shadow-[0_1px_0_rgb(var(--pp-border))]", className)}>
      {children}
    </kbd>
  );
}
