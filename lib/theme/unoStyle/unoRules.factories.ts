/**
 * Фабричные функции для создания правил в unoRules.ts
 * Уменьшают дублирование и упрощают создание новых правил
 */

import { addAlphaToHex, custom, negative, sizing } from "./helpers"
import type { GroupsRegExp, StyleType } from "./UnoTypes"
import { colors } from "fishtvue/theme/primitive"
import { specialColor, baseFilter, baseBackdropFilter, baseTransform } from "./unoStatic"

// ============================================
// ГЕНЕРАТОРЫ REGEX ПАТТЕРНОВ
// ============================================

/**
 * Генерирует regex для цветовых свойств
 */
export function generateColorRegexes(prefix: string) {
  return {
    abstract: new RegExp(
      /(?<style>PREFIX)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/.source.replace(
        "PREFIX",
        prefix
      )
    ),
    color: new RegExp(
      `(?<style>${prefix})-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
    ),
    specialColor: new RegExp(
      `(?<style>${prefix})-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
    )
  }
}

/**
 * Создает getValue для цветовых свойств
 */
export function createColorGetValue(
  cssProperty: string,
  options?: { wrapper?: string; customLogic?: (classStyle: string, reg: any) => string | undefined }
) {
  return function getValue(this: any, classStyle: string) {
    const reg = this.reg as Record<"abstract" | "color" | "specialColor", RegExp>

    // Если есть кастомная логика, попробуем её
    if (options?.customLogic) {
      const customResult = options.customLogic(classStyle, reg)
      if (customResult !== undefined) return customResult
    }

    // abstract (для [#hex] значений)
    if (reg.abstract?.test(classStyle)) {
      const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
      if (groups?.abstract?.startsWith("#")) {
        const color = addAlphaToHex(
          custom(groups),
          groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
        )
        const result = `${cssProperty}: ${color ?? ""};`
        return options?.wrapper ? `${options.wrapper}\n  ${result}` : result
      }
    }

    // color (для color-tone/opacity)
    if (reg.color?.test(classStyle)) {
      const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
      if (!groups?.special) return
      const color = addAlphaToHex(
        (colors as any)?.[groups.special]?.[groups.tone],
        groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
      )
      const result = `${cssProperty}: ${color};`
      return options?.wrapper ? `${options.wrapper}\n  ${result}` : result
    }

    // specialColor (для inherit/current/transparent/black/white)
    if (reg.specialColor?.test(classStyle)) {
      const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
      if (!groups?.special) return
      const color = addAlphaToHex(
        specialColor[groups.special],
        groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
      )
      const result = `${cssProperty}: ${color};`
      return options?.wrapper ? `${options.wrapper}\n  ${result}` : result
    }
  }
}

/**
 * Создает полное цветовое правило
 */
export function createColorRule(
  prefix: string,
  cssProperty: string,
  options?: {
    wrapper?: string
    customLogic?: (classStyle: string, reg: any) => string | undefined
    additionalRegexes?: Record<string, RegExp>
  }
): StyleType {
  const baseRegexes = generateColorRegexes(prefix)

  return {
    reg: options?.additionalRegexes ? { ...baseRegexes, ...options.additionalRegexes } : baseRegexes,
    getValue: createColorGetValue(cssProperty, options)
  }
}

// ============================================
// FILTER RULES FACTORY
// ============================================

/**
 * Генерирует regex для filter свойства
 */
