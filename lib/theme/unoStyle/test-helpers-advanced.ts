/**
 * Продвинутые Helper функции для тестирования unoStyle
 * Специализированные функции для сложных случаев
 */

import type { TestCase, ColorDefinition } from "./test-helpers"

// ============================================
// GRADIENT HELPERS
// ============================================

/**
 * Генерирует тесты для градиентных цветов (from/via/to)
 */
export function generateGradientColorTests(
  prefix: "from" | "via" | "to",
  color: string,
  hex: string,
  includeOpacity = true
): TestCase[] {
  const tests: TestCase[] = []

  // Базовый градиент
  if (prefix === "from") {
    tests.push({
      classValue: `${prefix}-${color}`,
      expected: `.${prefix}-${color} {\n  --fv-gradient-from: ${hex} var(--fv-gradient-from-position);\n  --fv-gradient-to: ${hex}00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}`
    })
  } else if (prefix === "via") {
    tests.push({
      classValue: `${prefix}-${color}`,
      expected: `.${prefix}-${color} {\n  --fv-gradient-to: ${hex}00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), ${hex} var(--fv-gradient-via-position), var(--fv-gradient-to);\n}`
    })
  } else {
    // to
    tests.push({
      classValue: `${prefix}-${color}`,
      expected: `.${prefix}-${color} {\n  --fv-gradient-to: ${hex} var(--fv-gradient-to-position);\n}`
    })
  }

  return tests
}

/**
 * Генерирует специальные градиентные цвета (inherit, current, transparent, black, white)
 */
export function generateGradientSpecialColors(prefix: "from" | "via" | "to"): TestCase[] {
  const specialColors = [
    { name: "inherit", value: "inherit" },
    { name: "current", value: "currentColor" },
    { name: "transparent", value: "transparent" },
    { name: "black", value: "#000000" },
    { name: "white", value: "#ffffff" }
  ]

  return specialColors.map(({ name, value }) => {
    if (prefix === "from") {
      return {
        classValue: `from-${name}`,
        expected: `.from-${name} {\n  --fv-gradient-from: ${value} var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}`
      }
    } else if (prefix === "via") {
      return {
        classValue: `via-${name}`,
        expected: `.via-${name} {\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), ${value} var(--fv-gradient-via-position), var(--fv-gradient-to);\n}`
      }
    } else {
      return {
        classValue: `to-${name}`,
        expected: `.to-${name} {\n  --fv-gradient-to: ${value} var(--fv-gradient-to-position);\n}`
      }
    }
  })
}

/**
 * Генерирует тесты для позиций градиента
 */
export function generateGradientPositionTests(prefix: "from" | "via" | "to"): TestCase[] {
  const positionProperty = prefix === "via" ? "from" : prefix // via использует from-position

  return [
    {
      classValue: `${prefix}-0%`,
      expected: `.${prefix}-0\\% {\n  --fv-gradient-${positionProperty}-position: 0%;\n}`
    },
    {
      classValue: `${prefix}-100%`,
      expected: `.${prefix}-100\\% {\n  --fv-gradient-${positionProperty}-position: 100%;\n}`
    }
  ]
}

/**
 * Генерирует полный набор градиентных тестов
 */
export function generateFullGradientTestSuite(prefix: "from" | "via" | "to", palette: ColorDefinition[]): TestCase[] {
  return [
    ...generateGradientSpecialColors(prefix),
    ...palette.flatMap(({ name, tone, hex }) => generateGradientColorTests(prefix, `${name}-${tone}`, hex)),
    ...generateGradientPositionTests(prefix)
  ]
}

// ============================================
// SPACING HELPERS (с поддержкой axis)
// ============================================

type SpacingAxis = "" | "x" | "y" | "s" | "e" | "t" | "r" | "b" | "l"

/**
 * Генерирует CSS свойства для spacing axis
 */
