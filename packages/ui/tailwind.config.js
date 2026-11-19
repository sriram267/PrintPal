import preset from "./tailwind.preset.js";

/** Tailwind for the library itself and its preview page. */
export default {
  presets: [preset],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./preview/**/*.{ts,tsx}"],
};
