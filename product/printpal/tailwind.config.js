import preset from "../../packages/ui/tailwind.preset.js";

/** @type {import('tailwindcss').Config} */
export default {
  // Colours, type sizes, corners, shadows and motion come from the shared library (packages/ui).
  presets: [preset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // The product loads Inter from Google Fonts under the name "Inter".
      fontFamily: { sans: ["Inter", "sans-serif"] },
      colors: {
        // Product-only shorthand names still used in some screens.
        printpal: {
          charcoal: "#202428",
          slate: "#737B84",
          border: "#DCE1E5",
          orange: "#D7440E",
          blue: "#2878D0",
          light: "#F3F5F7",
        },
      },
    },
  },
  plugins: [],
}
