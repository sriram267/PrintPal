import { useRef } from "react";

/**
 * Sections used to fade up each time they scrolled into view. That is gone on purpose: the only entrance
 * animations are the ones at the very start of a page load (hero, Pal notch), and the ones you trigger by
 * clicking (the Pal greeting, the product steps). Content below the hero is simply there as you scroll.
 *
 * The hook is kept so every section's `ref` still works, and so the old `reveal` classes stay harmless.
 */
export function useReveal<T extends HTMLElement>() {
  return useRef<T | null>(null);
}
