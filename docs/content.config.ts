import { defineCollection, defineContentConfig, z } from "@nuxt/content"

export default defineContentConfig({
  collections: {
    en: defineCollection({
      type: "page",
      source: {
        include: "en/**",
        prefix: "/"
      },
      schema: z.object({
        name: z.string(),
        description: z.string(),
        icon: z.string(),
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
    }),
    ru: defineCollection({
      type: "page",
      source: {
        include: "ru/**",
        prefix: "/"
      },
      schema: z.object({
        name: z.string(),
        description: z.string(),
        icon: z.string(),
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
    })
  }
})
