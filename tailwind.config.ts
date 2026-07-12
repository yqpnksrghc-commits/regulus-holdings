import type { Config } from "tailwindcss";

/**
 * Regulus Automation Inc. — Design System / Tailwind configuration.
 *
 * Colors are driven by CSS custom properties (see globals.css) so a single
 * source of truth powers both light and dark themes. Tailwind utilities read
 * those variables through the `rgb(var(--token) / <alpha-value>)` bridge,
 * which keeps opacity modifiers (e.g. `text-ink/70`) working.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-2": "rgb(var(--bg-2) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        "panel-2": "rgb(var(--panel-2) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        dim: "rgb(var(--dim) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-2": "rgb(var(--line-2) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        emerald: "rgb(var(--emerald) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display scale — clamp(min, preferred, max)
        display: ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        h1: ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        h2: ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h3: ["clamp(1.25rem, 2vw, 1.6rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        lead: ["clamp(1.075rem, 1.5vw, 1.3rem)", { lineHeight: "1.55" }],
      },
      maxWidth: {
        prose: "68ch",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        subtle: "0 1px 2px rgb(0 0 0 / 0.04), 0 1px 1px rgb(0 0 0 / 0.03)",
        card: "0 1px 3px rgb(0 0 0 / 0.05), 0 8px 24px -12px rgb(0 0 0 / 0.12)",
        lift: "0 2px 6px rgb(0 0 0 / 0.06), 0 20px 48px -16px rgb(0 0 0 / 0.24)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "draw-line": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "pulse-node": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s var(--ease-smooth) both",
        "pulse-node": "pulse-node 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
