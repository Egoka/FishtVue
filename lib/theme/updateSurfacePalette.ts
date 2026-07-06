import type { Theme, ThemeColor } from "fishtvue/theme/Theme"
import { get } from "fishtvue/utils/objectHandler"
import { getLiveFishtVue, injectTokens } from "./helpers/tokensCss"

export type SurfacePaletteInput = Partial<ThemeColor> | { light?: Partial<ThemeColor>; dark?: Partial<ThemeColor> }

const TOKEN_REF = /^\{([\w.]+)\}$/

const resolvePalette = (
  scale: Partial<ThemeColor> | undefined,
  primitive: unknown
): Partial<ThemeColor> | undefined => {
  if (!scale) return undefined
  return Object.fromEntries(
    Object.entries(scale).map(([tone, value]) => {
      if (typeof value !== "string") return [tone, value]
      const ref = value.match(TOKEN_REF)
      const resolved = ref ? get<unknown>(primitive, ref[1]) : value
      return [tone, typeof resolved === "string" ? resolved : value]
    })
  ) as Partial<ThemeColor>
}

/**
 * Обновляет палитру поверхностей (Wave 3.3 — theme.md Issue 1, публичный контракт
 * docs/content/.../2.Theming.md#updatesurfacepalette). Пишет `semantic.surface` (плоская палитра —
 * оба режима; `{light, dark}` — режимные подмножества) и эмитит `--fv-surface-{tone}` в tokens-теге;
 * dark-подмножество скоупится на `optionsTheme.darkModeSelector` либо `prefers-color-scheme`.
 * Значения '{zinc.500}'-refs резолвятся через primitive текущей темы.
 * ⚠️ Потребление surface-токенов компонентами (замена структурных нейтралей gray/neutral) — Wave 9;
 * здесь — API, конфиг и переменные.
 * Без установленного FishtVue — no-op, возвращает undefined.
 */
export default function updateSurfacePalette(paletteInput: SurfacePaletteInput): Theme | undefined {
  const fv = getLiveFishtVue()
  if (!fv?.config || !paletteInput) return
  const primitive = fv.config.theme?.primitive

  const isScoped = typeof paletteInput === "object" && ("light" in paletteInput || "dark" in paletteInput)
  const surface = isScoped
    ? {
        light: resolvePalette((paletteInput as any).light, primitive),
        dark: resolvePalette((paletteInput as any).dark, primitive)
      }
    : resolvePalette(paletteInput as Partial<ThemeColor>, primitive)

  fv.config.theme = fv.config.theme ?? {}
  fv.config.theme.semantic = { ...(fv.config.theme.semantic ?? {}), surface } as Theme["semantic"]
  injectTokens(fv)
  return fv.config.theme
}