function getSpacingProperties(
  property: "padding" | "margin" | "scroll-margin" | "scroll-padding",
  axis: SpacingAxis
): string[] {
  const map: Record<string, string[]> = {
    "": [property],
    x: [`${property}-left`, `${property}-right`],
    y: [`${property}-top`, `${property}-bottom`],
    s: [`${property}-inline-start`],
    e: [`${property}-inline-end`],
    t: [`${property}-top`],
    r: [`${property}-right`],
    b: [`${property}-bottom`],
    l: [`${property}-left`]
  }

  return map[axis] || [property]
}

/**
 * Генерирует тесты для spacing с поддержкой axis
 */
export function generateSpacingAxisTests(
  prefix: string,
  property: "padding" | "margin" | "scroll-margin" | "scroll-padding",
  axis: SpacingAxis,
  value: string,
  output: string
): TestCase {
  const classValue = axis ? `${prefix}${axis}-${value}` : `${prefix}-${value}`
  const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
  const properties = getSpacingProperties(property, axis)

  let cssProperties: string
  if (properties.length === 1) {
    cssProperties = `${properties[0]}: ${output};`
  } else {
    cssProperties = properties.map((prop) => `${prop}: ${output};`).join("\n  ")
  }

  return {
    classValue,
    expected: `.${escapedClass} {\n  ${cssProperties}\n}`
  }
}

/**
 * Генерирует все комбинации spacing тестов
 */
export function generateAllSpacingTests(
  prefix: string,
  property: "padding" | "margin" | "scroll-margin" | "scroll-padding",
  values: Array<{ input: string; output: string }>,
  axes: SpacingAxis[] = ["", "x", "y", "t", "r", "b", "l"]
): TestCase[] {
  return values.flatMap(({ input, output }) =>
    axes.map((axis) => generateSpacingAxisTests(prefix, property, axis, input, output))
  )
}

/**
 * Генерирует тесты для negative spacing
 */
export function generateNegativeSpacingTests(
  prefix: string,
  property: "margin" | "scroll-margin",
  values: Array<{ input: string; output: string }>,
  axes: SpacingAxis[] = ["", "x", "y", "t", "r", "b", "l"]
): TestCase[] {
  return values.flatMap(({ input, output }) =>
    axes.map((axis) => {
      const classValue = axis ? `-${prefix}${axis}-${input}` : `-${prefix}-${input}`
      const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
      const properties = getSpacingProperties(property, axis)

      const negatedOutput = input === "auto" ? "auto" : `calc(${output} * -1)`

      let cssProperties: string
      if (properties.length === 1) {
        cssProperties = `${properties[0]}: ${negatedOutput};`
      } else {
        cssProperties = properties.map((prop) => `${prop}: ${negatedOutput};`).join("\n  ")
      }

      return {
        classValue,
        expected: `.${escapedClass} {\n  ${cssProperties}\n}`
      }
    })
  )
}

// ============================================
// FILTER/BACKDROP-FILTER HELPERS
// ============================================

/**
 * Генерирует тесты для filter свойств
 */
export function generateFilterTests(
  filterName: string,
  cssVar: string,
  baseFilter: string,
  values: Array<{ input: string; output: string }>
): TestCase[] {
  return values.map(({ input, output }) => {
    const classValue = `${filterName}-${input}`
    const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
    return {
      classValue,
      expected: `.${escapedClass} {\n  --fv-${cssVar}: ${output};\n  ${baseFilter}\n}`
    }
  })
}

/**
 * Генерирует тесты для backdrop-filter свойств
 */
export function generateBackdropFilterTests(
  filterName: string,
  cssVar: string,
  baseBackdropFilter: string,
  values: Array<{ input: string; output: string }>
): TestCase[] {
  return values.map(({ input, output }) => {
    const classValue = `backdrop-${filterName}-${input}`
    const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
    return {
      classValue,
      expected: `.${escapedClass} {\n  --fv-backdrop-${cssVar}: ${output};\n  ${baseBackdropFilter}\n}`
    }
  })
}

