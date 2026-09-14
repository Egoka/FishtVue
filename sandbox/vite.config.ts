import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    // Песочница — отдельный install-root со своим node_modules, а `fishtvue` алиасится на
    // `../lib`, чьи импорты `vue` резолвятся вверх, в корневой node_modules. Без dedupe в
    // страницу приезжают ДВА разных рантайма Vue (здесь были 3.5.13 и 3.5.25), и `provide`/
    // `inject` между кодом песочницы и кодом библиотеки перестают видеть друг друга: плагин
    // `Config` тихо сваливается на window-фолбэк вместо inject. Тот же раскол ломал и типы —
    // `App` из одной копии не присваивается в `App` из другой (зеркальная строка в tsconfig).
    dedupe: ["vue"],
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
