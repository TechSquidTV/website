import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

const sharedGlobals = {
  ...globals.browser,
  ...globals.node,
};

export default [
  {
    ignores: [
      ".astro/**",
      "dist/**",
      "node_modules/**",
      "public/**",
      "src/content/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,astro}"],
    languageOptions: {
      globals: sharedGlobals,
    },
  },
  {
    files: ["**/*.astro"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^\\.\\.?/",
              message:
                "Use the @/ alias for src modules or #utils/ in Astro config.",
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
];
