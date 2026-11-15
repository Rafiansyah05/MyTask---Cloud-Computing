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
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        full: "9999px",
      },
      colors: {
        brand: {
          50: "#F0F5FF",
          100: "#E5EDFF",
          200: "#CDDCFF",
          300: "#A5C0FF",
          400: "#6B9BFF",
          500: "#0052FF", // Signature brand blue
          600: "#0047E0",
          700: "#0039B8",
          800: "#0A2D8F",
          900: "#0B2368",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC",
          muted: "#F1F5F9",
        },
      },
    },
  },
  plugins: [],
};
