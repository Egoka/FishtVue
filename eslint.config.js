import { defineConfig, globalIgnores } from "eslint/config"
import js from "@eslint/js"
import vue from "eslint-plugin-vue"
import vueParser from "vue-eslint-parser"
import typescript from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import prettier from "eslint-config-prettier"
import pluginPrettier from "eslint-plugin-prettier"

const globals = {
  import: "readonly",
  global: "readonly",
  process: "readonly",
  document: "readonly",
  Document: "readonly",
  window: "readonly",
  navigator: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  URL: "readonly",
  console: "readonly",
  getComputedStyle: "readonly",
  IntersectionObserver: "readonly",
  ResizeObserver: "readonly",
  Node: "readonly",
  NodeJS: "readonly",
  location: "readonly",
  NodeListOf: "readonly",
  Event: "readonly",
  TouchEvent: "readonly",
  WheelEvent: "readonly",
  PointerEvent: "readonly",
  ParentNode: "readonly",
  Element: "readonly",
  HTMLDivElement: "readonly",
  HTMLTableRowElement: "readonly",
  HTMLElement: "readonly",
  HTMLInputElement: "readonly",
  HTMLButtonElement: "readonly",
  HTMLStyleElement: "readonly",
  Response: "readonly",
  MouseEvent: "readonly",
  FocusEvent: "readonly",
  KeyboardEvent: "readonly",
  InputEvent: "readonly",
  ShadowRoot: "readonly",
  DOMException: "readonly",
  HTMLCanvasElement: "readonly",
  HTMLAnchorElement: "readonly",
  HTMLHeadElement: "readonly",
  DOMRect: "readonly",
  crypto: "readonly",
  // Vue and Nuxt
  defineAppConfig: "readonly",
  defineNuxtConfig: "readonly",
  useLocalePath: "readonly",
  useAsyncData: "readonly",
  useAppConfig: "readonly",
  ref: "readonly",
  Ref: "readonly",
  toRefs: "readonly",
  computed: "readonly",
  reactive: "readonly",
  watch: "readonly",
  inject: "readonly",
  provide: "readonly",
  onMounted: "readonly",
  onUnmounted: "readonly",
  nextTick: "readonly",
  useSlots: "readonly",
  FishtVue: "readonly",
  useI18n: "readonly",
  localStorage: "readonly",
  shallowRef: "readonly",
  useColorMode: "readonly",
  navigateTo: "readonly",
  history: "readonly",
  getHeaders: "readonly",
  useHead: "readonly",
  useState: "readonly",
  useNuxtApp: "readonly",
  useScrollTo: "readonly",
  useEditLink: "readonly",
  useActiveAnchor: "readonly",
  definePageMeta: "readonly",
  queryCollection: "readonly",
  queryCollectionNavigation: "readonly",
  queryCollectionSearchSections: "readonly",
  queryCollectionItemSurroundings: "readonly",
  defineEventHandler: "readonly",
  requestAnimationFrame: "readonly"
}

const baseConfig = {
  languageOptions: {
    globals
  },
  rules: {
    "no-unused-vars": "off"
  }
}

const typescriptConfig = {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    ...baseConfig.languageOptions,
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    }
  },
  plugins: {
    "@typescript-eslint": typescript
  },
  rules: {
    ...baseConfig.rules,
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unused-vars": "off"
  }
}

const vueConfig = {
  files: ["**/*.vue"],
  languageOptions: {
    parser: vueParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser
    },
    globals
  },
  plugins: {
    vue
  },
  rules: {
    ...baseConfig.rules,
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "vue/multi-word-component-names": "off"
  }
}

const prettierConfig = {
  plugins: {
    prettier: pluginPrettier
  },
  rules: {
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto"
      }
    ]
  }
}

const testConfig = {
  files: [".tests/setup/setupTests.ts", "**/*.test.ts", "**/*.spec.ts"],
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    "@typescript-eslint/no-unused-vars": "off"
  }
}

const declarationConfig = {
  files: ["**/*.d.ts"],
  rules: {
    ...baseConfig.rules,
    "@typescript-eslint/no-unused-vars": "off"
  }
}

export default defineConfig([
  js.configs.recommended,
  baseConfig,
  typescriptConfig,
  vueConfig,
  prettierConfig,
  prettier,
  testConfig,
  declarationConfig,
  globalIgnores([
    "dist/**/*",
    "node_modules/**/*",
    "coverage/**/*",
    "**/dist/**/*",
    "**/node_modules/**/*",
    "**/.nuxt/**/*",
    "**/.output/**/*"
  ])
])
