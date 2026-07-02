import stylesRules from "./unoRules"
import {
  formElementStates as formElementStatesList,
  media as mediaList,
  mediaDynamic as mediaDynamicList,
  pseudoContent as pseudoContentList,
  pseudoElements as pseudoElementsList,
  selectors as selectorsList,
  selectorsDynamic as selectorsDynamicList,
  singleStyles,
  specialSelectors,
  specialStates as specialStatesList,
  structuralPseudoClasses as structuralPseudoClassesList,
  userInteractionStates as userInteractionStatesList
} from "./unoStatic"
import { Modifier, PseudoClasses } from "fishtvue/theme/unoStyle/UnoTypes"

const singleStylesNames = new Set(Object.keys(singleStyles))
const RegSingleStyles = new RegExp(`(^|[^-a-z])(?<style>${[...singleStylesNames].join("|")})$`)
const StylesNames = new Set(Object.keys(stylesRules))
const RegStyles = new RegExp(
  `(?:.*:)?(?<![a-zA-Z])(?<className>(?<negative>-)?(?<style>${[...StylesNames].join("|")})[xyserltb]?-.*)`
)

const pseudoClasses = {
  userInteractionStates: userInteractionStatesList,
  formElementStates: formElementStatesList,
  structuralPseudoClasses: structuralPseudoClassesList,
  pseudoContent: pseudoContentList,
  pseudoElements: pseudoElementsList,
  specialStates: specialStatesList
} satisfies PseudoClasses
const pseudoClassesStringReg = Object.entries(pseudoClasses)
  .map((item) => `(?<${item[0]}>${Object.keys(item[1]).join("|")})`)
  .join("|")
const media = Object.keys(mediaList).join("|")
const mediaDynamic = Object.keys(mediaDynamicList).join("|")
const selectors = Object.keys(selectorsList).join("|")
const selectorsDynamic = Object.keys(selectorsDynamicList).join("|")

// Единый источник паттерна variant-токена: им же парсит getModifier (global-скан),
// им же (с якорями ^…$) валидируется каждый префикс — parser и validator не расходятся.
// has-ветка: bracket-форма (has-[a]) ИЛИ именованная (has-checked, v4) — имя резолвится
// по pseudo-словарям в tailwind(), неизвестное имя дропается (fail-closed).
// selectorsBoolean: boolean-shorthand `data-<name>:` → [data-<name>] (v4); негативный lookahead
// не даёт украсть bracket-форму data-[k=v]: у selectorsDynamic.
const modifierTokenSource = `(?<![\\w-])(((?<state>group|peer)-)?(((${
  pseudoClassesStringReg
})|(\\[(?<abstract>.*?)]))(\\/(?<stateName>\\w+))?|((?<has>has)-((\\[(?<hasValue>.*?)])|(?<hasNamed>[\\w-]+)))):|(?<media>${
  media
}):|(?<mediaDynamic>${mediaDynamic})-(\\[(?<mediaAbstract>.*?)]):|(?<selectors>${
  selectors
}):|(?<selectorsDynamic>${selectorsDynamic})-(\\[(?<selectorsAbstract>.*?)]):|(?<selectorsBoolean>data-(?!\\[)[\\w-]+):|(?<child>\\*):)`
const modifierTokenReg = new RegExp(modifierTokenSource, "g")
const variantValidationReg = new RegExp(`^(?:${modifierTokenSource})$`)

// Issue 3 (uno-engine.md): семейства, чьи классы матчились ЧУЖИМИ правилами
// (mask-t-from-* → gradient `from`, perspective-origin-* → `origin`) — fail-closed до реализации.
const unsupportedFamilyReg = /^-?(mask|perspective)-/

// Issue 1 (uno-engine.md): значение не должно попадать в CSS, если оно пустое, содержит литерал
// "undefined" (в т.ч. вклеенный без границ слова: `ms-[undefinedpx]` → `margin-inline-start: undefinedpx`),
// пустой вызов функции `()` или пустую декларацию СТАНДАРТНОГО свойства (`prop: ;`).
// Пустой reset custom property (`--fv-blur: ;` у blur-none) — валидное значение-пробел, пропускается.
const invalidValueReg = /undefined|\(\s*\)|(?:^|\n)\s*(?!--)[\w-]+:\s*;/

// Issue 4 (uno-engine.md): arbitrary properties — [prop:value] / [--var:value].
// Имя свойства — стандартное или custom property; value — всё до закрывающей скобки
// (underscore → пробел, как в arbitrary values Tailwind).
const arbitraryPropertyReg = /^\[((?:--)?[a-zA-Z][\w-]*):(.+)]$/

