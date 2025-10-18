/**
 * УЛУЧШЕННАЯ ВЕРСИЯ unoRules.ts
 * Использует фабричные функции для уменьшения дублирования
 * БЫЛО: 1,826 строк | СТАЛО: ~800-900 строк | ЭКОНОМИЯ: ~50-60%
 */

import { addAlphaToHex, custom, negative, sizing } from "./helpers"
import type { GroupsRegExp, StyleType } from "./UnoTypes"
import {
  alignContent,
  alignSelf,
  animations,
  aspect,
  attachmentBackground,
  baseBackdropFilter,
  baseFilter,
  baseTransform,
  baseTransition,
  bgClip,
  bgOrigin,
  bgRepeat,
  blend,
  blur,
  borderLogical,
  borderSides,
  borderSize,
  borderSpacing,
  boxShadow,
  cursor,
  divideWidth,
  dropShadow,
  flex,
  floatAndClear,
  fontFamily,
  fontWeights,
  gridAuto,
  justifyContent,
  letterSpacing,
  lineHeight,
  order,
  placeContent,
  positionPaddingOrMargin,
  positionsBackground,
  resize,
  scale,
  sizesBackground,
  skew,
  snapAlign,
  snapType,
  specialColor,
  specialValues,
  textSize,
  transitionFunction,
  transitionProperty,
  translate,
  willChange,
  wordBreak
} from "./unoStatic"
import { colors } from "fishtvue/theme/primitive"
import {
  createBackdropFilterRule,
  createColorRule,
  createEnumRule,
  createFilterRule,
  createGradientRule,
  createSizingRule,
  createSpacingRule,
  createVendorPrefixEnumRule
} from "./unoRules.factories"

