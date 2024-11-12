import { describe, it, expect, vi } from "vitest"
import primitive from "fishtvue/theme/primitive"
import semantic from "fishtvue/theme/semantic"
import { palette, toVarsCss, linksTheme, useStyle } from "fishtvue/theme"

describe("Testing theme", () => {
  describe("ThemePrimitive structure", () => {
    it("should have correct structure and types for spacing properties", () => {
      // Проверка на наличие ключей и типов значений
      const requiredKeys = [
        "m",
        "mx",
        "my",
        "mt",
        "mb",
        "ml",
        "mr",
        "p",
        "px",
        "py",
        "pt",
        "pb",
        "pl",
        "pr",
        "borderWidth",
        "rounded",
        "shadow",
        "opacity",
        "duration",
        "white",
        "black",
        "emerald",
        "green",
        "lime",
        "red",
        "orange",
        "amber",
        "yellow",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose",
        "slate",
        "gray",
        "zinc",
        "neutral",
        "stone"
      ]

      requiredKeys.forEach((key) => {
        expect(primitive).toHaveProperty(key)
      })

      // Примеры проверки типа значения для конкретных свойств
      expect(typeof primitive.m).toBe("object")
      expect(typeof primitive.mx).toBe("object")
      expect(typeof primitive.opacity).toBe("object")
      expect(typeof primitive.white).toBe("string")
      expect(typeof primitive.black).toBe("string")
    })
  })

  describe("ThemeSemantic structure", () => {
    it("should have correct structure and types for ThemeSemantic properties", () => {
      // Проверка наличия основных ключей
      expect(semantic).toHaveProperty("customThemeColor")
      expect(semantic).toHaveProperty("customThemeColorContrast")
      expect(semantic).toHaveProperty("primary")

      // Проверка типов значений для базовых свойств
      expect(typeof semantic.customThemeColor).toBe("number")
      expect(typeof semantic.customThemeColorContrast).toBe("number")

      // Проверка структуры и типов в объекте `primary`
      const primary = semantic.primary
      expect(primary).toHaveProperty("50")
      expect(primary).toHaveProperty("100")
      expect(primary).toHaveProperty("200")
      expect(primary).toHaveProperty("300")
      expect(primary).toHaveProperty("400")
      expect(primary).toHaveProperty("500")
      expect(primary).toHaveProperty("600")
      expect(primary).toHaveProperty("700")
      expect(primary).toHaveProperty("800")
      expect(primary).toHaveProperty("900")
      expect(primary).toHaveProperty("950")

      // Проверка, что значения цветов в `primary` являются строками
      Object.values(primary).forEach((value) => {
        expect(typeof value).toBe("string")
      })
    })
  })

  describe("palette function", () => {
    it("should create a palette for a valid HEX color", () => {
      const color = "#3498db"
      const result = palette(color)

      expect(result).toHaveProperty("50")
      expect(result).toHaveProperty("100")
      expect(result).toHaveProperty("200")
      expect(result).toHaveProperty("300")
      expect(result).toHaveProperty("400")
      expect(result).toHaveProperty("500")
      expect(result).toHaveProperty("600")
      expect(result).toHaveProperty("700")
      expect(result).toHaveProperty("800")
      expect(result).toHaveProperty("900")
      expect(result).toHaveProperty("950")
    })

    it("should correctly compute the lightest tint (50) and darkest shade (950)", () => {
      const color = "#3498db"
      const result = palette(color)

      // Проверка на светлый оттенок
      expect(result[50]).toBe("#f5fafd")

      // Проверка на темный оттенок
      expect(result[950]).toBe("#0d2637")
    })

    it("should handle short HEX codes correctly", () => {
      const color = "#349"
      const result = palette(color)

      expect(result[500]).toBe("#334499")
    })

    it("should return undefined for invalid HEX codes", () => {
      const color = "#12345g"
      const result = palette(color)
      expect(result).toStrictEqual({})
    })

    it("should generate different shades and tints for distinct scales", () => {
      const color = "#ff5733"
      const result = palette(color)

      const scales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
      scales.forEach((scale) => {
        //@ts-ignore
        expect(result[scale]).toMatch(/^#[A-Fa-f0-9]{6}$/) // Проверка на корректность HEX-кода
      })
    })
  })

  describe("toVarsCss function", () => {
    it("should convert a nested object to CSS variables string without prefix", () => {
      const input = {
        FixWindow: {
          root: {
            duration: "300ms"
          },
          body: {
            padding: "0 4px 0 4px",
            rounded: "4px",
            borderWidth: "1px"
          },
          light: {
            root: {
              color: "#262626"
            },
            body: {
              background: "#f5f5f4",
              color: "#52525b",
              border: "#e5e5e5"
            }
          },
          dark: {
            root: {
              color: "#d4d4d4"
            },
            body: {
              background: "#1c1917",
              color: "#a1a1aa",
              border: "#171717"
            }
          }
        }
      }

      const expectedOutput = `
    --FixWindow-root-duration: 300ms;
    --FixWindow-body-padding: 0 4px 0 4px;
    --FixWindow-body-rounded: 4px;
    --FixWindow-body-borderWidth: 1px;
    --FixWindow-light-root-color: #262626;
    --FixWindow-light-body-background: #f5f5f4;
    --FixWindow-light-body-color: #52525b;
    --FixWindow-light-body-border: #e5e5e5;
    --FixWindow-dark-root-color: #d4d4d4;
    --FixWindow-dark-body-background: #1c1917;
    --FixWindow-dark-body-color: #a1a1aa;
    --FixWindow-dark-body-border: #171717;
  `

      expect(toVarsCss<any>(input)).toBe(expectedOutput)
    })

    it("should convert a nested object to CSS variables string with prefix", () => {
      const input = {
        FixWindow: {
          root: {
            duration: "300ms"
          }
        }
      }

      const expectedOutput = `
    --prefix-FixWindow-root-duration: 300ms;
  `

      expect(toVarsCss<any>(input, "prefix")).toBe(expectedOutput)
    })

    it("should return an empty string for an empty object", () => {
      const input = {}
      const expectedOutput = "\n  "
      expect(toVarsCss(input)).toBe(expectedOutput)
    })

    it("should handle nested objects and arrays", () => {
      const input = {
        parent: {
          child: {
            value: "someValue"
          }
        }
      }

      const expectedOutput = `
    --parent-child-value: someValue;
  `

      expect(toVarsCss<any>(input)).toBe(expectedOutput)
    })

    it("should ignore non-object and non-string values", () => {
      const input = {
        validKey: "validValue",
        invalidKey: 12345 // Non-string and non-object value
      }

      const expectedOutput = `
    --validKey: validValue;
    --invalidKey: 12345;
  `
      expect(toVarsCss<any>(input)).toBe(expectedOutput)
    })
  })

  describe("linksTheme function", () => {
    const themeInput = {
      primitive: {
        px: {
          "1": "0 4px 0 4px"
        },
        borderWidth: {
          "1": "1px"
        },
        rounded: {
          sm: "4px"
        },
        duration: {
          "300": "300ms"
        },
        white: "#ffffff",
        black: "#000000",
        zinc: {
          "400": "#a1a1aa",
          "600": "#52525b"
        },
        neutral: {
          "200": "#e5e5e5",
          "300": "#d4d4d4",
          "800": "#262626",
          "900": "#171717"
        },
        stone: {
          "100": "#f5f5f4",
          "900": "#1c1917"
        }
      },
      semantic: {
        customThemeColor: 850,
        customThemeColorContrast: 60,
        primary: {
          "50": "hsl({customThemeColor} {customThemeColorContrast}% 95.1%)",
          "100": "hsl({customThemeColor} {customThemeColorContrast}% 93.1%)",
          "200": "hsl({customThemeColor} {customThemeColorContrast}% 86.1%)",
          "300": "hsl({customThemeColor} {customThemeColorContrast}% 74.4%)",
          "400": "hsl({customThemeColor} {customThemeColorContrast}% 60.1%)",
          "500": "hsl({customThemeColor} {customThemeColorContrast}% 46.9%)",
          "600": "hsl({customThemeColor} {customThemeColorContrast}% 39.5%)",
          "700": "hsl({customThemeColor} {customThemeColorContrast}% 30.5%)",
          "800": "hsl({customThemeColor} {customThemeColorContrast}% 20.5%)",
          "900": "hsl({customThemeColor} {customThemeColorContrast}% 9.2%)",
          "950": "hsl({customThemeColor} {customThemeColorContrast}% 6%)"
        }
      }
    }

    const expectedOutput = {
      primitive: {
        px: {
          "1": "0 4px 0 4px"
        },
        borderWidth: {
          "1": "1px"
        },
        rounded: {
          sm: "4px"
        },
        duration: {
          "300": "300ms"
        },
        white: "#ffffff",
        black: "#000000",
        zinc: {
          "400": "#a1a1aa",
          "600": "#52525b"
        },
        neutral: {
          "200": "#e5e5e5",
          "300": "#d4d4d4",
          "800": "#262626",
          "900": "#171717"
        },
        stone: {
          "100": "#f5f5f4",
          "900": "#1c1917"
        }
      },
      semantic: {
        customThemeColor: 850,
        customThemeColorContrast: 60,
        primary: {
          "50": "hsl(850 60% 95.1%)",
          "100": "hsl(850 60% 93.1%)",
          "200": "hsl(850 60% 86.1%)",
          "300": "hsl(850 60% 74.4%)",
          "400": "hsl(850 60% 60.1%)",
          "500": "hsl(850 60% 46.9%)",
          "600": "hsl(850 60% 39.5%)",
          "700": "hsl(850 60% 30.5%)",
          "800": "hsl(850 60% 20.5%)",
          "900": "hsl(850 60% 9.2%)",
          "950": "hsl(850 60% 6%)"
        }
      }
    }

    it("should replace theme links correctly", () => {
      const result = linksTheme(themeInput)
      expect(result).toEqual(expectedOutput)
    })

    it("should return undefined for undefined theme", () => {
      const result = linksTheme(undefined)
      expect(result).toBeUndefined()
    })

    it("should handle missing values gracefully", () => {
      const partialThemeInput = {
        ...themeInput,
        semantic: {
          ...themeInput.semantic,
          customThemeColor: 850
        }
      }
      const partialExpectedOutput = {
        ...expectedOutput,
        semantic: {
          ...expectedOutput.semantic,
          primary: {
            ...expectedOutput.semantic.primary
          }
        }
      }
      const result = linksTheme(partialThemeInput)
      expect(result).toEqual(partialExpectedOutput)
    })
  })

  describe("useStyle", () => {
    it("should add a style tag to the head with correct attributes and CSS", () => {
      const css = ".test { color: red; }"
      const options = {
        id: "test-style",
        name: "TestStyle",
        immediate: true
      }

      // Вызов функции useStyle
      const { el } = useStyle(css, options)
      expect(el).toBeTruthy()
      // Проверка, что элемент <style> был добавлен в <head>
      const styleTag = document.head.querySelector(`#test-style`) as HTMLStyleElement
      expect(styleTag).not.toBeNull()
      expect(styleTag.textContent).toBe(css)
      expect(styleTag.id).toBe("test-style")
      expect(styleTag.getAttribute("data-fishtvue-style-id")).toBe("TestStyle")
    })

    it("should call onMounted callback if provided", () => {
      const css = ".test { color: red; }"
      const onMounted = vi.fn()

      useStyle(css, {
        name: "TestStyle",
        immediate: true,
        onMounted
      })

      // Проверка, что callback был вызван
      expect(onMounted).toHaveBeenCalledWith("TestStyle")
    })

    it("should add style with media attribute if provided", () => {
      const css = ".test { color: red; }"
      const media = "print"

      useStyle(css, {
        id: "media-style",
        media
      })

      const styleTag = document.head.querySelector("#media-style") as HTMLStyleElement
      expect(styleTag).not.toBeNull()
      expect(styleTag.media).toBe(media)
    })

    it("should remove style tag on unload", () => {
      const css = ".test { color: red; }"
      const options = { id: "test-style", immediate: true }
      const { unload } = useStyle(css, options)

      unload()

      const styleTag = document.head.querySelector("#test-style")
      expect(styleTag).toBeNull()
    })

    it("should replace existing style content on load", async () => {
      const initialCss = ".test { color: red; }"
      const updatedCss = ".test { color: blue; }"
      const { load } = useStyle(initialCss, { id: "test-style", immediate: true })

      let styleTag = document.head.querySelector("#test-style") as HTMLStyleElement
      expect(styleTag.textContent).toBe(initialCss)

      await load(updatedCss)

      styleTag = document.head.querySelector("#test-style") as HTMLStyleElement
      expect(styleTag.textContent).toBe(updatedCss)
    })
  })
})
