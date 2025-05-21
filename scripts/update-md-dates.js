import { execSync } from "child_process"
import fs from "fs"
import path from "path"

function getChangedMdFiles() {
  return execSync("git diff --cached --name-only --diff-filter=ACM")
    .toString()
    .split("\n")
    .filter((file) => file.endsWith(".md"))
}

function updateDateInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const today = new Date().toLocaleDateString("en-GB") // формат DD/MM/YYYY

  const updatedContent = content.replace(/date:\s*\d{2}\/\d{2}\/\d{4}/, `date: ${today}`)

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent)
    execSync(`git add ${filePath}`)
  }
}

const changedMdFiles = getChangedMdFiles()
changedMdFiles.forEach((file) => {
  if (file) {
    // Добавляем проверку на пустую строку
    updateDateInFile(path.join(process.cwd(), file))
  }
})
