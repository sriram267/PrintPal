import * as React from "react";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../lib/cn";

export interface MenuItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onSelect?: () => void;
  /** Red text: for Delete. */
  danger?: boolean;
  disabled?: boolean;
  /** Draws a line above this item. */
  separatorBefore?: boolean;
}

export interface DropdownMenuProps {
  /** The button that opens the menu. */
  trigger: React.ReactElement;
  items: MenuItem[];
  align?: "start" | "end";
  label?: React.ReactNode;
}

/** A short list of actions opened from a button (the "⋯" menu, the user menu). */
export function DropdownMenu({ trigger, items, align = "end", label }: DropdownMenuProps) {
  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger asChild>{trigger}</MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-44 rounded-md border border-line bg-white p-1 shadow-pop animate-scale-in"
        >
          {label && <MenuPrimitive.Label className="px-2.5 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wide text-muted">{label}</MenuPrimitive.Label>}
          {items.map((it, i) => (
            <React.Fragment key={i}>
              {it.separatorBefore && <MenuPrimitive.Separator className="my-1 h-px bg-line" />}
              <MenuPrimitive.Item
                disabled={it.disabled}
                onSelect={it.onSelect}
                className={cn(
                  "flex h-8 cursor-pointer select-none items-center gap-2 rounded-xs px-2.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4",
                  it.danger ? "text-danger data-[highlighted]:bg-danger-tint" : "text-ink data-[highlighted]:bg-surface",
                )}
              >
                {it.icon && <span className={cn(it.danger ? "text-danger" : "text-muted")}>{it.icon}</span>}
                {it.label}
              </MenuPrimitive.Item>
            </React.Fragment>
          ))}
        </MenuPrimitive.Content>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
