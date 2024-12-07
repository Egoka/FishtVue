import { describe, it, expect } from "vitest"
import { hslToHex } from "fishtvue/utils/colorsHandler"

describe("hslToHex", () => {
  it("should return the input if it is an empty string", () => {
    expect(hslToHex("")).toBe("")
  })

  it("should return the input if it is not a valid HSL string", () => {
    expect(hslToHex("invalid")).toBe("invalid")
    expect(hslToHex("rgb(255, 255, 255)")).toBe("rgb(255, 255, 255)")
  })

  it("should convert an HSL color to hex correctly for red", () => {
    expect(hslToHex("hsl(0, 100%, 50%)")).toBe("#ff0000")
  })

  it("should convert an HSL color to hex correctly for green", () => {
    expect(hslToHex("hsl(120, 100%, 50%)")).toBe("#00ff00")
  })

  it("should convert an HSL color to hex correctly for blue", () => {
    expect(hslToHex("hsl(240, 100%, 50%)")).toBe("#0000ff")
  })

  it("should convert an HSL color to hex correctly for black", () => {
    expect(hslToHex("hsl(0, 0%, 0%)")).toBe("#000000")
  })

  it("should convert an HSL color to hex correctly for white", () => {
    expect(hslToHex("hsl(0, 0%, 100%)")).toBe("#ffffff")
  })

  it("should handle HSL colors with lightness at 25% (dark colors)", () => {
    expect(hslToHex("hsl(0, 100%, 25%)")).toBe("#800000")
  })

  it("should handle HSL colors with lightness at 75% (light colors)", () => {
    expect(hslToHex("hsl(120, 100%, 75%)")).toBe("#80ff80")
  })

  it("should handle HSL colors with saturation at 0% (grayscale)", () => {
    expect(hslToHex("hsl(0, 0%, 50%)")).toBe("#808080")
  })

  it("should wrap hue values greater than 360", () => {
    expect(hslToHex("hsl(480, 100%, 50%)")).toBe("#00ff00") // 480 - 360 = 120 (green)
  })

  it("should handle hue values less than 0", () => {
    expect(hslToHex("hsl(-120, 100%, 50%)")).toBe("#0000ff") // -120 + 360 = 240 (blue)
  })

  it("should handle fractional HSL values", () => {
    expect(hslToHex("hsl(180.5, 100%, 50%)")).toBe("#00fdff")
  })

  it("should handle edge cases for extremely high or low saturation and lightness", () => {
    expect(hslToHex("hsl(60, 200%, 50%)")).toBe("#ffff00")
    expect(hslToHex("hsl(60, -50%, 50%)")).toBe("#808080")
  })
})
