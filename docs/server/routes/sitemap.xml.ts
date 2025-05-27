export default defineEventHandler(async (event) => {
  const itemsEn = await queryCollection(event, "en").where("extension", "=", "md").all()
  const itemsRu = await queryCollection(event, "ru").where("extension", "=", "md").all()

  const urls = [...itemsEn, ...itemsRu]
    .map(
      (doc) => `
    <url>
      <loc>https://fisht.org${doc.id?.startsWith("ru") ? "/ru" : ""}${doc.path}</loc>
    </url>
  `
    )
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls}
  </urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml"
    }
  })
})
export const prerender = true
