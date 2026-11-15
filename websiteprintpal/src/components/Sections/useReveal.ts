import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Fade-up on scroll. Put the returned ref on a section; children with class `reveal` fade in (staggered by
 * their --d delay) the first time the section scrolls into view. Without JS, or with reduced motion, nothing is hidden.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm && "IntersectionObserver" in window) el.dataset.reveal = "pending";
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.reveal !== "pending") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}
