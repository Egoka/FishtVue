import type { HEX, RGB, ThemeColor } from "fishtvue/theme/Theme"

const SCALES: number[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const isShortHex = (color: HEX): boolean => /^#([A-Fa-f0-9]{3})$/gm.test(color)
const isHex = (color: HEX): boolean => /^#([A-Fa-f0-9]{6})$/gm.test(color)
const isRGB = (color: RGB): boolean => {
  const { r, g, b } = color
  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255
}
const normalizeColor = (color: HEX): string =>
  isShortHex(color) ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : color
const hexToRgb = <T extends RGB>(colorHex: HEX): T | undefined => {
  if (!isHex(colorHex)) return
  colorHex = normalizeColor(colorHex)
  return /^#([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})$/gm
    .exec(colorHex)
    ?.filter((_, i) => i)
    .map((x) => parseInt(x, 16))
    .reduce((result: Record<any, any>, item, index) => {
      result[["r", "g", "b"][index]] = item
      return result
    }, {}) as T
}

const rgbToHex = <T extends HEX>(colorRGB: RGB): T | undefined => {
  if (!isRGB(colorRGB)) return
  return `#${colorRGB.r.toString(16).padStart(2, "0")}${colorRGB.g.toString(16).padStart(2, "0")}${colorRGB.b.toString(16).padStart(2, "0")}` as T
}
const blendColors = (solubleColor: string, baseColor: string, weight = 50): string | undefined => {
  if (!(solubleColor && baseColor)) return
  solubleColor = normalizeColor(solubleColor)
  baseColor = normalizeColor(baseColor)

  const p = weight / 100
  const w = p * 2 - 1
  const w1 = (w + 1) / 2.0
  const w2 = 1 - w1

  const solubleRGB = hexToRgb(solubleColor)
  const baseRGB = hexToRgb(baseColor)
  if (!(solubleRGB && baseRGB)) return

  const r = Math.round(solubleRGB.r * w1 + baseRGB.r * w2)
  const g = Math.round(solubleRGB.g * w1 + baseRGB.g * w2)
  const b = Math.round(solubleRGB.b * w1 + baseRGB.b * w2)

  return rgbToHex({ r, g, b })
}

const tint = (color: string, percent: number) => blendColors("#ffffff", color, percent)
const shade = (color: string, percent: number) => blendColors("#000000", color, percent)

export default (color: HEX): ThemeColor =>
  SCALES.reduce((acc: any, scale, i) => {
    let resultColor
    if (i <= 5) {
      resultColor = tint(color, (5 - i) * 19)
    } else {
      resultColor = shade(color, (i - 5) * 15)
    }
    if (resultColor) {
      acc[scale] = resultColor
    }
    return acc
  }, {})
