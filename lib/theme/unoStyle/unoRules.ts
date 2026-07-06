import { addAlphaToHex, custom, negative, resolveColor, sizing } from "./helpers"
import type { GroupsRegExp, StyleType } from "./UnoTypes"
// prettier-ignore
import {
  alignContent,
  alignSelf,
  animations,
  aspect,
  attachmentBackground,
  baseBackdropFilter,
  baseFilter,
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
  spaceBetween,
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

export default <Record<string, StyleType>>{
  m: {
    styleName: "margin",
    reg: /(?<![a-zA-Z])(?<negative>-)?(?<style>m)(?<axis>[xyserltb])?-((?<special>\d+(\.\d+)?|px|auto)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups && (groups?.special || groups?.abstract || groups?.custom)) {
        return positionPaddingOrMargin[groups.axis](this.styleName ?? "", `${custom(groups) ?? sizing(groups) ?? ""}`)
      }
    }
  },
  p: {
    styleName: "padding",
    reg: /(?<![a-zA-Z])(?<style>p)(?<axis>[xyserltb])?-((?<special>\d+(\.\d+)?|px)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups && (groups?.special || groups?.abstract || groups?.custom)) {
        return positionPaddingOrMargin[groups.axis](this.styleName ?? "", custom(groups) ?? sizing(groups) ?? "")
      }
    }
  },
  w: {
    styleName: "width",
    reg: /(?<![a-zA-Z])(?<style>w)-((?<special>\d+(\.\d+)?(\/\d+)?(xs|xl)?|xs|sm|md|lg|xl|auto|px|full|screen|dvw|dvh|lvw|lvh|svw|svh|min|max|fit)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `width: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },
  "min-w": {
    styleName: "min-width",
    // Issue 3 (uno-engine.md): container scale (3xs…7xl) — зеркало правила `w`.
    reg: /(?<style>min-w)-((?<special>\d+(\.\d+)?(\/\d+)?(xs|xl)?|xs|sm|md|lg|xl|px|full|min|max|fit)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `min-width: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },
  "max-w": {
    reg: /(?<style>max-w)-((?<special>\d+(\.\d+)?(\/\d+)?(xs|xl)?|px|none|xs|sm|md|lg|xl|full|min|max|fit|prose|screen-sm|screen-md|screen-lg|screen-xl|screen-2xl|screen)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `max-width: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },
  h: {
    reg: /(?<![a-zA-Z])(?<style>h)-((?<special>\d+(\.\d+)?(\/\d+)?|auto|px|full|screen|dvw|dvh|lvw|lvh|svw|svh|min|max|fit)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `height: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },
  "min-h": {
    // Issue 3 (uno-engine.md): viewport-юниты — зеркало правила `h` (min-h-screen — в singleStyles).
    reg: /(?<style>min-h)-((?<special>\d+(\.\d+)?(\/\d+)?|px|full|min|max|fit|dvw|dvh|lvw|lvh|svw|svh)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `min-height: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },
  "max-h": {
    reg: /(?<style>max-h)-((?<special>\d+(\.\d+)?(\/\d+)?|px|none|xs|sm|md|lg|xl|full|min|max|fit|prose|screen-sm|screen-md|screen-lg|screen-xl|screen-2xl|screen|dvw|dvh|lvw|lvh|svw|svh)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `max-height: ${custom(groups) ?? sizing(groups) ?? ""};`
    }
  },
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
        return `color: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      }
    }
  },
  decoration: {
    reg: {
      abstract: new RegExp(
        /(?<style>decoration)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>decoration)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>decoration)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      style: new RegExp(/(?<style>decoration)-(?<special>solid|double|dotted|dashed|wavy)\b/),
      thickness: new RegExp(/(?<style>decoration)-(?<special>0|1|2|4|8|auto|from-font)\b/)
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor" | "style" | "thickness", RegExp>
      if (reg?.abstract?.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `text-decoration-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        else return `text-decoration-thickness: ${custom(groups) ?? ""};`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `text-decoration-color: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `text-decoration-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.style.test(classStyle)) {
        const groups = classStyle.match(reg.style)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `text-decoration-style: ${groups.special};`
      } else if (reg.thickness.test(classStyle)) {
        const groups = classStyle.match(reg.thickness)?.groups as GroupsRegExp
        if (!groups?.special) return
        if (!isNaN(+groups.special) && !isNaN(parseFloat(groups.special)))
          return `text-decoration-thickness: ${groups.special}px;`
        return `text-decoration-thickness: ${groups.special};`
      }
    }
  },
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
  whitespace: {
    reg: /(?<style>whitespace)-(?<special>normal|nowrap|pre-line|pre-wrap|pre|break-spaces)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `white-space: ${groups.special};`
    }
  },
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
  break: {
    reg: new RegExp(`(?<style>break)-(?<special>${Object.keys(wordBreak).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return wordBreak[groups.special]
    }
  },
  hyphens: {
    reg: /(?<style>hyphens)-(?<special>none|manual|auto)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `hyphens: ${groups.special};`
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
  bg: {
    reg: {
      abstract: new RegExp(
        /(?<style>bg)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>bg)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>bg)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      position: new RegExp(`(?<style>bg)-(?<special>${Object.keys(positionsBackground).join("|")})\\b`),
      attachment: new RegExp(`(?<style>bg)-(?<special>${Object.keys(attachmentBackground).join("|")})\\b`),
      sizes: new RegExp(`(?<style>bg)-(?<special>${Object.keys(sizesBackground).join("|")})\\b`),
      repeat: new RegExp(/(?<style>bg)-(?<special>repeat|no-repeat)\b/)
    },
    getValue(classStyle) {
      const reg = this.reg as Record<
        "abstract" | "color" | "specialColor" | "position" | "attachment" | "sizes" | "repeat",
        RegExp
      >
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `background-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        else if (groups?.abstract?.startsWith("length:"))
          return `background-size: ${custom(groups)?.replace("length:", "")?.replace(/_/g, " ") ?? ""};`
        else if (groups?.abstract?.startsWith("url")) return `background-image: ${custom(groups) ?? ""};`
        else return `background-position: ${custom(groups)?.replace(/_/g, " ") ?? ""};`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-color: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.position.test(classStyle)) {
        const groups = classStyle.match(reg.position)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-position: ${groups.special.replace("-", " ")};`
      } else if (reg.attachment.test(classStyle)) {
        const groups = classStyle.match(reg.attachment)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-attachment: ${groups.special};`
      } else if (reg.sizes.test(classStyle)) {
        const groups = classStyle.match(reg.sizes)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-size: ${groups.special};`
      } else if (reg.repeat.test(classStyle)) {
        const groups = classStyle.match(reg.repeat)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `background-repeat: ${groups.special};`
      }
    }
  },
  from: {
    reg: {
      abstract: new RegExp(
        /(?<style>from)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>from)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>from)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      position: new RegExp(`(?<style>from)-(?<special>\\d+%)`)
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor" | "position", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `--fv-gradient-from: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          } var(--fv-gradient-from-position);\n  --fv-gradient-to: ${custom(groups) ?? "000000"}00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-from: ${resolveColor(groups)} var(--fv-gradient-from-position);\n  --fv-gradient-to: ${resolveColor(groups, 0) ?? ""} var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-from: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined) ?? ""} var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);`
      } else if (reg.position.test(classStyle)) {
        const groups = classStyle.match(reg.position)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-from-position: ${groups.special.replace("-", " ")};`
      }
    }
  },
  via: {
    reg: {
      abstract: new RegExp(
        /(?<style>via)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>via)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>via)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      position: new RegExp(`(?<style>via)-(?<special>\\d+%)`)
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor" | "position", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `--fv-gradient-to: ${custom(groups)}00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          } var(--fv-gradient-via-position), var(--fv-gradient-to);`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-to: ${resolveColor(groups, 0) ?? ""} var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), ${resolveColor(groups)} var(--fv-gradient-via-position), var(--fv-gradient-to);`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)} var(--fv-gradient-via-position), var(--fv-gradient-to);`
      } else if (reg.position.test(classStyle)) {
        const groups = classStyle.match(reg.position)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-from-position: ${groups.special.replace("-", " ")};`
      }
    }
  },
  /////////////////////////////////
  to: {
    reg: {
      abstract: new RegExp(
        /(?<style>to)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>to)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>to)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      position: new RegExp(`(?<style>to)-(?<special>\\d+%)`)
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor" | "position", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `--fv-gradient-to: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          } var(--fv-gradient-to-position);`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-to: ${resolveColor(groups)} var(--fv-gradient-to-position);`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-to: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)} var(--fv-gradient-to-position);`
      } else if (reg.position.test(classStyle)) {
        const groups = classStyle.match(reg.position)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-gradient-to-position: ${groups.special.replace("-", " ")};`
      }
    }
  },
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
  border: {
    reg: {
      sides: new RegExp(
        `(?<style>border)-?(?<axis>${Object.keys(borderSides).join("|")})?\\b-?((?<special>\\d+)|(\\[(?<abstract>.*?)]\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?)|(\\((?<custom>.*?)\\)))?`
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
        return `border-color: ${resolveColor(groups)};`
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
  space: {
    // Issue 4 (uno-engine.md): Space Between — зеркало divide (child-combinator селектор
    // приходит из specialSelectors.space). `whitespace-*` защищён lookbehind'ом в RegStyles.
    reg: /(?<negative>-)?(?<style>space)-(?<axis>[xy])-((?<special>\d+(\.\d+)?|px|reverse)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups) return
      if (groups.special === "reverse") return `--fv-space-${groups.axis}-reverse: 1;`
      const value = custom(groups) ?? sizing(groups)
      if (!value) return
      return spaceBetween[groups.axis](value)
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
        return `border-color: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `border-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      }
    }
  },
  outline: {
    reg: {
      abstract: new RegExp(
        /(?<style>outline)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)])|(\((?<custom>.*?)\)))?/
      ),
      width: /(?<style>outline)-(?<special>\d+)/,
      offset: /(?<style>outline-offset)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
      style: /(?<style>outline)-(?<special>dashed|dotted|double)\b/,
      color: new RegExp(
        `(?<style>outline)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>outline)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "width" | "offset" | "style" | "color" | "specialColor", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `outline-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        return `outline-width: ${custom(groups) ?? ""};`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `outline-color: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `outline-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.style.test(classStyle)) {
        const groups = classStyle.match(reg.style)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `outline-style: ${groups.special};`
      } else if (reg.width.test(classStyle)) {
        const groups = classStyle.match(reg.width)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `outline-width: ${groups.special}px;`
      } else if (reg.offset.test(classStyle)) {
        const groups = classStyle.match(reg.offset)?.groups as GroupsRegExp
        return `outline-offset: ${custom(groups) ?? (groups.special ? `${groups.special}px` : "")};`
      }
    }
  },
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
        return `--fv-ring-offset-color: ${resolveColor(groups)};\n  box-shadow: 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color), var(--fv-ring-shadow);`
      } else if (reg.specialColorOffset.test(classStyle)) {
        const groups = classStyle.match(reg.specialColorOffset)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-ring-offset-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-ring-color: ${resolveColor(groups)};`
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
  shadow: {
    reg: {
      abstract: new RegExp(
        /(?<style>shadow)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      size: new RegExp(`(?<style>shadow)-(?<special>${Object.keys(boxShadow).join("|")})\\b`),
      color: new RegExp(
        `(?<style>shadow)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>shadow)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "size" | "color" | "specialColor", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `--fv-shadow-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        return `--fv-shadow: ${custom(groups)?.replace(/_/g, " ") ?? ""};\n  --fv-shadow-colored: ${
          custom(groups)
            ?.replace(/_(rgb)a?\(.*\)/g, "")
            ?.replace(/_/g, " ") ?? ""
        } var(--fv-shadow-color);\n  box-shadow: var(--fv-ring-offset-shadow, 0 0 #0000), var(--fv-ring-shadow, 0 0 #0000), var(--fv-shadow);`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-shadow-color: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `--fv-shadow-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.size.test(classStyle)) {
        const groups = classStyle.match(reg.size)?.groups as GroupsRegExp
        if (!groups?.special) return
        return boxShadow[groups.special]
      }
    }
  },
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
  blur: {
    reg: new RegExp(
      `(?<style>blur)-((?<special>${Object.keys(blur).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups?.special === "none") return `--fv-blur: ;\n  ${baseFilter}`
      return `--fv-blur: blur(${custom(groups) ?? (groups?.special ? `${blur[groups.special]}px` : "")});\n  ${baseFilter}`
    }
  },
  brightness: {
    reg: new RegExp(`(?<style>brightness)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-brightness: brightness(${custom(groups) ?? (groups?.special ? +groups.special / 100 : "")});\n  ${baseFilter}`
    }
  },
  contrast: {
    reg: new RegExp(`(?<style>contrast)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-contrast: contrast(${custom(groups) ?? (groups?.special ? +groups.special / 100 : "")});\n  ${baseFilter}`
    }
  },
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
  grayscale: {
    reg: new RegExp(`(?<style>grayscale)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-grayscale: grayscale(${custom(groups) ?? groups?.special ?? ""});\n  ${baseFilter}`
    }
  },
  "hue-rotate": {
    reg: new RegExp(
      `(?<negative>-)?(?<style>hue-rotate)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-hue-rotate: hue-rotate(${custom(groups) ?? (groups?.special ? (negative(groups, `${groups.special}deg`) ?? "") : "")});\n  ${baseFilter}`
    }
  },
  invert: {
    reg: new RegExp(`(?<style>invert)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-invert: invert(${custom(groups) ?? groups?.special ?? ""});\n  ${baseFilter}`
    }
  },
  sepia: {
    reg: new RegExp(`(?<style>sepia)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-sepia: sepia(${custom(groups) ?? groups?.special ?? ""});\n  ${baseFilter}`
    }
  },
  saturate: {
    reg: new RegExp(`(?<style>saturate)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-saturate: saturate(${custom(groups) ?? (groups?.special ? +groups.special / 100 : "")});\n  ${baseFilter}`
    }
  },
  "backdrop-blur": {
    reg: new RegExp(
      `(?<style>backdrop-blur)-((?<special>${Object.keys(blur).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups?.special === "none") return `--fv-backdrop-blur: ;\n  ${baseBackdropFilter}`
      return `--fv-backdrop-blur: blur(${custom(groups) ?? (groups?.special ? `${blur[groups.special]}px` : "")});\n  ${baseBackdropFilter}`
    }
  },
  "backdrop-brightness": {
    reg: new RegExp(
      `(?<style>backdrop-brightness)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-backdrop-brightness: brightness(${custom(groups) ?? (groups?.special ? +groups.special / 100 : "")});\n  ${baseBackdropFilter}`
    }
  },
  "backdrop-contrast": {
    reg: new RegExp(`(?<style>backdrop-contrast)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-backdrop-contrast: contrast(${custom(groups) ?? (groups?.special ? +groups.special / 100 : "")});\n  ${baseBackdropFilter}`
    }
  },
  "backdrop-grayscale": {
    reg: new RegExp(`(?<style>backdrop-grayscale)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-backdrop-grayscale: grayscale(${custom(groups) ?? groups?.special ?? ""});\n  ${baseBackdropFilter}`
    }
  },
  "backdrop-hue-rotate": {
    reg: new RegExp(
      `(?<style>backdrop-hue-rotate)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-backdrop-hue-rotate: hue-rotate(${custom(groups) ?? (groups?.special ? `${groups.special}deg` : "")});\n  ${baseBackdropFilter}`
    }
  },
  "backdrop-invert": {
    reg: new RegExp(`(?<style>backdrop-invert)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-backdrop-invert: invert(${custom(groups) ?? groups?.special ?? ""});\n  ${baseBackdropFilter}`
    }
  },
  "backdrop-sepia": {
    reg: new RegExp(`(?<style>backdrop-sepia)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-backdrop-sepia: sepia(${custom(groups) ?? groups?.special ?? ""});\n  ${baseBackdropFilter}`
    }
  },
  "backdrop-saturate": {
    reg: new RegExp(`(?<style>backdrop-saturate)-((?<special>\\d+)\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `--fv-backdrop-saturate: saturate(${custom(groups) ?? (groups?.special ? +groups.special / 100 : "")});\n  ${baseBackdropFilter}`
    }
  },
  "backdrop-opacity": {
    reg: /(?<style>backdrop-opacity)-((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (groups?.abstract) groups.abstract = `${+groups.abstract}`
      return `--fv-backdrop-opacity: opacity(${groups?.abstract || groups?.custom ? custom(groups) : groups?.special ? +groups.special / 100 : 1});\n  ${baseBackdropFilter}`
    }
  },
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
  scale: {
    // Issue 3 (uno-engine.md): negative-группа (минус терялся: -scale-100 → 1) + \b после \d+
    // (scale-3d матчился как 0.03). Обработка минуса — negative(), зеркало sizing().
    reg: /(?<negative>-)?(?<style>scale)-(?<axis>[xy])?-?((?<special>\d+)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups) return
      return scale[groups.axis](
        custom(groups) ?? (groups.special ? (negative(groups, `${+groups.special / 100}`) ?? "") : "")
      )
    }
  },
  rotate: {
    // Issue 6 (uno-engine.md): modern CSS property rotate: (v4) — вне transform:-цепочки,
    // комбинация с translate-*/scale-* больше не даёт двойного сдвига.
    reg: /(?<negative>-)?(?<style>rotate)-((?<special>\d+)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups) return
      return `rotate: ${custom(groups) ?? (groups.special ? (negative(groups, `${groups.special}deg`) ?? "") : "")};`
    }
  },
  translate: {
    reg: /(?<negative>-)?(?<style>translate)-(?<axis>[xy])?-?((?<special>\d+(\.\d+)?(\/\d+)?|px|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups) return
      return translate[groups.axis](`${custom(groups) ?? sizing(groups) ?? ""}`)
    }
  },
  skew: {
    reg: /(?<negative>-)?(?<style>skew)-(?<axis>[xy])?-?((?<special>\d+)|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups) return
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
  accent: {
    reg: {
      abstract: new RegExp(
        /(?<style>accent)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>accent)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>accent)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `accent-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `accent-color: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `accent-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      }
    }
  },
  appearance: {
    reg: /(?<style>appearance)-(?<special>none|auto)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `-webkit-appearance: ${groups.special};\n  -moz-appearance: ${groups.special};\n  appearance: ${groups.special};`
    }
  },
  cursor: {
    reg: new RegExp(
      `(?<style>cursor)-((?<special>${cursor.join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `cursor: ${groups?.abstract || groups?.custom ? (custom(groups)?.replace(/_/g, " ") ?? "") : (groups?.special ?? "")};`
    }
  },
  caret: {
    reg: {
      abstract: new RegExp(
        /(?<style>caret)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>caret)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>caret)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      )
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `caret-color: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `caret-color: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `caret-color: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      }
    }
  },
  "pointer-events": {
    reg: /(?<style>pointer-events)-(?<special>none|auto)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `pointer-events: ${groups.special};`
    }
  },
  resize: {
    reg: new RegExp(`(?<style>resize)-(?<special>${Object.keys(resize).join("|")})\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `resize: ${resize[groups.special]};`
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
  touch: {
    reg: /(?<style>touch)-(?<special>auto|none|pan-x|pan-left|pan-right|pan-y|pan-up|pan-down|pinch-zoom|manipulation)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return groups.special ? `touch-action: ${groups.special};` : ""
    }
  },
  select: {
    reg: /(?<style>select)-(?<special>none|text|all|auto)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return groups?.special ? `user-select: ${groups.special};` : ""
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
  fill: {
    reg: {
      abstract: new RegExp(
        /(?<style>fill)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>fill)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>fill)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      noneColor: /(?<style>fill)-(?<special>none)\b/
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor" | "noneColor", RegExp>
      if (reg?.abstract?.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `fill: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `fill: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `fill: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.noneColor.test(classStyle)) {
        const groups = classStyle.match(reg.noneColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `fill: ${groups.special};`
      }
    }
  },
  stroke: {
    reg: {
      abstract: new RegExp(
        /(?<style>stroke)-(\[(?<abstract>.*?)])\/?((?<opacity>\d+)\b|(\[(?<abstractOpacity>.*?)]))?|(\((?<custom>.*?)\))/
      ),
      color: new RegExp(
        `(?<style>stroke)-(?<special>${Object.keys(colors).join("|")})\\b-(?<tone>\\d+)\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      specialColor: new RegExp(
        `(?<style>stroke)-(?<special>${Object.keys(specialColor).join("|")})\\b\\/?((?<opacity>\\d+)\\b|(\\[(?<abstractOpacity>.*?)]))?`
      ),
      noneColor: /(?<style>stroke)-(?<special>none)\b/,
      width: /(?<style>stroke)-(?<special>\d+)\b/
    },
    getValue(classStyle) {
      const reg = this.reg as Record<"abstract" | "color" | "specialColor" | "noneColor" | "width", RegExp>
      if (reg.abstract.test(classStyle)) {
        const groups = classStyle.match(reg.abstract)?.groups as GroupsRegExp
        if (groups?.abstract?.startsWith("#"))
          return `stroke: ${
            addAlphaToHex(
              custom(groups),
              groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined
            ) ?? ""
          };`
        return `stroke-width: ${custom(groups) ?? ""};`
      } else if (reg.color.test(classStyle)) {
        const groups = classStyle.match(reg.color)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `stroke: ${resolveColor(groups)};`
      } else if (reg.specialColor.test(classStyle)) {
        const groups = classStyle.match(reg.specialColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `stroke: ${addAlphaToHex(specialColor[groups.special], groups.abstractOpacity ? +groups.abstractOpacity : groups.opacity ? +groups.opacity / 100 : undefined)};`
      } else if (reg.noneColor.test(classStyle)) {
        const groups = classStyle.match(reg.noneColor)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `stroke: ${groups.special};`
      } else if (reg.width.test(classStyle)) {
        const groups = classStyle.match(reg.width)?.groups as GroupsRegExp
        if (!groups?.special) return
        return `stroke-width: ${groups.special};`
      }
    }
  },
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
    // `both` — clear-специфичное значение (в shared floatAndClear его нет: float: both невалиден).
    reg: new RegExp(`(?<style>clear)-(?<special>${Object.keys(floatAndClear).join("|")}|both)\\b`),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups?.special) return
      return `clear: ${floatAndClear[groups.special] ?? groups.special};`
    }
  },
  object: {
    reg: {
      fit: /(?<style>object)-(?<special>contain|cover|fill|none|scale-down)\b/,
      position:
        /(?<style>object)-((?<special>left-bottom|left-top|right-bottom|right-top|top-left|top-right|bottom-left|bottom-right|top|bottom|left|right|center)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/
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
  basis: {
    // Issue 3 (uno-engine.md): container scale (3xs…7xl) — зеркало правила `w`.
    reg: /(?<style>basis)-((?<special>\d+(\.\d+)?(\/\d+)?(xs|xl)?|xs|sm|md|lg|xl|px|auto|full)\b|(\[(?<abstract>.*?)])|(\((?<custom>.*?)\)))/,
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
      `(?<negative>-)?(?<style>order)-((?<special>\\d+|${Object.keys(order).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      if (!groups) return
      return `order: ${custom(groups) ?? (isNaN(+groups.special) ? (order[groups?.special] ?? "") : (negative(groups, groups?.special ?? "") ?? ""))};`
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
    reg: /(?<style>items)-(?<special>start|end|center|baseline-last|baseline|stretch)\b/,
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `align-items: ${groups?.special === "baseline-last" ? "last baseline" : (groups?.special ?? "")};`
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
  },
  animate: {
    reg: new RegExp(
      `(?<style>animate)-((?<special>${Object.keys(animations).join("|")})\\b|(\\[(?<abstract>.*?)])|(\\((?<custom>.*?)\\)))`
    ),
    getValue(classStyle) {
      const groups = classStyle.match(this.reg as RegExp)?.groups as GroupsRegExp
      return `animation: ${groups?.abstract || groups?.custom ? (custom(groups)?.replace(/_/g, " ") ?? "") : (animations[groups?.special] ?? "")};`
    }
  }
}
