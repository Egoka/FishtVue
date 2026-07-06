/**
 * Helper функции для тестирования unoStyle
 * Уменьшают дублирование кода и упрощают создание новых тестов
 */

export type TestCase = {
  classValue: string
  expected: string
}

export type ColorDefinition = {
  name: string
  tone: number
  hex: string
}

export type PseudoState = {
  modifier: string
  pseudo: string
}

export type MediaQuery = {
  name: string
  query: string
  width?: string
}

export type SizeValue = {
  input: string
  output: string
}

// ============================================
// ЦВЕТОВЫЕ КОНСТАНТЫ
// ============================================

/**
 * Полная палитра цветов Tailwind
 */
export const FULL_COLOR_PALETTE: ColorDefinition[] = [
  // Slate
  { name: "slate", tone: 50, hex: "#f8fafc" },
  { name: "slate", tone: 100, hex: "#f1f5f9" },
  { name: "slate", tone: 200, hex: "#e2e8f0" },
  { name: "slate", tone: 300, hex: "#cbd5e1" },
  { name: "slate", tone: 400, hex: "#94a3b8" },
  { name: "slate", tone: 500, hex: "#64748b" },
  { name: "slate", tone: 600, hex: "#475569" },
  { name: "slate", tone: 700, hex: "#334155" },
  { name: "slate", tone: 800, hex: "#1e293b" },
  { name: "slate", tone: 900, hex: "#0f172a" },
  { name: "slate", tone: 950, hex: "#020617" },

  // Gray
  { name: "gray", tone: 50, hex: "#f9fafb" },
  { name: "gray", tone: 100, hex: "#f3f4f6" },
  { name: "gray", tone: 200, hex: "#e5e7eb" },
  { name: "gray", tone: 300, hex: "#d1d5db" },
  { name: "gray", tone: 400, hex: "#9ca3af" },
  { name: "gray", tone: 500, hex: "#6b7280" },
  { name: "gray", tone: 600, hex: "#4b5563" },
  { name: "gray", tone: 700, hex: "#374151" },
  { name: "gray", tone: 800, hex: "#1f2937" },
  { name: "gray", tone: 900, hex: "#111827" },
  { name: "gray", tone: 950, hex: "#030712" },

  // Red
  { name: "red", tone: 50, hex: "#fef2f2" },
  { name: "red", tone: 100, hex: "#fee2e2" },
  { name: "red", tone: 200, hex: "#fecaca" },
  { name: "red", tone: 300, hex: "#fca5a5" },
  { name: "red", tone: 400, hex: "#f87171" },
  { name: "red", tone: 500, hex: "#ef4444" },
  { name: "red", tone: 600, hex: "#dc2626" },
  { name: "red", tone: 700, hex: "#b91c1c" },
  { name: "red", tone: 800, hex: "#991b1b" },
  { name: "red", tone: 900, hex: "#7f1d1d" },
  { name: "red", tone: 950, hex: "#450a0a" },

  // Продолжение для других цветов...
  { name: "emerald", tone: 100, hex: "#d1fae5" },
  { name: "green", tone: 200, hex: "#bbf7d0" },
  { name: "lime", tone: 300, hex: "#bef264" },
  { name: "orange", tone: 500, hex: "#f97316" },
  { name: "amber", tone: 600, hex: "#d97706" },
  { name: "yellow", tone: 700, hex: "#a16207" },
  { name: "teal", tone: 800, hex: "#115e59" },
  { name: "cyan", tone: 900, hex: "#164e63" },
  { name: "sky", tone: 950, hex: "#082f49" }
]

/**
 * Упрощенная палитра для быстрых тестов
 */
export const COMMON_COLOR_PALETTE: ColorDefinition[] = [
  { name: "slate", tone: 50, hex: "#f8fafc" },
  { name: "emerald", tone: 100, hex: "#d1fae5" },
  { name: "green", tone: 200, hex: "#bbf7d0" },
  { name: "lime", tone: 300, hex: "#bef264" },
  { name: "red", tone: 400, hex: "#f87171" },
  { name: "orange", tone: 500, hex: "#f97316" },
  { name: "amber", tone: 600, hex: "#d97706" },
  { name: "yellow", tone: 700, hex: "#a16207" },
  { name: "teal", tone: 800, hex: "#115e59" },
  { name: "cyan", tone: 900, hex: "#164e63" },
  { name: "sky", tone: 950, hex: "#082f49" }
]

