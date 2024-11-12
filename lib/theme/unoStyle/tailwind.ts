import stylesRules from "./unoRules"
import {
  media as mediaList,
  mediaDynamic as mediaDynamicList,
  selectors as selectorsList,
  selectorsDynamic as selectorsDynamicList,
  userInteractionStates as userInteractionStatesList,
  formElementStates as formElementStatesList,
  structuralPseudoClasses as structuralPseudoClassesList,
  pseudoContent as pseudoContentList,
  pseudoElements as pseudoElementsList,
  specialStates as specialStatesList,
  singleStyles,
  specialSelectors
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
  if (typeof (classStyle as any) !== "string") return
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
  if (/:/.test(classStyle)) {
    const mod = getModifier(classStyle)
    modifier.pseudoClasses =
      (mod.userInteractionStates ? userInteractionStatesList[mod.userInteractionStates] : "") +
      (mod.formElementStates ? formElementStatesList[mod.formElementStates] : "") +
      (mod.structuralPseudoClasses ? structuralPseudoClassesList[mod.structuralPseudoClasses] : "") +
      (mod.pseudoContent ? pseudoContentList[mod.pseudoContent] : "") +
      (mod.pseudoElements ? pseudoElementsList[mod.pseudoElements] : "") +
      (mod.specialStates ? specialStatesList[mod.specialStates] : "") +
      (mod.has ? `:has(${mod.hasValue})` : "") +
      (mod.child ? ` > *` : "")
    if (mod.state)
      modifier.state = `.${mod.state}${mod.stateName ? `\\/${mod.stateName}` : ""}${modifier.pseudoClasses}`
    if (mod.state && mod.abstract) modifier.state = setCustomModifier(modifier.state, mod.abstract)
    else if (mod.abstract) modifier.abstract = mod.abstract
    if (mod.pseudoContent) modifier.content = "  content: var(--tw-content);\n"
    if (mod.selectors) modifier.selectors = selectorsList[mod.selectors]
    if (mod.selectorsDynamic && mod.selectorsAbstract)
      modifier.selectors = selectorsDynamicList[mod.selectorsDynamic](mod.selectorsAbstract)
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
    if (!(groups?.style && StylesNames.has(groups?.style))) return
    value = stylesRules[groups?.style].getValue(groups.className)
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
  const ref = new RegExp(
    `(?<![\\w-])(((?<state>group|peer)-)?(((${
      pseudoClassesStringReg
    })|(\\[(?<abstract>.*?)]))(\\/(?<stateName>\\w+))?|((?<has>has)-(\\[(?<hasValue>.*?)]))):|(?<media>${
      media
    }):|(?<mediaDynamic>${mediaDynamic})-(\\[(?<mediaAbstract>.*?)]):|(?<selectors>${
      selectors
    }):|(?<selectorsDynamic>${selectorsDynamic})-(\\[(?<selectorsAbstract>.*?)]):|(?<child>\\*):)`,
    "g"
  )
  return [...classStyle.matchAll(ref)].reduce((acc: Record<string, string | string[]>, currentMatch) => {
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

// Space Between
// Font Smoothing
// Animation
