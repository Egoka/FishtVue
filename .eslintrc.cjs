module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-essential",
    "plugin:prettier/recommended"
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script"
      }
    }
  ],
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "vue"],
  ignorePatterns: ["dist", "node_modules", "coverage", "eslint.config.js"],
  rules: {
    "no-var": "error",
    "prefer-const": "error",
    "no-undef": "off",
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto"
      }
    ]
  }
}