// ============================================
// TRANSFORM HELPERS
// ============================================

/**
 * Генерирует тесты для transform свойств с axis
 */
export function generateTransformAxisTests(
  transformName: string,
  cssVar: string,
  baseTransform: string,
  axis: "" | "x" | "y",
  values: Array<{ input: string; output: string }>
): TestCase[] {
  return values.map(({ input, output }) => {
    const classValue = axis ? `${transformName}-${axis}-${input}` : `${transformName}-${input}`
    const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")

    let cssProperties: string
    if (axis === "") {
      cssProperties = `--fv-${cssVar}-x: ${output};\n  --fv-${cssVar}-y: ${output};\n  ${baseTransform}`
    } else {
      cssProperties = `--fv-${cssVar}-${axis}: ${output};\n  ${baseTransform}`
    }

    return {
      classValue,
      expected: `.${escapedClass} {\n  ${cssProperties}\n}`
    }
  })
}

// ============================================
// COMPLEX HELPERS
// ============================================

/**
 * Генерирует тесты для divide свойств
 */
export function generateDivideWidthTests(axis: "x" | "y", widthValue: string): TestCase {
  const classValue = `divide-${axis}-${widthValue}`
  const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
  const reverseVar = axis === "x" ? "--fv-divide-x-reverse: 0" : "--fv-divide-y-reverse: 0"

  let borderProps: string
  if (axis === "x") {
    borderProps = `${reverseVar};\n  border-right-width: calc(${widthValue}* var(--fv-divide-x-reverse));\n  border-left-width: calc(${widthValue}* calc(1 - var(--fv-divide-x-reverse)));`
  } else {
    borderProps = `${reverseVar};\n  border-top-width: calc(${widthValue}* calc(1 - var(--fv-divide-y-reverse)));\n  border-bottom-width: calc(${widthValue}* var(--fv-divide-y-reverse));`
  }

  return {
    classValue,
    expected: `.${escapedClass} > :not([hidden]) ~ :not([hidden]) {\n  ${borderProps}\n}`
  }
}

/**
 * Генерирует тесты для ring свойств
 */
export function generateRingWidthTests(width: string): TestCase {
  if (width === "") {
    // Особый случай для "ring" без числа
    return {
      classValue: "ring",
      expected:
        ".ring {\n  box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow, 0 0 #0000);\n}"
    }
  }

  return {
    classValue: `ring-${width}`,
    expected: `.ring-${width} {\n  --fv-ring-offset-shadow: var(--fv-ring-inset) 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color);\n  --fv-ring-shadow: var(--fv-ring-inset) 0 0 0 calc(${width}px + var(--fv-ring-offset-width)) var(--fv-ring-color);\n  box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow, 0 0 #0000);\n}`
  }
}

// ============================================
// POSITION HELPERS
// ============================================

/**
 * Генерирует тесты для inset свойств
 */
export function generateInsetTests(axis: "" | "x" | "y", value: string, output: string): TestCase {
  const classValue = axis ? `inset-${axis}-${value}` : `inset-${value}`
  const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")

  let cssProperties: string
  if (axis === "x") {
    cssProperties = `left: ${output};\n  right: ${output};`
  } else if (axis === "y") {
    cssProperties = `top: ${output};\n  bottom: ${output};`
  } else {
    cssProperties = `inset: ${output};`
  }

  return {
    classValue,
    expected: `.${escapedClass} {\n  ${cssProperties}\n}`
  }
}

// ============================================
// BORDER RADIUS HELPERS
// ============================================

type BorderRadiusAxis = "" | "s" | "e" | "t" | "r" | "b" | "l" | "ss" | "se" | "ee" | "es" | "tl" | "tr" | "br" | "bl"

/**
 * Получает свойства border-radius для axis
 */
