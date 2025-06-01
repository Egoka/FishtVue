import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/content", "@nuxtjs/i18n", "@nuxtjs/color-mode", "@nuxt/image", "fishtvue/module"],
  fishtvue: {
    prefix: "",
    theme: {
      semantic: {
        customThemeColor: 150,
        customThemeColorContrast: 85
      }
    },
    optionsTheme: {
      darkModeSelector: "html.dark"
    }
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "nord",
            light: "vitesse-light",
            dark: "vitesse-dark"
          },
          preload: ["ts", "vue", "js", "html"]
        }
      }
    }
  },
  i18n: {
    bundle: {
      optimizeTranslationDirective: false
    },
    locales: [
      { code: "en", iso: "en-US", file: "en.json", name: "English", flag: "us" },
      { code: "ru", iso: "ru-RU", file: "ru.json", name: "Русский", flag: "ru" }
    ],
    defaultLocale: "en",
    lazy: false,
    strategy: "prefix_except_default"
  },
  colorMode: {
    preference: "system", // default value of $colorMode.preference
    fallback: "light", // fallback value if not system preference found
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "",
    storage: "localStorage", // or 'sessionStorage' or 'cookie'
    storageKey: "nuxt-color-mode"
  },
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    build: {
      sourcemap: false
    }
  },
  nitro: {
    prerender: {
      routes: ["/*", "/sitemap.xml", "/components/components", "/ru/components/components"],
      crawlLinks: true
    }
  }
})
