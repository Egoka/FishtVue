import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      fishtvue: fileURLToPath(new URL("./../lib", import.meta.url))
    }
  },
  server: {
    // Claude Code preview/менеджеры портов передают назначенный порт через env PORT.
    // Vite сам PORT не читает — пробрасываем вручную. Без PORT — дефолтный 5173 с авто-инкрементом.
    port: Number(process.env.PORT) || 5173,
    strictPort: Boolean(process.env.PORT),
    fs: {
      allow: [".."]
    }
  }
})
