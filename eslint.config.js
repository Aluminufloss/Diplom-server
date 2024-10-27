import js from "@eslint/js";

export default [
  js.configs.recommended,

  {
    parser: "@typescript-eslint/parser",
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    rules: {
      eqeqeq: "error",
      "no-unused-vars": "warn",
      "no-console": "warn",
      curly: "error",
      "prefer-const": "warn",
      "no-duplicate-imports": "error",
      "no-throw-literal": "error",
      "consistent-return": "warn",
      "no-magic-numbers": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
