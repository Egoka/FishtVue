import { defineConfig, globalIgnores } from "eslint/config"
import js from "@eslint/js"
import vue from "eslint-plugin-vue"
import vueParser from "vue-eslint-parser"
import typescript from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import prettier from "eslint-config-prettier"
import pluginPrettier from "eslint-plugin-prettier"

const globals = {
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
  MouseEvent: "readonly",
  FocusEvent: "readonly",
  KeyboardEvent: "readonly",
  InputEvent: "readonly",
  ShadowRoot: "readonly",
  DOMException: "readonly",
  HTMLCanvasElement: "readonly",
  HTMLAnchorElement: "readonly",
  HTMLHeadElement: "readonly",
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
  useNuxtApp: "readonly",
  useScrollTo: "readonly",
  useEditLink: "readonly",
  useActiveAnchor: "readonly",
  definePageMeta: "readonly",
  queryCollection: "readonly",
  queryCollectionNavigation: "readonly",
  queryCollectionSearchSections: "readonly",
  queryCollectionItemSurroundings: "readonly",
  requestAnimationFrame: "readonly"
}
export default defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals
    },
    rules: {
      "no-unused-vars": "off"
    }
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals,
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
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  {
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
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "vue/multi-word-component-names": "off"
    }
  },
  {
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
  },
  prettier,
  {
    files: [".tests/setup/setupTests.ts", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals
    },
    rules: {
      "no-unused-vars": "off"
    }
  },
  globalIgnores([
    "dist/**/*",
    "node_modules/**/*",
    "coverage/**/*",
    "**/dist/**/*",
    "**/node_modules/**/*",
    "**/.nuxt/**/*"
  ])
])