export function generateFilterRegex(filterName: string, specialValues?: string[]) {
  const valuesPattern = specialValues ? `(?<special>${specialValues.join("|")})\\b|` : ""
  return new RegExp(
    `(?<style>${filterName})-(${valuesPattern}(?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
  )
}

/**
 * Создает getValue для filter свойства
 */
export function createFilterGetValue(
  cssVar: string,
  cssFunction: string,
  baseFilterValue: string,
  options?: {
    valueTransform?: (value: string) => string
    specialCases?: Record<string, string>
  }
) {
  return function getValue(this: any, classStyle: string) {
    const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp

    // Проверка специальных случаев (например, "none")
    if (options?.specialCases && groups?.special && options.specialCases[groups.special]) {
      return `--fv-${cssVar}: ${options.specialCases[groups.special]};\n  ${baseFilterValue}`
    }

    // Обработка значения
    let value: string
    if (groups?.abstract || groups?.custom) {
      value = custom(groups) ?? ""
    } else if (groups?.special) {
      value = options?.valueTransform ? options.valueTransform(groups.special) : groups.special
    } else {
      return
    }

    return `--fv-${cssVar}: ${cssFunction}(${value});\n  ${baseFilterValue}`
  }
}

/**
 * Создает полное filter правило
 */
export function createFilterRule(
  name: string,
  cssFunction: string,
  options?: {
    specialValues?: string[]
    valueTransform?: (value: string) => string
    specialCases?: Record<string, string>
  }
): StyleType {
  return {
    reg: generateFilterRegex(name, options?.specialValues),
    getValue: createFilterGetValue(name, cssFunction, baseFilter, options)
  }
}

/**
 * Создает backdrop-filter правило
 */
export function createBackdropFilterRule(
  name: string,
  cssFunction: string,
  options?: {
    specialValues?: string[]
    valueTransform?: (value: string) => string
    specialCases?: Record<string, string>
  }
): StyleType {
  return {
    reg: generateFilterRegex(`backdrop-${name}`, options?.specialValues),
    getValue: createFilterGetValue(`backdrop-${name}`, cssFunction, baseBackdropFilter, options)
  }
}

// ============================================
// SIZING RULES FACTORY
// ============================================

/**
 * Создает sizing правило (w, h, min-w, max-w, etc.)
 */
export function createSizingRule(prefix: string, cssProperty: string, specialValues?: string[]): StyleType {
  const additionalValues = specialValues ? `|${specialValues.join("|")}` : ""
  const reg = new RegExp(
    `(?<![a-zA-Z])(?<style>${prefix})-((?<special>\\d+(\\.\\d+)?(\\/\\d+)?(xs|xl)?${additionalValues}|xs|sm|md|lg|xl|auto|px|full|screen|dvw|dvh|lvw|lvh|svw|svh|min|max|fit)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
  )

  return {
    styleName: cssProperty,
    reg,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `${cssProperty}: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  }
}

// ============================================
// TRANSFORM RULES FACTORY
// ============================================

/**
 * Создает transform правило с axis (scale, translate, skew)
 */
export function createTransformAxisRule(
  name: string,
  cssVar: string,
  valueTransform: (value: string, axis?: string) => string,
  options?: { allowNegative?: boolean }
): StyleType {
  const negativePattern = options?.allowNegative ? "(?<negative>-)?" : ""
  const reg = new RegExp(
    `${negativePattern}(?<style>${name})-(?<axis>[xy])?-?((?<special>\\d+(\\.\\d+)?(\\/\\d+)?|px|full)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
  )

  return {
    reg,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      const value = custom(groups) ?? sizing(groups) ?? ""
      const transformedValue = valueTransform(value, groups.axis)

      if (!groups.axis) {
        // Оба axis
        return `--fv-${cssVar}-x: ${transformedValue};\n  --fv-${cssVar}-y: ${transformedValue};\n  ${baseTransform}`
      } else {
        // Один axis
        return `--fv-${cssVar}-${groups.axis}: ${transformedValue};\n  ${baseTransform}`
      }
    }
  }
}

// ============================================
// ENUM RULES FACTORY
// ============================================

/**
 * Создает простое enum правило
 */
export function createEnumRule(
  prefix: string,
  cssProperty: string,
  values: string[],
  options?: {
    valueTransform?: (value: string) => string
  }
): StyleType {
  return {
    reg: new RegExp(`(?<style>${prefix})-(?<special>${values.join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      const value = options?.valueTransform ? options.valueTransform(groups.special) : groups.special
      return `${cssProperty}: ${value};`
    }
  }
}

/**
 * Создает enum правило с вендорными префиксами
 */
export function createVendorPrefixEnumRule(
  prefix: string,
  cssProperty: string,
  values: string[],
  vendors: string[] = ["-webkit-", "-moz-", ""]
): StyleType {
  return {
    reg: new RegExp(`(?<style>${prefix})-(?<special>${values.join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return vendors.map((v) => `${v}${cssProperty}: ${groups.special};`).join("\n  ")
    }
  }
}

// ============================================
// GRADIENT RULES FACTORY
// ============================================

/**
 * Создает gradient правило (from/via/to)
 */
export function createGradientRule(type: "from" | "via" | "to"): StyleType {
  const regexes = generateColorRegexes(type)

  // Добавляем position regex
  const positionReg = new RegExp(`(?<style>${type})-(?<special>\\d+%)`)

  return {
    reg: {
      ...regexes,
      position: positionReg
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor" | "position", RegExp>

      // Position
      if (reg.position.test(classStyle)) {
        const groups = classStyle.match(reg.position)?.groups as GroupsRegExp
        if (!groups?.special) return
        const posProperty = type === "via" ? "from" : type
        return `--fv-gradient-${posProperty}-position: ${groups.special.replace("-", " ")};`
      }

      // Abstract hex colors
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#")) {
          const color = addAlphaToHex(
            custom(groups),
            groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
          )

          return getGradientCSS(type, color ?? "", custom(groups) ?? "000000")
        }
      }

      // Color палитра
      if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        const color = addAlphaToHex(
          (colors as any)?.[groups.special]?.[groups.tone],
          groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
        )
        const baseColor = (colors as any)?.[groups.special]?.[groups.tone] ?? "000000"

        return getGradientCSS(type, color ?? "", baseColor)
      }

      // Special colors
      if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        const color = addAlphaToHex(
          specialColor[groups.special],
          groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
        )

        return getGradientSpecialColorCSS(type, color ?? "")
      }
    }
  }
}

