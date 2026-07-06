import { hasInjectionContext, inject } from "vue"
// Wave 3.3: runtime-цикл theme→config→theme и theme→component→theme — намеренный и безопасный:
// оба биндинга используются только в телах функций (не при module-eval), ESM live-bindings
// к моменту вызова инициализированы. Верифицируется `pnpm lib:build`.
import { FishtVueSymbol } from "fishtvue/config"
import type { FishtVue, OptionsTheme } from "fishtvue/config"
import { cssComponents } from "fishtvue/component"
import { isClient, minifyCSS } from "fishtvue/utils/domHandler"
import { hslToHex } from "fishtvue/utils/colorsHandler"
import { colors as defaultColors } from "fishtvue/theme/primitive"
import type { Theme, ThemeColor } from "fishtvue/theme/Theme"
import { hexToRgbTriplet } from "../unoStyle/helpers"
import useStyle from "./useStyle"

/** Имя style-тега токенов: `style[data-fishtvue-style-id="FishtVueTokens"]` + ключ в cssComponents (SSR). */
export const TOKENS_STYLE_NAME = "FishtVueTokens"

// Реестр имён палитры статичен (его знает движок unoRules) — динамичны только ЗНАЧЕНИЯ из live config.
const COLOR_NAMES = Object.keys(defaultColors)

/** Live (мутабельный) FishtVue instance: inject-first, window-fallback для вызовов вне setup. */
export function getLiveFishtVue(): FishtVue | undefined {
  let fv: FishtVue | undefined
  if (hasInjectionContext()) fv = inject(FishtVueSymbol, undefined)
  if (!fv && isClient()) fv = (window as any)?.FishtVue
  return fv
}

const toFullColor = (raw: string): string => raw.replace("<alpha-value>", "100")

const toTriplet = (raw: string): string | undefined => hexToRgbTriplet(raw.startsWith("hsl") ? hslToHex(raw) : raw)

const paletteLines = (scale: Partial<ThemeColor> | undefined, varName: (tone: string) => string): string[] => {
  if (!scale || typeof scale !== "object") return []
  const lines: string[] = []
  for (const tone of Object.keys(scale)) {
    const raw = (scale as any)[tone]
    if (typeof raw === "string") lines.push(`  ${varName(tone)}: ${raw};`)
  }
  return lines
}

/**
 * Строит `:root`-блок дизайн-токенов из LIVE темы:
 * - `--theme`/`--theme-contrast` — динамический hue/saturation брендового слота;
 * - `--fv-{name}-{tone}` — rgb-триплеты статических цветов (их читает `rgb(var(--fv-…, fallback))`
 *   в сгенерированном CSS, см. unoStyle/helpers.resolveColor);
 * - `--fv-theme-{tone}` — полные цвета слота theme (формулы на var(--theme) либо override
 *   из `semantic.primary` — его пишет updatePrimaryPalette);
 * - `--fv-surface-{tone}` — слот `semantic.surface` (пишет updateSurfacePalette; dark-подмножество
 *   скоупится на darkModeSelector либо prefers-color-scheme). Токены surface компонентами пока
 *   не потребляются — миграция структурных нейтралей на них: Wave 9.
 * Не заданные темой цвета НЕ эмитятся — правила вернутся к запечённому fallback внутри var().
 */
export function buildTokensCss(theme: Theme | undefined, optionsTheme?: OptionsTheme): string {
  const primitive: any = theme?.primitive
  const semantic: any = theme?.semantic
  const root: string[] = []

  root.push(`  --theme: ${semantic?.customThemeColor ?? 0};`)
  root.push(`  --theme-contrast: ${semantic?.customThemeColorContrast ?? 0};`)

  for (const name of COLOR_NAMES) {
    const scale = primitive?.[name]
    if (!scale || typeof scale !== "object") continue
    for (const tone of Object.keys(scale)) {
      const raw = scale[tone]
      if (typeof raw !== "string") continue
      if (name === "theme") {
        root.push(`  --fv-theme-${tone}: ${toFullColor(raw)};`)
      } else {
        const triplet = toTriplet(raw)
        if (triplet) root.push(`  --fv-${name}-${tone}: ${triplet};`)
      }
    }
  }

  // Брендовый override: semantic.primary (полные цвета) перекрывает формулы theme-слота.
  root.push(...paletteLines(semantic?.primary, (tone) => `--fv-theme-${tone}`))

  const surface = semantic?.surface
  const isScoped = surface && typeof surface === "object" && ("light" in surface || "dark" in surface)
  root.push(...paletteLines(isScoped ? surface.light : surface, (tone) => `--fv-surface-${tone}`))

  let css = `:root {\n${root.join("\n")}\n}`

  const darkLines = isScoped ? paletteLines(surface.dark, (tone) => `--fv-surface-${tone}`) : []
  if (darkLines.length) {
    const darkSelector = optionsTheme?.darkModeSelector
    css += darkSelector?.length
      ? `\n${darkSelector} {\n${darkLines.join("\n")}\n}`
      : `\n@media (prefers-color-scheme: dark) {\n:root {\n${darkLines.join("\n")}\n}\n}`
  }
  return css
}

/**
 * Инжектит tokens-блок: строка → cssComponents (SSR-путь Nuxt-plugin'а) + `<style>`-тег на клиенте
 * (useStyle дедуплицирует по style-id и заменяет контент — каждый runtime-вызов API перезаписывает
 * ОДИН тег, чем перекрашивает все смонтированные компоненты без regen).
 */
export function injectTokens(fv: FishtVue | undefined): void {
  if (!fv?.config) return
  const layers = fv.config.optionsTheme?.layers
  const body = buildTokensCss(fv.config.theme, fv.config.optionsTheme)
  let css =
    layers && layers.length ? `@layer ${layers};\n@layer fishtvue {\n${body}\n}` : `@layer fishtvue {\n${body}\n}`
  if (!fv.config.optionsTheme?.isNotMinifyCSS) css = minifyCSS(css)
  cssComponents.set(TOKENS_STYLE_NAME as any, css)
  if (isClient()) useStyle(css, { name: TOKENS_STYLE_NAME })
}