function getBorderRadiusProperties(axis: BorderRadiusAxis): string[] {
  const map: Record<BorderRadiusAxis, string[]> = {
    "": ["border-radius"],
    s: ["border-start-start-radius", "border-end-start-radius"],
    e: ["border-start-end-radius", "border-end-end-radius"],
    t: ["border-top-left-radius", "border-top-right-radius"],
    r: ["border-top-right-radius", "border-bottom-right-radius"],
    b: ["border-bottom-left-radius", "border-bottom-right-radius"],
    l: ["border-top-left-radius", "border-bottom-left-radius"],
    ss: ["border-start-start-radius"],
    se: ["border-start-end-radius"],
    ee: ["border-end-end-radius"],
    es: ["border-end-start-radius"],
    tl: ["border-top-left-radius"],
    tr: ["border-top-right-radius"],
    br: ["border-bottom-right-radius"],
    bl: ["border-bottom-left-radius"]
  }

  return map[axis] || ["border-radius"]
}

/**
 * Генерирует тесты для border-radius
 */
export function generateBorderRadiusTests(axis: BorderRadiusAxis, size: string, output: string): TestCase {
  const classValue = axis ? `rounded-${axis}-${size}` : size ? `rounded-${size}` : "rounded"
  const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
  const properties = getBorderRadiusProperties(axis)

  let cssProperties: string
  if (properties.length === 1) {
    cssProperties = `${properties[0]}: ${output};`
  } else {
    cssProperties = properties.map((prop) => `${prop}: ${output};`).join("\n  ")
  }

  return {
    classValue,
    expected: `.${escapedClass} {\n  ${cssProperties}\n}`
  }
}

// ============================================
// GRID/FLEXBOX HELPERS
// ============================================

/**
 * Генерирует тесты для grid-template
 */
export function generateGridTemplateTests(type: "cols" | "rows", count: number): TestCase {
  const property = type === "cols" ? "grid-template-columns" : "grid-template-rows"

  return {
    classValue: `grid-${type}-${count}`,
    expected: `.grid-${type}-${count} {\n  ${property}: repeat(${count}, minmax(0, 1fr));\n}`
  }
}

/**
 * Генерирует тесты для col/row span
 */
export function generateGridSpanTests(type: "col" | "row", span: number | "full"): TestCase {
  const property = type === "col" ? "grid-column" : "grid-row"
  const value = span === "full" ? "1 / -1" : `span ${span} / span ${span}`

  return {
    classValue: `${type}-span-${span}`,
    expected: `.${type}-span-${span} {\n  ${property}: ${value};\n}`
  }
}

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Создает тест для свойства с несколькими значениями CSS
 */
export function createMultiPropertyTest(classValue: string, properties: Record<string, string>): TestCase {
  const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
  const cssProps = Object.entries(properties)
    .map(([prop, value]) => `${prop}: ${value};`)
    .join("\n  ")

  return {
    classValue,
    expected: `.${escapedClass} {\n  ${cssProps}\n}`
  }
}

/**
 * Создает тест с CSS переменными
 */
export function createCSSVarTest(
  classValue: string,
  cssVars: Record<string, string>,
  additionalProps?: string
): TestCase {
  const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
  const varsStr = Object.entries(cssVars)
    .map(([prop, value]) => `${prop}: ${value};`)
    .join("\n  ")

  const allProps = additionalProps ? `${varsStr}\n  ${additionalProps}` : varsStr

  return {
    classValue,
    expected: `.${escapedClass} {\n  ${allProps}\n}`
  }
}

/**
 * Создает группу тестов с одинаковой структурой но разными значениями
 */
export function createTestGroup<T extends Record<string, any>>(
  items: T[],
  generator: (item: T) => TestCase
): TestCase[] {
  return items.map(generator)
}

// ============================================
// BORDER WIDTH HELPERS
// ============================================

type BorderAxis = "" | "x" | "y" | "s" | "e" | "t" | "r" | "b" | "l"

