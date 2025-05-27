import { useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import type { PageCollection } from "~/content.config"

export const useSeoMetaFromDoc = (doc: PageCollection | null) => {
  if (!doc) return

  const { t, locale, defaultLocale, locales, localeProperties } = useI18n()
  const { site } = useAppConfig()
  const route = useRoute()

  const title = doc?.title
  const description = doc?.description ?? t("seo.doc.description")
  const image = `${site.url}${doc?.image ?? "/og/banner.png"}`
  const ogType = doc?.ogType ?? "website"
  const robots = doc?.robots ?? "index, follow"
  const url = route ? `${site.url}${route.fullPath}` : site.url
  console.log("locale", locale, defaultLocale, locales, localeProperties)
  useHead({
    title,
    description,
    meta: [
      { name: "robots", content: robots },
      { property: "title", content: title },
      { property: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:site_name", content: site.title },
      { property: "og:url", content: url },
      { property: "og:type", content: ogType },
      { property: "og:locale", content: localeProperties.value.iso as string },
      ...locales.value
        .filter((loc) => loc.code !== locale.value)
        .map((loc) => ({ property: `og:locale:alternate`, content: loc.iso as string })),
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: image },
      { name: "keywords", content: "fishtvue vue vue.js vue3 ui library component" }
    ],
    link: [
      { rel: "canonical", href: url },
      {
        rel: "icon",
        type: "image/x-icon",
        href: `${site.url}/logo-${useColorMode().value === "light" ? "light" : "dark"}.ico`
      }
    ],
    script: [
      {
        type: "application/ld+json",
        // @ts-ignore
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description: description,
          url: url,
          image: image
        })
      }
    ]
  })
}

export type OgType =
  | "website"
  | "article"
  | "book"
  | "profile"
  | "music.song"
  | "music.album"
  | "music.playlist"
  | "music.radio_station"
  | "video.movie"
  | "video.episode"
  | "video.tv_show"
  | "video.other"
  | "game"
  | "sport"
  | "product"
  | "place"
  | "restaurant"
  | "bar"
  | "cafe"
  | "hotel"
  | "attraction"
  | "event"
  | "business"
  | "organization"
  | "blog"
  | "news"
  | "video"
  | "audio"
  | "image"
  | string

export type RobotsDirective =
  | "index"
  | "noindex"
  | "follow"
  | "nofollow"
  | "none"
  | "all"
  | "noarchive"
  | "nocache"
  | "noimageindex"
  | "nosnippet"
  | "notranslate"
  | "noodp"
  | "noyaca"
  | "noydir"
  | "max-snippet:[number]"
  | "max-image-preview:[size]"
  | "max-video-preview:[number]"
  | "unavailable_after:[date]"
  | string
