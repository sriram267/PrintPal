import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** "single": opening one closes the others. "multiple": any number open. */
  type?: "single" | "multiple";
  defaultOpen?: string[];
  className?: string;
}

/** A list of questions or sections that open one at a time (FAQ, collapsible settings). */
export function Accordion({ items, type = "single", defaultOpen, className }: AccordionProps) {
  const rootProps =
    type === "single"
      ? ({ type: "single", collapsible: true, defaultValue: defaultOpen?.[0] } as const)
      : ({ type: "multiple", defaultValue: defaultOpen } as const);
  return (
    <AccordionPrimitive.Root {...rootProps} className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((it) => (
        <AccordionPrimitive.Item key={it.id} value={it.id}>
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-md font-medium text-ink transition-colors hover:text-ink-2 focus-visible:outline-none focus-visible:text-accent">
              {it.title}
              <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-base ease-out group-data-[state=open]:rotate-180" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden text-base leading-relaxed text-ink-3 data-[state=open]:animate-slide-up">
            <div className="pb-4 pr-8">{it.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
