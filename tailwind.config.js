/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["2.5rem", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-lg": ["2rem", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
        title: ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        body: ["0.9375rem", { lineHeight: "1.55" }],
        small: ["0.8125rem", { lineHeight: "1.45" }],
        micro: ["0.75rem", { lineHeight: "1.35", letterSpacing: "0.04em" }],
      },
      colors: {
        paper: "rgb(var(--rgb-paper) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--rgb-surface) / <alpha-value>)",
          raised: "rgb(var(--rgb-surface-raised) / <alpha-value>)",
        },
        ink: {
          900: "rgb(var(--rgb-ink-900) / <alpha-value>)",
          700: "rgb(var(--rgb-ink-700) / <alpha-value>)",
          500: "rgb(var(--rgb-ink-500) / <alpha-value>)",
          300: "rgb(var(--rgb-ink-300) / <alpha-value>)",
        },
        line: "rgb(var(--rgb-line) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--rgb-accent) / <alpha-value>)",
          hover: "rgb(var(--rgb-accent-hover) / <alpha-value>)",
          soft: "rgb(var(--rgb-accent-soft) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--rgb-success) / <alpha-value>)",
          soft: "rgb(var(--rgb-success-soft) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--rgb-warning) / <alpha-value>)",
          soft: "rgb(var(--rgb-warning-soft) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--rgb-danger) / <alpha-value>)",
          soft: "rgb(var(--rgb-danger-soft) / <alpha-value>)",
        },
      },
      borderRadius: {
        control: "6px",
        card: "10px",
        modal: "14px",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        float:
          "0 8px 24px -4px rgba(22, 20, 15, 0.08), 0 2px 6px -1px rgba(22, 20, 15, 0.04)",
        modal:
          "0 32px 64px -16px rgba(4, 13, 31, 0.35), 0 8px 24px -8px rgba(4, 13, 31, 0.2)",
        lift: "0 24px 40px -12px rgba(15, 23, 42, 0.28), 0 8px 16px -8px rgba(0, 102, 255, 0.25)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        micro: "120ms",
        ui: "200ms",
        layout: "320ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "modal-in": {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(12px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "sheet-in": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slot-in": {
          "0%": { opacity: "0", gridTemplateRows: "0fr" },
          "100%": { opacity: "1", gridTemplateRows: "1fr" },
        },
        "card-lift": {
          "0%": {
            transform: "scale(1) rotate(0deg)",
            boxShadow: "0 0 0 0 rgba(15, 23, 42, 0)",
          },
          "100%": { transform: "scale(1.04) rotate(2.5deg)" },
        },
        "backdrop-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "dropdown-in": {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(-4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "draw-check": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 200ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "modal-in": "modal-in 240ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-in": "sheet-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "drawer-in": "drawer-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "slot-in": "slot-in 200ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "card-lift": "card-lift 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "backdrop-in": "backdrop-in 200ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "dropdown-in": "dropdown-in 120ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "draw-check": "draw-check 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
