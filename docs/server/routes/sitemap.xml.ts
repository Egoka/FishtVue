export default defineEventHandler(async (event) => {
  const itemsEn = await queryCollection(event, "en").where("extension", "=", "md").all()
  const itemsRu = await queryCollection(event, "ru").where("extension", "=", "md").all()

  // Создаем карту для связывания EN и RU версий одной страницы
  const pageMap = new Map<string, { en?: any; ru?: any }>()

  itemsEn.forEach((doc: any) => {
    const key = doc.path
    if (!pageMap.has(key)) pageMap.set(key, {})
    pageMap.get(key)!.en = doc
  })

  itemsRu.forEach((doc: any) => {
    const key = doc.path
    if (!pageMap.has(key)) pageMap.set(key, {})
    pageMap.get(key)!.ru = doc
  })

  // Генерируем URL с hreflang связями
  const urls = Array.from(pageMap.entries())
    .map(([path, versions]) => {
      const enUrl = `https://fisht.org${path}`
      const ruUrl = `https://fisht.org/ru${path}`

      // Определяем дату последнего изменения
      const rawDate = versions.en?.meta?.date || versions.ru?.meta?.date
      let lastmod = new Date().toISOString().split("T")[0]

      if (rawDate) {
        try {
          // Пробуем разобрать дату в формате DD/MM/YYYY
          const parts = String(rawDate).split("/")
          if (parts.length === 3) {
            const [day, month, year] = parts
            const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
            if (!isNaN(date.getTime())) {
              lastmod = date.toISOString().split("T")[0]
            }
          }
        } catch (e) {
          // Используем текущую дату если не удалось распарсить
        }
      }

      // Определяем приоритет на основе глубины пути
      const depth = path.split("/").filter(Boolean).length
      const priority = Math.max(0.5, 1.0 - depth * 0.1).toFixed(1)

      let urlBlock = ""

      // Добавляем EN версию
      if (versions.en) {
        urlBlock += `
    <url>
      <loc>${enUrl}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${priority}</priority>${
        versions.ru
          ? `
      <xhtml:link rel="alternate" hreflang="ru" href="${ruUrl}" />
      <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
      <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`
          : ""
      }
    </url>`
      }

      // Добавляем RU версию
      if (versions.ru) {
        urlBlock += `
    <url>
      <loc>${ruUrl}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${priority}</priority>${
        versions.en
          ? `
      <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
      <xhtml:link rel="alternate" hreflang="ru" href="${ruUrl}" />
      <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`
          : ""
      }
    </url>`
      }

      return urlBlock
    })
    .join("\n")

  // Добавляем главную страницу
  const homeUrls = `
    <url>
      <loc>https://fisht.org</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
      <xhtml:link rel="alternate" hreflang="en" href="https://fisht.org" />
      <xhtml:link rel="alternate" hreflang="ru" href="https://fisht.org/ru" />
      <xhtml:link rel="alternate" hreflang="x-default" href="https://fisht.org" />
    </url>
    <url>
      <loc>https://fisht.org/ru</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
      <xhtml:link rel="alternate" hreflang="en" href="https://fisht.org" />
      <xhtml:link rel="alternate" hreflang="ru" href="https://fisht.org/ru" />
      <xhtml:link rel="alternate" hreflang="x-default" href="https://fisht.org" />
    </url>`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${homeUrls}
  ${urls}
  </urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml"
    }
  })
})
export const prerender = true
