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
      routes: ["/en", "/ru", "/sitemap.xml", "/components/components", "/ru/components/components"],
      crawlLinks: true,
      // Увеличиваем количество одновременных запросов для более быстрого пререндера
      concurrency: 10,
      // Указываем игнорируемые маршруты
      ignore: ["/api/", "/_nuxt/"]
    },
    // Добавляем заголовки для SEO
    routeRules: {
      "/**": {
        headers: {
          "X-Robots-Tag": "index, follow",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        }
      },
      "/sitemap.xml": {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600, s-maxage=3600"
        }
      },
      "/robots.txt": {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "public, max-age=86400, s-maxage=86400"
        }
      }
    }
  }
})
