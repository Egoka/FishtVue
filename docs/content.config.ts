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
  seo?: {
    title?: string // SEO заголовок (переопределяет title)
    description?: string // SEO описание (переопределяет description)
    keywords?: string[] // Ключевые слова для SEO
    ogImage?: string // Open Graph изображение
    ogTitle?: string // Open Graph заголовок
    ogDescription?: string // Open Graph описание
    ogType?: OgType // Тип контента (article, website, etc.)
    twitterCard?: "summary" | "summary_large_image" | "app" | "player" // Тип Twitter Card
    twitterTitle?: string // Twitter заголовок
    twitterDescription?: string // Twitter описание
    twitterImage?: string // Twitter изображение
    canonical?: string // Канонический URL
    robots?: RobotsDirective | RobotsDirective[] // Директивы для роботов
    author?: string // Автор контента
    publishedTime?: string // Время публикации (ISO 8601)
    modifiedTime?: string // Время последнего изменения (ISO 8601)
    section?: string // Секция сайта (для article)
    tags?: string[] // Теги контента
  }
}

const schema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        icon: z.string(),
        to: z.string(),
        target: z.string().optional()
      })
    )
    .optional(),
  // SEO метаданные
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogType: z.string().optional(),
      twitterCard: z.enum(["summary", "summary_large_image", "app", "player"]).optional(),
      twitterTitle: z.string().optional(),
      twitterDescription: z.string().optional(),
      twitterImage: z.string().optional(),
      canonical: z.string().optional(),
      robots: z.string().optional(),
      author: z.string().optional(),
      publishedTime: z.string().optional(),
      modifiedTime: z.string().optional(),
      section: z.string().optional(),
      tags: z.array(z.string()).optional()
    })
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
