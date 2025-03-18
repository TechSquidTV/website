import { tagMap } from "./src/utils/blogTag";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        slideUp: "slideUp 0.5s ease forwards",
        fade: "fadeIn 0.5s ease-in-out",
      },
      backdropFilter: {
        none: "none",
        blur: "blur(20px)",
      },
      backgroundImage: (theme: any) => ({
        bigsur: `linear-gradient(to top right, ${theme(
          "colors.violet.500"
        )}, ${theme("colors.orange.300")})`,
      }),
      colors: {
        smoke: {
          "50": "#eaebeb",
          "100": "#dadcdd",
          "200": "#c5c7c9",
          "300": "#a1a5aa",
          "400": "#787d82",
          "500": "#5e6368",
          "600": "#4e5155",
          "700": "#424448",
          "800": "#393b3c",
          "900": "#252627",
          "950": "#141415",
          "1000": "#0c0c0d",
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
  safelist: getTailwindSafeList(),
  plugins: [require("@tailwindcss/container-queries")],
};

function getTailwindSafeList() {
  const iconSizes = [
    "w-3",
    "h-3",
    "w-4",
    "h-4",
    "w-5",
    "h-5",
    "w-6",
    "h-6",
    "w-12",
    "h-12",
    "w-24",
    "h-24",
  ];
  const tagColors = Object.values(tagMap).map((tag) => `bg-${tag.color}`);
  return [...iconSizes, ...tagColors, "bg-smoke-950", "text-smoke-100"];
}
