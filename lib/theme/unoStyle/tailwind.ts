import stylesRules from "./unoRules"
import {
  containerSizes as containerSizesList,
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
// Волна 3 (Issue 2) добавила к этому источнику шесть форм. Порядок альтернатив — часть контракта:
// regex-alternation возвращает ПЕРВУЮ подошедшую, поэтому `not-`/`in-`/`nth-` и container-формы
// стоят раньше словарных, а `**:` — раньше `*:`.
const containerSizesAlt = Object.keys(containerSizesList)
  .sort((a, b) => b.length - a.length)
  .join("|")
// `in-*:` (v4, неявная группа) конфликтует с псевдо-классами, чьё ИМЯ начинается на `in-`:
// без этой защиты `in-range:` разбирался бы как «предок в состоянии range». Список выводится
// из словарей, а не хардкодится, — новый такой псевдо-класс не понадобится вспоминать.
const inVariantConflicts = [
  ...Object.keys(userInteractionStatesList),
  ...Object.keys(formElementStatesList),
  ...Object.keys(structuralPseudoClassesList),
  ...Object.keys(specialStatesList)
]
  .filter((name) => name.startsWith("in-"))
  .map((name) => name.slice(3))
const inVariantGuard = inVariantConflicts.length ? `(?!(?:${inVariantConflicts.join("|")})\\b)` : ""
const modifierTokenSource = `(?<![\\w-])((?<not>not)-(?<notInner>supports-\\[.*?]|\\[.*?]|[\\w-]+):|(?<inVariant>in)-${inVariantGuard}(?<inInner>\\[.*?]|[\\w-]+):|(?<nth>nth(?:-last)?(?:-of-type)?)-((?<nthValue>\\d+)|\\[(?<nthAbstract>.*?)]):|(?<stateRel>group|peer)-((?<stateSel>${
  selectors
})|(?<stateSelDyn>${selectorsDynamic})-\\[(?<stateSelAbstract>.*?)]|(?<stateSelBool>data-(?!\\[)[\\w-]+))(\\/(?<stateRelName>\\w+))?:|(?<containerDynamic>@(?:min|max))-\\[(?<containerAbstract>.*?)](\\/(?<containerDynamicName>[\\w-]+))?:|(?<container>@(?:max-)?(?:${
  containerSizesAlt
}))(\\/(?<containerName>[\\w-]+))?:|((?<state>group|peer)-)?(((${
  pseudoClassesStringReg
})|(\\[(?<abstract>.*?)]))(\\/(?<stateName>\\w+))?|((?<has>has)-((\\[(?<hasValue>.*?)])|(?<hasNamed>[\\w-]+)))):|(?<media>${
  media
}):|(?<mediaDynamic>${mediaDynamic})-(\\[(?<mediaAbstract>.*?)]):|(?<supportsNamed>supports)-(?!\\[)(?<supportsFeature>[\\w-]+):|(?<selectors>${
  selectors
}):|(?<selectorsDynamic>${selectorsDynamic})-(\\[(?<selectorsAbstract>.*?)]):|(?<selectorsBoolean>data-(?!\\[)[\\w-]+):|(?<descendant>\\*\\*):|(?<child>\\*):)`
const modifierTokenReg = new RegExp(modifierTokenSource, "g")
const variantValidationReg = new RegExp(`^(?:${modifierTokenSource})$`)

// Issue 3 (uno-engine.md): семейства, чьи классы матчились ЧУЖИМИ правилами
// (mask-t-from-* → gradient `from`) — fail-closed до реализации.
// `perspective-*` снят из списка 2026-09-06 (Issue 4): семейство реализовано, включая
// `perspective-origin-*`, которое раньше уводило разбор в правило `origin`.
const unsupportedFamilyReg = /^-?mask-/

// Issue 1 (uno-engine.md): значение не должно попадать в CSS, если оно пустое, содержит литерал
// "undefined" (в т.ч. вклеенный без границ слова: `ms-[undefinedpx]` → `margin-inline-start: undefinedpx`),
// пустой вызов функции `()` или пустую декларацию СТАНДАРТНОГО свойства (`prop: ;`).
// Пустой reset custom property (`--fv-blur: ;` у blur-none) — валидное значение-пробел, пропускается.
const invalidValueReg = /undefined|\(\s*\)|(?:^|\n)\s*(?!--)[\w-]+:\s*;/

// Issue 4 (uno-engine.md): arbitrary properties — [prop:value] / [--var:value].
// Имя свойства — стандартное или custom property; value — всё до закрывающей скобки
// (underscore → пробел, как в arbitrary values Tailwind).
const arbitraryPropertyReg = /^\[((?:--)?[a-zA-Z][\w-]*):(.+)]$/

// Issue 2 (uno-engine.md): утилита `@container` (v4) — объявление контейнера, к которому
// привязываются container-варианты `@sm:` / `@max-md:` / `@min-[…]:`.
const containerUtilityReg = /^@container(?:-(?<kind>normal))?(?:\/(?<name>[\w-]+))?$/

// Issue 2 (uno-engine.md): функциональные nth-варианты v4 — имя варианта → CSS-псевдо-класс.
const NTH_PSEUDO: Record<string, string> = {
  nth: "nth-child",
  "nth-last": "nth-last-child",
  "nth-of-type": "nth-of-type",
  "nth-last-of-type": "nth-last-of-type"
}

// Issue 2 (uno-engine.md): резолв имени псевдо-класса по всем словарям. Используется именованной
// has-формой, `not-*` и `in-*` — все три принимают одно и то же множество имён.
function resolvePseudoName(name: string): string | undefined {
  return (
    (userInteractionStatesList as Record<string, string>)[name] ??
    (formElementStatesList as Record<string, string>)[name] ??
    (structuralPseudoClassesList as Record<string, string>)[name] ??
    (specialStatesList as Record<string, string>)[name]
  )
}

// Issue 2 (uno-engine.md): `not-<media>:` → отрицание media-условия. Наш словарь хранит целую
// строку `@media (…)`, поэтому отрицание строится из условия: скобочное условие требует формы
// `not all and (…)` (иначе CSS невалиден), безусловный `print` — простого `not print`.
function negateMedia(rule: string): string | undefined {
  if (!rule.startsWith("@media ")) return
  const condition = rule.slice("@media ".length).trim()
  if (!condition) return
  if (condition.startsWith("not ")) return
  return condition.startsWith("(") ? `@media not all and ${condition}` : `@media not ${condition}`
}

// Issue 2 (uno-engine.md): нормализация arbitrary at-rule варианта `[@media(hover:hover)]:`.
// Раньше такая форма давала мусорный селектор (класс + текст условия) и была закрыта fail-closed'ом.
function normalizeAtRule(abstract: string): string | undefined {
  const value = abstract.replace(/_/g, " ")
  const match = value.match(/^@([a-zA-Z-]+)\s*(.*)$/)
  if (!match) return
  const [, name, rest] = match
  return rest ? `@${name} ${rest}` : `@${name}`
}

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
  // ---Issue 2 (uno-engine.md), волна 3: слоты новых вариантов ---------------------------
  // at-rule'ы, открытые не media-словарём (`not-<media>:`, `@container`, `[@media(…)]:`);
  // складываются в тот же список, что и media, — закрывающие скобки считаются по нему.
  const atRules: string[] = []
  // `:not(…)` от `not-*:` — их может быть несколько (`not-hover:not-focus:`).
  const notSelectors: string[] = []
  // Префикс-предок от `in-*:` (`:where(*:focus) `).
  let ancestor = ""
  // `:nth-child(…)` и родня от `nth-*:`.
  let nthSelector = ""
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
    // Arbitrary at-rule variant ([@media(...)]:) — открывает свой блок наравне с media-словарём.
    if (mod.abstract?.startsWith("@")) {
      const atRule = normalizeAtRule(mod.abstract)
      if (!atRule) {
        warnUnsupported(classStyle, `unsupported at-rule variant "[${mod.abstract}]:"`)
        return
      }
      atRules.push(`${atRule} {\n`)
      mod.abstract = undefined
    }
    // ---Issue 2 (uno-engine.md), волна 3 -------------------------------------------------
    // `not-*:` — отрицание уже известного варианта: псевдо-класс уходит в `:not()`, media-условие
    // в `@media not …`, `supports-[…]` в `@supports not (…)`, произвольный селектор в `:not(…)`.
    if (mod.not) {
      const inner = mod.notInner ?? ""
      if (inner.startsWith("[") && inner.endsWith("]")) {
        notSelectors.push(`:not(${inner.slice(1, -1).replace(/_/g, " ")})`)
      } else if (inner.startsWith("supports-[")) {
        atRules.push(`@supports not (${inner.slice("supports-[".length, -1).replace(/_/g, " ")}) {\n`)
      } else {
        const pseudo = resolvePseudoName(inner)
        if (pseudo) notSelectors.push(`:not(${pseudo})`)
        else {
          const negated = mediaList[inner] ? negateMedia(mediaList[inner]) : undefined
          if (!negated) {
            warnUnsupported(classStyle, `unsupported variant "not-${inner}:"`)
            return
          }
          atRules.push(`${negated} {\n`)
        }
      }
    }
    // `in-*:` — неявная группа v4: условие проверяется на ЛЮБОМ предке, без класса `group`.
    if (mod.inVariant) {
      const inner = mod.inInner ?? ""
      const resolved =
        inner.startsWith("[") && inner.endsWith("]") ? inner.slice(1, -1).replace(/_/g, " ") : resolvePseudoName(inner)
      if (!resolved) {
        warnUnsupported(classStyle, `unsupported variant "in-${inner}:"`)
        return
      }
      ancestor = `:where(${resolved.startsWith(":") ? `*${resolved}` : resolved}) `
    }
    // `nth-*:` — функциональные структурные псевдо-классы v4.
    if (mod.nth) {
      const argument = mod.nthAbstract ? mod.nthAbstract.replace(/_/g, " ") : mod.nthValue
      if (!argument) {
        warnUnsupported(classStyle, `unsupported variant "${mod.nth}:"`)
        return
      }
      nthSelector = `:${NTH_PSEUDO[mod.nth]}(${argument})`
    }
    // Именованная has-форма (has-checked:) резолвится по pseudo-словарям; неизвестное имя — fail-closed.
    let hasSelector = ""
    if (mod.has) {
      if (mod.hasNamed) {
        const resolved = resolvePseudoName(mod.hasNamed)
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
    // Композиции `group-/peer- × aria-/data-` (Issue 2): раньше разбор терял group-условие и
    // правило применялось к самому элементу, а не к потомку группы.
    if (mod.stateRel) {
      const qualifier = mod.stateSel
        ? selectorsList[mod.stateSel]
        : mod.stateSelDyn && mod.stateSelAbstract !== undefined
          ? selectorsDynamicList[mod.stateSelDyn](mod.stateSelAbstract)
          : mod.stateSelBool
            ? `[${mod.stateSelBool}]`
            : ""
      if (!qualifier) {
        warnUnsupported(classStyle, `unsupported variant "${mod.stateRel}-…:"`)
        return
      }
      modifier.state = `.${mod.stateRel}${mod.stateRelName ? `\\/${mod.stateRelName}` : ""}${qualifier} ${
        mod.stateRel === "peer" ? "~ " : ""
      }`
    }
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
    // Именованный `supports-<feature>:` (v4) — проверка поддержки СВОЙСТВА, а не пары
    // «свойство: значение»; отсюда var()-заглушка справа, как в самом Tailwind.
    if (mod.supportsNamed && mod.supportsFeature)
      atRules.push(`@supports (${mod.supportsFeature}: var(--fv-supports)) {\n`)
    // Container queries (Issue 2) — главный false positive прежнего движка: `@sm:` молча уходил
    // в viewport-`@media`, то есть «работал» на full-width контейнерах и врал на остальных.
    if (mod.container) {
      const isMax = mod.container.startsWith("@max-")
      const size = containerSizesList[mod.container.replace(/^@(?:max-)?/, "")]
      if (!size) {
        warnUnsupported(classStyle, `unsupported container query "${mod.container}:"`)
        return
      }
      const name = mod.containerName ? `${mod.containerName} ` : ""
      atRules.push(`@container ${name}(${isMax ? `width < ${size}` : `min-width: ${size}`}) {\n`)
    }
    if (mod.containerDynamic && mod.containerAbstract) {
      const isMax = mod.containerDynamic === "@max"
      const value = mod.containerAbstract.replace(/_/g, " ")
      const name = mod.containerDynamicName ? `${mod.containerDynamicName} ` : ""
      atRules.push(`@container ${name}(${isMax ? `width < ${value}` : `min-width: ${value}`}) {\n`)
    }
    if (modifier.state && !mod.stateRel) {
      modifier.state += " "
      if (mod.state === "peer") modifier.state += "~ "
      modifier.pseudoClasses = ""
    }
    // `**:` — ВСЕ потомки (v4). Раньше давал ` > *`, то есть то же, что `*:` (прямые дети).
    if (mod.descendant) modifier.pseudoClasses += " *"
  }
  // Issue 2 (uno-engine.md): important-модификатор в обеих формах — префиксной `!mt-4` (v3) и
  // суффиксной `mt-4!` (v4). Раньше `!` просто экранировался в селектор, и объявление уходило
  // в CSS без `!important` — молча неверный приоритет.
  let important = false
  if (baseUtility.startsWith("!")) {
    important = true
    baseUtility = baseUtility.slice(1)
  } else if (baseUtility.endsWith("!")) {
    important = true
    baseUtility = baseUtility.slice(0, -1)
  }
  // Issue 3: «чужое» семейство не отдаётся соседним правилам — fail-closed до реализации.
  if (unsupportedFamilyReg.test(baseUtility)) {
    warnUnsupported(classStyle, `utility family "${baseUtility.replace(/^-?([a-z]+)-.*/, "$1-*")}" is not supported`)
    return
  }
  // Сборка правила из слотов — одна на все три ветки (arbitrary property / single style / rule).
  const emit = (declarations: string, specialSelector = ""): string => {
    const blocks = [...modifier.media.filter((item) => item.endsWith("{\n")), ...atRules]
    const body = important ? declarations.replace(/;(?=\s*(?:\n|$))/g, " !important;") : declarations
    return `${blocks.join("")}${options.selector}${ancestor}${modifier.state}.${setCustomModifier(
      isolation(className),
      modifier.abstract
    )}${modifier.selectors}${notSelectors.join("")}${nthSelector}${
      modifier.pseudoClasses
    }${specialSelector} {\n${modifier.content}  ${body}\n}${"\n}".repeat(blocks.length)}`
  }
  // Issue 2 (uno-engine.md): утилита `@container` (v4) — без неё container-варианты было не к чему
  // привязать. Формы: `@container`, `@container-normal`, `@container/{name}`.
  const containerUtility = baseUtility.match(containerUtilityReg)
  if (containerUtility) {
    const kind = containerUtility.groups?.kind === "normal" ? "normal" : "inline-size"
    const name = containerUtility.groups?.name
    return emit(`container-type: ${kind};${name ? `\n  container-name: ${name};` : ""}`)
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
    return emit(value)
  }
  if (RegSingleStyles.test(baseUtility)) {
    const styleName = baseUtility.match(RegSingleStyles)?.groups?.style
    if (!(styleName && singleStylesNames.has(styleName))) return
    return emit(singleStyles[styleName])
  } else {
    const groups = baseUtility.match(RegStyles)?.groups
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
    return emit(value, specialSelectors[groups?.style] ?? "")
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