const warnedClasses = new Set<string>()
function warnUnsupported(classStyle: string, reason: string): void {
  if (process.env.NODE_ENV === "production") return
  if (warnedClasses.has(classStyle)) return
  warnedClasses.add(classStyle)
  console.warn(`[FishtVue tailwind] class "${classStyle}" was dropped: ${reason}`)
}

// Разбор класса на variant-токены по `:` на глубине 0 — двоеточия внутри `[...]`/`(...)`
// (arbitrary values/variants: `[&:hover]:`, `supports-[display:grid]:`) не являются разделителями.
function splitTopLevelSegments(classStyle: string): string[] {
  const segments: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < classStyle.length; i++) {
    const char = classStyle[i]
    if (char === "[" || char === "(") depth++
    else if (char === "]" || char === ")") depth--
    else if (char === ":" && depth === 0) {
      segments.push(classStyle.slice(start, i))
      start = i + 1
    }
  }
  segments.push(classStyle.slice(start))
  return segments
}

type ModifierClass = {
  state: string
  pseudoClasses: string
  media: string[]
  content: string
  selectors: string
  specialSelector: string
  abstract: string
}
type tailwindOptions = {
  selector: string
  darkSelector: string
}

export function tailwind(
  classStyle: string,
  options: tailwindOptions = {
    selector: "",
    darkSelector: ""
  }
): string | undefined {
  if (typeof (classStyle as any) !== "string" || classStyle === "") return
  const className: string | undefined = classStyle
  let value: string | undefined = undefined
  const modifier: ModifierClass = {
    state: "",
    pseudoClasses: "",
    media: [""],
    content: "",
    selectors: "",
    specialSelector: "",
    abstract: ""
  }
  let baseUtility = classStyle
  if (/:/.test(classStyle)) {
    // Issue 1 (режим 3): нераспознанный вариант раньше давал правило БЕЗ условия
    // (not-hover:opacity-75 применялся всегда) — теперь fail-closed.
    const segments = splitTopLevelSegments(classStyle)
    baseUtility = segments[segments.length - 1]
    for (const variantToken of segments.slice(0, -1)) {
      if (!variantValidationReg.test(`${variantToken}:`)) {
        warnUnsupported(classStyle, `unsupported variant "${variantToken}:"`)
        return
      }
    }
    const mod = getModifier(classStyle)
    // Arbitrary at-rule variant ([@media(...)]:) движок не умеет — раньше давал мусорный селектор.
    if (mod.abstract?.startsWith("@")) {
      warnUnsupported(classStyle, `unsupported at-rule variant "[${mod.abstract}]:"`)
      return
    }
    // Именованная has-форма (has-checked:) резолвится по pseudo-словарям; неизвестное имя — fail-closed.
    let hasSelector = ""
    if (mod.has) {
      if (mod.hasNamed) {
        const resolved =
          (userInteractionStatesList as Record<string, string>)[mod.hasNamed] ??
          (formElementStatesList as Record<string, string>)[mod.hasNamed] ??
          (structuralPseudoClassesList as Record<string, string>)[mod.hasNamed] ??
          (specialStatesList as Record<string, string>)[mod.hasNamed]
        if (!resolved) {
          warnUnsupported(classStyle, `unsupported variant "has-${mod.hasNamed}:"`)
          return
        }
        hasSelector = `:has(${resolved})`
      } else hasSelector = `:has(${mod.hasValue})`
    }
    modifier.pseudoClasses =
      (mod.userInteractionStates ? userInteractionStatesList[mod.userInteractionStates] : "") +
      (mod.formElementStates ? formElementStatesList[mod.formElementStates] : "") +
      (mod.structuralPseudoClasses ? structuralPseudoClassesList[mod.structuralPseudoClasses] : "") +
      (mod.pseudoContent ? pseudoContentList[mod.pseudoContent] : "") +
      (mod.pseudoElements ? pseudoElementsList[mod.pseudoElements] : "") +
      (mod.specialStates ? specialStatesList[mod.specialStates] : "") +
      hasSelector +
      (mod.child ? ` > *` : "")
    if (mod.state)
      modifier.state = `.${mod.state}${mod.stateName ? `\\/${mod.stateName}` : ""}${modifier.pseudoClasses}`
    if (mod.state && mod.abstract) modifier.state = setCustomModifier(modifier.state, mod.abstract)
    else if (mod.abstract) modifier.abstract = mod.abstract
    if (mod.pseudoContent) modifier.content = "  content: var(--fv-content);\n"
    if (mod.selectors) modifier.selectors = selectorsList[mod.selectors]
    if (mod.selectorsDynamic && mod.selectorsAbstract)
      modifier.selectors = selectorsDynamicList[mod.selectorsDynamic](mod.selectorsAbstract)
    // Boolean data-shorthand (v4): data-active: → [data-active].
    if (mod.selectorsBoolean) modifier.selectors = `[${mod.selectorsBoolean}]`
    if (mod.media)
      modifier.media = mod.media.map((mediaItem) => {
        if (mediaItem === "dark" && options.darkSelector?.length) return `${options.darkSelector} {\n`
        else return `${mediaList[mediaItem]} {\n`
      })
    if (mod.mediaDynamic && mod.mediaAbstract)
      modifier.media.push(`${mediaDynamicList[mod.mediaDynamic](mod.mediaAbstract)} {\n`)
    if (modifier.state) {
      modifier.state += " "
      if (mod.state === "peer") modifier.state += "~ "
      modifier.pseudoClasses = ""
    }
  }
  // Issue 3: «чужое» семейство не отдаётся соседним правилам — fail-closed до реализации.
  if (unsupportedFamilyReg.test(baseUtility)) {
    warnUnsupported(classStyle, `utility family "${baseUtility.replace(/^-?([a-z]+)-.*/, "$1-*")}" is not supported`)
    return
  }
  // Issue 4: arbitrary property ([appearance:textfield], [--my-var:10px]).
  const arbitraryProperty = baseUtility.match(arbitraryPropertyReg)
  if (arbitraryProperty) {
    const [, property, rawValue] = arbitraryProperty
    // Инъекция за пределы декларации ({} ;) ломает правило — fail-closed.
    if (/[{};]/.test(rawValue)) {
      warnUnsupported(classStyle, "unsafe arbitrary property value")
      return
    }
    value = `${property}: ${rawValue.replace(/_/g, " ")};`
    if (invalidValueReg.test(value)) {
      warnUnsupported(classStyle, "arbitrary property produced no valid value")
      return
    }
    return `${modifier.media.join("")}${options.selector}${
      modifier.state
    }.${setCustomModifier(isolation(className), modifier.abstract)}${modifier.selectors}${
      modifier.pseudoClasses
    } {\n${modifier.content}  ${value}\n}${"\n}".repeat(modifier.media.filter((i) => i.endsWith("{\n")).length)}`
  }
  if (RegSingleStyles.test(classStyle)) {
    const styleName = classStyle.match(RegSingleStyles)?.groups?.style
    if (!(styleName && singleStylesNames.has(styleName))) return
    value = singleStyles[styleName]
    return `${modifier.media.join("")}${options.selector}${
      modifier.state
    }.${setCustomModifier(isolation(className), modifier.abstract)}${modifier.selectors}${
      modifier.pseudoClasses
    } {\n${modifier.content}  ${value}\n}${"\n}".repeat(modifier.media.filter((i) => i.endsWith("{\n")).length)}`
  } else {
    const groups = classStyle.match(RegStyles)?.groups
    if (!(groups?.style && StylesNames.has(groups?.style))) {
      warnUnsupported(classStyle, "no matching rule")
      return
    }
    value = stylesRules[groups?.style].getValue(groups.className)
    // Issue 1 (режим 2): пустое значение / литерал "undefined" не интерполируется в CSS.
    if (!value || invalidValueReg.test(value)) {
      warnUnsupported(classStyle, `rule "${groups.style}" produced no valid value`)
      return
    }
    modifier.specialSelector = specialSelectors[groups?.style] ?? ""
    return `${modifier.media.join("")}${options.selector}${
      modifier.state
    }.${setCustomModifier(isolation(className), modifier.abstract)}${modifier.selectors}${
      modifier.pseudoClasses
    }${modifier.specialSelector} {\n${modifier.content}  ${value}\n}${"\n}".repeat(
      modifier.media.filter((i) => i.endsWith("{\n")).length
    )}`
  }
}

function isolation(classStyle: string): string {
  return classStyle.replace(/[^a-zA-Z0-9-_]/g, "\\$&")
}

function setCustomModifier(className: string, abstract: string) {
  if (!abstract) return className
  abstract = abstract.replace(/_/g, " ")
  return /&/.test(abstract) ? abstract.replace("&", className) : className + abstract
}

function getModifier(classStyle: string): Modifier {
  return [...classStyle.matchAll(modifierTokenReg)].reduce((acc: Record<string, string | string[]>, currentMatch) => {
    Object.entries(currentMatch.groups ?? {}).forEach(([key, value]) => {
      if (value !== undefined) {
        if (["media"].includes(key)) {
          if (Array.isArray(acc[key])) (acc[key] as string[]).push(value)
          else acc[key] = [value]
        } else {
          acc[key] = value
        }
      }
    })
    return acc
  }, {}) as Modifier
}

// Пробелы покрытия (Space Between, Font Smoothing, mask-*, 3D transforms и др.) —
// полный список в Documentation/issues/uno-engine.md (Issues 2, 4).