/**
 * Генерирует CSS для градиента
 */
function getGradientCSS(type: "from" | "via" | "to", color: string, baseColor: string): string {
  if (type === "from") {
    return `--fv-gradient-from: ${color} var(--fv-gradient-from-position);\n  --fv-gradient-to: ${baseColor}00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);`
  } else if (type === "via") {
    return `--fv-gradient-to: ${baseColor}00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), ${color} var(--fv-gradient-via-position), var(--fv-gradient-to);`
  } else {
    // to
    return `--fv-gradient-to: ${color} var(--fv-gradient-to-position);`
  }
}

/**
 * Генерирует CSS для специальных цветов градиента
 */
function getGradientSpecialColorCSS(type: "from" | "via" | "to", color: string): string {
  if (type === "from") {
    return `--fv-gradient-from: ${color} var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);`
  } else if (type === "via") {
    return `--fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), ${color} var(--fv-gradient-via-position), var(--fv-gradient-to);`
  } else {
    // to
    return `--fv-gradient-to: ${color} var(--fv-gradient-to-position);`
  }
}

// ============================================
// SPACING RULES FACTORY
// ============================================

/**
 * Создает spacing правило (margin/padding)
 */
export function createSpacingRule(
  prefix: string,
  cssProperty: string,
  allowNegative: boolean,
  axisHelper: Record<string, (property: string, value: string) => string>
): StyleType {
  const negativePattern = allowNegative ? "(?<negative>-)?" : ""
  const specialPattern = allowNegative ? "\\d+(\\.\\d+)?|px|auto" : "\\d+(\\.\\d+)?|px"

  return {
    styleName: cssProperty,
    reg: new RegExp(
      `(?<![a-zA-Z])${negativePattern}(?<style>${prefix})(?<axis>[xyserltb])?-((?<special>${specialPattern})|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups && (groups?.special || groups?.abstract || groups?.custom)) {
        return axisHelper[groups.axis](this.styleName ?? "", `${custom(groups) ?? sizing(groups) ?? ""}`)
      }
    }
  }
}

// ============================================
// SIMPLE PROPERTY FACTORY
// ============================================

/**
 * Создает простое правило с одним CSS свойством
 */
export function createSimpleRule(
  prefix: string,
  cssProperty: string,
  valuePattern: string,
  valueGetter?: (groups: GroupsRegExp) => string
): StyleType {
  return {
    reg: new RegExp(`(?<style>${prefix})-(${valuePattern})`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      const value = valueGetter ? valueGetter(groups) : (custom(groups) ?? sizing(groups) ?? groups?.special ?? "")
      return `${cssProperty}: ${value};`
    }
  }
}