/**
 * Получает border-width свойства для axis
 */
function getBorderWidthProperties(axis: BorderAxis): string[] {
  const map: Record<BorderAxis, string[]> = {
    "": ["border-width"],
    x: ["border-left-width", "border-right-width"],
    y: ["border-top-width", "border-bottom-width"],
    s: ["border-inline-start-width"],
    e: ["border-inline-end-width"],
    t: ["border-top-width"],
    r: ["border-right-width"],
    b: ["border-bottom-width"],
    l: ["border-left-width"]
  }

  return map[axis] || ["border-width"]
}

/**
 * Генерирует тесты для border-width с axis
 */
export function generateBorderWidthTests(axis: BorderAxis, width: string, output: string): TestCase {
  const classValue = axis ? `border-${axis}-${width}` : width === "1" ? "border" : `border-${width}`
  const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
  const properties = getBorderWidthProperties(axis)

  let cssProperties: string
  if (properties.length === 1) {
    cssProperties = `${properties[0]}: ${output};`
  } else {
    cssProperties = properties.map((prop) => `${prop}: ${output};`).join("\n  ")
  }

  return {
    classValue,
    expected: `.${escapedClass} {\n  ${cssProperties}\n}`
  }
}

// ============================================
// SHADOW HELPERS
// ============================================

/**
 * Значения box-shadow из Tailwind
 */
export const BOX_SHADOW_VALUES: Record<string, string> = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "0 0 #0000"
}

/**
 * Генерирует тесты для box-shadow
 */
export function generateBoxShadowTests(): TestCase[] {
  return Object.entries(BOX_SHADOW_VALUES).map(([size, shadow]) => {
    const classValue = size ? `shadow-${size}` : "shadow"
    return {
      classValue,
      expected: `.${classValue} {\n  box-shadow: ${shadow};\n}`
    }
  })
}

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Значения display
 */
export const DISPLAY_VALUES = [
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "table",
  "inline-table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row-group",
  "table-row",
  "flow-root",
  "grid",
  "inline-grid",
  "contents",
  "list-item",
  "hidden"
]

/**
 * Генерирует тесты для display
 */
export function generateDisplayTests(): TestCase[] {
  return DISPLAY_VALUES.map((value) => ({
    classValue: value,
    expected: `.${value} {\n  display: ${value === "hidden" ? "none" : value};\n}`
  }))
}

// ============================================
// POSITION HELPERS
// ============================================

/**
 * Значения position
 */
export const POSITION_VALUES = ["static", "fixed", "absolute", "relative", "sticky"]

/**
 * Генерирует тесты для position
 */
export function generatePositionTests(): TestCase[] {
  return POSITION_VALUES.map((value) => ({
    classValue: value,
    expected: `.${value} {\n  position: ${value};\n}`
  }))
}

// ============================================
// SIMPLE PROPERTY HELPERS
// ============================================

/**
 * Генерирует простые тесты для enum-свойств
 */
export function generateSimpleEnumTests(
  prefix: string,
  property: string,
  values: string[],
  valueTransform?: (value: string) => string
): TestCase[] {
  return values.map((value) => {
    const outputValue = valueTransform ? valueTransform(value) : value
    return {
      classValue: `${prefix}-${value}`,
      expected: `.${prefix}-${value} {\n  ${property}: ${outputValue};\n}`
    }
  })
}

/**
 * Генерирует тесты для свойств с vendor prefixes
 */
export function generateVendorPrefixTests(
  classValue: string,
  property: string,
  value: string,
  vendors: string[] = ["-webkit-", "-moz-", ""]
): TestCase {
  const escapedClass = classValue.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
  const cssProps = vendors.map((vendor) => `${vendor}${property}: ${value};`).join("\n  ")

  return {
    classValue,
    expected: `.${escapedClass} {\n  ${cssProps}\n}`
  }
}
