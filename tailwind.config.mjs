/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
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
  plugins: [],
};