// ============================================
// ГЕНЕРАТОРЫ ТЕСТОВ ДЛЯ ЦВЕТОВ
// ============================================

/**
 * Генерирует тесты для специальных значений цветов
 * (inherit, current, transparent, black, white)
 */
export function generateSpecialColorTests(prefix: string, property: string): TestCase[] {
  return [
    { classValue: `${prefix}-inherit`, expected: `.${prefix}-inherit {\n  ${property}: inherit;\n}` },
    { classValue: `${prefix}-current`, expected: `.${prefix}-current {\n  ${property}: currentColor;\n}` },
    { classValue: `${prefix}-transparent`, expected: `.${prefix}-transparent {\n  ${property}: transparent;\n}` },
    { classValue: `${prefix}-black`, expected: `.${prefix}-black {\n  ${property}: #000000;\n}` },
    { classValue: `${prefix}-white`, expected: `.${prefix}-white {\n  ${property}: #ffffff;\n}` }
  ]
}

/**
 * Генерирует тесты для opacity вариантов цвета
 */
export function generateOpacityTests(prefix: string, property: string, baseColor = "white"): TestCase[] {
  const hexMap: Record<string, string> = {
    white: "#ffffff",
    black: "#000000"
  }

  const baseHex = hexMap[baseColor] || "#ffffff"

  return [
    {
      classValue: `${prefix}-${baseColor}/0`,
      expected: `.${prefix}-${baseColor}\\/0 {\n  ${property}: ${baseHex}00;\n}`
    },
    {
      classValue: `${prefix}-${baseColor}/50`,
      expected: `.${prefix}-${baseColor}\\/50 {\n  ${property}: ${baseHex}80;\n}`
    },
    {
      classValue: `${prefix}-${baseColor}/100`,
      expected: `.${prefix}-${baseColor}\\/100 {\n  ${property}: ${baseHex};\n}`
    }
  ]
}

/**
 * Генерирует тесты для цветовой палитры.
 * Wave 3.3: именованные цвета эмитятся через CSS-variable indirection
 * `rgb(var(--fv-{name}-{tone}, R G B))` — см. unoStyle/helpers.resolveColor + colorVars.test.ts.
 */
