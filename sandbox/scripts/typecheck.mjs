// Типовая проверка песочницы, суженная до её собственных файлов.
//
// Зачем обёртка вместо голого `vue-tsc --noEmit`. Песочница импортирует компоненты как
// `fishtvue/{name}/{Name}.vue` — это не наша прихоть, а конвенция репозитория: `{name}.mjs`
// из `package.json` подпакетов существует только в `dist/`, а `index.ts` есть не у всех
// подпакетов, поэтому и сама `lib/` импортирует соседей raw-путём к SFC. Из-за этого SFC
// библиотеки попадают в программу TypeScript, и включённый `strictTemplates` начинает
// проверять ещё и их шаблоны — около двухсот нарушений, которые к песочнице отношения не
// имеют и чинятся отдельным заходом (корневой `pnpm typecheck` их не видит: там нет
// `vueCompilerOptions`).
//
// Поэтому: прогоняем vue-tsc целиком, а отчитываемся и падаем только по файлам песочницы.
import { spawnSync } from "node:child_process"

const LIB_PREFIX = "../lib/"
const res = spawnSync("vue-tsc", ["--noEmit", "--pretty", "false"], {
  cwd: new URL("..", import.meta.url).pathname,
  encoding: "utf-8",
  shell: process.platform === "win32"
})

if (res.error) {
  console.error(res.error.message)
  process.exit(1)
}

const lines = `${res.stdout ?? ""}${res.stderr ?? ""}`.split("\n")
const isError = (l) => / error TS\d+: /.test(l)
const ours = lines.filter((l) => isError(l) && !l.startsWith(LIB_PREFIX))
const skipped = lines.filter((l) => isError(l) && l.startsWith(LIB_PREFIX)).length

if (ours.length) {
  console.error(ours.join("\n"))
  console.error(`\n${ours.length} ошибок в песочнице.`)
  if (skipped) console.error(`(${skipped} ошибок в lib/ под strictTemplates пропущено — вне объёма песочницы.)`)
  process.exit(1)
}

console.log(`Типы песочницы чисты.${skipped ? ` (${skipped} ошибок в lib/ под strictTemplates пропущено.)` : ""}`)
