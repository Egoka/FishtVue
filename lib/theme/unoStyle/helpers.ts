import { specialValues } from "fishtvue/theme/unoStyle/unoStatic"

export function addAlphaToHex(color: string, alpha?: number): string {
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
export function sizing(value: string): string {
  if (/(?<dividend>\d+)\/(?<divisor>\d+)/.test(value)) {
    const res = value.match(/(?<dividend>\d+)\/(?<divisor>\d+)/)
    if (res) {
      const { dividend, divisor } = res.groups as any
      if (dividend && divisor) {
        return `${parseFloat(((dividend / divisor) * 100).toFixed(4))}%`
      }
    }
  }
  if (parseFloat(value) === 0) return "0px"
  if (/xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl/.test(value)) return specialValues[value]
  if (parseFloat(value) >= 0) return `${parseFloat(value) * 2 * 0.125}rem`
  return specialValues[value]
}