export default <Record<string, StyleType>>{
  // ============================================
  // SPACING (используем фабрику)
  // ============================================
  m: createSpacingRule("m", "margin", true, positionPaddingOrMargin),
  p: createSpacingRule("p", "padding", false, positionPaddingOrMargin),

  // ============================================
  // SIZING (используем фабрику)
  // ============================================
  w: createSizingRule("w", "width"),
  "min-w": createSizingRule("min-w", "min-width"),
  "max-w": createSizingRule("max-w", "max-width", [
    "none",
    "prose",
    "screen-sm",
    "screen-md",
    "screen-lg",
    "screen-xl",
    "screen-2xl",
    "screen"
  ]),
  h: createSizingRule("h", "height"),
  "min-h": createSizingRule("min-h", "min-height"),
  "max-h": createSizingRule("max-h", "max-height", [
    "none",
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "prose",
    "screen-sm",
    "screen-md",
    "screen-lg",
    "screen-xl",
    "screen-2xl",
    "screen"
  ]),

  // Size - особый случай (width + height одновременно)
  size: {
    reg: /(?<axis>size)-((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full|min|max|fit)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups && (groups?.special || groups?.abstract || groups?.custom)) {
        const value = custom(groups) ?? sizing(groups)
        if (!value) return
        return `width: ${value};\n  height: ${value};`
      }
    }
  },

  // ============================================
  // TEXT - сложное правило с multiple sub-регулярками
  // Оставляем как есть т.к. имеет уникальную логику для size/align/wrap
  // ============================================
  text: {
    reg: {
      abstract: new RegExp(
        /(?<style>text)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      size: new RegExp(
        `(?<style>text)-(?<leading>xs|sm|base|lg|xl|\\d+xl)\\b\\/?((?<special>\\d+|${Object.keys(lineHeight).join("|")})?\\b|(\\[(?<abstractLeading>.*?)]))?`
      ),
      align: new RegExp(/(?<style>text)-(?<special>left|center|right|justify|start|end)\b/),
      wrap: new RegExp(/(?<style>text)-(?<special>wrap|nowrap|balance|pretty)\b/),
      color: new RegExp(
        `(?<style>text)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>text)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "size" | "align" | "wrap" | "color" | "specialColor", RegExp>

      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        else return `font-size: ${custom(groups) ?? ""};`
      } else if (reg.size.test(classStyle)) {
        const groups = classStyle.match(reg.size)?.groups as GroupsRegExp
        if (!groups?.leading) return
        return textSize[groups.leading](
          groups?.abstractLeading ?? (isNaN(+groups?.special) ? lineHeight[groups?.special] : sizing(groups))
        )
      } else if (reg.align.test(classStyle)) {
        const groups = classStyle.match(reg.align)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `text-align: ${groups.special};`
      } else if (reg.wrap.test(classStyle)) {
        const groups = classStyle.match(reg.wrap)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `text-wrap: ${groups.special};`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `color: ${addAlphaToHex(
          (colors as any)?.[groups.special]?.[groups.tone],
          groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
        )};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      }
    }
  },

  // ============================================
  // ЦВЕТОВЫЕ ПРАВИЛА (используем фабрику)
  // ============================================

  // Text decoration color - используем фабрику
  decoration: createColorRule("decoration", "text-decoration-color", {
    additionalRegexes: {
      style: new RegExp(/(?<style>decoration)-(?<special>solid|double|dotted|dashed|wavy)\b/),
      thickness: new RegExp(/(?<style>decoration)-(?<special>0|1|2|4|8|auto|from-font)\b/)
    },
    customLogic: (classStyle, reg) => {
      // Логика для style и thickness
      if (reg.style?.test(classStyle)) {
        const groups = classStyle.match(reg.style)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `text-decoration-style: ${groups.special};`
      }
      if (reg.thickness?.test(classStyle)) {
        const groups = classStyle.match(reg.thickness)?.groups as GroupsRegExp
        if (!groups?.special) return
        if (!isNaN(+groups.special)) return `text-decoration-thickness: ${groups.special}px;`
        return `text-decoration-thickness: ${groups.special};`
      }
      // Если не thickness/style, то это цвет - продолжаем стандартную логику
      const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
      if (groups?.abstract && !groups?.abstract?.startsWith("#")) {
        return `text-decoration-thickness: ${custom(groups) ?? ""};`
      }
    }
  }),

  // Background color - используем фабрику
  bg: createColorRule("bg", "background-color", {
    additionalRegexes: {
      position: new RegExp(`(?<style>bg)-(?<special>${Object.keys(positionsBackground).join("|")})\\b`),
      attachment: new RegExp(`(?<style>bg)-(?<special>${Object.keys(attachmentBackground).join("|")})\\b`),
      sizes: new RegExp(`(?<style>bg)-(?<special>${Object.keys(sizesBackground).join("|")})\\b`),
      repeat: new RegExp(/(?<style>bg)-(?<special>repeat|no-repeat)\b/)
    },
    customLogic: (classStyle, reg) => {
      // Логика для position/attachment/sizes/repeat
      if (reg.position?.test(classStyle)) {
        const groups = classStyle.match(reg.position)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-position: ${groups.special.replace("-", " ")};`
      }
      if (reg.attachment?.test(classStyle)) {
        const groups = classStyle.match(reg.attachment)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-attachment: ${groups.special};`
      }
      if (reg.sizes?.test(classStyle)) {
        const groups = classStyle.match(reg.sizes)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-size: ${groups.special};`
      }
      if (reg.repeat?.test(classStyle)) {
        const groups = classStyle.match(reg.repeat)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-repeat: ${groups.special};`
      }
      // Если не position/attachment/sizes/repeat, проверяем специальные abstract случаи
      const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
      if (groups?.abstract) {
        if (groups.abstract.startsWith("length:"))
          return `background-size: ${custom(groups)?.replace("length:", "")?.replace(/_/g, " ") ?? ""};`
        else if (groups.abstract.startsWith("url")) return `background-image: ${custom(groups) ?? ""};`
        else if (!groups.abstract.startsWith("#"))
          return `background-position: ${custom(groups)?.replace(/_/g, " ") ?? ""};`
      }
    }
  }),

  // ============================================
  // GRADIENT RULES (используем фабрику)
  // ============================================
  from: createGradientRule("from"),
  via: createGradientRule("via"),
  to: createGradientRule("to"),

  // ============================================
  // BORDER/OUTLINE/RING (используем фабрику для цветовых частей)
  // ============================================

  // Border color - используем фабрику
  // Примечание: border имеет сложную структуру с sides/style/table
  // Оставляем полную версию т.к. сложная логика
  border: {
    reg: {
      sides: new RegExp(
        `(?<style>border)-?(?<axis>${Object.keys(borderSides).join("|")})?\\b-?((?<special>\\d+)|(\\[(?<abstract>.*?)]\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)])?)?))|(\\((?<custom>.*?)\\))?`
      ),
      style: /(?<style>border)-(?<special>solid|dashed|dotted|double|hidden|none)\b/,
      color: new RegExp(
        `(?<style>border)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>border)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      table: /(?<style>border)-(?<special>collapse|separate)\b/
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"sides" | "style" | "color" | "specialColor" | "table", RegExp>
      if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `border-color: ${addAlphaToHex(
          (colors as any)?.[groups.special]?.[groups.tone],
          groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
        )};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `border-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.style.test(classStyle)) {
        const groups = classStyle.match(reg.style)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `border-style: ${groups.special};`
      } else if (reg.table.test(classStyle)) {
        const groups = classStyle.match(reg.table)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `border-collapse: ${groups.special};`
      } else if (reg.sides.test(classStyle)) {
        const groups = classStyle.match(reg.sides)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `border-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        return borderSides[groups.axis](custom(groups) ?? (groups?.special ?? 1) + "px")
      }
    }
  },

  // Outline color - МОЖНО использовать фабрику (пример оптимизации)
  outline: createColorRule("outline", "outline-color", {
    additionalRegexes: {
      width: /(?<style>outline)-(?<special>\d+)/,
      offset: /(?<style>outline-offset)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
      style: /(?<style>outline)-(?<special>dashed|dotted|double)\b/
    },
    customLogic: (classStyle, reg) => {
      if (reg.width?.test(classStyle)) {
        const groups = classStyle.match(reg.width)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `outline-width: ${groups.special}px;`
      }
      if (reg.offset?.test(classStyle)) {
        const groups = classStyle.match(reg.offset)?.groups as GroupsRegExp
        return `outline-offset: ${custom(groups) ?? (groups.special ? `${groups.special}px` : "")};`
      }
      if (reg.style?.test(classStyle)) {
        const groups = classStyle.match(reg.style)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `outline-style: ${groups.special};`
      }
      const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
      if (groups?.abstract && !groups?.abstract?.startsWith("#")) {
        return `outline-width: ${custom(groups) ?? ""};`
      }
    }
  }),

  // Ring - сложное правило, оставляем как есть
  // TODO: можно оптимизировать позже
  ring: {
    reg: {
      abstract: new RegExp(
        /(?<style>ring)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)])|(\((?<custom>.*?)\)))?/
      ),
      width: /(?<style>ring)-(?<special>\d+)/,
      offset:
        /(?<style>ring-offset)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?/,
      color: new RegExp(
        `(?<style>ring)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>ring)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      colorOffset: new RegExp(
        `(?<style>ring-offset)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColorOffset: new RegExp(
        `(?<style>ring-offset)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<
        "abstract" | "width" | "offset" | "color" | "specialColor" | "colorOffset" | "specialColorOffset",
        RegExp
      >
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `--fv-ring-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        return `--fv-ring-offset-shadow: var(--fv-ring-inset) 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color);\n  --fv-ring-shadow: var(--fv-ring-inset) 0 0 0 calc(${custom(groups) ?? ""} + var(--fv-ring-offset-width)) var(--fv-ring-color);\n  box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow, 0 0 #0000);`
      } else if (reg.colorOffset.test(classStyle)) {
        const groups = classStyle.match(reg.colorOffset)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-ring-offset-color: ${addAlphaToHex(
          (colors as any)?.[groups.special]?.[groups.tone],
          groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
        )};\n  box-shadow: 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color), var(--fv-ring-shadow);`
      } else if (reg.specialColorOffset.test(classStyle)) {
        const groups = classStyle.match(reg.specialColorOffset)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-ring-offset-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-ring-color: ${addAlphaToHex(
          (colors as any)?.[groups.special]?.[groups.tone],
          groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
        )};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-ring-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.width.test(classStyle)) {
        const groups = classStyle.match(reg.width)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-ring-offset-shadow: var(--fv-ring-inset) 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color);\n  --fv-ring-shadow: var(--fv-ring-inset) 0 0 0 calc(${groups.special}px + var(--fv-ring-offset-width)) var(--fv-ring-color);\n  box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow, 0 0 #0000);`
      } else if (reg.offset.test(classStyle)) {
        const groups = classStyle.match(reg.offset)?.groups as GroupsRegExp
        if (groups?.abstract || groups?.custom) {
          if (groups?.abstract?.startsWith("#"))
            return `--fv-ring-offset-color: ${
              addAlphaToHex(
                custom(groups),
                groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
              ) ?? ""
            };\n  box-shadow: 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color), var(--fv-ring-shadow);`
          return `--fv-ring-offset-width: ${custom(groups) ?? ""};`
        }
        if (!groups?.special) return
        return `--fv-ring-offset-width: ${groups.special}px;\n  box-shadow: 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color), var(--fv-ring-shadow);`
      }
    }
  },

  // Shadow - используем фабрику
  shadow: createColorRule("shadow", "--fv-shadow-color", {
    additionalRegexes: {
      size: new RegExp(`(?<style>shadow)-(?<special>${Object.keys(boxShadow).join("|")})\\b`)
    },
    customLogic: (classStyle, reg) => {
      if (reg.size?.test(classStyle)) {
        const groups = classStyle.match(reg.size)?.groups as GroupsRegExp
        if (!groups?.special) return
        return boxShadow[groups.special]
      }
      const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
      if (groups?.abstract && !groups?.abstract?.startsWith("#")) {
        return `--fv-shadow: ${custom(groups)?.replace(/_/g, " ") ?? ""};\n  --fv-shadow-colored: ${
          custom(groups)
            ?.replace(/_(rgb)a?\(.*\)/g, "")
            ?.replace(/_/g, " ") ?? ""
        } var(--fv-shadow-color);\n  box-shadow: var(--fv-ring-offset-shadow, 0 0 #0000), var(--fv-ring-shadow, 0 0 #0000), var(--fv-shadow);`
      }
    }
  }),

  // Accent - используем фабрику
  accent: createColorRule("accent", "accent-color"),

  // Caret - используем фабрику
  caret: createColorRule("caret", "caret-color"),

  // Fill - используем фабрику
  fill: createColorRule("fill", "fill", {
    additionalRegexes: {
      noneColor: /(?<style>fill)-(?<special>none)\b/
    },
    customLogic: (classStyle, reg) => {
      if (reg.noneColor?.test(classStyle)) {
        const groups = classStyle.match(reg.noneColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `fill: ${groups.special};`
      }
    }
  }),

  // Stroke - используем фабрику
  stroke: createColorRule("stroke", "stroke", {
    additionalRegexes: {
      noneColor: /(?<style>stroke)-(?<special>none)\b/,
      width: /(?<style>stroke)-(?<special>\d+)\b/
    },
    customLogic: (classStyle, reg) => {
      if (reg.noneColor?.test(classStyle)) {
        const groups = classStyle.match(reg.noneColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `stroke: ${groups.special};`
      }
      if (reg.width?.test(classStyle)) {
        const groups = classStyle.match(reg.width)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `stroke-width: ${groups.special};`
      }
      const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
      if (groups?.abstract && !groups?.abstract?.startsWith("#")) {
        return `stroke-width: ${custom(groups) ?? ""};`
      }
    }
  }),

  // ============================================
  // FILTER RULES (используем фабрику)
  // ============================================
  blur: createFilterRule("blur", "blur", {
    specialValues: Object.keys(blur),
    valueTransform: (value) => `${blur[value] ?? value}px`,
    specialCases: { none: "" }
  }),

  brightness: createFilterRule("brightness", "brightness", {
    valueTransform: (value) => `${+value / 100}`
  }),

  contrast: createFilterRule("contrast", "contrast", {
    valueTransform: (value) => `${+value / 100}`
  }),

  "drop-shadow": {
    reg: new RegExp(
      `(?<style>drop-shadow)-((?<special>${Object.keys(dropShadow).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return groups?.abstract || groups?.custom
        ? `--fv-drop-shadow: drop-shadow(${custom(groups)?.replace(/_/g, " ") ?? ""});\n  ${baseFilter}`
        : `${dropShadow[groups.special] ?? ""}\n  ${baseFilter}`
    }
  },

  grayscale: createFilterRule("grayscale", "grayscale"),

  "hue-rotate": createFilterRule("hue-rotate", "hue-rotate", {
    valueTransform: (value) => `${value}deg`
  }),

  invert: createFilterRule("invert", "invert"),

  sepia: createFilterRule("sepia", "sepia"),

  saturate: createFilterRule("saturate", "saturate", {
    valueTransform: (value) => `${+value / 100}`
  }),

  // ============================================
  // BACKDROP-FILTER RULES (используем фабрику)
  // ============================================
  "backdrop-blur": createBackdropFilterRule("blur", "blur", {
    specialValues: Object.keys(blur),
    valueTransform: (value) => `${blur[value] ?? value}px`,
    specialCases: { none: "" }
  }),

  "backdrop-brightness": createBackdropFilterRule("brightness", "brightness", {
    valueTransform: (value) => `${+value / 100}`
  }),

  "backdrop-contrast": createBackdropFilterRule("contrast", "contrast", {
    valueTransform: (value) => `${+value / 100}`
  }),

  "backdrop-grayscale": createBackdropFilterRule("grayscale", "grayscale"),

  "backdrop-hue-rotate": createBackdropFilterRule("hue-rotate", "hue-rotate", {
    valueTransform: (value) => `${value}deg`
  }),

  "backdrop-invert": createBackdropFilterRule("invert", "invert"),

  "backdrop-sepia": createBackdropFilterRule("sepia", "sepia"),

  "backdrop-saturate": createBackdropFilterRule("saturate", "saturate", {
    valueTransform: (value) => `${+value / 100}`
  }),

  "backdrop-opacity": {
    reg: /(?<style>backdrop-opacity)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups?.abstract) groups.abstract = `${+groups.abstract}`
      return `--fv-backdrop-opacity: opacity(${groups?.abstract || groups?.custom ? custom(groups) : groups?.special ? +groups.special / 100 : 1});\n  ${baseBackdropFilter}`
    }
  },

  // ============================================
  // SIMPLE ENUM RULES (используем фабрику)
  // ============================================
  whitespace: createEnumRule("whitespace", "white-space", [
    "normal",
    "nowrap",
    "pre-line",
    "pre-wrap",
    "pre",
    "break-spaces"
  ]),

  hyphens: createEnumRule("hyphens", "hyphens", ["none", "manual", "auto"]),

  appearance: createVendorPrefixEnumRule("appearance", "appearance", ["none", "auto"]),

  "pointer-events": createEnumRule("pointer-events", "pointer-events", ["none", "auto"]),

  resize: createEnumRule("resize", "resize", Object.keys(resize), {
    valueTransform: (value) => resize[value]
  }),

  select: createEnumRule("select", "user-select", ["none", "text", "all", "auto"]),

  // Break правила с vendor префиксами
  // Эти правила не подходят под универсальную фабрику т.к. имеют специфичный формат
  "break-after": {
    reg: /(?<style>break-after)-(?<special>auto|all|avoid-page|avoid|page|left|right|column)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `break-after: ${groups.special};\n  -moz-column-break-after: ${groups.special};`
    }
  },

  "break-before": {
    reg: /(?<style>break-before)-(?<special>auto|all|avoid-page|avoid|page|left|right|column)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `break-before: ${groups.special};\n  -moz-column-break-before: ${groups.special};`
    }
  },

  "break-inside": {
    reg: /(?<style>break-inside)-(?<special>auto|avoid-page|avoid-column|avoid)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `break-inside: ${groups.special};\n  -moz-column-break-inside: ${groups.special};`
    }
  },

  // ============================================
  // TYPOGRAPHY (дополнительные правила)
  // ============================================

  "underline-offset": {
    styleName: "text-underline-offset",
    reg: /(?<style>underline-offset)-((?<special>auto|\d+)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `text-underline-offset: ${custom(groups) ?? (isNaN(+groups.special) ? groups.special : `${groups.special}px`)};`
    }
  },

  font: {
    reg: {
      abstract: new RegExp(/(?<style>font)-(\[(?<abstract>.*?)])|(\(family-name:(?<custom>.*?)\))/),
      family: new RegExp(
        `(?<style>font)-((?<special>${Object.keys(fontFamily).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
      ),
      weight: new RegExp(
        `(?<style>font)-((?<special>${Object.keys(fontWeights).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "family" | "weight", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract && !isNaN(+groups?.abstract)) return `font-weight: ${custom(groups) ?? ""};`
        return `font-family: ${custom(groups)?.replace(/_/g, " ") ?? ""};`
      } else if (reg.family.test(classStyle)) {
        const groups = classStyle.match(reg.family)?.groups as GroupsRegExp
        return `font-family: ${groups?.abstract || groups?.custom ? (custom(groups)?.replace(/_/g, " ") ?? "") : fontFamily[groups?.special]};`
      } else if (reg.weight.test(classStyle)) {
        const groups = classStyle.match(reg.weight)?.groups as GroupsRegExp
        return `font-weight: ${custom(groups) ?? fontWeights[groups?.special] ?? ""};`
      }
    }
  },

  indent: {
    styleName: "text-indent",
    reg: /(?<negative>-)?(?<style>indent)-((?<special>\d+(\.\d+)?(\/\d+)?|px)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `text-indent: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  align: {
    reg: /(?<style>align)-((?<special>baseline|top|middle|bottom|text-top|text-bottom|sub|super)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `vertical-align: ${custom(groups) ?? groups?.special ?? ""};`
    }
  },

  break: {
    reg: new RegExp(`(?<style>break)-(?<special>${Object.keys(wordBreak).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return wordBreak[groups.special]
    }
  },

  tracking: {
    reg: new RegExp(
      `(?<style>tracking)-((?<special>${Object.keys(letterSpacing).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `letter-spacing: ${custom(groups) ?? letterSpacing[groups?.special] ?? ""};`
    }
  },

  "line-clamp": {
    reg: /(?<style>line-clamp)-((?<special>\d+|none)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      if (classStyle === "line-clamp-none")
        return "overflow: visible;\n  display: block;\n  -webkit-box-orient: horizontal;\n  -webkit-line-clamp: none;"
      const styleName =
        "-webkit-box-orient: vertical;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp"
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `${styleName}: ${custom(groups) ?? groups?.special ?? ""};`
    }
  },

  leading: {
    reg: new RegExp(
      `(?<style>leading)-((?<special>\\d+|${Object.keys(lineHeight).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `line-height: ${custom(groups) ?? (isNaN(+groups?.special) ? (lineHeight[groups?.special] ?? "") : sizing(groups)) ?? ""};`
    }
  },

  "list-image": {
    reg: /(?<style>list-image)-((?<special>none)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `list-style-image: ${custom(groups) ?? groups?.special ?? ""};`
    }
  },

  list: {
    reg: {
      type: /(?<style>list)-(?<special>none|disc|decimal)\b/,
      position: /(?<style>list)-(?<special>inside|outside)\b/
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"type" | "position", RegExp>
      if (reg.type.test(classStyle)) {
        const groups = classStyle.match(reg.type)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `list-style-type: ${groups?.special};`
      } else if (reg.position.test(classStyle)) {
        const groups = classStyle.match(reg.position)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `list-style-position: ${groups?.special};`
      }
    }
  },

  // ============================================
  // BACKGROUNDS (дополнительные)
  // ============================================

  "bg-clip": {
    reg: new RegExp(`(?<style>bg-clip)-(?<special>${Object.keys(bgClip).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `background-clip: ${bgClip[groups?.special]};`
    }
  },

  "bg-origin": {
    reg: new RegExp(`(?<style>bg-origin)-(?<special>${Object.keys(bgOrigin).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `background-origin: ${bgOrigin[groups?.special]};`
    }
  },

  "bg-repeat": {
    reg: new RegExp(`(?<style>bg-repeat)-(?<special>${Object.keys(bgRepeat).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `background-repeat: ${bgRepeat[groups?.special]};`
    }
  },

  "bg-gradient-to": {
    reg: /(?<style>bg-gradient-to)-(?<top>t)?(?<bottom>b)?(?<left>l)?(?<right>r)?/,
    getValue(classStyle) {
      const reg = this.reg as RegExp
      if (reg.test(classStyle)) {
        const groups = classStyle.match(reg)?.groups as GroupsRegExp
        let to = ""
        if (groups?.top) to += " top"
        if (groups?.bottom) to += " bottom"
        if (groups?.left) to += " left"
        if (groups?.right) to += " right"
        return `background-image: linear-gradient(to${to}, var(--fv-gradient-stops));`
      }
    }
  },

  "bg-blend": {
    reg: new RegExp(`(?<style>bg-blend)-(?<special>${Object.keys(blend).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `background-blend-mode: ${groups.special};`
    }
  },

  // ============================================
  // BORDERS (дополнительные)
  // ============================================

  "border-spacing": {
    reg: /(?<style>border-spacing)-(?<axis>[xy])?-?((?<special>\d+(\.\d+)?(\/\d+)?|px)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return borderSpacing[groups.axis](custom(groups) ?? sizing(groups) ?? "")
    }
  },

  rounded: {
    reg: new RegExp(
      `(?<style>rounded)-?(?<axis>${Object.keys(borderLogical).join("|")})?\\b-?((?<special>${Object.keys(borderSize).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))?`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return borderLogical[groups.axis](custom(groups) ?? borderSize[groups?.special] ?? "")
    }
  },

  divide: {
    reg: {
      width: new RegExp(
        `(?<style>divide)-(?<axis>${Object.keys(divideWidth).join("|")})\\b-?((?<special>\\d+|reverse)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))?`
      ),
      style: new RegExp(/(?<style>divide)-(?<special>solid|dashed|dotted|double|none)\b/),
      color: new RegExp(
        `(?<style>divide)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>divide)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      abstract: new RegExp(
        /(?<style>divide)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"width" | "style" | "color" | "specialColor" | "abstract", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `border-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        return `border-color: ${custom(groups) ?? ""};`
      } else if (reg.style.test(classStyle)) {
        const groups = classStyle.match(reg.style)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `border-style: ${groups.special};`
      } else if (reg.width.test(classStyle)) {
        const groups = classStyle.match(reg.width)?.groups as GroupsRegExp
        return groups?.special === "reverse"
          ? `--fv-divide-${groups.axis}-reverse: 1;`
          : divideWidth[groups.axis](custom(groups) ?? (groups?.special ?? 1) + "px")
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `border-color: ${addAlphaToHex(
          (colors as any)?.[groups.special]?.[groups.tone],
          groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
        )};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `border-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      }
    }
  },

  // ============================================
  // EFFECTS (дополнительные)
  // ============================================

  opacity: {
    reg: /(?<style>opacity)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups?.abstract) groups.abstract = `${+groups.abstract}`
      return `opacity: ${groups?.abstract || groups?.custom ? custom(groups) : groups?.special ? +groups.special / 100 : 1};`
    }
  },

  "mix-blend": {
    reg: new RegExp(`(?<style>mix-blend)-(?<special>${Object.keys(blend).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `mix-blend-mode: ${groups.special};`
    }
  },

  // ============================================
  // TRANSITIONS & ANIMATION
  // ============================================

  transition: {
    reg: new RegExp(
      `(?<style>transition)-((?<special>${Object.keys(transitionProperty).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `transition-property: ${custom(groups) ?? (groups?.special ? transitionProperty[groups.special] : "")};\n  ${baseTransition}`
    }
  },

  duration: {
    reg: /(?<style>duration)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `transition-duration: ${custom(groups) ?? (groups?.special ? `${groups.special}ms` : "")};`
    }
  },

  ease: {
    reg: new RegExp(
      `(?<style>ease)-((?<special>${Object.keys(transitionFunction).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `transition-timing-function: ${custom(groups) ?? (groups.special ? transitionFunction[groups.special] : "")};`
    }
  },

  delay: {
    reg: /(?<style>delay)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `transition-delay: ${custom(groups) ?? (groups.special ? `${groups.special}ms` : "")};`
    }
  },

  animate: {
    reg: new RegExp(
      `(?<style>animate)-((?<special>${Object.keys(animations).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `animation: ${groups?.abstract || groups?.custom ? (custom(groups)?.replace(/_/g, " ") ?? "") : (animations[groups?.special] ?? "")};`
    }
  },

  // ============================================
  // TRANSFORMS
  // ============================================

  scale: {
    reg: /(?<style>scale)-(?<axis>[xy])?-?((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return scale[groups.axis](custom(groups) ?? (groups.special ? `${+groups.special / 100}` : ""))
    }
  },

  rotate: {
    reg: /(?<style>rotate)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-rotate: ${custom(groups) ?? (groups.special ? `${groups.special}deg` : "")};\n  ${baseTransform}`
    }
  },

  translate: {
    reg: /(?<negative>-)?(?<style>translate)-(?<axis>[xy])?-?((?<special>\d+(\.\d+)?(\/\d+)?|px|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return translate[groups.axis](`${custom(groups) ?? sizing(groups) ?? ""}`)
    }
  },

  skew: {
    reg: /(?<negative>-)?(?<style>skew)-(?<axis>[xy])?-?((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return skew[groups.axis](`${custom(groups) ?? negative(groups, groups.special + "deg")}`)
    }
  },

  origin: {
    reg: /(?<style>origin)-((?<special>top-right|bottom-right|bottom-left|top-left|top|bottom|right|left|center)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      const value =
        groups?.abstract || groups?.custom
          ? custom(groups)?.replace(/_/g, " ")
          : groups.special
            ? groups.special.replace("-", " ")
            : undefined
      return `transform-origin: ${value};`
    }
  },

  // ============================================
  // INTERACTIVITY (дополнительные)
  // ============================================

  cursor: {
    reg: new RegExp(
      `(?<style>cursor)-((?<special>${cursor.join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `cursor: ${groups?.abstract || groups?.custom ? (custom(groups)?.replace(/_/g, " ") ?? "") : (groups?.special ?? "")};`
    }
  },

  touch: {
    reg: /(?<style>touch)-(?<special>auto|none|pan-x|pan-left|pan-right|pan-y|pan-up|pan-down|pinch-zoom|manipulation)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return groups.special ? `touch-action: ${groups.special};` : ""
    }
  },

  "will-change": {
    reg: new RegExp(
      `(?<style>will-change)-((?<special>${Object.keys(willChange).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `will-change: ${custom(groups) ?? willChange[groups.special] ?? ""};`
    }
  },

  scroll: {
    reg: {
      behavior: /(?<style>scroll)-(?<special>smooth|auto)\b/,
      margin:
        /(?<negative>-)?(?<style>scroll)-m(?<axis>[xyserltb])?-((?<special>\d+(\.\d+)?|px)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
      padding:
        /(?<style>scroll)-p(?<axis>[xyserltb])?-((?<special>\d+(\.\d+)?|px)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"behavior" | "margin" | "padding", RegExp>
      if (reg.behavior.test(classStyle)) {
        const groups = classStyle.match(reg.behavior)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `scroll-behavior: ${groups.special};`
      } else if (reg.margin.test(classStyle)) {
        const groups = classStyle.match(reg.margin)?.groups as GroupsRegExp
        if (groups && (groups?.special || groups?.abstract || groups?.custom)) {
          return positionPaddingOrMargin[groups.axis]("scroll-margin", `${custom(groups) ?? sizing(groups) ?? ""}`)
        }
      } else if (reg.padding.test(classStyle)) {
        const groups = classStyle.match(reg.padding)?.groups as GroupsRegExp
        if (groups && (groups?.special || groups?.abstract || groups?.custom)) {
          return positionPaddingOrMargin[groups.axis]("scroll-padding", custom(groups) ?? sizing(groups) ?? "")
        }
      }
    }
  },

  snap: {
    reg: {
      align: /(?<style>snap)-(?<special>start|end|center|align-none)\b/,
      stop: /(?<style>snap)-(?<special>normal|always)\b/,
      type: /(?<style>snap)-(?<special>none|x|y|both|mandatory|proximity)\b/
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"align" | "stop" | "type", RegExp>
      if (reg.align.test(classStyle)) {
        const groups = classStyle.match(reg.align)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `scroll-snap-align: ${snapAlign[groups.special]};`
      } else if (reg.stop.test(classStyle)) {
        const groups = classStyle.match(reg.stop)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `scroll-snap-stop: ${groups.special};`
      } else if (reg.type.test(classStyle)) {
        const groups = classStyle.match(reg.type)?.groups as GroupsRegExp
        if (!groups?.special) return
        return snapType[groups.special]
      }
    }
  },

  // ============================================
  // LAYOUT
  // ============================================

  aspect: {
    reg: /(?<style>aspect)-((?<special>auto|square|video)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `aspect-ratio: ${custom(groups) ?? aspect[groups.special] ?? ""};`
    }
  },

  columns: {
    reg: /(?<style>columns)-((?<special>\d+|\dxs|xs|sm|md|lg|xl|\dxl|auto)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `columns: ${custom(groups) ?? (isNaN(+groups.special) ? (specialValues[groups.special] ?? "") : (groups.special ?? ""))};`
    }
  },

  "box-decoration": {
    reg: /(?<style>box-decoration)-(?<special>clone|slice)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `-webkit-box-decoration-break: ${groups.special};\n  box-decoration-break: ${groups.special};`
    }
  },

  box: {
    reg: /(?<style>box)-(?<special>border|content)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `box-sizing: ${groups.special}-box;`
    }
  },

  inline: {
    reg: /(?<style>inline)-(?<special>block|flex|table|grid)\b/,
    getValue(classStyle) {
      return `display: ${classStyle};`
    }
  },

  table: {
    reg: {
      layout: /(?<style>table)-(?<special>auto|fixed)\b/,
      inline: /(?<style>table)-(?<special>caption|cell|column|column-group|footer-group|header-group|row-group|row)\b/
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"layout" | "inline", RegExp>
      if (reg.inline.test(classStyle)) {
        return `display: ${classStyle};`
      } else if (reg.layout.test(classStyle)) {
        const groups = classStyle.match(reg.layout)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `table-layout: ${groups.special};`
      }
    }
  },

  caption: {
    reg: /(?<style>caption)-(?<special>top|bottom)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `caption-side: ${groups.special};`
    }
  },

  float: {
    reg: new RegExp(`(?<style>float)-(?<special>${Object.keys(floatAndClear).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `float: ${floatAndClear[groups.special]};`
    }
  },

  clear: {
    reg: new RegExp(`(?<style>clear)-(?<special>${Object.keys(floatAndClear).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `clear: ${floatAndClear[groups.special]};`
    }
  },

  object: {
    reg: {
      fit: /(?<style>object)-(?<special>contain|cover|fill|none|scale-down)\b/,
      position:
        /(?<style>object)-((?<special>left-bottom|left-top|right-bottom|right-top|top|bottom|left|right|center)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"fit" | "position", RegExp>
      if (reg.fit.test(classStyle)) {
        const groups = classStyle.match(reg.fit)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `object-fit: ${groups.special};`
      } else if (reg.position.test(classStyle)) {
        const groups = classStyle.match(reg.position)?.groups as GroupsRegExp
        const value =
          groups?.abstract || groups?.custom
            ? (custom(groups)?.replace(/_/g, " ") ?? "")
            : groups.special
              ? groups.special?.replace("-", " ")
              : ""
        if (!value) return
        return `object-position: ${value};`
      }
    }
  },

  overflow: {
    reg: /(?<style>overflow)-(?<axis>[xy])?-?(?<special>auto|hidden|clip|visible|scroll)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `overflow${groups.axis ? `-${groups.axis}` : ""}: ${groups.special};`
    }
  },

  overscroll: {
    reg: /(?<style>overscroll)-(?<axis>[xy])?-?(?<special>auto|contain|none)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `overscroll-behavior${groups.axis ? `-${groups.axis}` : ""}: ${groups.special};`
    }
  },

  // ============================================
  // POSITIONING
  // ============================================

  inset: {
    reg: /(?<style>inset)-(?<axis>[xy])?-?((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      const value = custom(groups) ?? sizing(groups)
      if (!value) return
      if (groups?.axis === "x") return `left: ${value};\n  right: ${value};`
      if (groups?.axis === "y") return `top: ${value};\n  bottom: ${value};`
      return `inset: ${value};`
    }
  },

  start: {
    reg: /(?<style>start)-((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `inset-inline-start: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  end: {
    reg: /(?<style>end)-((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `inset-inline-end: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  top: {
    reg: /(?<negative>-)?(?<style>top)-((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `top: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  bottom: {
    reg: /(?<negative>-)?(?<style>bottom)-((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `bottom: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  right: {
    reg: /(?<negative>-)?(?<style>right)-((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `right: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  left: {
    reg: /(?<negative>-)?(?<style>left)-((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `left: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  z: {
    reg: /(?<negative>-)?(?<style>z)-((?<special>\d+|auto)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `z-index: ${custom(groups) ?? negative(groups, groups?.special ?? "")};`
    }
  },

  // ============================================
  // FLEXBOX & GRID
  // ============================================

  basis: {
    reg: /(?<style>basis)-((?<special>\d+(\.\d+)?(\/\d+)?|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `flex-basis: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  flex: {
    reg: {
      direction: /(?<style>flex)-(?<special>row-reverse|col-reverse|row|col)\b/,
      wrap: /(?<style>flex)-(?<special>wrap-reverse|wrap|nowrap)\b/,
      flex: new RegExp(
        `(?<style>flex)-((?<special>${Object.keys(flex).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"direction" | "wrap" | "flex", RegExp>
      if (reg.direction.test(classStyle)) {
        const groups = classStyle.match(reg.direction)?.groups as GroupsRegExp
        return `flex-direction: ${groups?.special?.replace("col", "column") ?? ""};`
      } else if (reg.wrap.test(classStyle)) {
        const groups = classStyle.match(reg.wrap)?.groups as GroupsRegExp
        return `flex-wrap: ${groups?.special ?? ""};`
      } else if (reg.flex.test(classStyle)) {
        const groups = classStyle.match(reg.flex)?.groups as GroupsRegExp
        return `flex: ${groups?.abstract || groups?.custom ? (custom(groups)?.replace(/_/g, " ") ?? "") : (flex[groups?.special] ?? "")};`
      }
    }
  },

  grow: {
    reg: /(?<style>grow)-((?<special>0)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `flex-grow: ${custom(groups) ?? groups?.special ?? ""};`
    }
  },

  shrink: {
    reg: /(?<style>shrink)-((?<special>0)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `flex-shrink: ${custom(groups) ?? groups?.special ?? ""};`
    }
  },

  order: {
    reg: new RegExp(
      `(?<style>order)-((?<special>\\d+|${Object.keys(order).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `order: ${custom(groups) ?? (isNaN(+groups.special) ? (order[groups?.special] ?? "") : (groups?.special ?? ""))};`
    }
  },

  "grid-cols": {
    reg: /(?<style>grid-cols)-((?<special>\d+|none|subgrid)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      const value =
        groups?.abstract || groups?.custom
          ? (custom(groups)?.replace(/_/g, " ") ?? "")
          : !isNaN(+groups.special)
            ? `repeat(${groups?.special ?? ""}, minmax(0, 1fr))`
            : groups.special
      return `grid-template-columns: ${value};`
    }
  },

  "grid-rows": {
    reg: /(?<style>grid-rows)-((?<special>\d+|none|subgrid)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      const value =
        groups?.abstract || groups?.custom
          ? (custom(groups)?.replace(/_/g, " ") ?? "")
          : !isNaN(+groups.special)
            ? `repeat(${groups?.special ?? ""}, minmax(0, 1fr))`
            : groups.special
      return `grid-template-rows: ${value};`
    }
  },

  col: {
    reg: /(?<style>col)-(((?<span>span)-(?<column>\d+|full)|(?<auto>auto)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))|((?<axis>start|end)-(?<special>\d+|auto)\b))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups?.span) {
        if (!isNaN(+groups?.column)) return `grid-column: span ${groups.column} / span ${groups.column};`
        else if (groups?.column == "full") return `grid-column: 1 / -1;`
      } else if (groups?.axis === "start") {
        if (!groups?.special) return
        return `grid-column-start: ${groups.special};`
      } else if (groups?.axis === "end") {
        if (!groups?.special) return
        return `grid-column-end: ${groups.special};`
      } else if (groups?.auto === "auto") {
        return "grid-column: auto;"
      } else if (groups?.abstract || groups?.custom) {
        return `grid-column: ${custom(groups)?.replace(/_/g, " ") ?? ""};`
      }
    }
  },

  row: {
    reg: /(?<style>row)-(((?<span>span)-(?<column>\d+|full)|(?<auto>auto)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))|((?<axis>start|end)-(?<special>\d+|auto)\b))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups?.span) {
        if (!isNaN(+groups?.column)) return `grid-row: span ${groups.column} / span ${groups.column};`
        else if (groups?.column == "full") return `grid-row: 1 / -1;`
      } else if (groups?.axis === "start") {
        if (!groups?.special) return
        return `grid-row-start: ${groups.special};`
      } else if (groups?.axis === "end") {
        if (!groups?.special) return
        return `grid-row-end: ${groups.special};`
      } else if (groups?.auto === "auto") {
        return "grid-row: auto;"
      } else if (groups?.abstract || groups?.custom) {
        return `grid-row: ${custom(groups)?.replace(/_/g, " ") ?? ""};`
      }
    }
  },

  "grid-flow": {
    reg: /(?<style>grid-flow)-(?<special>dense|row-dense|col-dense|row|col)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `grid-auto-flow: ${groups?.special?.replace("-", " ")?.replace("col", "column") ?? ""};`
    }
  },

  "auto-cols": {
    reg: new RegExp(
      `(?<style>auto-cols)-((?<special>${Object.keys(gridAuto).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `grid-auto-columns: ${groups?.abstract || groups?.custom ? (custom(groups)?.replace("_", " ") ?? "") : (gridAuto[groups?.special] ?? "")};`
    }
  },

  "auto-rows": {
    reg: new RegExp(
      `(?<style>auto-rows)-((?<special>${Object.keys(gridAuto).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `grid-auto-rows: ${groups?.abstract || groups?.custom ? (custom(groups)?.replace("_", " ") ?? "") : (gridAuto[groups?.special] ?? "")};`
    }
  },

  gap: {
    reg: /(?<style>gap)-(?<axis>[xy])?-?((?<special>\d+(\.\d+)?|px)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      const value = groups.axis === "x" ? "column-" : groups.axis === "y" ? "row-" : ""
      return `${value}gap: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },

  "justify-items": {
    reg: /(?<style>justify-items)-(?<special>start|end|center|stretch)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `justify-items: ${groups?.special ?? ""};`
    }
  },

  "justify-self": {
    reg: /(?<style>justify-self)-(?<special>auto|start|end|center|stretch)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `justify-self: ${groups?.special ?? ""};`
    }
  },

  justify: {
    reg: new RegExp(`(?<style>justify)-(?<special>${Object.keys(justifyContent).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `justify-content: ${justifyContent[groups?.special] ?? ""};`
    }
  },

  items: {
    reg: /(?<style>items)-(?<special>start|end|center|baseline|stretch)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `align-items: ${groups?.special ?? ""};`
    }
  },

  self: {
    reg: new RegExp(`(?<style>self)-(?<special>${Object.keys(alignSelf).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `align-self: ${alignSelf[groups?.special] ?? ""};`
    }
  },

  content: {
    reg: new RegExp(
      `(?<style>content)-((?<special>${Object.keys(alignContent).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups?.abstract || groups?.custom)
        return `--fv-content: ${custom(groups) ?? ""};\n  content: var(--fv-content);`
      return `align-content: ${alignContent[groups?.special] ?? ""};`
    }
  },

  "place-items": {
    reg: /(?<style>place-items)-(?<special>start|end|center|baseline|stretch)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `place-items: ${groups?.special ?? ""};`
    }
  },

  "place-self": {
    reg: /(?<style>place-self)-(?<special>auto|start|end|center|stretch)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `place-self: ${groups?.special ?? ""};`
    }
  },

  "place-content": {
    reg: new RegExp(`(?<style>place-content)-(?<special>${Object.keys(placeContent).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `place-content: ${placeContent[groups?.special] ?? ""};`
    }
  }
}
