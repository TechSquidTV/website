/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        slideUp: "slideUp 0.5s ease forwards",
      },
      backdropFilter: {
        none: "none",
        blur: "blur(20px)",
      },
      colors: {
        smoke: {
          50: "#eaebeb",
          100: "#dadcdd",
          200: "#c5c7c9",
          300: "#a1a5aa",
          400: "#787d82",
          500: "#5e6368",
          600: "#4e5155",
          700: "#424448",
          800: "#393b3c",
          900: "#252627",
          950: "#141415",
          1000: "#0c0c0d",
        },
      },
    },
    boxShadow: {
      sm: "0 1px 2px 0 rgb(0 0 0/ 0.05)",
      DEFAULT:
        "0 1px 3px 0 rgb(0 0 0 / 0.18), 0 1px 2px -1px rgb(0 0 0 / 0.18)",
      md: "0 1px 3px 0 rgb(0 0 0 / 0.18), 0 1px 2px -1px rgb(0 0 0 / 0.18)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.18), 0 4px 6px -4px rgb(0 0 0 / 0.18)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.18), 0 8px 10px -6px rgb(0 0 0 / 0.18)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.18)",
    },
    borderRadius: {
      none: "0",
      xs: "0.125rem",
      sm: "0.25rem",
      DEFAULT: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "2rem",
      "2xl": "4rem",
      "3xl": "8rem",
      full: "9999px",
    },
  },
  safelist: ["w-3", "h-3", "w-4", "h-4", "w-5", "h-5", "w-6", "h-6"],
  plugins: [],
};
