export function hslToHex(hsl: string): string {
  if (hsl === "") return ""

  const match = hsl.match(/^hsl\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)%,\s*(-?\d+(\.\d+)?)%\)$/)
  if (!match) return hsl

  let [, h, , s, , l] = match.map(Number)
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(s, 100)) / 100
  l = Math.max(0, Math.min(l, 100)) / 100

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const r = Math.round(hueToRgb(p, q, h / 360 + 1 / 3) * 255)
  const g = Math.round(hueToRgb(p, q, h / 360) * 255)
  const b = Math.round(hueToRgb(p, q, h / 360 - 1 / 3) * 255)

  const toHex = (x: number) => x.toString(16).padStart(2, "0")

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
