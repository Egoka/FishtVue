import { defineCollection, defineContentConfig, type PageCollectionItemBase, z } from "@nuxt/content"
import type { OgType, RobotsDirective } from "~/composables/seo"

export type PageCollection = PageCollectionItemBase & {
  name: string
  description: string
  icon?: string
  image?: string
  ogType?: OgType
  robots?: RobotsDirective | RobotsDirective[]
  links?: {
    label: string
    icon: string
    to: string
    target?: string
  }[]
}
const schema = z.object({
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  image: z.string(),
  links: z
    .array(
      z.object({
        label: z.string(),
        icon: z.string(),
        to: z.string(),
        target: z.string().optional()
      })
    )
    .optional()
})
export default defineContentConfig({
  collections: {
    en: defineCollection({
      type: "page",
      source: {
        include: "en/**",
        prefix: "/"
      },
      schema
    }),
    ru: defineCollection({
      type: "page",
      source: {
        include: "ru/**",
        prefix: "/"
      },
      schema
    })
  }
})
