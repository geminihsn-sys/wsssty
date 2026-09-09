import type { Config } from "tailwindcss";

/**
 * Walid Style design tokens.
 *
 * Palette is pinned by the brand brief: warm beige/cream canvas with a deep
 * charcoal for text and accents. We deliberately keep the accent monochrome
 * (charcoal ink) plus a single restrained olive-bronze used sparingly, rather
 * than the terracotta that reads as a generic "luxury" default.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F2EB", // primary background
        sand: "#E8E0D1", // deeper beige for sections / fills
        offwhite: "#FAFAFA", // clean surfaces / cards
        ink: "#1A1A1A", // charcoal — primary text & accents
        "ink-soft": "#57534E", // muted secondary text
        line: "#E0D8C8", // warm hairline borders
        bronze: "#8C7A5B", // restrained metallic accent (use sparingly)
        success: "#3F6B4E",
        danger: "#9B4A3A",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-jost)", "system-ui", "-apple-system", "sans-serif"],
        arabic: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // A deliberate editorial scale (major-third-ish) for display type.
        "display-xl": ["clamp(3rem, 8vw, 6.5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.0", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        wider: "0.08em",
        widest: "0.18em",
      },
      maxWidth: {
        content: "1280px",
      },
      transitionTimingFunction: {
        refined: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "rise": "rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
