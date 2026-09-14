import { get } from "fishtvue/utils/objectHandler"
import { colors as defaultColors } from "fishtvue/theme/primitive"
import { getLiveFishtVue } from "./helpers/tokensCss"

export type DesignToken = {
  /** CSS custom property (есть только у токенизированных путей). */
  name?: string
  /** Готовая ссылка `var(--…)` (есть только у токенизированных путей). */
  variable?: string
  /** Значение из merged live-темы. */
  value: unknown
}

const COLOR_NAMES = new Set(Object.keys(defaultColors))

// path → CSS-переменная (только для путей, реально представленных в tokens-теге).
const varNameFor = (path: string): string | undefined => {
  const parts = path.split(".")
  if (parts[0] === "primitive" && parts.length === 3 && COLOR_NAMES.has(parts[1]) && /^\d+$/.test(parts[2]))
    return `--fv-${parts[1]}-${parts[2]}`
  if (path === "semantic.customThemeColor") return "--theme"
  if (path === "semantic.customThemeColorContrast") return "--theme-contrast"
  if (parts[0] === "semantic" && parts[1] === "primary" && parts.length === 3) return `--fv-theme-${parts[2]}`
  if (parts[0] === "semantic" && parts[1] === "surface") {
    const tone = parts[parts.length - 1]
    if (/^\d+$/.test(tone)) return `--fv-surface-${tone}`
  }
  return undefined
}

/**
 * Метаданные дизайн-токена по dot-path в merged live-теме (Wave 3.3 — theme.md Issue 1,
 * публичный контракт docs/content/.../2.Theming.md#$dt): `$dt("primitive.emerald.500")` →
 * `{ name: "--fv-emerald-500", variable: "var(--fv-emerald-500)", value: "#10b981" }`.
 * Для путей без CSS-переменной (spacing/duration/…) возвращается только `value`.
 * Неизвестный путь или отсутствие установленного FishtVue → undefined.
 */
export default function $dt(path: string): DesignToken | undefined {
  const fv = getLiveFishtVue()
  if (!fv?.config?.theme || !path) return
  const value = get<unknown>(fv.config.theme, path)
  if (value === undefined) return
  const name = varNameFor(path)
  return name ? { name, variable: `var(${name})`, value } : { value }
}
