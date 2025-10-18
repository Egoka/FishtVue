#!/usr/bin/env node

/**
 * Скрипт для валидации сгенерированного sitemap.xml
 * Проверяет корректность URLs, наличие обязательных полей, и hreflang связей
 */

import { readFile } from "fs/promises"
import { XMLParser } from "fast-xml-parser"

const SITEMAP_PATH = ".output/public/sitemap.xml"
const BASE_URL = "https://fisht.org"

async function validateSitemap() {
  console.log("🔍 Валидация sitemap.xml...\n")

  try {
    const content = await readFile(SITEMAP_PATH, "utf-8")

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "_"
    })

    const result = parser.parse(content)
    const urlset = result.urlset

    if (!urlset || !urlset.url) {
      console.error("❌ Неверный формат sitemap")
      process.exit(1)
    }

    const urls = Array.isArray(urlset.url) ? urlset.url : [urlset.url]

    console.log(`📊 Статистика:\n`)
    console.log(`   Всего URL: ${urls.length}`)

    // Группируем по языкам
    const enUrls = urls.filter((u) => !u.loc.includes("/ru/") && u.loc !== `${BASE_URL}/ru`)
    const ruUrls = urls.filter((u) => u.loc.includes("/ru/") || u.loc === `${BASE_URL}/ru`)

    console.log(`   Английские: ${enUrls.length}`)
    console.log(`   Русские: ${ruUrls.length}\n`)

    // Проверки
    let errors = 0
    let warnings = 0

    console.log("🔎 Проверка качества...\n")

    // Проверка 1: Обязательные поля
    urls.forEach((url, index) => {
      if (!url.loc) {
        console.error(`❌ URL #${index + 1}: отсутствует <loc>`)
        errors++
      }
      if (!url.lastmod) {
        console.warn(`⚠️  ${url.loc}: отсутствует <lastmod>`)
        warnings++
      }
      if (!url.priority) {
        console.warn(`⚠️  ${url.loc}: отсутствует <priority>`)
        warnings++
      }
      if (!url.changefreq) {
        console.warn(`⚠️  ${url.loc}: отсутствует <changefreq>`)
        warnings++
      }
    })

    // Проверка 2: Корректность URL
    urls.forEach((url) => {
      if (!url.loc.startsWith(BASE_URL)) {
        console.error(`❌ ${url.loc}: некорректный базовый URL (должен начинаться с ${BASE_URL})`)
        errors++
      }
      if (url.loc.includes(" ")) {
        console.error(`❌ ${url.loc}: содержит пробелы`)
        errors++
      }
    })

    // Проверка 3: Дубликаты
    const locMap = new Map()
    urls.forEach((url) => {
      const count = locMap.get(url.loc) || 0
      locMap.set(url.loc, count + 1)
    })

    for (const [loc, count] of locMap.entries()) {
      if (count > 1) {
        console.error(`❌ Дубликат URL (${count}x): ${loc}`)
        errors++
      }
    }

    // Проверка 4: Hreflang связи
    console.log("\n🌐 Проверка hreflang связей...\n")

    const urlsWithHreflang = urls.filter((u) => u["xhtml:link"])
    console.log(`   URL с hreflang: ${urlsWithHreflang.length}/${urls.length}`)

    if (urlsWithHreflang.length === 0) {
      console.warn(`⚠️  Нет URL с hreflang связями`)
      warnings++
    }

    // Проверка связей EN <-> RU
    const pathMap = new Map()
    urls.forEach((url) => {
      let path = url.loc.replace(BASE_URL, "")
      if (path.startsWith("/ru")) {
        path = path.replace("/ru", "")
      }

      if (!pathMap.has(path)) {
        pathMap.set(path, { en: null, ru: null })
      }

      const isRu = url.loc.includes("/ru/")
      if (isRu) {
        pathMap.get(path).ru = url.loc
      } else {
        pathMap.get(path).en = url.loc
      }
    })

    let pairsCount = 0
    let orphansCount = 0

    for (const [path, versions] of pathMap.entries()) {
      if (versions.en && versions.ru) {
        pairsCount++
      } else {
        orphansCount++
        console.warn(`⚠️  Страница без пары: ${versions.en || versions.ru}`)
      }
    }

    console.log(`\n   Парных страниц (EN+RU): ${pairsCount}`)
    console.log(`   Страниц без пары: ${orphansCount}\n`)

    // Проверка 5: Даты
    console.log("📅 Проверка дат...\n")

    const today = new Date()
    const oldDates = urls.filter((url) => {
      if (!url.lastmod) return false
      const date = new Date(url.lastmod)
      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24))
      return diffDays > 365
    })

    if (oldDates.length > 0) {
      console.warn(`⚠️  ${oldDates.length} страниц не обновлялись более года`)
      oldDates.slice(0, 5).forEach((url) => {
        console.warn(`   - ${url.loc} (${url.lastmod})`)
      })
      if (oldDates.length > 5) {
        console.warn(`   ... и еще ${oldDates.length - 5}`)
      }
    }

    // Проверка 6: Priority
    console.log("\n🎯 Проверка приоритетов...\n")

    const priorities = {}
    urls.forEach((url) => {
      const p = url.priority || "0.5"
      priorities[p] = (priorities[p] || 0) + 1
    })

    Object.entries(priorities)
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
      .forEach(([priority, count]) => {
        console.log(`   Priority ${priority}: ${count} страниц`)
      })

    // Итоговый отчет
    console.log("\n" + "=".repeat(60))
    console.log("\n📋 Итоговый отчет:\n")

    if (errors === 0 && warnings === 0) {
      console.log("✅ Sitemap идеален! Никаких проблем не обнаружено.\n")
    } else {
      if (errors > 0) {
        console.log(`❌ Критические ошибки: ${errors}`)
      }
      if (warnings > 0) {
        console.log(`⚠️  Предупреждения: ${warnings}`)
      }
      console.log("")

      if (errors > 0) {
        console.log("Необходимо исправить критические ошибки перед деплоем!")
        process.exit(1)
      }
    }

    console.log("💡 Рекомендации:\n")
    console.log("1. Регулярно обновляйте даты в frontmatter")
    console.log("2. Убедитесь, что все важные страницы имеют priority >= 0.7")
    console.log("3. Проверьте, что парные языковые версии имеют одинаковый контент")
    console.log("4. После деплоя отправьте sitemap в Google Search Console")
    console.log("")
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`❌ Файл не найден: ${SITEMAP_PATH}`)
      console.log("\nСначала выполните сборку:")
      console.log("  npm run generate")
    } else {
      console.error("❌ Ошибка при валидации:", error.message)
    }
    process.exit(1)
  }
}

validateSitemap()