const hexToTriplet = (hex: string): string => {
  const int = parseInt(hex.slice(1), 16)
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`
}

export function generateColorPaletteTests(prefix: string, property: string, colors: ColorDefinition[]): TestCase[] {
  return colors.map(({ name, tone, hex }) => ({
    classValue: `${prefix}-${name}-${tone}`,
    expected: `.${prefix}-${name}-${tone} {\n  ${property}: rgb(var(--fv-${name}-${tone}, ${hexToTriplet(hex)}));\n}`
  }))
}

/**
 * Генерирует тесты для arbitrary values с opacity
 */
export function generateArbitraryColorTests(prefix: string, property: string, hex = "#50d71e"): TestCase[] {
  const escapedHex = hex.replace("#", "\\#")
  return [{ classValue: `${prefix}-[${hex}]`, expected: `.${prefix}-\\[${escapedHex}\\] {\n  ${property}: ${hex};\n}` }]
}

/**
 * Генерирует тесты для arbitrary values с opacity
 */
export function generateArbitraryOpacityTests(prefix: string, property: string, hex = "#50d71e"): TestCase[] {
  const escapedHex = hex.replace("#", "\\#")
  return [
    {
      classValue: `${prefix}-[${hex}]/25`,
      expected: `.${prefix}-\\[${escapedHex}\\]\\/25 {\n  ${property}: ${hex}40;\n}`
    }
  ]
}

/**
 * Генерирует полный набор цветовых тестов для свойства
 */
export function generateFullColorTestSuite(
  prefix: string,
  property: string,
  palette = COMMON_COLOR_PALETTE
): TestCase[] {
  return [
    ...generateSpecialColorTests(prefix, property),
    ...generateOpacityTests(prefix, property, "white"),
    ...generateColorPaletteTests(prefix, property, palette),
    ...generateArbitraryColorTests(prefix, property),
    ...generateArbitraryOpacityTests(prefix, property)
  ]
}

// ============================================
// ГЕНЕРАТОРЫ ТЕСТОВ ДЛЯ РАЗМЕРОВ
// ============================================

/**
 * Генерирует тесты для размерных значений
 */
export function generateSizingTests(prefix: string, property: string, values: SizeValue[]): TestCase[] {
  return values.map(({ input, output }) => {
    const classValue = `${prefix}-${input}`
    const escapedClass = escapeClassName(classValue)
    return {
      classValue,
      expected: `.${escapedClass} {\n  ${property}: ${output};\n}`
    }
  })
}

/**
 * Стандартные размерные значения Tailwind
 */
export const COMMON_SIZE_VALUES: SizeValue[] = [
  { input: "0", output: "0px" },
  { input: "px", output: "1px" },
  { input: "0.5", output: "0.125rem" },
  { input: "1", output: "0.25rem" },
  { input: "1.5", output: "0.375rem" },
  { input: "2", output: "0.5rem" },
  { input: "2.5", output: "0.625rem" },
  { input: "3", output: "0.75rem" },
  { input: "4", output: "1rem" },
  { input: "5", output: "1.25rem" },
  { input: "6", output: "1.5rem" },
  { input: "8", output: "2rem" },
  { input: "10", output: "2.5rem" },
  { input: "12", output: "3rem" },
  { input: "16", output: "4rem" },
  { input: "20", output: "5rem" },
  { input: "24", output: "6rem" },
  { input: "32", output: "8rem" }
]

/**
 * Полный список всех размерных значений Tailwind (для 100% покрытия)
 */
export const ALL_SIZE_VALUES: SizeValue[] = [
  { input: "0", output: "0px" },
  { input: "px", output: "1px" },
  { input: "0.5", output: "0.125rem" },
  { input: "1", output: "0.25rem" },
  { input: "1.5", output: "0.375rem" },
  { input: "2", output: "0.5rem" },
  { input: "2.5", output: "0.625rem" },
  { input: "3", output: "0.75rem" },
  { input: "3.5", output: "0.875rem" },
  { input: "4", output: "1rem" },
  { input: "5", output: "1.25rem" },
  { input: "6", output: "1.5rem" },
  { input: "7", output: "1.75rem" },
  { input: "8", output: "2rem" },
  { input: "9", output: "2.25rem" },
  { input: "10", output: "2.5rem" },
  { input: "11", output: "2.75rem" },
  { input: "12", output: "3rem" },
  { input: "14", output: "3.5rem" },
  { input: "16", output: "4rem" },
  { input: "20", output: "5rem" },
  { input: "24", output: "6rem" },
  { input: "28", output: "7rem" },
  { input: "32", output: "8rem" },
  { input: "36", output: "9rem" },
  { input: "40", output: "10rem" },
  { input: "44", output: "11rem" },
  { input: "48", output: "12rem" },
  { input: "52", output: "13rem" },
  { input: "56", output: "14rem" },
  { input: "60", output: "15rem" },
  { input: "64", output: "16rem" },
  { input: "72", output: "18rem" },
  { input: "80", output: "20rem" },
  { input: "96", output: "24rem" }
]

/**
 * Специальные размерные значения
 */
export const SPECIAL_SIZE_VALUES: SizeValue[] = [
  { input: "auto", output: "auto" },
  { input: "full", output: "100%" },
  { input: "screen", output: "100vw" },
  { input: "min", output: "min-content" },
  { input: "max", output: "max-content" },
  { input: "fit", output: "fit-content" }
]

/**
 * Дробные значения (базовые)
 */
export const FRACTIONAL_VALUES: SizeValue[] = [
  { input: "1/2", output: "calc(1 / 2 * 100%)" },
  { input: "1/3", output: "calc(1 / 3 * 100%)" },
  { input: "2/3", output: "calc(2 / 3 * 100%)" },
  { input: "1/4", output: "calc(1 / 4 * 100%)" },
  { input: "2/4", output: "calc(2 / 4 * 100%)" },
  { input: "3/4", output: "calc(3 / 4 * 100%)" }
]

/**
 * Полный список всех дробных значений (для 100% покрытия)
 */
export const ALL_FRACTIONAL_VALUES: SizeValue[] = [
  { input: "1/2", output: "calc(1 / 2 * 100%)" },
  { input: "1/3", output: "calc(1 / 3 * 100%)" },
  { input: "2/3", output: "calc(2 / 3 * 100%)" },
  { input: "1/4", output: "calc(1 / 4 * 100%)" },
  { input: "2/4", output: "calc(2 / 4 * 100%)" },
  { input: "3/4", output: "calc(3 / 4 * 100%)" },
  { input: "1/5", output: "calc(1 / 5 * 100%)" },
  { input: "2/5", output: "calc(2 / 5 * 100%)" },
  { input: "3/5", output: "calc(3 / 5 * 100%)" },
  { input: "4/5", output: "calc(4 / 5 * 100%)" },
  { input: "1/6", output: "calc(1 / 6 * 100%)" },
  { input: "2/6", output: "calc(2 / 6 * 100%)" },
  { input: "3/6", output: "calc(3 / 6 * 100%)" },
  { input: "4/6", output: "calc(4 / 6 * 100%)" },
  { input: "5/6", output: "calc(5 / 6 * 100%)" },
  { input: "1/12", output: "calc(1 / 12 * 100%)" },
  { input: "2/12", output: "calc(2 / 12 * 100%)" },
  { input: "3/12", output: "calc(3 / 12 * 100%)" },
  { input: "4/12", output: "calc(4 / 12 * 100%)" },
  { input: "5/12", output: "calc(5 / 12 * 100%)" },
  { input: "6/12", output: "calc(6 / 12 * 100%)" },
  { input: "7/12", output: "calc(7 / 12 * 100%)" },
  { input: "8/12", output: "calc(8 / 12 * 100%)" },
  { input: "9/12", output: "calc(9 / 12 * 100%)" },
  { input: "10/12", output: "calc(10 / 12 * 100%)" },
  { input: "11/12", output: "calc(11 / 12 * 100%)" }
]

// ============================================
// ГЕНЕРАТОРЫ ТЕСТОВ ДЛЯ ПСЕВДО-КЛАССОВ
// ============================================

/**
 * Генерирует тесты для псевдо-классов
 */
export function generatePseudoClassTests(
  pseudoStates: PseudoState[],
  baseClass = "p-0",
  baseStyle = "padding: 0px"
): TestCase[] {
  return pseudoStates.map(({ modifier, pseudo }) => ({
    classValue: `${modifier}:${baseClass}`,
    expected: `.${modifier}\\:${baseClass}${pseudo} {\n  ${baseStyle};\n}`
  }))
}

/**
 * Псевдо-классы взаимодействия с пользователем
 */
export const USER_INTERACTION_STATES: PseudoState[] = [
  { modifier: "hover", pseudo: ":hover" },
  { modifier: "active", pseudo: ":active" },
  { modifier: "visited", pseudo: ":visited" },
  { modifier: "target", pseudo: ":target" },
  { modifier: "focus", pseudo: ":focus" },
  { modifier: "focus-within", pseudo: ":focus-within" },
  { modifier: "focus-visible", pseudo: ":focus-visible" }
]

/**
 * Структурные псевдо-классы
 */
export const STRUCTURAL_PSEUDO_CLASSES: PseudoState[] = [
  { modifier: "first", pseudo: ":first-child" },
  { modifier: "last", pseudo: ":last-child" },
  { modifier: "only", pseudo: ":only-child" },
  { modifier: "odd", pseudo: ":nth-child(odd)" },
  { modifier: "even", pseudo: ":nth-child(even)" },
  { modifier: "first-of-type", pseudo: ":first-of-type" },
  { modifier: "last-of-type", pseudo: ":last-of-type" },
  { modifier: "only-of-type", pseudo: ":only-of-type" },
  { modifier: "empty", pseudo: ":empty" }
]

/**
 * Состояния форм
 */
export const FORM_STATES: PseudoState[] = [
  { modifier: "disabled", pseudo: ":disabled" },
  { modifier: "enabled", pseudo: ":enabled" },
  { modifier: "checked", pseudo: ":checked" },
  { modifier: "indeterminate", pseudo: ":indeterminate" },
  { modifier: "default", pseudo: ":default" },
  { modifier: "required", pseudo: ":required" },
  { modifier: "valid", pseudo: ":valid" },
  { modifier: "invalid", pseudo: ":invalid" },
  { modifier: "in-range", pseudo: ":in-range" },
  { modifier: "out-of-range", pseudo: ":out-of-range" },
  { modifier: "autofill", pseudo: ":autofill" },
  { modifier: "read-only", pseudo: ":read-only" },
  { modifier: "placeholder-shown", pseudo: ":placeholder-shown" }
]

/**
 * Псевдо-элементы
 */
export const PSEUDO_ELEMENTS: PseudoState[] = [
  { modifier: "placeholder", pseudo: "::placeholder" },
  { modifier: "file", pseudo: "::file-selector-button" },
  { modifier: "marker", pseudo: "::marker" },
  { modifier: "selection", pseudo: "::selection" },
  { modifier: "first-line", pseudo: "::first-line" },
  { modifier: "first-letter", pseudo: "::first-letter" },
  { modifier: "backdrop", pseudo: "::backdrop" }
]

/**
 * Псевдо-элементы с content
 */
export const PSEUDO_ELEMENTS_WITH_CONTENT: PseudoState[] = [
  { modifier: "after", pseudo: "::after" },
  { modifier: "before", pseudo: "::before" }
]

/**
 * Генерирует тесты для псевдо-элементов с content
 */
export function generatePseudoElementsWithContentTests(
  pseudoElements: PseudoState[],
  baseClass = "p-0",
  baseStyle = "padding: 0px"
): TestCase[] {
  return pseudoElements.map(({ modifier, pseudo }) => ({
    classValue: `${modifier}:${baseClass}`,
    expected: `.${modifier}\\:${baseClass}${pseudo} {\n  content: var(--fv-content);\n  ${baseStyle};\n}`
  }))
}

// ============================================
// ГЕНЕРАТОРЫ ТЕСТОВ ДЛЯ МЕДИА-ЗАПРОСОВ
// ============================================

/**
 * Генерирует тесты для responsive breakpoints
 */
export function generateBreakpointTests(
  breakpoints: MediaQuery[],
  baseClass = "p-0",
  baseStyle = "padding: 0px"
): TestCase[] {
  return breakpoints.map(({ name, width }) => ({
    classValue: `${name}:${baseClass}`,
    expected: `@media (min-width: ${width}) {\n.${name}\\:${baseClass} {\n  ${baseStyle};\n}\n}`
  }))
}

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS: MediaQuery[] = [
  { name: "sm", query: "(min-width: 640px)", width: "640px" },
  { name: "md", query: "(min-width: 768px)", width: "768px" },
  { name: "lg", query: "(min-width: 1024px)", width: "1024px" },
  { name: "xl", query: "(min-width: 1280px)", width: "1280px" },
  { name: "2xl", query: "(min-width: 1536px)", width: "1536px" }
]

/**
 * Генерирует тесты для медиа-запросов с произвольными условиями
 */
export function generateMediaQueryTests(
  mediaQueries: MediaQuery[],
  baseClass = "p-0",
  baseStyle = "padding: 0px"
): TestCase[] {
  return mediaQueries.map(({ name, query }) => ({
    classValue: `${name}:${baseClass}`,
    expected: `@media ${query} {\n.${name}\\:${baseClass} {\n  ${baseStyle};\n}\n}`
  }))
}

/**
 * Медиа-запросы для предпочтений
 */
export const PREFERENCE_MEDIA_QUERIES: MediaQuery[] = [
  { name: "motion-reduce", query: "(prefers-reduced-motion: reduce)" },
  { name: "motion-safe", query: "(prefers-reduced-motion: no-preference)" },
  { name: "contrast-more", query: "(prefers-contrast: more)" },
  { name: "contrast-less", query: "(prefers-contrast: less)" }
]

// ============================================
// УТИЛИТЫ
// ============================================

/**
 * Создает escaped версию класса для CSS селектора
 */
export function escapeClassName(className: string): string {
  return className.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
}

/**
 * Форматирует CSS правило
 */
export function formatCSSRule(selector: string, properties: string): string {
  return `${selector} {\n  ${properties}\n}`
}

/**
 * Оборачивает CSS правило в медиа-запрос
 */
export function wrapInMedia(cssRule: string, mediaQuery: string): string {
  return `${mediaQuery} {\n${cssRule}\n}`
}

/**
 * Создает тест кейс из данных
 */
export function createTestCase(classValue: string, cssRule: string): TestCase {
  const escapedClass = escapeClassName(classValue)
  return {
    classValue,
    expected: formatCSSRule(`.${escapedClass}`, cssRule)
  }
}
