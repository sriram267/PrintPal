import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../src/lib/cn";

/** One entry on the preview page. */
export interface Entry {
  id: string;
  name: string;
  group: "Foundations" | "Core" | "Pal" | "Product" | "Website";
  /** One plain sentence: what it is and when to use it. */
  description: string;
  /** Where it is used today (shown as small tags). */
  usedIn?: string[];
  Demo: () => JSX.Element;
  /** A short usage example. */
  code?: string;
}

/** A labelled box showing one example. */
export function Demo({ title, children, dark, className, stage }: { title?: string; children: React.ReactNode; dark?: boolean; className?: string; stage?: string }) {
  return (
    <div className="min-w-0">
      {title && <div className="mb-2 text-2xs font-semibold uppercase tracking-wide text-muted">{title}</div>}
      <div
        className={cn(
          "flex min-h-24 flex-wrap items-center gap-3 rounded-xl border p-5",
          dark ? "border-[#1d1f22] bg-[#0B0C0E]" : "border-line bg-white",
          stage,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Code with a copy button. */
export function Code({ code }: { code: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-xl bg-[#111316] p-4 pr-12 font-mono text-[12.5px] leading-relaxed text-[#E6E9EE]">
        <code>{code.trim()}</code>
      </pre>
      <button
        type="button"
        aria-label="Copy code"
        onClick={() => {
          void navigator.clipboard?.writeText(code.trim());
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        }}
        className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-sm text-[#9AA3AF] hover:bg-white/10 hover:text-white"
      >
        {done ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

/** Lay demos out in a responsive grid. */
export function Grid({ cols = 2, children }: { cols?: 1 | 2 | 3; children: React.ReactNode }) {
  return <div className={cn("grid gap-5", cols === 2 && "lg:grid-cols-2", cols === 3 && "md:grid-cols-2 xl:grid-cols-3")}>{children}</div>;
}
