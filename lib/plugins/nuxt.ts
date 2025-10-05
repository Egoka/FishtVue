import { cssComponents } from "fishtvue/component"
import { defineNuxtPlugin } from "nuxt/app"
import type { NuxtApp } from "nuxt/app"

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  if ((process as any).server && nuxtApp.ssrContext) {
    nuxtApp.hook("app:rendered", () => {
      if (cssComponents.size) {
        cssComponents.forEach((style, component) => {
          nuxtApp.ssrContext?.head.push({
            style: {
              // @ts-ignore
              type: "text/css",
              "data-fishtvue-style-id": component,
              innerHTML: style
            }
          })
        })
      }
    })
  }
})
