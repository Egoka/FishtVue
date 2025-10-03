import { MATH_FUNCTIONS, specialValues } from "fishtvue/theme/unoStyle/unoStatic"
import type { GroupsRegExp } from "fishtvue/theme/unoStyle/UnoTypes"

export function addAlphaToHex(color: string | undefined, alpha?: number | undefined): string | undefined {
  if (!color) return color
  if (color.startsWith("hsl")) return color.replace("<alpha-value>", "100")
  if (typeof alpha !== "number") return color
  if (alpha === 1 || alpha === 100) return color
  let alphaValue
  if (alpha > 1) alphaValue = Math.round((alpha / 100) * 255)
  else alphaValue = Math.round(alpha * 255)
  const alphaHex = alphaValue.toString(16).padStart(2, "0")
  if (color.startsWith("hsl")) return color.replace("<alpha-value>", alphaHex)
  if (color[0] !== "#" || (color.length !== 7 && color.length !== 4)) return color
  return `${color}${alphaHex}`
}

export function sizing(value: string | undefined): string | undefined {
  if (value === undefined) return
  if (/(?<dividend>\d+)\/(?<divisor>\d+)/.test(value)) {
    const res = value.match(/(?<dividend>\d+)\/(?<divisor>\d+)/)
    if (res) {
      const { dividend, divisor } = res.groups as any
      if (dividend && divisor) {
        return `calc(${dividend} / ${divisor} * 100%)`
      }
    }
  }
  if (parseFloat(value) === 0) return "0px"
  if (/3xs|2xs|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl/.test(value)) return specialValues[value]
  if (parseFloat(value) >= 0) return `${parseFloat(value) * 2 * 0.125}rem`
  return specialValues[value]
}

export function custom(groups: GroupsRegExp): string | undefined {
  if (groups?.custom) return `var(${groups?.custom})`
  if (groups?.abstract) return formatMathFunctions(groups?.abstract)
  return
}

const LOWER_A = 0x61
const LOWER_Z = 0x7a
const UPPER_A = 0x41
const UPPER_Z = 0x5a
const LOWER_E = 0x65
const UPPER_E = 0x45
const ZERO = 0x30
const NINE = 0x39
const ADD = 0x2b
const SUB = 0x2d
const MUL = 0x2a
const DIV = 0x2f
const OPEN_PAREN = 0x28
const CLOSE_PAREN = 0x29
const COMMA = 0x2c
const SPACE = 0x20
const PERCENT = 0x25

export function hasMathFn(input: string) {
  return input.indexOf("(") !== -1 && MATH_FUNCTIONS.some((fn) => input.includes(`${fn}(`))
}

export function formatMathFunctions(input: string): string {
  if (!MATH_FUNCTIONS.some((fn) => input.includes(fn))) {
    return input
  }

  let result = ""
  let formattable: boolean[] = []

  let valuePos: number | null = null
  let lastValuePos: number | null = null

  for (let i = 0; i < input.length; i++) {
    let char = input.charCodeAt(i)
    if (char >= ZERO && char <= NINE) {
      valuePos = i
    } else if (
      valuePos !== null &&
      (char === PERCENT || (char >= LOWER_A && char <= LOWER_Z) || (char >= UPPER_A && char <= UPPER_Z))
    ) {
      valuePos = i
    } else {
      lastValuePos = valuePos
      valuePos = null
    }
    if (char === OPEN_PAREN) {
      result += input[i]
      let start = i

      for (let j = i - 1; j >= 0; j--) {
        let inner = input.charCodeAt(j)

        if (inner >= ZERO && inner <= NINE) {
          start = j // 0-9
        } else if (inner >= LOWER_A && inner <= LOWER_Z) {
          start = j // a-z
        } else {
          break
        }
      }

      let fn = input.slice(start, i)

      if (MATH_FUNCTIONS.includes(fn)) {
        formattable.unshift(true)
        continue
      } else if (formattable[0] && fn === "") {
        formattable.unshift(true)
        continue
      }
      formattable.unshift(false)
      continue
    } else if (char === CLOSE_PAREN) {
      result += input[i]
      formattable.shift()
    } else if (char === COMMA && formattable[0]) {
      result += `, `
      continue
    } else if (char === SPACE && formattable[0] && result.charCodeAt(result.length - 1) === SPACE) {
      continue
    } else if ((char === ADD || char === MUL || char === DIV || char === SUB) && formattable[0]) {
      let trimmed = result.trimEnd()
      let prev = trimmed.charCodeAt(trimmed.length - 1)
      let prevPrev = trimmed.charCodeAt(trimmed.length - 2)
      let next = input.charCodeAt(i + 1)
      if ((prev === LOWER_E || prev === UPPER_E) && prevPrev >= ZERO && prevPrev <= NINE) {
        result += input[i]
        continue
      } else if (prev === ADD || prev === MUL || prev === DIV || prev === SUB) {
        result += input[i]
        continue
      } else if (prev === OPEN_PAREN || prev === COMMA) {
        result += input[i]
        continue
      } else if (input.charCodeAt(i - 1) === SPACE) {
        result += `${input[i]} `
      } else if (
        (prev >= ZERO && prev <= NINE) ||
        (next >= ZERO && next <= NINE) ||
        prev === CLOSE_PAREN ||
        next === OPEN_PAREN ||
        next === ADD ||
        next === MUL ||
        next === DIV ||
        next === SUB ||
        (lastValuePos !== null && lastValuePos === i - 1)
      )
        result += ` ${input[i]} `
      else result += input[i]
    } else result += input[i]
  }

  return result
}
