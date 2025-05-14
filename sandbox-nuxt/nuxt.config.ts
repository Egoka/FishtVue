// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  modules: ["fishtvue/module"],
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()]
    // resolve: {
    //   alias: {
    //     fishtvue: fileURLToPath(new URL("./../lib", import.meta.url))
    //   }
    // }
  },
  nitro: {
    prerender: {
      routes: ["/"],
      crawlLinks: true
    }
  }
})
