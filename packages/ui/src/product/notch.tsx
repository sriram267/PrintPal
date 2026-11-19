import * as React from "react";
import { Download, X } from "lucide-react";
import { cn } from "../lib/cn";
import { PalMascot, type PalTone } from "../pal/PalMascot";

/*
 * The Pal notch, as building blocks. The black pill that hangs from the top edge of the screen,
 * in its states: idle pill, toast, printer (document bar). The product's live notch adds the
 * queueing/timers on top of these; the look lives here.
 */

/** Concave "ears" that make the notch look like it hangs from the screen edge. */
function Ears() {
  const ear = "pointer-events-none absolute top-0 z-[3] size-[14px]";
  return (
    <>
      <span aria-hidden className={cn(ear, "-left-[14px]")} style={{ background: "radial-gradient(circle at 0 14px, transparent 13.5px, #000 14px)" }} />
      <span aria-hidden className={cn(ear, "-right-[14px]")} style={{ background: "radial-gradient(circle at 14px 14px, transparent 13.5px, #000 14px)" }} />
    </>
  );
}

export interface NotchShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "pill" = idle (216 × 34). "panel" = expanded (toast, printer, greeting). */
  size?: "pill" | "panel";
  /** Fix it to the top centre of the viewport, like in the app. Off = render in place (docs, previews). */
  docked?: boolean;
  width?: number;
}

/** The black notch surface itself. Put any notch content inside. */
export function NotchShell({ size = "pill", docked = false, width, className, style, children, ...props }: NotchShellProps) {
  const w = width ?? (size === "pill" ? 216 : 440);
  return (
    <div
      className={cn(docked && "fixed left-1/2 top-0 z-[1000] -translate-x-1/2", "relative", className)}
      style={{ width: docked ? `min(${w}px, calc(100vw - 28px))` : `min(${w}px, calc(100% - 28px))`, ...style }}
      {...props}
    >
      <Ears />
      <div
        className={cn(
          "relative z-[2] w-full overflow-hidden bg-black text-night-text",
          size === "pill"
            ? "flex h-[34px] items-center justify-between rounded-b-[16px] px-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.38),0_2px_6px_rgba(0,0,0,0.22),inset_0_-1px_0_rgba(255,255,255,0.12)]"
            : "rounded-b-[22px] shadow-notch",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** The idle notch: Pal's face, a short label, and the camera dot. */
export function NotchPill({ label, docked, className }: { label: React.ReactNode; docked?: boolean; className?: string }) {
  return (
    <NotchShell size="pill" docked={docked} className={className}>
      <span className="flex min-w-0 items-center gap-2">
        <PalMascot size={22} hands={false} className="-ml-[3px] shrink-0" />
        <span className="truncate text-[11.5px] font-medium text-[#94A3B8]">{label}</span>
      </span>
      <span aria-hidden className="size-2.5 shrink-0 rounded-full border border-white/20 bg-[#111418]" />
    </NotchShell>
  );
}

export type NotchToastVariant = "success" | "error" | "warning" | "info" | "loading" | "workshop";
const TONE: Record<NotchToastVariant, PalTone> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  loading: "neutral",
  workshop: "warm",
};

export interface NotchToastProps {
  variant?: NotchToastVariant;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small grey line above the title. */
  badge?: React.ReactNode;
  /** 0–1: how much time is left before it closes (the thin bar at the bottom). Leave out to hide it. */
  progress?: number;
  onClose?: () => void;
  docked?: boolean;
}

/** A toast in the notch: Pal tinted by the state (blue info, green success, red error…) plus the message. */
export function NotchToast({ variant = "info", title, description, badge, progress, onClose, docked }: NotchToastProps) {
  return (
    <NotchShell size="panel" docked={docked} role="status" aria-live="polite">
      <div className={cn("flex min-h-[56px] gap-3 py-[13px] pl-4 pr-3", description || badge ? "items-start" : "items-center")}>
        <PalMascot size={32} hands={false} tone={TONE[variant]} className="-my-0.5 -ml-0.5 shrink-0" />
        <div className="min-w-0 flex-1 pt-px">
          {badge && <div className="mb-0.5 text-2xs font-medium text-[#8A93A0]">{badge}</div>}
          <p className="m-0 break-words text-base font-semibold leading-snug tracking-[-0.005em] text-night-text">{title}</p>
          {description && <p className="m-0 mt-0.5 break-words text-[12.5px] leading-[1.45] text-night-muted">{description}</p>}
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-7 shrink-0 place-items-center rounded-full text-night-muted hover:bg-white/10 hover:text-white">
            <X className="size-4" />
          </button>
        )}
      </div>
      {progress !== undefined && (
        <div className="mx-4 mb-2.5 h-[3px] overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white/40 transition-[width] duration-150 ease-linear" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
        </div>
      )}
    </NotchShell>
  );
}

export interface NotchDocumentBarProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  downloadLabel?: string;
  onDownload?: () => void;
  onClose?: () => void;
  /** Width of the paper that comes out of the slot; sizes the printer. */
  paperWidth?: number;
  docked?: boolean;
}

/** The notch as a printer: Pal at work on the screen, Download / Close, and the paper slot. */
export function NotchDocumentBar({ title, subtitle, downloadLabel = "Download", onDownload, onClose, paperWidth = 520, docked }: NotchDocumentBarProps) {
  return (
    <NotchShell size="panel" width={paperWidth + 56} docked={docked}>
      <div className="px-2 pb-3.5 pt-2">
        <div className="flex h-14 items-center gap-3 rounded-[16px] bg-[#0D0E10] pl-4 pr-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.65),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          <PalMascot size={42} hands={false} tone="info" mode="work" className="-ml-1.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-base font-semibold leading-tight text-night-text">{title}</p>
            {subtitle && <p className="m-0 mt-px truncate text-xs text-night-muted">{subtitle}</p>}
          </div>
          {onDownload && (
            <button type="button" onClick={onDownload} className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand px-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover">
              <Download className="size-3.5" strokeWidth={2.4} />
              {downloadLabel}
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-[30px] shrink-0 place-items-center rounded-full text-night-muted transition-colors hover:bg-white/10 hover:text-white">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="mt-2.5 flex justify-center" aria-hidden>
          <div className="h-3 rounded-full bg-[#08080A] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.09)]" style={{ width: paperWidth + 20 }} />
        </div>
      </div>
    </NotchShell>
  );
}
