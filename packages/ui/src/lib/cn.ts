import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* Teach tailwind-merge our custom sizes so `text-sm` and `text-ink` don't cancel each other out. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["2xs", "xs", "sm", "base", "md", "lg", "xl", "display"] }],
      h: [{ h: ["control-xs", "control-sm", "control", "control-lg"] }],
      shadow: [{ shadow: ["xs", "btn", "brand", "card", "pop", "dialog", "window", "notch"] }],
    },
  },
});

/** Join class names; later classes win over earlier conflicting ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
