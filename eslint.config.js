// eslint.config.js
const globals = require("globals");
const js = require("@eslint/js"); // ESLint's recommended base rules

module.exports = [
  js.configs.recommended, // flat-compatible base config
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      // Add rules similar to eslint-config-standard manually
      "no-unused-vars": "warn",
      semi: ["error", "never"],
      quotes: ["error", "single"],
      // Add more as needed
    },
  },
];
