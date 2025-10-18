import { useRoute } from "vue-router"
import { useI18n } from "vue-i18n"
import type { PageCollection } from "~/content.config"

export const useSeoMetaFromDoc = (doc: PageCollection | null) => {
  const { t, locale, defaultLocale, locales, localeProperties } = useI18n()
  if (!doc) {
    useHead({
      title: t("404.title"),
      meta: [{ name: "robots", content: "noindex, nofollow" }]
    })
    return
  }

  const { site } = useAppConfig()
  const route = useRoute()

  // Приоритет: doc.seo.* > doc.* > defaults
  const title = doc?.seo?.title ?? doc?.title
  const description = doc?.seo?.description ?? doc?.description ?? t("seo.doc.description")
  const image = `${site.url}${doc?.seo?.ogImage ?? doc?.image ?? "/og/banner.png"}`
  const ogType = doc?.seo?.ogType ?? doc?.ogType ?? "website"
  const robots = doc?.seo?.robots ?? doc?.robots ?? "index, follow"
  const author = doc?.seo?.author ?? "Egoka"
  const keywords = doc?.seo?.keywords
    ? [...doc.seo.keywords, "fishtvue", "fisht"]
    : [
        "fisht",
        "fishtvue",
        "vue",
        "vue.js",
        "vue3",
        "ui library",
        "component library",
        "vue components",
        "typescript",
        "accessibility",
        "wcag"
      ]

  const baseUrl = site.url?.endsWith("/") ? site.url.slice(0, -1) : site.url

  // Получаем путь без префикса локали
  const pathWithoutLocale = route?.path?.replace(`/${locale.value}`, "") || "/"
  const fullPath = route?.fullPath?.startsWith("/") ? route.fullPath : `/${route?.fullPath}`
  const url = route ? `${baseUrl}${fullPath}` : baseUrl

  // Создаем hreflang ссылки для всех языков
  const hreflangLinks: Array<{ rel: string; hreflang: string; href: string }> = locales.value.map((loc) => {
    const localePrefix = loc.code === defaultLocale ? "" : `/${loc.code}`
    return {
      rel: "alternate",
      hreflang: loc.code,
      href: `${baseUrl}${localePrefix}${pathWithoutLocale}`
    }
  })

  // Добавляем x-default для английской версии
  hreflangLinks.push({
    rel: "alternate",
    hreflang: "x-default",
    href: `${baseUrl}${pathWithoutLocale}`
  })

  // Создаем breadcrumb для структурированных данных
  const pathSegments = pathWithoutLocale.split("/").filter(Boolean)
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl
      },
      ...pathSegments.map((segment, index) => {
        const segmentPath = `/${pathSegments.slice(0, index + 1).join("/")}`
        return {
          "@type": "ListItem",
          position: index + 2,
          name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
          item: `${baseUrl}${locale.value !== defaultLocale ? `/${locale.value}` : ""}${segmentPath}`
        }
      })
    ]
  }

  // Структурированные данные для программного обеспечения
  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FishtVue",
    description: "Modern UI component library for Vue.js projects",
    url: site.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    author: {
      "@type": "Person",
      name: "Egoka",
      url: site.publisherLink
    }
  }

  // Структурированные данные для документации
  const publishedTime = doc?.seo?.publishedTime ?? doc?.meta?.date
  const modifiedTime = doc?.seo?.modifiedTime ?? doc?.meta?.date

  // Безопасное преобразование дат
  const getISODate = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString()
    try {
      // Если дата в формате DD/MM/YYYY
      if (typeof dateValue === "string" && dateValue.includes("/")) {
        const [day, month, year] = dateValue.split("/")
        return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`).toISOString()
      }
      return new Date(dateValue).toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  const techArticle = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: description,
    url: url,
    image: image,
    datePublished: getISODate(publishedTime),
    dateModified: getISODate(modifiedTime),
    author: {
      "@type": doc?.seo?.author ? "Person" : "Organization",
      name: author,
      url: site.publisherLink
    },
    publisher: {
      "@type": "Organization",
      name: "FishtVue",
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/og/banner.png`
      }
    },
    inLanguage: localeProperties.value.iso as string,
    ...(doc?.seo?.section && { articleSection: doc.seo.section }),
    ...(doc?.seo?.tags && { keywords: doc.seo.tags.join(", ") })
  }

  // Open Graph и Twitter метаданные с приоритетом seo.*
  const ogTitle = doc?.seo?.ogTitle ?? title
  const ogDescription = doc?.seo?.ogDescription ?? description
  const twitterCard = doc?.seo?.twitterCard ?? "summary_large_image"
  const twitterTitle = doc?.seo?.twitterTitle ?? title
  const twitterDescription = doc?.seo?.twitterDescription ?? description
  const twitterImage = doc?.seo?.twitterImage ?? image
  const canonical = doc?.seo?.canonical ? `${baseUrl}${doc.seo.canonical}` : url

  useHead({
    title,
    description,
    meta: [
      { name: "robots", content: robots },
      { property: "title", content: title },
      { property: "description", content: description },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDescription },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: ogTitle },
      { property: "og:site_name", content: site.title },
      { property: "og:url", content: url },
      { property: "og:type", content: ogType },
      { property: "og:locale", content: localeProperties.value.iso as string },
      ...locales.value
        .filter((loc) => loc.code !== locale.value)
        .map((loc) => ({ property: `og:locale:alternate`, content: loc.iso as string })),
      ...(publishedTime ? [{ property: "article:published_time", content: getISODate(publishedTime) }] : []),
      ...(modifiedTime ? [{ property: "article:modified_time", content: getISODate(modifiedTime) }] : []),
      ...(doc?.seo?.section ? [{ property: "article:section", content: doc.seo.section }] : []),
      ...(doc?.seo?.tags ? doc.seo.tags.map((tag) => ({ property: "article:tag", content: tag })) : []),
      { name: "twitter:title", content: twitterTitle },
      { name: "twitter:description", content: twitterDescription },
      { name: "twitter:card", content: twitterCard },
      { name: "twitter:image", content: twitterImage },
      { name: "twitter:site", content: "@FishtVue" },
      { name: "twitter:creator", content: "@Egoka" },
      { name: "keywords", content: Array.isArray(keywords) ? keywords.join(", ") : keywords },
      { name: "author", content: author },
      { name: "language", content: localeProperties.value.iso as string },
      { name: "revisit-after", content: "7 days" }
    ],
    link: [
      { rel: "canonical", href: canonical },
      ...hreflangLinks,
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
        children: JSON.stringify(breadcrumbList)
      },
      {
        type: "application/ld+json",
        // @ts-ignore
        children: JSON.stringify(techArticle)
      },
      {
        type: "application/ld+json",
        // @ts-ignore
        children: JSON.stringify(softwareApplication)
      }
    ],
    htmlAttrs: {
      lang: locale.value
    }
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
