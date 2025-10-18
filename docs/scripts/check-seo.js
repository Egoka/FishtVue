#!/usr/bin/env node

import { readdir, readFile } from "fs/promises"
import { join } from "path"
import matter from "gray-matter"

const CONTENT_DIR = "./content"
const ISSUES = []

async function getAllMarkdownFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      await getAllMarkdownFiles(fullPath, files)
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath)
    }
  }

  return files
}

async function checkSEO() {
  console.log("🔍 Проверка SEO качества документации...\n")

  try {
    const files = await getAllMarkdownFiles(CONTENT_DIR)
    let totalFiles = 0
    let filesWithIssues = 0
    let filesWithSEO = 0
    let filesWithKeywords = 0

    for (const file of files) {
      totalFiles++
      const content = await readFile(file, "utf-8")
      const { data: frontmatter } = matter(content)
      const issues = []

      // Приоритет: seo.title > title
      const title = frontmatter.seo?.title || frontmatter.title
      const description = frontmatter.seo?.description || frontmatter.description
      const hasKeywords = frontmatter.seo?.keywords && frontmatter.seo.keywords.length > 0

      // Статистика SEO объектов
      if (frontmatter.seo) {
        filesWithSEO++
        if (hasKeywords) filesWithKeywords++
      }

      // Проверяем наличие title
      if (!title) {
        issues.push("❌ Отсутствует title и seo.title")
      } else if (title.length < 10) {
        issues.push(`⚠️  Title слишком короткий: "${title}" (${title.length} символов)`)
      } else if (title.length > 70) {
        issues.push(`⚠️  Title слишком длинный: "${title}" (${title.length} символов, рекомендуется 50-60)`)
      }

      // Проверяем наличие description
      if (!description) {
        issues.push("❌ Отсутствует description и seo.description")
      } else if (description.length < 100) {
        issues.push(`⚠️  Description слишком короткий: ${description.length} символов (рекомендуется 120-160)`)
      } else if (description.length > 200) {
        issues.push(`⚠️  Description слишком длинный: ${description.length} символов (рекомендуется 120-160)`)
      }

      // Проверяем SEO объект
      if (!frontmatter.seo) {
        issues.push("⚠️  Отсутствует SEO объект (рекомендуется добавить)")
      } else {
        // Проверяем keywords
        if (!frontmatter.seo.keywords || frontmatter.seo.keywords.length === 0) {
          issues.push("⚠️  Нет keywords в SEO объекте")
        } else if (frontmatter.seo.keywords.length < 3) {
          issues.push(`⚠️  Мало keywords: ${frontmatter.seo.keywords.length} (рекомендуется 5-10)`)
        }

        // Проверяем author
        if (!frontmatter.seo.author) {
          issues.push("⚠️  Нет author в SEO объекте")
        }

        // Проверяем section
        if (!frontmatter.seo.section) {
          issues.push("⚠️  Нет section в SEO объекте")
        }

        // Проверяем tags
        if (!frontmatter.seo.tags || frontmatter.seo.tags.length === 0) {
          issues.push("⚠️  Нет tags в SEO объекте")
        }
      }

      // Проверяем наличие date
      if (!frontmatter.date) {
        issues.push("⚠️  Отсутствует date (последнее обновление)")
      }

      // Проверяем длину контента
      const contentLength = content.replace(/^---[\s\S]*?---/, "").trim().length
      if (contentLength < 300) {
        issues.push(`⚠️  Контент слишком короткий: ${contentLength} символов`)
      }

      if (issues.length > 0) {
        filesWithIssues++
        ISSUES.push({
          file: file.replace("./content/", ""),
          issues
        })
      }
    }

    // Выводим результаты
    console.log(`📊 Общая статистика:\n`)
    console.log(`   Всего файлов проверено: ${totalFiles}`)
    console.log(`   Файлов с SEO объектами: ${filesWithSEO} (${Math.round((filesWithSEO / totalFiles) * 100)}%)`)
    console.log(`   Файлов с keywords: ${filesWithKeywords} (${Math.round((filesWithKeywords / totalFiles) * 100)}%)`)
    console.log(`   Файлов с проблемами: ${filesWithIssues}`)
    console.log(`   Качество: ${Math.round(((totalFiles - filesWithIssues) / totalFiles) * 100)}%\n`)

    if (ISSUES.length > 0) {
      console.log("🔴 Найденные проблемы:\n")
      ISSUES.forEach(({ file, issues }) => {
        console.log(`📄 ${file}`)
        issues.forEach((issue) => console.log(`   ${issue}`))
        console.log("")
      })
    } else {
      console.log("✅ Все страницы соответствуют требованиям SEO!\n")
    }

    // Выводим рекомендации
    console.log("\n📋 Рекомендации для улучшения SEO:\n")
    console.log("1. SEO Title должен быть 50-60 символов (используйте seo.title)")
    console.log("2. SEO Description должен быть 120-160 символов (используйте seo.description)")
    console.log("3. Добавьте 5-10 keywords в seo.keywords")
    console.log("4. Укажите author, section и tags в SEO объекте")
    console.log("5. Каждая страница должна иметь дату последнего обновления")
    console.log("6. Контент страницы должен быть не менее 300 символов\n")
  } catch (error) {
    console.error("❌ Ошибка при проверке:", error.message)
    process.exit(1)
  }
}

checkSEO()
