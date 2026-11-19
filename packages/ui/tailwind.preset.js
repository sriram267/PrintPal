/**
 * PrintPal Tailwind preset. Every app that builds UI uses this, so classes like `bg-brand`, `text-muted`,
 * `rounded-xl`, `h-control`, `shadow-dialog` mean exactly the same thing everywhere.
 * Values come from src/tokens/tokens.css (never hard-code a hex in a component).
 *
 *   // tailwind.config.js of an app
 *   import preset from "../../packages/ui/tailwind.preset.js";
 *   export default { presets: [preset], content: ["./src/**\/*.{ts,tsx}", "../../packages/ui/src/**\/*.{ts,tsx}"] };
 */
const c = (name) => `rgb(var(--pp-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: c("ink"), 2: c("ink-2"), 3: c("ink-3") },
        muted: { DEFAULT: c("muted"), foreground: c("muted") },
        faint: c("faint"),
        surface: { DEFAULT: c("surface"), 2: c("surface-2"), hover: c("hover") },
        line: { DEFAULT: c("border"), strong: c("border-strong"), soft: c("line") },
        brand: { DEFAULT: c("brand"), hover: c("brand-hover"), tint: c("brand-tint"), line: c("brand-line") },
        accent: { DEFAULT: c("accent"), hover: c("accent-hover"), tint: c("accent-tint"), line: c("accent-line") },
        success: { DEFAULT: c("success"), tint: c("success-tint") },
        warning: { DEFAULT: c("warning"), tint: c("warning-tint") },
        danger: { DEFAULT: c("danger"), hover: c("danger-hover"), text: c("danger-text"), tint: c("danger-tint"), line: c("danger-line") },
        neutral: { tint: c("neutral-tint"), line: c("neutral-line"), text: c("neutral-text") },
        night: { DEFAULT: c("night"), hover: c("night-hover"), card: c("night-card"), text: c("night-text"), muted: c("night-muted") },
        // shadcn-compatible names
        background: c("surface"),
        foreground: c("ink"),
        border: c("border"),
        input: c("border"),
        ring: c("accent"),
        primary: { DEFAULT: c("brand"), foreground: c("white") },
        secondary: { DEFAULT: c("accent"), foreground: c("white") },
        destructive: { DEFAULT: c("danger"), foreground: c("white") },
        card: { DEFAULT: c("white"), foreground: c("ink") },
        popover: { DEFAULT: c("white"), foreground: c("ink") },
      },
      fontFamily: {
        sans: ["var(--pp-font)"],
        mono: ["var(--pp-font-mono)"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
        xs: ["12px", { lineHeight: "1.45" }],
        sm: ["13px", { lineHeight: "1.45" }],
        base: ["14px", { lineHeight: "1.5" }],
        md: ["15px", { lineHeight: "1.45" }],
        lg: ["18px", { lineHeight: "1.35" }],
        xl: ["20px", { lineHeight: "1.3", letterSpacing: "-0.024em" }],
        display: ["clamp(30px, 3.3vw, 46px)", { lineHeight: "1.1", letterSpacing: "-0.038em" }],
      },
      fontWeight: { book: "450" },
      borderRadius: {
        xs: "var(--pp-radius-xs)",
        sm: "var(--pp-radius-sm)",
        md: "var(--pp-radius-md)",
        lg: "var(--pp-radius-lg)",
        xl: "var(--pp-radius-xl)",
        "2xl": "var(--pp-radius-2xl)",
      },
      height: { "control-xs": "var(--pp-h-xs)", "control-sm": "var(--pp-h-sm)", control: "var(--pp-h-md)", "control-lg": "var(--pp-h-lg)" },
      minHeight: { control: "var(--pp-h-md)" },
      boxShadow: {
        xs: "var(--pp-shadow-xs)",
        btn: "var(--pp-shadow-btn)",
        brand: "var(--pp-shadow-brand)",
        card: "var(--pp-shadow-card)",
        pop: "var(--pp-shadow-pop)",
        dialog: "var(--pp-shadow-dialog)",
        window: "var(--pp-shadow-window)",
        notch: "var(--pp-shadow-notch)",
      },
      transitionTimingFunction: { out: "var(--pp-ease-out)", spring: "var(--pp-spring)" },
      transitionDuration: { fast: "100ms", base: "150ms", slow: "380ms" },
      keyframes: {
        "pp-fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pp-scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "pp-slide-up": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pp-sheet-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "pp-spin": { to: { transform: "rotate(360deg)" } },
        "pp-shimmer": { "0%": { backgroundPosition: "-200px 0" }, "100%": { backgroundPosition: "200px 0" } },
      },
      animation: {
        "fade-in": "pp-fade-in 150ms var(--pp-ease-out)",
        "scale-in": "pp-scale-in 180ms var(--pp-ease-out)",
        "slide-up": "pp-slide-up 180ms var(--pp-ease-out)",
        "sheet-up": "pp-sheet-up 380ms var(--pp-ease-out)",
        spin: "pp-spin 0.8s linear infinite",
        shimmer: "pp-shimmer 1.4s linear infinite",
      },
    },
  },
};
