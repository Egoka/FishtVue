import type { Theme, ThemeColor } from "fishtvue/theme/Theme"
import { get } from "fishtvue/utils/objectHandler"
import palette from "./helpers/palette"
import { getLiveFishtVue, injectTokens } from "./helpers/tokensCss"

export type PrimaryPaletteInput = string | Partial<ThemeColor>

const TOKEN_REF = /^\{([\w.]+)\}$/

// '{indigo.500}' → значение из primitive текущей темы; обычные строки — как есть.
const resolveRef = (value: string, primitive: unknown): string => {
  const ref = value.match(TOKEN_REF)
  if (!ref) return value
  const resolved = get<unknown>(primitive, ref[1])
  return typeof resolved === "string" ? resolved : value
}

/**
 * Обновляет брендовую палитру (Wave 3.3 — theme.md Issue 1, публичный контракт
 * docs/content/.../2.Theming.md#updateprimarypalette). Брендовый слот FishtVue — цвет `theme`
 * (все `*-theme-{tone}` классы 22 компонентов), поэтому палитра пишется в `semantic.primary`
 * и эмитится override'ами `--fv-theme-{tone}` в tokens-теге поверх hsl-формул слота.
 * Вход: палитра тонов (hex или '{indigo.500}'-refs), '{indigo}' — копия готовой шкалы primitive,
 * одиночный hex — генерация 11-ступенчатой шкалы через palette().
 * Без установленного FishtVue — no-op, возвращает undefined.
 */
export default function updatePrimaryPalette(paletteInput: PrimaryPaletteInput): Theme | undefined {
  const fv = getLiveFishtVue()
  if (!fv?.config || !paletteInput) return
  const primitive = fv.config.theme?.primitive

  let resolved: Partial<ThemeColor>
  if (typeof paletteInput === "string") {
    const ref = paletteInput.match(TOKEN_REF)
    resolved = ref ? ((get<unknown>(primitive, ref[1]) ?? {}) as Partial<ThemeColor>) : palette(paletteInput)
  } else {
    resolved = Object.fromEntries(
      Object.entries(paletteInput).map(([tone, value]) => [
        tone,
        typeof value === "string" ? resolveRef(value, primitive) : value
      ])
    ) as Partial<ThemeColor>
  }

  fv.config.theme = fv.config.theme ?? {}
  fv.config.theme.semantic = { ...(fv.config.theme.semantic ?? {}), primary: resolved } as Theme["semantic"]
  injectTokens(fv)
  return fv.config.theme
}
