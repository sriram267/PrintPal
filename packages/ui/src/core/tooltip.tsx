import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../lib/cn";

export interface TooltipProps {
  /** The short text shown on hover or keyboard focus. */
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactElement;
  delay?: number;
}

/** A short dark hint shown on hover. Never put anything important only in a tooltip. */
export function Tooltip({ content, side = "top", delay = 300, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn("z-50 max-w-60 rounded-sm bg-ink px-2.5 py-1.5 text-xs font-medium text-white shadow-pop animate-fade-in")}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-ink" width={10} height={5} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
