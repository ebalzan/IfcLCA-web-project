const { defineConfig } = require("eslint/config");

const prettier = require("eslint-plugin-prettier");
const reactHooks = require("eslint-plugin-react-hooks");
const next = require("@next/eslint-plugin-next");

const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    extends: compat.extends("next/core-web-vitals", "prettier"),

    plugins: {
      prettier,
      reactHooks,
      next,
    },

    ignores: [
      "node_modules",
      ".next",
      ".vscode",
      ".prettierignore",
      ".prettierrc.js",
      ".eslintrc.js",
      "eslint.config.js",
      ".nvmrc",
      ".watchmanconfig",
      "_dev.sh",
      "components.json",
      "next-env.d.ts",
      "next.config.js",
      "tsconfig.json",
      "postcss.config.js",
      "tailwind.config.js",
      "vercel.json",
    ],

    rules: {
      "prettier/prettier": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "import/order": [
        1,
        {
          groups: [
            "external",
            "builtin",
            "internal",
            "sibling",
            "parent",
            "index",
          ],

          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@clerk/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@hookform/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@tanstack/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/components/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@/hooks/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@/interfaces/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@/layouts/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/lib/**",
              group: "internal",
            },
            {
              pattern: "@/models/**",
              group: "internal",
            },
            {
              pattern: "@/schemas/**",
              group: "internal",
            },
            {
              pattern: "@/styles/**",
              group: "internal",
            },
            {
              pattern: "@/utils/**",
              group: "internal",
            },
          ],

          pathGroupsExcludedImportTypes: ["internal"],

          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
