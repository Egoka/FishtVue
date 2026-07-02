import { describe, expect, it } from "vitest"
import { tailwind } from "fishtvue/theme"
import {
  baseBackdropFilter,
  baseFilter,
  baseScale,
  baseSkew,
  baseTransition,
  baseTranslate
} from "fishtvue/theme/unoStyle/unoStatic"
import {
  ALL_FRACTIONAL_VALUES,
  ALL_SIZE_VALUES,
  BREAKPOINTS,
  COMMON_SIZE_VALUES,
  FORM_STATES,
  FRACTIONAL_VALUES,
  generateBreakpointTests,
  generateFullColorTestSuite,
  generatePseudoClassTests,
  generatePseudoElementsWithContentTests,
  generateSizingTests,
  PSEUDO_ELEMENTS,
  PSEUDO_ELEMENTS_WITH_CONTENT,
  SPECIAL_SIZE_VALUES,
  STRUCTURAL_PSEUDO_CLASSES,
  USER_INTERACTION_STATES
} from "./test-helpers"

// ============================================
// ОСНОВНЫЕ ТЕСТЫ
// ============================================

describe("unoStyle", () => {
  describe("Special tests", () => {
    it("Not string", () => {
      // @ts-ignore
      expect(tailwind(42)).toBeUndefined()
    })

    it("Unknown class", () => {
      expect(tailwind("unknown-class-123")).toBeUndefined()
    })

    it("Empty string", () => {
      expect(tailwind("")).toBeUndefined()
    })
  })

  describe("Handling Hover, Focus, and Other States", () => {
    describe("Pseudo-classes", () => {
      describe("Hover, focus, and active", () => {
        it.each(generatePseudoClassTests(USER_INTERACTION_STATES))(
          `tailwind($classValue)`,
          ({ classValue, expected }) => {
            expect(tailwind(classValue)).toBe(expected)
          }
        )
      })

      describe("First, last, odd, and even", () => {
        it.each(generatePseudoClassTests(STRUCTURAL_PSEUDO_CLASSES))(
          `tailwind($classValue)`,
          ({ classValue, expected }) => {
            expect(tailwind(classValue)).toBe(expected)
          }
        )
      })

      describe("Form states", () => {
        it.each(generatePseudoClassTests(FORM_STATES))(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Styling based on parent state (group-{modifier})", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "group-hover:p-0", expected: ".group:hover .group-hover\\:p-0 {\n  padding: 0px;\n}" },
          { classValue: "group-focus:p-0", expected: ".group:focus .group-focus\\:p-0 {\n  padding: 0px;\n}" },
          {
            classValue: "group-hover/edit:p-0",
            expected: ".group\\/edit:hover .group-hover\\/edit\\:p-0 {\n  padding: 0px;\n}"
          },
          {
            classValue: "group-focus/edit:p-0",
            expected: ".group\\/edit:focus .group-focus\\/edit\\:p-0 {\n  padding: 0px;\n}"
          },
          {
            classValue: "group-[.is-published]:p-0",
            expected: ".group.is-published .group-\\[\\.is-published\\]\\:p-0 {\n  padding: 0px;\n}"
          },
          {
            classValue: "group-[:nth-of-type(3)_&]:p-0",
            expected: ":nth-of-type(3) .group .group-\\[\\:nth-of-type\\(3\\)_\\&\\]\\:p-0 {\n  padding: 0px;\n}"
          }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Styling based on sibling state (peer-{modifier})", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "peer-hover:p-0", expected: ".peer:hover ~ .peer-hover\\:p-0 {\n  padding: 0px;\n}" },
          { classValue: "peer-focus:p-0", expected: ".peer:focus ~ .peer-focus\\:p-0 {\n  padding: 0px;\n}" },
          {
            classValue: "peer-hover/edit:p-0",
            expected: ".peer\\/edit:hover ~ .peer-hover\\/edit\\:p-0 {\n  padding: 0px;\n}"
          },
          {
            classValue: "peer-focus/edit:p-0",
            expected: ".peer\\/edit:focus ~ .peer-focus\\/edit\\:p-0 {\n  padding: 0px;\n}"
          },
          {
            classValue: "peer-[.is-published]:p-0",
            expected: ".peer.is-published ~ .peer-\\[\\.is-published\\]\\:p-0 {\n  padding: 0px;\n}"
          },
          {
            classValue: "peer-[:nth-of-type(3)_&]:p-0",
            expected: ":nth-of-type(3) .peer ~ .peer-\\[\\:nth-of-type\\(3\\)_\\&\\]\\:p-0 {\n  padding: 0px;\n}"
          }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Styling direct children (*-{modifier})", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "*:p-0", expected: ".\\*\\:p-0 > * {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Styling based on descendants (has-{modifier})", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "has-[:checked]:p-0",
            expected: ".has-\\[\\:checked\\]\\:p-0:has(:checked) {\n  padding: 0px;\n}"
          },
          {
            classValue: "peer-has-[:checked]:p-0",
            expected: ".peer:has(:checked) ~ .peer-has-\\[\\:checked\\]\\:p-0 {\n  padding: 0px;\n}"
          }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
    })

    describe("Pseudo-elements", () => {
      it.each(generatePseudoElementsWithContentTests(PSEUDO_ELEMENTS_WITH_CONTENT))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each(generatePseudoClassTests(PSEUDO_ELEMENTS))(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Media and feature queries", () => {
      describe("Responsive breakpoints", () => {
        it.each(generateBreakpointTests(BREAKPOINTS))("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Targeting a breakpoint range", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "sm:max-2xl:p-0",
            expected:
              "@media (min-width: 640px) {\n@media not all and (min-width: 1536px) {\n.sm\\:max-2xl\\:p-0 {\n  padding: 0px;\n}\n}\n}"
          },
          {
            classValue: "md:max-2xl:p-0",
            expected:
              "@media (min-width: 768px) {\n@media not all and (min-width: 1536px) {\n.md\\:max-2xl\\:p-0 {\n  padding: 0px;\n}\n}\n}"
          },
          {
            classValue: "lg:max-2xl:p-0",
            expected:
              "@media (min-width: 1024px) {\n@media not all and (min-width: 1536px) {\n.lg\\:max-2xl\\:p-0 {\n  padding: 0px;\n}\n}\n}"
          },
          {
            classValue: "xl:max-2xl:p-0",
            expected:
              "@media (min-width: 1280px) {\n@media not all and (min-width: 1536px) {\n.xl\\:max-2xl\\:p-0 {\n  padding: 0px;\n}\n}\n}"
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Arbitrary values", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "min-[320px]:p-0",
            expected: "@media (min-width: 320px) {\n.min-\\[320px\\]\\:p-0 {\n  padding: 0px;\n}\n}"
          },
          {
            classValue: "max-[600px]:p-0",
            expected: "@media (max-width: 600px) {\n.max-\\[600px\\]\\:p-0 {\n  padding: 0px;\n}\n}"
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Prefers color scheme", () => {
        it.each([
          {
            classValue: "dark:p-0",
            expected: "@media (prefers-color-scheme: dark) {\n.dark\\:p-0 {\n  padding: 0px;\n}\n}"
          },
          {
            classValue: "dark:flex",
            expected: "@media (prefers-color-scheme: dark) {\n.dark\\:flex {\n  display: flex;\n}\n}"
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Prefers reduced motion", () => {
        const motionPreferences = [
          { modifier: "motion-reduce", query: "(prefers-reduced-motion: reduce)" },
          { modifier: "motion-safe", query: "(prefers-reduced-motion: no-preference)" },
          { modifier: "contrast-more", query: "(prefers-contrast: more)" },
          { modifier: "contrast-less", query: "(prefers-contrast: less)" }
        ]

        it.each(
          motionPreferences.map(({ modifier, query }) => ({
            classValue: `${modifier}:p-0`,
            expected: `@media ${query} {\n.${modifier}\\:p-0 {\n  padding: 0px;\n}\n}`
          }))
        )("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Forced colors mode", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "forced-colors:p-0",
            expected: "@media (forced-colors: active) {\n.forced-colors\\:p-0 {\n  padding: 0px;\n}\n}"
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Viewport orientation", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "portrait:p-0",
            expected: "@media (orientation: portrait) {\n.portrait\\:p-0 {\n  padding: 0px;\n}\n}"
          },
          {
            classValue: "landscape:p-0",
            expected: "@media (orientation: landscape) {\n.landscape\\:p-0 {\n  padding: 0px;\n}\n}"
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Print styles", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "print:p-0",
            expected: "@media print {\n.print\\:p-0 {\n  padding: 0px;\n}\n}"
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Supports rules", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "supports-[display:grid]:p-0",
            expected: "@supports (display:grid) {\n.supports-\\[display\\:grid\\]\\:p-0 {\n  padding: 0px;\n}\n}"
          },
          {
            classValue: "supports-[backdrop-filter]:bg-red-500/25",
            expected:
              "@supports (backdrop-filter) {\n.supports-\\[backdrop-filter\\]\\:bg-red-500\\/25 {\n  background-color: rgb(var(--fv-red-500, 239 68 68) / 0.25);\n}\n}"
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
    })

    describe("Attribute selectors", () => {
      describe("ARIA states", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "aria-busy:p-0", expected: `.aria-busy\\:p-0[aria-busy="true"] {\n  padding: 0px;\n}` },
          {
            classValue: "aria-checked:p-0",
            expected: `.aria-checked\\:p-0[aria-checked="true"] {\n  padding: 0px;\n}`
          },
          {
            classValue: "aria-disabled:p-0",
            expected: `.aria-disabled\\:p-0[aria-disabled="true"] {\n  padding: 0px;\n}`
          },
          {
            classValue: "aria-expanded:p-0",
            expected: `.aria-expanded\\:p-0[aria-expanded="true"] {\n  padding: 0px;\n}`
          },
          { classValue: "aria-hidden:p-0", expected: `.aria-hidden\\:p-0[aria-hidden="true"] {\n  padding: 0px;\n}` },
          {
            classValue: "aria-pressed:p-0",
            expected: `.aria-pressed\\:p-0[aria-pressed="true"] {\n  padding: 0px;\n}`
          },
          {
            classValue: "aria-readonly:p-0",
            expected: `.aria-readonly\\:p-0[aria-readonly="true"] {\n  padding: 0px;\n}`
          },
          {
            classValue: "aria-required:p-0",
            expected: `.aria-required\\:p-0[aria-required="true"] {\n  padding: 0px;\n}`
          },
          {
            classValue: "aria-selected:p-0",
            expected: `.aria-selected\\:p-0[aria-selected="true"] {\n  padding: 0px;\n}`
          },
          {
            classValue: "aria-[sort=ascending]:p-0",
            expected: `.aria-\\[sort\\=ascending\\]\\:p-0[aria-sort="ascending"] {\n  padding: 0px;\n}`
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Data attributes", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "data-[size=large]:p-0",
            expected: `.data-\\[size\\=large\\]\\:p-0[data-size="large"] {\n  padding: 0px;\n}`
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("RTL support", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "ltr:p-0", expected: `.ltr\\:p-0:where([dir="ltr"], [dir="ltr"] *) {\n  padding: 0px;\n}` },
          { classValue: "rtl:p-0", expected: `.rtl\\:p-0:where([dir="rtl"], [dir="rtl"] *) {\n  padding: 0px;\n}` }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })

      describe("Open/closed state", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "open:p-0", expected: `.open\\:p-0[open] {\n  padding: 0px;\n}` }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
    })

    describe("Arbitrary selectors", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "[&:nth-child(3)]:p-0",
          expected: `.\\[\\&\\:nth-child\\(3\\)\\]\\:p-0:nth-child(3) {\n  padding: 0px;\n}`
        },
        {
          classValue: "lg:[&:nth-child(3)]:hover:p-0",
          expected: `@media (min-width: 1024px) {\n.lg\\:\\[\\&\\:nth-child\\(3\\)\\]\\:hover\\:p-0:nth-child(3):hover {\n  padding: 0px;\n}\n}`
        },
        {
          classValue: "[&_p]:p-0",
          expected: `.\\[\\&_p\\]\\:p-0 p {\n  padding: 0px;\n}`
        }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Typography", () => {
    describe("Text Color", () => {
      it.each(generateFullColorTestSuite("text", "color"))(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each([
        {
          classValue: "text-red-400/0",
          expected: ".text-red-400\\/0 {\n  color: rgb(var(--fv-red-400, 248 113 113) / 0);\n}"
        },
        {
          classValue: "text-red-400/50",
          expected: ".text-red-400\\/50 {\n  color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        {
          classValue: "text-red-400/100",
          expected: ".text-red-400\\/100 {\n  color: rgb(var(--fv-red-400, 248 113 113));\n}"
        },
        {
          classValue: "text-red-400/[.06]",
          expected: ".text-red-400\\/\\[\\.06\\] {\n  color: rgb(var(--fv-red-400, 248 113 113) / 0.06);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Font Size", () => {
      const fontSizes = [
        { size: "xs", fontSize: "0.75rem", lineHeight: "1rem" },
        { size: "sm", fontSize: "0.875rem", lineHeight: "1.25rem" },
        { size: "base", fontSize: "1rem", lineHeight: "1.5rem" },
        { size: "lg", fontSize: "1.125rem", lineHeight: "1.75rem" },
        { size: "xl", fontSize: "1.25rem", lineHeight: "1.75rem" },
        { size: "2xl", fontSize: "1.5rem", lineHeight: "2rem" },
        { size: "3xl", fontSize: "1.875rem", lineHeight: "2.25rem" },
        { size: "4xl", fontSize: "2.25rem", lineHeight: "2.5rem" },
        { size: "5xl", fontSize: "3rem", lineHeight: "1" },
        { size: "6xl", fontSize: "3.75rem", lineHeight: "1" },
        { size: "7xl", fontSize: "4.5rem", lineHeight: "1" },
        { size: "8xl", fontSize: "6rem", lineHeight: "1" },
        { size: "9xl", fontSize: "8rem", lineHeight: "1" }
      ]

      it.each(
        fontSizes.map(({ size, fontSize, lineHeight }) => ({
          classValue: `text-${size}`,
          expected: `.text-${size} {\n  font-size: ${fontSize};\n  line-height: ${lineHeight};\n}`
        }))
      )(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each([
        { classValue: "text-[14px]", expected: ".text-\\[14px\\] {\n  font-size: 14px;\n}" },
        { classValue: "text-base/6", expected: ".text-base\\/6 {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}" },
        { classValue: "text-base/7", expected: ".text-base\\/7 {\n  font-size: 1rem;\n  line-height: 1.75rem;\n}" },
        {
          classValue: "text-base/loose",
          expected: ".text-base\\/loose {\n  font-size: 1rem;\n  line-height: 2;\n}"
        },
        {
          classValue: "text-base/[17px]",
          expected: ".text-base\\/\\[17px\\] {\n  font-size: 1rem;\n  line-height: 17px;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Font Weight", () => {
      const fontWeights = [
        { name: "thin", value: "100" },
        { name: "extralight", value: "200" },
        { name: "light", value: "300" },
        { name: "normal", value: "400" },
        { name: "medium", value: "500" },
        { name: "semibold", value: "600" },
        { name: "bold", value: "700" },
        { name: "extrabold", value: "800" },
        { name: "black", value: "900" }
      ]

      it.each(
        fontWeights.map(({ name, value }) => ({
          classValue: `font-${name}`,
          expected: `.font-${name} {\n  font-weight: ${value};\n}`
        }))
      )(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it("arbitrary font weight", () => {
        expect(tailwind("font-[1100]")).toBe(".font-\\[1100\\] {\n  font-weight: 1100;\n}")
      })
    })
  })

  describe("Layout", () => {
    describe("Aspect Ratio", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "aspect-auto", expected: ".aspect-auto {\n  aspect-ratio: auto;\n}" },
        { classValue: "aspect-square", expected: ".aspect-square {\n  aspect-ratio: 1 / 1;\n}" },
        { classValue: "aspect-video", expected: ".aspect-video {\n  aspect-ratio: 16 / 9;\n}" },
        { classValue: "aspect-[4/3]", expected: ".aspect-\\[4\\/3\\] {\n  aspect-ratio: 4/3;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Columns", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "columns-1", expected: ".columns-1 {\n  columns: 1;\n}" },
        { classValue: "columns-auto", expected: ".columns-auto {\n  columns: auto;\n}" },
        { classValue: "columns-3xs", expected: ".columns-3xs {\n  columns: 16rem;\n}" },
        { classValue: "columns-xs", expected: ".columns-xs {\n  columns: 20rem;\n}" },
        { classValue: "columns-xl", expected: ".columns-xl {\n  columns: 36rem;\n}" },
        { classValue: "columns-7xl", expected: ".columns-7xl {\n  columns: 80rem;\n}" },
        { classValue: "columns-[10rem]", expected: ".columns-\\[10rem\\] {\n  columns: 10rem;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Break After", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "break-after-auto",
          expected: ".break-after-auto {\n  break-after: auto;\n  -moz-column-break-after: auto;\n}"
        },
        {
          classValue: "break-after-avoid",
          expected: ".break-after-avoid {\n  break-after: avoid;\n  -moz-column-break-after: avoid;\n}"
        },
        {
          classValue: "break-after-all",
          expected: ".break-after-all {\n  break-after: all;\n  -moz-column-break-after: all;\n}"
        },
        {
          classValue: "break-after-avoid-page",
          expected: ".break-after-avoid-page {\n  break-after: avoid-page;\n  -moz-column-break-after: avoid-page;\n}"
        },
        {
          classValue: "break-after-page",
          expected: ".break-after-page {\n  break-after: page;\n  -moz-column-break-after: page;\n}"
        },
        {
          classValue: "break-after-left",
          expected: ".break-after-left {\n  break-after: left;\n  -moz-column-break-after: left;\n}"
        },
        {
          classValue: "break-after-right",
          expected: ".break-after-right {\n  break-after: right;\n  -moz-column-break-after: right;\n}"
        },
        {
          classValue: "break-after-column",
          expected: ".break-after-column {\n  break-after: column;\n  -moz-column-break-after: column;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Break Before", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "break-before-auto",
          expected: ".break-before-auto {\n  break-before: auto;\n  -moz-column-break-before: auto;\n}"
        },
        {
          classValue: "break-before-avoid",
          expected: ".break-before-avoid {\n  break-before: avoid;\n  -moz-column-break-before: avoid;\n}"
        },
        {
          classValue: "break-before-all",
          expected: ".break-before-all {\n  break-before: all;\n  -moz-column-break-before: all;\n}"
        },
        {
          classValue: "break-before-avoid-page",
          expected:
            ".break-before-avoid-page {\n  break-before: avoid-page;\n  -moz-column-break-before: avoid-page;\n}"
        },
        {
          classValue: "break-before-page",
          expected: ".break-before-page {\n  break-before: page;\n  -moz-column-break-before: page;\n}"
        },
        {
          classValue: "break-before-left",
          expected: ".break-before-left {\n  break-before: left;\n  -moz-column-break-before: left;\n}"
        },
        {
          classValue: "break-before-right",
          expected: ".break-before-right {\n  break-before: right;\n  -moz-column-break-before: right;\n}"
        },
        {
          classValue: "break-before-column",
          expected: ".break-before-column {\n  break-before: column;\n  -moz-column-break-before: column;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Break Inside", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "break-inside-auto",
          expected: ".break-inside-auto {\n  break-inside: auto;\n  -moz-column-break-inside: auto;\n}"
        },
        {
          classValue: "break-inside-avoid",
          expected: ".break-inside-avoid {\n  break-inside: avoid;\n  -moz-column-break-inside: avoid;\n}"
        },
        {
          classValue: "break-inside-avoid-page",
          expected:
            ".break-inside-avoid-page {\n  break-inside: avoid-page;\n  -moz-column-break-inside: avoid-page;\n}"
        },
        {
          classValue: "break-inside-avoid-column",
          expected:
            ".break-inside-avoid-column {\n  break-inside: avoid-column;\n  -moz-column-break-inside: avoid-column;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Box Decoration Break", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "box-decoration-clone",
          expected: ".box-decoration-clone {\n  -webkit-box-decoration-break: clone;\n  box-decoration-break: clone;\n}"
        },
        {
          classValue: "box-decoration-slice",
          expected: ".box-decoration-slice {\n  -webkit-box-decoration-break: slice;\n  box-decoration-break: slice;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Box Sizing", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "box-border", expected: ".box-border {\n  box-sizing: border-box;\n}" },
        { classValue: "box-content", expected: ".box-content {\n  box-sizing: content-box;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Display", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "block", expected: ".block {\n  display: block;\n}" },
        { classValue: "inline-block", expected: ".inline-block {\n  display: inline-block;\n}" },
        { classValue: "inline", expected: ".inline {\n  display: inline;\n}" },
        { classValue: "flex", expected: ".flex {\n  display: flex;\n}" },
        { classValue: "inline-flex", expected: ".inline-flex {\n  display: inline-flex;\n}" },
        { classValue: "table", expected: ".table {\n  display: table;\n}" },
        { classValue: "inline-table", expected: ".inline-table {\n  display: inline-table;\n}" },
        { classValue: "table-caption", expected: ".table-caption {\n  display: table-caption;\n}" },
        { classValue: "table-cell", expected: ".table-cell {\n  display: table-cell;\n}" },
        { classValue: "table-column", expected: ".table-column {\n  display: table-column;\n}" },
        { classValue: "table-column-group", expected: ".table-column-group {\n  display: table-column-group;\n}" },
        { classValue: "table-footer-group", expected: ".table-footer-group {\n  display: table-footer-group;\n}" },
        { classValue: "table-header-group", expected: ".table-header-group {\n  display: table-header-group;\n}" },
        { classValue: "table-row-group", expected: ".table-row-group {\n  display: table-row-group;\n}" },
        { classValue: "table-row", expected: ".table-row {\n  display: table-row;\n}" },
        { classValue: "flow-root", expected: ".flow-root {\n  display: flow-root;\n}" },
        { classValue: "grid", expected: ".grid {\n  display: grid;\n}" },
        { classValue: "inline-grid", expected: ".inline-grid {\n  display: inline-grid;\n}" },
        { classValue: "contents", expected: ".contents {\n  display: contents;\n}" },
        { classValue: "list-item", expected: ".list-item {\n  display: list-item;\n}" },
        { classValue: "hidden", expected: ".hidden {\n  display: none;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Floats", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "float-start", expected: ".float-start {\n  float: inline-start;\n}" },
        { classValue: "float-end", expected: ".float-end {\n  float: inline-end;\n}" },
        { classValue: "float-right", expected: ".float-right {\n  float: right;\n}" },
        { classValue: "float-left", expected: ".float-left {\n  float: left;\n}" },
        { classValue: "float-none", expected: ".float-none {\n  float: none;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Clear", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "clear-start", expected: ".clear-start {\n  clear: inline-start;\n}" },
        { classValue: "clear-end", expected: ".clear-end {\n  clear: inline-end;\n}" },
        { classValue: "clear-right", expected: ".clear-right {\n  clear: right;\n}" },
        { classValue: "clear-left", expected: ".clear-left {\n  clear: left;\n}" },
        { classValue: "clear-none", expected: ".clear-none {\n  clear: none;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Isolation", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "isolate", expected: ".isolate {\n  isolation: isolate;\n}" },
        { classValue: "isolation-auto", expected: ".isolation-auto {\n  isolation: auto;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Object Fit", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "object-contain", expected: ".object-contain {\n  object-fit: contain;\n}" },
        { classValue: "object-cover", expected: ".object-cover {\n  object-fit: cover;\n}" },
        { classValue: "object-fill", expected: ".object-fill {\n  object-fit: fill;\n}" },
        { classValue: "object-none", expected: ".object-none {\n  object-fit: none;\n}" },
        { classValue: "object-scale-down", expected: ".object-scale-down {\n  object-fit: scale-down;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Object Position", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "object-bottom", expected: ".object-bottom {\n  object-position: bottom;\n}" },
        { classValue: "object-center", expected: ".object-center {\n  object-position: center;\n}" },
        { classValue: "object-left", expected: ".object-left {\n  object-position: left;\n}" },
        { classValue: "object-left-bottom", expected: ".object-left-bottom {\n  object-position: left bottom;\n}" },
        { classValue: "object-left-top", expected: ".object-left-top {\n  object-position: left top;\n}" },
        { classValue: "object-right", expected: ".object-right {\n  object-position: right;\n}" },
        { classValue: "object-right-bottom", expected: ".object-right-bottom {\n  object-position: right bottom;\n}" },
        { classValue: "object-right-top", expected: ".object-right-top {\n  object-position: right top;\n}" },
        { classValue: "object-top", expected: ".object-top {\n  object-position: top;\n}" },
        {
          classValue: "object-[center_bottom]",
          expected: ".object-\\[center_bottom\\] {\n  object-position: center bottom;\n}"
        },
        { classValue: "object-[50%_50%]", expected: ".object-\\[50\\%_50\\%\\] {\n  object-position: 50% 50%;\n}" },
        {
          classValue: "object-[250px_125px]",
          expected: ".object-\\[250px_125px\\] {\n  object-position: 250px 125px;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Overflow", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "overflow-auto", expected: ".overflow-auto {\n  overflow: auto;\n}" },
        { classValue: "overflow-hidden", expected: ".overflow-hidden {\n  overflow: hidden;\n}" },
        { classValue: "overflow-clip", expected: ".overflow-clip {\n  overflow: clip;\n}" },
        { classValue: "overflow-visible", expected: ".overflow-visible {\n  overflow: visible;\n}" },
        { classValue: "overflow-scroll", expected: ".overflow-scroll {\n  overflow: scroll;\n}" },
        { classValue: "overflow-x-auto", expected: ".overflow-x-auto {\n  overflow-x: auto;\n}" },
        { classValue: "overflow-y-auto", expected: ".overflow-y-auto {\n  overflow-y: auto;\n}" },
        { classValue: "overflow-x-hidden", expected: ".overflow-x-hidden {\n  overflow-x: hidden;\n}" },
        { classValue: "overflow-y-hidden", expected: ".overflow-y-hidden {\n  overflow-y: hidden;\n}" },
        { classValue: "overflow-x-clip", expected: ".overflow-x-clip {\n  overflow-x: clip;\n}" },
        { classValue: "overflow-y-clip", expected: ".overflow-y-clip {\n  overflow-y: clip;\n}" },
        { classValue: "overflow-x-visible", expected: ".overflow-x-visible {\n  overflow-x: visible;\n}" },
        { classValue: "overflow-y-visible", expected: ".overflow-y-visible {\n  overflow-y: visible;\n}" },
        { classValue: "overflow-x-scroll", expected: ".overflow-x-scroll {\n  overflow-x: scroll;\n}" },
        { classValue: "overflow-y-scroll", expected: ".overflow-y-scroll {\n  overflow-y: scroll;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Overscroll Behavior", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "overscroll-auto", expected: ".overscroll-auto {\n  overscroll-behavior: auto;\n}" },
        { classValue: "overscroll-contain", expected: ".overscroll-contain {\n  overscroll-behavior: contain;\n}" },
        { classValue: "overscroll-none", expected: ".overscroll-none {\n  overscroll-behavior: none;\n}" },
        { classValue: "overscroll-y-auto", expected: ".overscroll-y-auto {\n  overscroll-behavior-y: auto;\n}" },
        {
          classValue: "overscroll-y-contain",
          expected: ".overscroll-y-contain {\n  overscroll-behavior-y: contain;\n}"
        },
        { classValue: "overscroll-y-none", expected: ".overscroll-y-none {\n  overscroll-behavior-y: none;\n}" },
        { classValue: "overscroll-x-auto", expected: ".overscroll-x-auto {\n  overscroll-behavior-x: auto;\n}" },
        {
          classValue: "overscroll-x-contain",
          expected: ".overscroll-x-contain {\n  overscroll-behavior-x: contain;\n}"
        },
        { classValue: "overscroll-x-none", expected: ".overscroll-x-none {\n  overscroll-behavior-x: none;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Position", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "static", expected: ".static {\n  position: static;\n}" },
        { classValue: "fixed", expected: ".fixed {\n  position: fixed;\n}" },
        { classValue: "absolute", expected: ".absolute {\n  position: absolute;\n}" },
        { classValue: "relative", expected: ".relative {\n  position: relative;\n}" },
        { classValue: "sticky", expected: ".sticky {\n  position: sticky;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Top / Right / Bottom / Left", () => {
      // inset с всеми значениями
      it.each(
        generateSizingTests("inset", "inset", [
          ...COMMON_SIZE_VALUES.slice(0, 5),
          ...FRACTIONAL_VALUES,
          ...SPECIAL_SIZE_VALUES.filter((v) => ["auto", "full"].includes(v.input))
        ])
      )("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      // start с всеми фракциями
      it.each(generateSizingTests("start", "inset-inline-start", FRACTIONAL_VALUES))(
        "tailwind($classValue)",
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      // end с всеми фракциями
      it.each(generateSizingTests("end", "inset-inline-end", FRACTIONAL_VALUES))(
        "tailwind($classValue)",
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      // top с всеми фракциями
      it.each(generateSizingTests("top", "top", FRACTIONAL_VALUES))(
        "tailwind($classValue)",
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      // right с всеми фракциями
      it.each(generateSizingTests("right", "right", FRACTIONAL_VALUES))(
        "tailwind($classValue)",
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      // bottom с всеми фракциями
      it.each(generateSizingTests("bottom", "bottom", FRACTIONAL_VALUES))(
        "tailwind($classValue)",
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      // left с всеми фракциями
      it.each(generateSizingTests("left", "left", FRACTIONAL_VALUES))(
        "tailwind($classValue)",
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        { classValue: "inset-x-0", expected: ".inset-x-0 {\n  left: 0px;\n  right: 0px;\n}" },
        { classValue: "inset-y-0", expected: ".inset-y-0 {\n  top: 0px;\n  bottom: 0px;\n}" },
        { classValue: "inset-x-px", expected: ".inset-x-px {\n  left: 1px;\n  right: 1px;\n}" },
        { classValue: "inset-y-px", expected: ".inset-y-px {\n  top: 1px;\n  bottom: 1px;\n}" },
        { classValue: "inset-x-0.5", expected: ".inset-x-0\\.5 {\n  left: 0.125rem;\n  right: 0.125rem;\n}" },
        { classValue: "inset-y-0.5", expected: ".inset-y-0\\.5 {\n  top: 0.125rem;\n  bottom: 0.125rem;\n}" },
        { classValue: "start-0", expected: ".start-0 {\n  inset-inline-start: 0px;\n}" },
        { classValue: "start-px", expected: ".start-px {\n  inset-inline-start: 1px;\n}" },
        { classValue: "start-0.5", expected: ".start-0\\.5 {\n  inset-inline-start: 0.125rem;\n}" },
        { classValue: "end-0", expected: ".end-0 {\n  inset-inline-end: 0px;\n}" },
        { classValue: "end-px", expected: ".end-px {\n  inset-inline-end: 1px;\n}" },
        { classValue: "end-0.5", expected: ".end-0\\.5 {\n  inset-inline-end: 0.125rem;\n}" },
        { classValue: "top-0", expected: ".top-0 {\n  top: 0px;\n}" },
        { classValue: "top-px", expected: ".top-px {\n  top: 1px;\n}" },
        { classValue: "top-0.5", expected: ".top-0\\.5 {\n  top: 0.125rem;\n}" },
        { classValue: "right-0", expected: ".right-0 {\n  right: 0px;\n}" },
        { classValue: "right-px", expected: ".right-px {\n  right: 1px;\n}" },
        { classValue: "right-0.5", expected: ".right-0\\.5 {\n  right: 0.125rem;\n}" },
        { classValue: "bottom-0", expected: ".bottom-0 {\n  bottom: 0px;\n}" },
        { classValue: "bottom-px", expected: ".bottom-px {\n  bottom: 1px;\n}" },
        { classValue: "bottom-0.5", expected: ".bottom-0\\.5 {\n  bottom: 0.125rem;\n}" },
        { classValue: "left-0", expected: ".left-0 {\n  left: 0px;\n}" },
        { classValue: "left-px", expected: ".left-px {\n  left: 1px;\n}" },
        { classValue: "left-0.5", expected: ".left-0\\.5 {\n  left: 0.125rem;\n}" },
        {
          classValue: "inset-x-1/2",
          expected: ".inset-x-1\\/2 {\n  left: calc(1 / 2 * 100%);\n  right: calc(1 / 2 * 100%);\n}"
        },
        { classValue: "inset-x-full", expected: ".inset-x-full {\n  left: 100%;\n  right: 100%;\n}" },
        {
          classValue: "inset-y-1/2",
          expected: ".inset-y-1\\/2 {\n  top: calc(1 / 2 * 100%);\n  bottom: calc(1 / 2 * 100%);\n}"
        },
        { classValue: "inset-y-full", expected: ".inset-y-full {\n  top: 100%;\n  bottom: 100%;\n}" },
        { classValue: "start-auto", expected: ".start-auto {\n  inset-inline-start: auto;\n}" },
        { classValue: "start-1/2", expected: ".start-1\\/2 {\n  inset-inline-start: calc(1 / 2 * 100%);\n}" },
        { classValue: "start-full", expected: ".start-full {\n  inset-inline-start: 100%;\n}" },
        { classValue: "end-auto", expected: ".end-auto {\n  inset-inline-end: auto;\n}" },
        { classValue: "end-1/2", expected: ".end-1\\/2 {\n  inset-inline-end: calc(1 / 2 * 100%);\n}" },
        { classValue: "end-full", expected: ".end-full {\n  inset-inline-end: 100%;\n}" },
        { classValue: "top-auto", expected: ".top-auto {\n  top: auto;\n}" },
        { classValue: "top-1/2", expected: ".top-1\\/2 {\n  top: calc(1 / 2 * 100%);\n}" },
        { classValue: "top-full", expected: ".top-full {\n  top: 100%;\n}" },
        { classValue: "right-auto", expected: ".right-auto {\n  right: auto;\n}" },
        { classValue: "right-1/2", expected: ".right-1\\/2 {\n  right: calc(1 / 2 * 100%);\n}" },
        { classValue: "right-full", expected: ".right-full {\n  right: 100%;\n}" },
        { classValue: "bottom-auto", expected: ".bottom-auto {\n  bottom: auto;\n}" },
        { classValue: "bottom-1/2", expected: ".bottom-1\\/2 {\n  bottom: calc(1 / 2 * 100%);\n}" },
        { classValue: "bottom-full", expected: ".bottom-full {\n  bottom: 100%;\n}" },
        { classValue: "left-auto", expected: ".left-auto {\n  left: auto;\n}" },
        { classValue: "left-1/2", expected: ".left-1\\/2 {\n  left: calc(1 / 2 * 100%);\n}" },
        { classValue: "left-full", expected: ".left-full {\n  left: 100%;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "inset-[3px]", expected: ".inset-\\[3px\\] {\n  inset: 3px;\n}" },
        { classValue: "inset-x-[3px]", expected: ".inset-x-\\[3px\\] {\n  left: 3px;\n  right: 3px;\n}" },
        { classValue: "inset-y-[3px]", expected: ".inset-y-\\[3px\\] {\n  top: 3px;\n  bottom: 3px;\n}" },
        { classValue: "start-[3px]", expected: ".start-\\[3px\\] {\n  inset-inline-start: 3px;\n}" },
        { classValue: "end-[3px]", expected: ".end-\\[3px\\] {\n  inset-inline-end: 3px;\n}" },
        { classValue: "top-[3px]", expected: ".top-\\[3px\\] {\n  top: 3px;\n}" },
        { classValue: "right-[3px]", expected: ".right-\\[3px\\] {\n  right: 3px;\n}" },
        { classValue: "bottom-[3px]", expected: ".bottom-\\[3px\\] {\n  bottom: 3px;\n}" },
        { classValue: "left-[3px]", expected: ".left-\\[3px\\] {\n  left: 3px;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Visibility", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "visible", expected: ".visible {\n  visibility: visible;\n}" },
        { classValue: "invisible", expected: ".invisible {\n  visibility: hidden;\n}" },
        { classValue: "collapse", expected: ".collapse {\n  visibility: collapse;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Z-Index", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "z-0", expected: ".z-0 {\n  z-index: 0;\n}" },
        { classValue: "z-10", expected: ".z-10 {\n  z-index: 10;\n}" },
        { classValue: "z-20", expected: ".z-20 {\n  z-index: 20;\n}" },
        { classValue: "z-30", expected: ".z-30 {\n  z-index: 30;\n}" },
        { classValue: "z-40", expected: ".z-40 {\n  z-index: 40;\n}" },
        { classValue: "z-50", expected: ".z-50 {\n  z-index: 50;\n}" },
        { classValue: "z-auto", expected: ".z-auto {\n  z-index: auto;\n}" },
        { classValue: "z-[100]", expected: ".z-\\[100\\] {\n  z-index: 100;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Flexbox & Grid", () => {
    describe("Flex Basis", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "basis-0", expected: ".basis-0 {\n  flex-basis: 0px;\n}" },
        { classValue: "basis-1", expected: ".basis-1 {\n  flex-basis: 0.25rem;\n}" },
        { classValue: "basis-auto", expected: ".basis-auto {\n  flex-basis: auto;\n}" },
        { classValue: "basis-px", expected: ".basis-px {\n  flex-basis: 1px;\n}" },
        { classValue: "basis-0.5", expected: ".basis-0\\.5 {\n  flex-basis: 0.125rem;\n}" },
        { classValue: "basis-1.5", expected: ".basis-1\\.5 {\n  flex-basis: 0.375rem;\n}" },
        { classValue: "basis-1/2", expected: ".basis-1\\/2 {\n  flex-basis: calc(1 / 2 * 100%);\n}" },
        { classValue: "basis-11/12", expected: ".basis-11\\/12 {\n  flex-basis: calc(11 / 12 * 100%);\n}" },
        { classValue: "basis-full", expected: ".basis-full {\n  flex-basis: 100%;\n}" },
        { classValue: "basis-[14.2857143%]", expected: ".basis-\\[14\\.2857143\\%\\] {\n  flex-basis: 14.2857143%;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Flex Direction", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "flex-row", expected: ".flex-row {\n  flex-direction: row;\n}" },
        { classValue: "flex-row-reverse", expected: ".flex-row-reverse {\n  flex-direction: row-reverse;\n}" },
        { classValue: "flex-col", expected: ".flex-col {\n  flex-direction: column;\n}" },
        { classValue: "flex-col-reverse", expected: ".flex-col-reverse {\n  flex-direction: column-reverse;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Flex Wrap", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "flex-wrap", expected: ".flex-wrap {\n  flex-wrap: wrap;\n}" },
        { classValue: "flex-wrap-reverse", expected: ".flex-wrap-reverse {\n  flex-wrap: wrap-reverse;\n}" },
        { classValue: "flex-nowrap", expected: ".flex-nowrap {\n  flex-wrap: nowrap;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Flex", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "flex-1", expected: ".flex-1 {\n  flex: 1 1 0%;\n}" },
        { classValue: "flex-auto", expected: ".flex-auto {\n  flex: 1 1 auto;\n}" },
        { classValue: "flex-initial", expected: ".flex-initial {\n  flex: 0 1 auto;\n}" },
        { classValue: "flex-none", expected: ".flex-none {\n  flex: none;\n}" },
        { classValue: "flex-[2_2_0%]", expected: ".flex-\\[2_2_0\\%\\] {\n  flex: 2 2 0%;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Flex Grow", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "grow", expected: ".grow {\n  flex-grow: 1;\n}" },
        { classValue: "grow-0", expected: ".grow-0 {\n  flex-grow: 0;\n}" },
        { classValue: "grow-[2]", expected: ".grow-\\[2\\] {\n  flex-grow: 2;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Flex Shrink", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "shrink", expected: ".shrink {\n  flex-shrink: 1;\n}" },
        { classValue: "shrink-0", expected: ".shrink-0 {\n  flex-shrink: 0;\n}" },
        { classValue: "shrink-[2]", expected: ".shrink-\\[2\\] {\n  flex-shrink: 2;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Order", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "order-1", expected: ".order-1 {\n  order: 1;\n}" },
        { classValue: "order-first", expected: ".order-first {\n  order: -9999;\n}" },
        { classValue: "order-last", expected: ".order-last {\n  order: 9999;\n}" },
        { classValue: "order-none", expected: ".order-none {\n  order: 0;\n}" },
        { classValue: "order-[13]", expected: ".order-\\[13\\] {\n  order: 13;\n}" },
        { classValue: "order-[-13]", expected: ".order-\\[-13\\] {\n  order: -13;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Grid Template Columns", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "grid-cols-1",
          expected: ".grid-cols-1 {\n  grid-template-columns: repeat(1, minmax(0, 1fr));\n}"
        },
        {
          classValue: "grid-cols-12",
          expected: ".grid-cols-12 {\n  grid-template-columns: repeat(12, minmax(0, 1fr));\n}"
        },
        { classValue: "grid-cols-none", expected: ".grid-cols-none {\n  grid-template-columns: none;\n}" },
        { classValue: "grid-cols-subgrid", expected: ".grid-cols-subgrid {\n  grid-template-columns: subgrid;\n}" },
        {
          classValue: "grid-cols-[200px_minmax(900px,_1fr)_100px]",
          expected:
            ".grid-cols-\\[200px_minmax\\(900px\\,_1fr\\)_100px\\] {\n  grid-template-columns: 200px minmax(900px, 1fr) 100px;\n}"
        }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Grid Column Start / End", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "col-auto", expected: ".col-auto {\n  grid-column: auto;\n}" },
        { classValue: "col-span-1", expected: ".col-span-1 {\n  grid-column: span 1 / span 1;\n}" },
        { classValue: "col-span-12", expected: ".col-span-12 {\n  grid-column: span 12 / span 12;\n}" },
        { classValue: "col-span-full", expected: ".col-span-full {\n  grid-column: 1 / -1;\n}" },
        { classValue: "col-start-1", expected: ".col-start-1 {\n  grid-column-start: 1;\n}" },
        { classValue: "col-start-auto", expected: ".col-start-auto {\n  grid-column-start: auto;\n}" },
        { classValue: "col-end-1", expected: ".col-end-1 {\n  grid-column-end: 1;\n}" },
        { classValue: "col-end-auto", expected: ".col-end-auto {\n  grid-column-end: auto;\n}" },
        { classValue: "col-[16_/_span_16]", expected: ".col-\\[16_\\/_span_16\\] {\n  grid-column: 16 / span 16;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Grid Template Rows", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "grid-rows-1", expected: ".grid-rows-1 {\n  grid-template-rows: repeat(1, minmax(0, 1fr));\n}" },
        {
          classValue: "grid-rows-12",
          expected: ".grid-rows-12 {\n  grid-template-rows: repeat(12, minmax(0, 1fr));\n}"
        },
        { classValue: "grid-rows-none", expected: ".grid-rows-none {\n  grid-template-rows: none;\n}" },
        { classValue: "grid-rows-subgrid", expected: ".grid-rows-subgrid {\n  grid-template-rows: subgrid;\n}" },
        {
          classValue: "grid-rows-[200px_minmax(900px,_1fr)_100px]",
          expected:
            ".grid-rows-\\[200px_minmax\\(900px\\,_1fr\\)_100px\\] {\n  grid-template-rows: 200px minmax(900px, 1fr) 100px;\n}"
        }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Grid Row Start / End", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "row-auto", expected: ".row-auto {\n  grid-row: auto;\n}" },
        { classValue: "row-span-1", expected: ".row-span-1 {\n  grid-row: span 1 / span 1;\n}" },
        { classValue: "row-span-12", expected: ".row-span-12 {\n  grid-row: span 12 / span 12;\n}" },
        { classValue: "row-span-full", expected: ".row-span-full {\n  grid-row: 1 / -1;\n}" },
        { classValue: "row-start-1", expected: ".row-start-1 {\n  grid-row-start: 1;\n}" },
        { classValue: "row-start-auto", expected: ".row-start-auto {\n  grid-row-start: auto;\n}" },
        { classValue: "row-end-1", expected: ".row-end-1 {\n  grid-row-end: 1;\n}" },
        { classValue: "row-end-auto", expected: ".row-end-auto {\n  grid-row-end: auto;\n}" },
        { classValue: "row-[16_/_span_16]", expected: ".row-\\[16_\\/_span_16\\] {\n  grid-row: 16 / span 16;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Grid Auto Flow", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "grid-flow-row", expected: ".grid-flow-row {\n  grid-auto-flow: row;\n}" },
        { classValue: "grid-flow-col", expected: ".grid-flow-col {\n  grid-auto-flow: column;\n}" },
        { classValue: "grid-flow-dense", expected: ".grid-flow-dense {\n  grid-auto-flow: dense;\n}" },
        { classValue: "grid-flow-row-dense", expected: ".grid-flow-row-dense {\n  grid-auto-flow: row dense;\n}" },
        { classValue: "grid-flow-col-dense", expected: ".grid-flow-col-dense {\n  grid-auto-flow: column dense;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Grid Auto Columns", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "auto-cols-auto", expected: ".auto-cols-auto {\n  grid-auto-columns: auto;\n}" },
        { classValue: "auto-cols-min", expected: ".auto-cols-min {\n  grid-auto-columns: min-content;\n}" },
        { classValue: "auto-cols-max", expected: ".auto-cols-max {\n  grid-auto-columns: max-content;\n}" },
        { classValue: "auto-cols-fr", expected: ".auto-cols-fr {\n  grid-auto-columns: minmax(0, 1fr);\n}" },
        {
          classValue: "auto-cols-[minmax(0,_2fr)]",
          expected: ".auto-cols-\\[minmax\\(0\\,_2fr\\)\\] {\n  grid-auto-columns: minmax(0, 2fr);\n}"
        }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Grid Auto Rows", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "auto-rows-auto", expected: ".auto-rows-auto {\n  grid-auto-rows: auto;\n}" },
        { classValue: "auto-rows-min", expected: ".auto-rows-min {\n  grid-auto-rows: min-content;\n}" },
        { classValue: "auto-rows-max", expected: ".auto-rows-max {\n  grid-auto-rows: max-content;\n}" },
        { classValue: "auto-rows-fr", expected: ".auto-rows-fr {\n  grid-auto-rows: minmax(0, 1fr);\n}" },
        {
          classValue: "auto-rows-[minmax(0,_2fr)]",
          expected: ".auto-rows-\\[minmax\\(0\\,_2fr\\)\\] {\n  grid-auto-rows: minmax(0, 2fr);\n}"
        }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Gap", () => {
      it.each(
        generateSizingTests("gap", "gap", [
          ...COMMON_SIZE_VALUES.slice(0, 4),
          { input: "[2.75rem]", output: "2.75rem" }
        ])
      )("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "gap-x-0", expected: ".gap-x-0 {\n  column-gap: 0px;\n}" },
        { classValue: "gap-y-0", expected: ".gap-y-0 {\n  row-gap: 0px;\n}" },
        { classValue: "gap-x-px", expected: ".gap-x-px {\n  column-gap: 1px;\n}" },
        { classValue: "gap-y-px", expected: ".gap-y-px {\n  row-gap: 1px;\n}" },
        { classValue: "gap-x-0.5", expected: ".gap-x-0\\.5 {\n  column-gap: 0.125rem;\n}" },
        { classValue: "gap-y-0.5", expected: ".gap-y-0\\.5 {\n  row-gap: 0.125rem;\n}" },
        { classValue: "gap-x-[2.75rem]", expected: ".gap-x-\\[2\\.75rem\\] {\n  column-gap: 2.75rem;\n}" },
        { classValue: "gap-y-[2.75rem]", expected: ".gap-y-\\[2\\.75rem\\] {\n  row-gap: 2.75rem;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Justify Content", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "justify-normal", expected: ".justify-normal {\n  justify-content: normal;\n}" },
        { classValue: "justify-start", expected: ".justify-start {\n  justify-content: flex-start;\n}" },
        { classValue: "justify-end", expected: ".justify-end {\n  justify-content: flex-end;\n}" },
        { classValue: "justify-center", expected: ".justify-center {\n  justify-content: center;\n}" },
        { classValue: "justify-between", expected: ".justify-between {\n  justify-content: space-between;\n}" },
        { classValue: "justify-around", expected: ".justify-around {\n  justify-content: space-around;\n}" },
        { classValue: "justify-evenly", expected: ".justify-evenly {\n  justify-content: space-evenly;\n}" },
        { classValue: "justify-stretch", expected: ".justify-stretch {\n  justify-content: stretch;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Justify Items", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "justify-items-start", expected: ".justify-items-start {\n  justify-items: start;\n}" },
        { classValue: "justify-items-end", expected: ".justify-items-end {\n  justify-items: end;\n}" },
        { classValue: "justify-items-center", expected: ".justify-items-center {\n  justify-items: center;\n}" },
        { classValue: "justify-items-stretch", expected: ".justify-items-stretch {\n  justify-items: stretch;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Justify Self", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "justify-self-auto", expected: ".justify-self-auto {\n  justify-self: auto;\n}" },
        { classValue: "justify-self-start", expected: ".justify-self-start {\n  justify-self: start;\n}" },
        { classValue: "justify-self-end", expected: ".justify-self-end {\n  justify-self: end;\n}" },
        { classValue: "justify-self-center", expected: ".justify-self-center {\n  justify-self: center;\n}" },
        { classValue: "justify-self-stretch", expected: ".justify-self-stretch {\n  justify-self: stretch;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Align Content", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "content-normal", expected: ".content-normal {\n  align-content: normal;\n}" },
        { classValue: "content-center", expected: ".content-center {\n  align-content: center;\n}" },
        { classValue: "content-start", expected: ".content-start {\n  align-content: flex-start;\n}" },
        { classValue: "content-end", expected: ".content-end {\n  align-content: flex-end;\n}" },
        { classValue: "content-between", expected: ".content-between {\n  align-content: space-between;\n}" },
        { classValue: "content-around", expected: ".content-around {\n  align-content: space-around;\n}" },
        { classValue: "content-evenly", expected: ".content-evenly {\n  align-content: space-evenly;\n}" },
        { classValue: "content-baseline", expected: ".content-baseline {\n  align-content: baseline;\n}" },
        { classValue: "content-stretch", expected: ".content-stretch {\n  align-content: stretch;\n}" },
        {
          classValue: "content-['*']",
          expected: ".content-\\[\\'\\*\\'\\] {\n  --fv-content: '*';\n  content: var(--fv-content);\n}"
        }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Align Items", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "items-start", expected: ".items-start {\n  align-items: start;\n}" },
        { classValue: "items-end", expected: ".items-end {\n  align-items: end;\n}" },
        { classValue: "items-center", expected: ".items-center {\n  align-items: center;\n}" },
        { classValue: "items-baseline", expected: ".items-baseline {\n  align-items: baseline;\n}" },
        { classValue: "items-stretch", expected: ".items-stretch {\n  align-items: stretch;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Align Self", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "self-auto", expected: ".self-auto {\n  align-self: auto;\n}" },
        { classValue: "self-start", expected: ".self-start {\n  align-self: flex-start;\n}" },
        { classValue: "self-end", expected: ".self-end {\n  align-self: flex-end;\n}" },
        { classValue: "self-center", expected: ".self-center {\n  align-self: center;\n}" },
        { classValue: "self-stretch", expected: ".self-stretch {\n  align-self: stretch;\n}" },
        { classValue: "self-baseline", expected: ".self-baseline {\n  align-self: baseline;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Place Content", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "place-content-center", expected: ".place-content-center {\n  place-content: center;\n}" },
        { classValue: "place-content-start", expected: ".place-content-start {\n  place-content: start;\n}" },
        { classValue: "place-content-end", expected: ".place-content-end {\n  place-content: end;\n}" },
        {
          classValue: "place-content-between",
          expected: ".place-content-between {\n  place-content: space-between;\n}"
        },
        { classValue: "place-content-around", expected: ".place-content-around {\n  place-content: space-around;\n}" },
        { classValue: "place-content-evenly", expected: ".place-content-evenly {\n  place-content: space-evenly;\n}" },
        { classValue: "place-content-baseline", expected: ".place-content-baseline {\n  place-content: baseline;\n}" },
        { classValue: "place-content-stretch", expected: ".place-content-stretch {\n  place-content: stretch;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Place Items", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "place-items-start", expected: ".place-items-start {\n  place-items: start;\n}" },
        { classValue: "place-items-end", expected: ".place-items-end {\n  place-items: end;\n}" },
        { classValue: "place-items-center", expected: ".place-items-center {\n  place-items: center;\n}" },
        { classValue: "place-items-baseline", expected: ".place-items-baseline {\n  place-items: baseline;\n}" },
        { classValue: "place-items-stretch", expected: ".place-items-stretch {\n  place-items: stretch;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Place Self", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "place-self-auto", expected: ".place-self-auto {\n  place-self: auto;\n}" },
        { classValue: "place-self-start", expected: ".place-self-start {\n  place-self: start;\n}" },
        { classValue: "place-self-end", expected: ".place-self-end {\n  place-self: end;\n}" },
        { classValue: "place-self-center", expected: ".place-self-center {\n  place-self: center;\n}" },
        { classValue: "place-self-stretch", expected: ".place-self-stretch {\n  place-self: stretch;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Spacing", () => {
    describe("Padding", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "p-0", expected: ".p-0 {\n  padding: 0px;\n}" },
        { classValue: "px-0", expected: ".px-0 {\n  padding-left: 0px;\n  padding-right: 0px;\n}" },
        { classValue: "py-0", expected: ".py-0 {\n  padding-top: 0px;\n  padding-bottom: 0px;\n}" },
        { classValue: "ps-0", expected: ".ps-0 {\n  padding-inline-start: 0px;\n}" },
        { classValue: "pe-0", expected: ".pe-0 {\n  padding-inline-end: 0px;\n}" },
        { classValue: "pt-0", expected: ".pt-0 {\n  padding-top: 0px;\n}" },
        { classValue: "pr-0", expected: ".pr-0 {\n  padding-right: 0px;\n}" },
        { classValue: "pb-0", expected: ".pb-0 {\n  padding-bottom: 0px;\n}" },
        { classValue: "pl-0", expected: ".pl-0 {\n  padding-left: 0px;\n}" },
        { classValue: "p-px", expected: ".p-px {\n  padding: 1px;\n}" },
        { classValue: "p-0.5", expected: ".p-0\\.5 {\n  padding: 0.125rem;\n}" },
        { classValue: "p-1", expected: ".p-1 {\n  padding: 0.25rem;\n}" },
        { classValue: "p-1.5", expected: ".p-1\\.5 {\n  padding: 0.375rem;\n}" },
        { classValue: "p-32", expected: ".p-32 {\n  padding: 8rem;\n}" },
        { classValue: "px-32", expected: ".px-32 {\n  padding-left: 8rem;\n  padding-right: 8rem;\n}" },
        { classValue: "px-[32rem]", expected: ".px-\\[32rem\\] {\n  padding-left: 32rem;\n  padding-right: 32rem;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Margin", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "m-0", expected: ".m-0 {\n  margin: 0px;\n}" },
        { classValue: "mx-0", expected: ".mx-0 {\n  margin-left: 0px;\n  margin-right: 0px;\n}" },
        { classValue: "my-0", expected: ".my-0 {\n  margin-top: 0px;\n  margin-bottom: 0px;\n}" },
        { classValue: "ms-0", expected: ".ms-0 {\n  margin-inline-start: 0px;\n}" },
        { classValue: "me-0", expected: ".me-0 {\n  margin-inline-end: 0px;\n}" },
        { classValue: "mt-0", expected: ".mt-0 {\n  margin-top: 0px;\n}" },
        { classValue: "mr-0", expected: ".mr-0 {\n  margin-right: 0px;\n}" },
        { classValue: "mb-0", expected: ".mb-0 {\n  margin-bottom: 0px;\n}" },
        { classValue: "ml-0", expected: ".ml-0 {\n  margin-left: 0px;\n}" },
        { classValue: "m-px", expected: ".m-px {\n  margin: 1px;\n}" },
        { classValue: "m-0.5", expected: ".m-0\\.5 {\n  margin: 0.125rem;\n}" },
        { classValue: "m-1", expected: ".m-1 {\n  margin: 0.25rem;\n}" },
        { classValue: "m-1.5", expected: ".m-1\\.5 {\n  margin: 0.375rem;\n}" },
        { classValue: "m-32", expected: ".m-32 {\n  margin: 8rem;\n}" },
        { classValue: "mx-32", expected: ".mx-32 {\n  margin-left: 8rem;\n  margin-right: 8rem;\n}" },
        { classValue: "m-auto", expected: ".m-auto {\n  margin: auto;\n}" },
        { classValue: "mx-auto", expected: ".mx-auto {\n  margin-left: auto;\n  margin-right: auto;\n}" },
        { classValue: "mx-[32rem]", expected: ".mx-\\[32rem\\] {\n  margin-left: 32rem;\n  margin-right: 32rem;\n}" },
        { classValue: "-m-px", expected: ".-m-px {\n  margin: calc(1px * -1);\n}" },
        {
          classValue: "-mx-[32rem]",
          expected: ".-mx-\\[32rem\\] {\n  margin-left: calc(32rem * -1);\n  margin-right: calc(32rem * -1);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Sizing", () => {
    describe("Width", () => {
      // Используем ALL_SIZE_VALUES для полного покрытия
      it.each(
        generateSizingTests("w", "width", [...ALL_SIZE_VALUES, ...ALL_FRACTIONAL_VALUES, ...SPECIAL_SIZE_VALUES])
      )(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "w-[96rem]", expected: ".w-\\[96rem\\] {\n  width: 96rem;\n}" },
        { classValue: "w-3xs", expected: ".w-3xs {\n  width: 16rem;\n}" },
        { classValue: "w-2xs", expected: ".w-2xs {\n  width: 18rem;\n}" },
        { classValue: "w-svw", expected: ".w-svw {\n  width: 100svw;\n}" },
        { classValue: "w-lvw", expected: ".w-lvw {\n  width: 100lvw;\n}" },
        { classValue: "w-dvw", expected: ".w-dvw {\n  width: 100dvw;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Height", () => {
      // Используем ALL_SIZE_VALUES для полного покрытия
      it.each(
        generateSizingTests("h", "height", [
          ...ALL_SIZE_VALUES,
          ...ALL_FRACTIONAL_VALUES,
          ...SPECIAL_SIZE_VALUES.filter((v) => v.input !== "screen"), // Исключаем screen
          { input: "screen", output: "100vh" } // Добавляем правильное значение для height
        ])
      )(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "h-[96rem]", expected: ".h-\\[96rem\\] {\n  height: 96rem;\n}" },
        { classValue: "h-svw", expected: ".h-svw {\n  height: 100svw;\n}" },
        { classValue: "h-svh", expected: ".h-svh {\n  height: 100svh;\n}" },
        { classValue: "h-lvw", expected: ".h-lvw {\n  height: 100lvw;\n}" },
        { classValue: "h-lvh", expected: ".h-lvh {\n  height: 100lvh;\n}" },
        { classValue: "h-dvw", expected: ".h-dvw {\n  height: 100dvw;\n}" },
        { classValue: "h-dvh", expected: ".h-dvh {\n  height: 100dvh;\n}" },
        {
          classValue: "h-(--custom-property)",
          expected: ".h-\\(--custom-property\\) {\n  height: var(--custom-property);\n}"
        },
        {
          classValue: "h-[calc(100vh-50px)]",
          expected: ".h-\\[calc\\(100vh-50px\\)\\] {\n  height: calc(100vh - 50px);\n}"
        },
        {
          classValue: "h-9/99",
          expected: ".h-9\\/99 {\n  height: calc(9 / 99 * 100%);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Min-Width", () => {
      it.each(generateSizingTests("min-w", "min-width", [...ALL_SIZE_VALUES, ...ALL_FRACTIONAL_VALUES]))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        { classValue: "min-w-full", expected: ".min-w-full {\n  min-width: 100%;\n}" },
        { classValue: "min-w-min", expected: ".min-w-min {\n  min-width: min-content;\n}" },
        { classValue: "min-w-max", expected: ".min-w-max {\n  min-width: max-content;\n}" },
        { classValue: "min-w-fit", expected: ".min-w-fit {\n  min-width: fit-content;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Max-Width", () => {
      it.each(
        generateSizingTests("max-w", "max-width", [
          ...ALL_SIZE_VALUES.slice(0, 10),
          ...ALL_FRACTIONAL_VALUES.slice(0, 6)
        ])
      )(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "max-w-none", expected: ".max-w-none {\n  max-width: none;\n}" },
        { classValue: "max-w-xs", expected: ".max-w-xs {\n  max-width: 20rem;\n}" },
        { classValue: "max-w-sm", expected: ".max-w-sm {\n  max-width: 24rem;\n}" },
        { classValue: "max-w-md", expected: ".max-w-md {\n  max-width: 28rem;\n}" },
        { classValue: "max-w-lg", expected: ".max-w-lg {\n  max-width: 32rem;\n}" },
        { classValue: "max-w-xl", expected: ".max-w-xl {\n  max-width: 36rem;\n}" },
        { classValue: "max-w-2xl", expected: ".max-w-2xl {\n  max-width: 42rem;\n}" },
        { classValue: "max-w-3xl", expected: ".max-w-3xl {\n  max-width: 48rem;\n}" },
        { classValue: "max-w-4xl", expected: ".max-w-4xl {\n  max-width: 56rem;\n}" },
        { classValue: "max-w-5xl", expected: ".max-w-5xl {\n  max-width: 64rem;\n}" },
        { classValue: "max-w-6xl", expected: ".max-w-6xl {\n  max-width: 72rem;\n}" },
        { classValue: "max-w-7xl", expected: ".max-w-7xl {\n  max-width: 80rem;\n}" },
        { classValue: "max-w-full", expected: ".max-w-full {\n  max-width: 100%;\n}" },
        { classValue: "max-w-prose", expected: ".max-w-prose {\n  max-width: 65ch;\n}" },
        { classValue: "max-w-screen-sm", expected: ".max-w-screen-sm {\n  max-width: 640px;\n}" },
        { classValue: "max-w-screen-md", expected: ".max-w-screen-md {\n  max-width: 768px;\n}" },
        { classValue: "max-w-screen-lg", expected: ".max-w-screen-lg {\n  max-width: 1024px;\n}" },
        { classValue: "max-w-screen-xl", expected: ".max-w-screen-xl {\n  max-width: 1280px;\n}" },
        { classValue: "max-w-screen-2xl", expected: ".max-w-screen-2xl {\n  max-width: 1536px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Min-Height", () => {
      it.each(generateSizingTests("min-h", "min-height", [...ALL_SIZE_VALUES, ...ALL_FRACTIONAL_VALUES]))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        { classValue: "min-h-full", expected: ".min-h-full {\n  min-height: 100%;\n}" },
        { classValue: "min-h-min", expected: ".min-h-min {\n  min-height: min-content;\n}" },
        { classValue: "min-h-max", expected: ".min-h-max {\n  min-height: max-content;\n}" },
        { classValue: "min-h-fit", expected: ".min-h-fit {\n  min-height: fit-content;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Max-Height", () => {
      it.each(
        generateSizingTests("max-h", "max-height", [
          ...ALL_SIZE_VALUES.slice(0, 10),
          ...ALL_FRACTIONAL_VALUES.slice(0, 6)
        ])
      )(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "max-h-none", expected: ".max-h-none {\n  max-height: none;\n}" },
        { classValue: "max-h-xs", expected: ".max-h-xs {\n  max-height: 20rem;\n}" },
        { classValue: "max-h-sm", expected: ".max-h-sm {\n  max-height: 24rem;\n}" },
        { classValue: "max-h-md", expected: ".max-h-md {\n  max-height: 28rem;\n}" },
        { classValue: "max-h-lg", expected: ".max-h-lg {\n  max-height: 32rem;\n}" },
        { classValue: "max-h-xl", expected: ".max-h-xl {\n  max-height: 36rem;\n}" },
        { classValue: "max-h-full", expected: ".max-h-full {\n  max-height: 100%;\n}" },
        { classValue: "max-h-screen", expected: ".max-h-screen {\n  max-height: 100vh;\n}" },
        { classValue: "max-h-prose", expected: ".max-h-prose {\n  max-height: 65ch;\n}" },
        { classValue: "max-h-screen-sm", expected: ".max-h-screen-sm {\n  max-height: 640px;\n}" },
        { classValue: "max-h-screen-md", expected: ".max-h-screen-md {\n  max-height: 768px;\n}" },
        { classValue: "max-h-screen-lg", expected: ".max-h-screen-lg {\n  max-height: 1024px;\n}" },
        { classValue: "max-h-screen-xl", expected: ".max-h-screen-xl {\n  max-height: 1280px;\n}" },
        { classValue: "max-h-screen-2xl", expected: ".max-h-screen-2xl {\n  max-height: 1536px;\n}" },
        { classValue: "max-h-min", expected: ".max-h-min {\n  max-height: min-content;\n}" },
        { classValue: "max-h-max", expected: ".max-h-max {\n  max-height: max-content;\n}" },
        { classValue: "max-h-fit", expected: ".max-h-fit {\n  max-height: fit-content;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Size", () => {
      // Size использует и width и height одновременно
      // Примечание: size НЕ поддерживает 'screen' в реализации (см. unoRules.ts:121)
      it.each(
        [
          ...ALL_SIZE_VALUES,
          ...ALL_FRACTIONAL_VALUES,
          ...SPECIAL_SIZE_VALUES.filter((v) => v.input !== "screen") // screen не поддерживается для size
        ].map(({ input, output }) => ({
          classValue: `size-${input}`,
          expected: `.size-${input.replace(/[^a-zA-Z0-9-_]/g, "\\$&")} {\n  width: ${output};\n  height: ${output};\n}`
        }))
      )(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "size-[14px]", expected: ".size-\\[14px\\] {\n  width: 14px;\n  height: 14px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Backgrounds", () => {
    describe("Background Color", () => {
      it.each(generateFullColorTestSuite("bg", "background-color"))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "bg-red-400/0",
          expected: ".bg-red-400\\/0 {\n  background-color: rgb(var(--fv-red-400, 248 113 113) / 0);\n}"
        },
        {
          classValue: "bg-red-400/50",
          expected: ".bg-red-400\\/50 {\n  background-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        {
          classValue: "bg-red-400/100",
          expected: ".bg-red-400\\/100 {\n  background-color: rgb(var(--fv-red-400, 248 113 113));\n}"
        },
        {
          classValue: "bg-red-400/[.06]",
          expected: ".bg-red-400\\/\\[\\.06\\] {\n  background-color: rgb(var(--fv-red-400, 248 113 113) / 0.06);\n}"
        },
        { classValue: "bg-[#50d71e]/25", expected: ".bg-\\[\\#50d71e\\]\\/25 {\n  background-color: #50d71e40;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Background Attachment", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-fixed", expected: ".bg-fixed {\n  background-attachment: fixed;\n}" },
        { classValue: "bg-local", expected: ".bg-local {\n  background-attachment: local;\n}" },
        { classValue: "bg-scroll", expected: ".bg-scroll {\n  background-attachment: scroll;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Background Clip", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-clip-border", expected: ".bg-clip-border {\n  background-clip: border-box;\n}" },
        { classValue: "bg-clip-padding", expected: ".bg-clip-padding {\n  background-clip: padding-box;\n}" },
        { classValue: "bg-clip-content", expected: ".bg-clip-content {\n  background-clip: content-box;\n}" },
        { classValue: "bg-clip-text", expected: ".bg-clip-text {\n  background-clip: text;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Background Origin", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-origin-border", expected: ".bg-origin-border {\n  background-origin: border-box;\n}" },
        { classValue: "bg-origin-padding", expected: ".bg-origin-padding {\n  background-origin: padding-box;\n}" },
        { classValue: "bg-origin-content", expected: ".bg-origin-content {\n  background-origin: content-box;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Background Position", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-bottom", expected: ".bg-bottom {\n  background-position: bottom;\n}" },
        { classValue: "bg-center", expected: ".bg-center {\n  background-position: center;\n}" },
        { classValue: "bg-left", expected: ".bg-left {\n  background-position: left;\n}" },
        { classValue: "bg-left-bottom", expected: ".bg-left-bottom {\n  background-position: left bottom;\n}" },
        { classValue: "bg-left-top", expected: ".bg-left-top {\n  background-position: left top;\n}" },
        { classValue: "bg-right", expected: ".bg-right {\n  background-position: right;\n}" },
        { classValue: "bg-right-bottom", expected: ".bg-right-bottom {\n  background-position: right bottom;\n}" },
        { classValue: "bg-right-top", expected: ".bg-right-top {\n  background-position: right top;\n}" },
        { classValue: "bg-top", expected: ".bg-top {\n  background-position: top;\n}" },
        {
          classValue: "bg-[center_top_1rem]",
          expected: ".bg-\\[center_top_1rem\\] {\n  background-position: center top 1rem;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Background Repeat", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-repeat", expected: ".bg-repeat {\n  background-repeat: repeat;\n}" },
        { classValue: "bg-no-repeat", expected: ".bg-no-repeat {\n  background-repeat: no-repeat;\n}" },
        { classValue: "bg-repeat-x", expected: ".bg-repeat-x {\n  background-repeat: repeat-x;\n}" },
        { classValue: "bg-repeat-y", expected: ".bg-repeat-y {\n  background-repeat: repeat-y;\n}" },
        { classValue: "bg-repeat-round", expected: ".bg-repeat-round {\n  background-repeat: round;\n}" },
        { classValue: "bg-repeat-space", expected: ".bg-repeat-space {\n  background-repeat: space;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Background Size", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-auto", expected: ".bg-auto {\n  background-size: auto;\n}" },
        { classValue: "bg-cover", expected: ".bg-cover {\n  background-size: cover;\n}" },
        { classValue: "bg-contain", expected: ".bg-contain {\n  background-size: contain;\n}" },
        { classValue: "bg-none", expected: ".bg-none {\n  background-image: none;\n}" },
        {
          classValue: "bg-[length:200px_100px]",
          expected: ".bg-\\[length\\:200px_100px\\] {\n  background-size: 200px 100px;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Background Image", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "bg-gradient-to-t",
          expected: ".bg-gradient-to-t {\n  background-image: linear-gradient(to top, var(--fv-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-tr",
          expected:
            ".bg-gradient-to-tr {\n  background-image: linear-gradient(to top right, var(--fv-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-r",
          expected: ".bg-gradient-to-r {\n  background-image: linear-gradient(to right, var(--fv-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-br",
          expected:
            ".bg-gradient-to-br {\n  background-image: linear-gradient(to bottom right, var(--fv-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-b",
          expected: ".bg-gradient-to-b {\n  background-image: linear-gradient(to bottom, var(--fv-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-bl",
          expected:
            ".bg-gradient-to-bl {\n  background-image: linear-gradient(to bottom left, var(--fv-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-l",
          expected: ".bg-gradient-to-l {\n  background-image: linear-gradient(to left, var(--fv-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-tl",
          expected:
            ".bg-gradient-to-tl {\n  background-image: linear-gradient(to top left, var(--fv-gradient-stops));\n}"
        },
        {
          classValue: "bg-[url('/img/hero-pattern.svg')]",
          expected:
            ".bg-\\[url\\(\\'\\/img\\/hero-pattern\\.svg\\'\\)\\] {\n  background-image: url('/img/hero-pattern.svg');\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Gradient Color Stops FROM", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "from-inherit",
          expected:
            ".from-inherit {\n  --fv-gradient-from: inherit var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "from-current",
          expected:
            ".from-current {\n  --fv-gradient-from: currentColor var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "from-transparent",
          expected:
            ".from-transparent {\n  --fv-gradient-from: transparent var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "from-black",
          expected:
            ".from-black {\n  --fv-gradient-from: #000000 var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "from-white",
          expected:
            ".from-white {\n  --fv-gradient-from: #ffffff var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "from-slate-50",
          expected:
            ".from-slate-50 {\n  --fv-gradient-from: rgb(var(--fv-slate-50, 248 250 252)) var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(var(--fv-slate-50, 248 250 252) / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "from-red-500",
          expected:
            ".from-red-500 {\n  --fv-gradient-from: rgb(var(--fv-red-500, 239 68 68)) var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(var(--fv-red-500, 239 68 68) / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "from-[#50d71e]",
          expected:
            ".from-\\[\\#50d71e\\] {\n  --fv-gradient-from: #50d71e var(--fv-gradient-from-position);\n  --fv-gradient-to: #50d71e00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "from-0%", expected: ".from-0\\% {\n  --fv-gradient-from-position: 0%;\n}" },
        { classValue: "from-100%", expected: ".from-100\\% {\n  --fv-gradient-from-position: 100%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "from-red-400/50",
          expected:
            ".from-red-400\\/50 {\n  --fv-gradient-from: rgb(var(--fv-red-400, 248 113 113) / 0.5) var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(var(--fv-red-400, 248 113 113) / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "from-[#50d71e]/25",
          expected:
            ".from-\\[\\#50d71e\\]\\/25 {\n  --fv-gradient-from: #50d71e40 var(--fv-gradient-from-position);\n  --fv-gradient-to: #50d71e00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Gradient Color Stops VIA", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "via-inherit",
          expected:
            ".via-inherit {\n  --fv-gradient-to: rgb(255 255 255 / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), inherit var(--fv-gradient-via-position), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "via-slate-50",
          expected:
            ".via-slate-50 {\n  --fv-gradient-to: rgb(var(--fv-slate-50, 248 250 252) / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), rgb(var(--fv-slate-50, 248 250 252)) var(--fv-gradient-via-position), var(--fv-gradient-to);\n}"
        },
        {
          classValue: "via-[#50d71e]",
          expected:
            ".via-\\[\\#50d71e\\] {\n  --fv-gradient-to: #50d71e00 var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), #50d71e var(--fv-gradient-via-position), var(--fv-gradient-to);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Gradient Color Stops TO", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "to-inherit",
          expected: ".to-inherit {\n  --fv-gradient-to: inherit var(--fv-gradient-to-position);\n}"
        },
        {
          classValue: "to-slate-50",
          expected:
            ".to-slate-50 {\n  --fv-gradient-to: rgb(var(--fv-slate-50, 248 250 252)) var(--fv-gradient-to-position);\n}"
        },
        {
          classValue: "to-[#50d71e]",
          expected: ".to-\\[\\#50d71e\\] {\n  --fv-gradient-to: #50d71e var(--fv-gradient-to-position);\n}"
        },
        { classValue: "to-0%", expected: ".to-0\\% {\n  --fv-gradient-to-position: 0%;\n}" },
        { classValue: "to-100%", expected: ".to-100\\% {\n  --fv-gradient-to-position: 100%;\n}" },
        {
          classValue: "to-red-400/50",
          expected:
            ".to-red-400\\/50 {\n  --fv-gradient-to: rgb(var(--fv-red-400, 248 113 113) / 0.5) var(--fv-gradient-to-position);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Typography", () => {
    describe("Font Family", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "font-sans",
          expected: `.font-sans {\n  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";\n}`
        },
        {
          classValue: "font-serif",
          expected: `.font-serif {\n  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;\n}`
        },
        {
          classValue: "font-mono",
          expected: `.font-mono {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;\n}`
        },
        { classValue: "font-['Open_Sans']", expected: `.font-\\[\\'Open_Sans\\'\\] {\n  font-family: 'Open Sans';\n}` },
        {
          classValue: "font-(family-name:--custom-property)",
          expected: `.font-\\(family-name\\:--custom-property\\) {\n  font-family: var(--custom-property);\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Font Style", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "italic", expected: ".italic {\n  font-style: italic;\n}" },
        { classValue: "not-italic", expected: ".not-italic {\n  font-style: normal;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Font Variant Numeric", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "normal-nums", expected: ".normal-nums {\n  font-variant-numeric: normal;\n}" },
        { classValue: "ordinal", expected: ".ordinal {\n  font-variant-numeric: ordinal;\n}" },
        { classValue: "slashed-zero", expected: ".slashed-zero {\n  font-variant-numeric: slashed-zero;\n}" },
        { classValue: "lining-nums", expected: ".lining-nums {\n  font-variant-numeric: lining-nums;\n}" },
        { classValue: "oldstyle-nums", expected: ".oldstyle-nums {\n  font-variant-numeric: oldstyle-nums;\n}" },
        {
          classValue: "proportional-nums",
          expected: ".proportional-nums {\n  font-variant-numeric: proportional-nums;\n}"
        },
        { classValue: "tabular-nums", expected: ".tabular-nums {\n  font-variant-numeric: tabular-nums;\n}" },
        {
          classValue: "diagonal-fractions",
          expected: ".diagonal-fractions {\n  font-variant-numeric: diagonal-fractions;\n}"
        },
        {
          classValue: "stacked-fractions",
          expected: ".stacked-fractions {\n  font-variant-numeric: stacked-fractions;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Letter Spacing", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "tracking-tighter", expected: ".tracking-tighter {\n  letter-spacing: -0.05em;\n}" },
        { classValue: "tracking-tight", expected: ".tracking-tight {\n  letter-spacing: -0.025em;\n}" },
        { classValue: "tracking-normal", expected: ".tracking-normal {\n  letter-spacing: 0em;\n}" },
        { classValue: "tracking-wide", expected: ".tracking-wide {\n  letter-spacing: 0.025em;\n}" },
        { classValue: "tracking-wider", expected: ".tracking-wider {\n  letter-spacing: 0.05em;\n}" },
        { classValue: "tracking-widest", expected: ".tracking-widest {\n  letter-spacing: 0.1em;\n}" },
        { classValue: "tracking-[.25em]", expected: ".tracking-\\[\\.25em\\] {\n  letter-spacing: .25em;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Line Clamp", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "line-clamp-1",
          expected:
            ".line-clamp-1 {\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 1;\n}"
        },
        {
          classValue: "line-clamp-6",
          expected:
            ".line-clamp-6 {\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 6;\n}"
        },
        {
          classValue: "line-clamp-none",
          expected:
            ".line-clamp-none {\n  overflow: visible;\n  display: block;\n  -webkit-box-orient: horizontal;\n  -webkit-line-clamp: none;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Line Height", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "leading-3", expected: ".leading-3 {\n  line-height: 0.75rem;\n}" },
        { classValue: "leading-none", expected: ".leading-none {\n  line-height: 1;\n}" },
        { classValue: "leading-tight", expected: ".leading-tight {\n  line-height: 1.25;\n}" },
        { classValue: "leading-snug", expected: ".leading-snug {\n  line-height: 1.375;\n}" },
        { classValue: "leading-normal", expected: ".leading-normal {\n  line-height: 1.5;\n}" },
        { classValue: "leading-relaxed", expected: ".leading-relaxed {\n  line-height: 1.625;\n}" },
        { classValue: "leading-loose", expected: ".leading-loose {\n  line-height: 2;\n}" },
        { classValue: "leading-[3rem]", expected: ".leading-\\[3rem\\] {\n  line-height: 3rem;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("List Style Image", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "list-image-none", expected: ".list-image-none {\n  list-style-image: none;\n}" },
        {
          classValue: "list-image-[url(checkmark.png)]",
          expected: ".list-image-\\[url\\(checkmark\\.png\\)\\] {\n  list-style-image: url(checkmark.png);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("List Style Position", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "list-inside", expected: ".list-inside {\n  list-style-position: inside;\n}" },
        { classValue: "list-outside", expected: ".list-outside {\n  list-style-position: outside;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("List Style Type", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "list-none", expected: ".list-none {\n  list-style-type: none;\n}" },
        { classValue: "list-disc", expected: ".list-disc {\n  list-style-type: disc;\n}" },
        { classValue: "list-decimal", expected: ".list-decimal {\n  list-style-type: decimal;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Align", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "text-left", expected: ".text-left {\n  text-align: left;\n}" },
        { classValue: "text-center", expected: ".text-center {\n  text-align: center;\n}" },
        { classValue: "text-right", expected: ".text-right {\n  text-align: right;\n}" },
        { classValue: "text-justify", expected: ".text-justify {\n  text-align: justify;\n}" },
        { classValue: "text-start", expected: ".text-start {\n  text-align: start;\n}" },
        { classValue: "text-end", expected: ".text-end {\n  text-align: end;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Decoration", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "underline", expected: ".underline {\n  text-decoration-line: underline;\n}" },
        { classValue: "overline", expected: ".overline {\n  text-decoration-line: overline;\n}" },
        { classValue: "line-through", expected: ".line-through {\n  text-decoration-line: line-through;\n}" },
        { classValue: "no-underline", expected: ".no-underline {\n  text-decoration-line: none;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Decoration Color", () => {
      it.each(generateFullColorTestSuite("decoration", "text-decoration-color"))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "decoration-red-400/0",
          expected: ".decoration-red-400\\/0 {\n  text-decoration-color: rgb(var(--fv-red-400, 248 113 113) / 0);\n}"
        },
        {
          classValue: "decoration-red-400/50",
          expected: ".decoration-red-400\\/50 {\n  text-decoration-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        {
          classValue: "decoration-red-400/100",
          expected: ".decoration-red-400\\/100 {\n  text-decoration-color: rgb(var(--fv-red-400, 248 113 113));\n}"
        },
        {
          classValue: "decoration-red-400/[.06]",
          expected:
            ".decoration-red-400\\/\\[\\.06\\] {\n  text-decoration-color: rgb(var(--fv-red-400, 248 113 113) / 0.06);\n}"
        },
        {
          classValue: "decoration-[#50d71e]/25",
          expected: ".decoration-\\[\\#50d71e\\]\\/25 {\n  text-decoration-color: #50d71e40;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Decoration Style", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "decoration-solid", expected: ".decoration-solid {\n  text-decoration-style: solid;\n}" },
        { classValue: "decoration-double", expected: ".decoration-double {\n  text-decoration-style: double;\n}" },
        { classValue: "decoration-dotted", expected: ".decoration-dotted {\n  text-decoration-style: dotted;\n}" },
        { classValue: "decoration-dashed", expected: ".decoration-dashed {\n  text-decoration-style: dashed;\n}" },
        { classValue: "decoration-wavy", expected: ".decoration-wavy {\n  text-decoration-style: wavy;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Decoration Thickness", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "decoration-auto", expected: ".decoration-auto {\n  text-decoration-thickness: auto;\n}" },
        {
          classValue: "decoration-from-font",
          expected: ".decoration-from-font {\n  text-decoration-thickness: from-font;\n}"
        },
        { classValue: "decoration-0", expected: ".decoration-0 {\n  text-decoration-thickness: 0px;\n}" },
        { classValue: "decoration-8", expected: ".decoration-8 {\n  text-decoration-thickness: 8px;\n}" },
        { classValue: "decoration-[3px]", expected: ".decoration-\\[3px\\] {\n  text-decoration-thickness: 3px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Underline Offset", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "underline-offset-auto",
          expected: ".underline-offset-auto {\n  text-underline-offset: auto;\n}"
        },
        { classValue: "underline-offset-0", expected: ".underline-offset-0 {\n  text-underline-offset: 0px;\n}" },
        { classValue: "underline-offset-8", expected: ".underline-offset-8 {\n  text-underline-offset: 8px;\n}" },
        {
          classValue: "underline-offset-[3px]",
          expected: ".underline-offset-\\[3px\\] {\n  text-underline-offset: 3px;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Transform", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "uppercase", expected: ".uppercase {\n  text-transform: uppercase;\n}" },
        { classValue: "lowercase", expected: ".lowercase {\n  text-transform: lowercase;\n}" },
        { classValue: "capitalize", expected: ".capitalize {\n  text-transform: capitalize;\n}" },
        { classValue: "normal-case", expected: ".normal-case {\n  text-transform: none;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Overflow", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "truncate",
          expected: ".truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}"
        },
        { classValue: "text-ellipsis", expected: ".text-ellipsis {\n  text-overflow: ellipsis;\n}" },
        { classValue: "text-clip", expected: ".text-clip {\n  text-overflow: clip;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Wrap", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "text-wrap", expected: ".text-wrap {\n  text-wrap: wrap;\n}" },
        { classValue: "text-nowrap", expected: ".text-nowrap {\n  text-wrap: nowrap;\n}" },
        { classValue: "text-balance", expected: ".text-balance {\n  text-wrap: balance;\n}" },
        { classValue: "text-pretty", expected: ".text-pretty {\n  text-wrap: pretty;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Text Indent", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "indent-0", expected: ".indent-0 {\n  text-indent: 0px;\n}" },
        { classValue: "indent-px", expected: ".indent-px {\n  text-indent: 1px;\n}" },
        { classValue: "indent-0.5", expected: ".indent-0\\.5 {\n  text-indent: 0.125rem;\n}" },
        { classValue: "indent-1", expected: ".indent-1 {\n  text-indent: 0.25rem;\n}" },
        { classValue: "indent-96", expected: ".indent-96 {\n  text-indent: 24rem;\n}" },
        { classValue: "indent-[50%]", expected: ".indent-\\[50\\%\\] {\n  text-indent: 50%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Vertical Align", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "align-baseline", expected: ".align-baseline {\n  vertical-align: baseline;\n}" },
        { classValue: "align-top", expected: ".align-top {\n  vertical-align: top;\n}" },
        { classValue: "align-middle", expected: ".align-middle {\n  vertical-align: middle;\n}" },
        { classValue: "align-bottom", expected: ".align-bottom {\n  vertical-align: bottom;\n}" },
        { classValue: "align-text-top", expected: ".align-text-top {\n  vertical-align: text-top;\n}" },
        { classValue: "align-sub", expected: ".align-sub {\n  vertical-align: sub;\n}" },
        { classValue: "align-super", expected: ".align-super {\n  vertical-align: super;\n}" },
        { classValue: "align-[4px]", expected: ".align-\\[4px\\] {\n  vertical-align: 4px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Whitespace", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "whitespace-normal", expected: ".whitespace-normal {\n  white-space: normal;\n}" },
        { classValue: "whitespace-nowrap", expected: ".whitespace-nowrap {\n  white-space: nowrap;\n}" },
        { classValue: "whitespace-pre", expected: ".whitespace-pre {\n  white-space: pre;\n}" },
        { classValue: "whitespace-pre-line", expected: ".whitespace-pre-line {\n  white-space: pre-line;\n}" },
        { classValue: "whitespace-pre-wrap", expected: ".whitespace-pre-wrap {\n  white-space: pre-wrap;\n}" },
        {
          classValue: "whitespace-break-spaces",
          expected: ".whitespace-break-spaces {\n  white-space: break-spaces;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Word Break", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "break-normal", expected: ".break-normal {\n  overflow-wrap: normal;\n  word-break: normal;\n}" },
        { classValue: "break-words", expected: ".break-words {\n  overflow-wrap: break-word;\n}" },
        { classValue: "break-all", expected: ".break-all {\n  word-break: break-all;\n}" },
        { classValue: "break-keep", expected: ".break-keep {\n  word-break: keep-all;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Hyphens", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "hyphens-none", expected: ".hyphens-none {\n  hyphens: none;\n}" },
        { classValue: "hyphens-manual", expected: ".hyphens-manual {\n  hyphens: manual;\n}" },
        { classValue: "hyphens-auto", expected: ".hyphens-auto {\n  hyphens: auto;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Borders", () => {
    describe("Border Radius", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "rounded-none", expected: ".rounded-none {\n  border-radius: 0px;\n}" },
        { classValue: "rounded-sm", expected: ".rounded-sm {\n  border-radius: 0.125rem;\n}" },
        { classValue: "rounded", expected: ".rounded {\n  border-radius: 0.25rem;\n}" },
        {
          classValue: "rounded-s-md",
          expected: ".rounded-s-md {\n  border-start-start-radius: 0.375rem;\n  border-end-start-radius: 0.375rem;\n}"
        },
        {
          classValue: "rounded-t-xl",
          expected: ".rounded-t-xl {\n  border-top-left-radius: 0.75rem;\n  border-top-right-radius: 0.75rem;\n}"
        },
        {
          classValue: "rounded-l-full",
          expected: ".rounded-l-full {\n  border-top-left-radius: 9999px;\n  border-bottom-left-radius: 9999px;\n}"
        },
        { classValue: "rounded-ss-none", expected: ".rounded-ss-none {\n  border-start-start-radius: 0px;\n}" },
        { classValue: "rounded-tl-xl", expected: ".rounded-tl-xl {\n  border-top-left-radius: 0.75rem;\n}" },
        { classValue: "rounded-[12px]", expected: ".rounded-\\[12px\\] {\n  border-radius: 12px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Divide Width", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "divide-x",
          expected:
            ".divide-x > :not([hidden]) ~ :not([hidden]) {\n  --fv-divide-x-reverse: 0;\n  border-right-width: calc(1px* var(--fv-divide-x-reverse));\n  border-left-width: calc(1px* calc(1 - var(--fv-divide-x-reverse)));\n}"
        },
        {
          classValue: "divide-y",
          expected:
            ".divide-y > :not([hidden]) ~ :not([hidden]) {\n  --fv-divide-y-reverse: 0;\n  border-top-width: calc(1px* calc(1 - var(--fv-divide-y-reverse)));\n  border-bottom-width: calc(1px* var(--fv-divide-y-reverse));\n}"
        },
        {
          classValue: "divide-x-reverse",
          expected: ".divide-x-reverse > :not([hidden]) ~ :not([hidden]) {\n  --fv-divide-x-reverse: 1;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Divide Color", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "divide-inherit",
          expected: ".divide-inherit > :not([hidden]) ~ :not([hidden]) {\n  border-color: inherit;\n}"
        },
        {
          classValue: "divide-black",
          expected: ".divide-black > :not([hidden]) ~ :not([hidden]) {\n  border-color: #000000;\n}"
        },
        {
          classValue: "divide-slate-50",
          expected:
            ".divide-slate-50 > :not([hidden]) ~ :not([hidden]) {\n  border-color: rgb(var(--fv-slate-50, 248 250 252));\n}"
        },
        {
          classValue: "divide-red-400/50",
          expected:
            ".divide-red-400\\/50 > :not([hidden]) ~ :not([hidden]) {\n  border-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Divide Style", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "divide-solid",
          expected: ".divide-solid > :not([hidden]) ~ :not([hidden]) {\n  border-style: solid;\n}"
        },
        {
          classValue: "divide-dashed",
          expected: ".divide-dashed > :not([hidden]) ~ :not([hidden]) {\n  border-style: dashed;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Border Width", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "border-0", expected: ".border-0 {\n  border-width: 0px;\n}" },
        { classValue: "border", expected: ".border {\n  border-width: 1px;\n}" },
        { classValue: "border-2", expected: ".border-2 {\n  border-width: 2px;\n}" },
        {
          classValue: "border-x-4",
          expected: ".border-x-4 {\n  border-left-width: 4px;\n  border-right-width: 4px;\n}"
        },
        {
          classValue: "border-y-8",
          expected: ".border-y-8 {\n  border-top-width: 8px;\n  border-bottom-width: 8px;\n}"
        },
        { classValue: "border-t-2", expected: ".border-t-2 {\n  border-top-width: 2px;\n}" },
        { classValue: "border-[12px]", expected: ".border-\\[12px\\] {\n  border-width: 12px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Border Color", () => {
      it.each(generateFullColorTestSuite("border", "border-color"))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "border-red-400/0",
          expected: ".border-red-400\\/0 {\n  border-color: rgb(var(--fv-red-400, 248 113 113) / 0);\n}"
        },
        {
          classValue: "border-red-400/50",
          expected: ".border-red-400\\/50 {\n  border-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        {
          classValue: "border-[#50d71e]/25",
          expected: ".border-\\[\\#50d71e\\]\\/25 {\n  border-color: #50d71e40;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Border Style", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "border-solid", expected: ".border-solid {\n  border-style: solid;\n}" },
        { classValue: "border-dashed", expected: ".border-dashed {\n  border-style: dashed;\n}" },
        { classValue: "border-dotted", expected: ".border-dotted {\n  border-style: dotted;\n}" },
        { classValue: "border-double", expected: ".border-double {\n  border-style: double;\n}" },
        { classValue: "border-hidden", expected: ".border-hidden {\n  border-style: hidden;\n}" },
        { classValue: "border-none", expected: ".border-none {\n  border-style: none;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Outline Width", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "outline-0", expected: ".outline-0 {\n  outline-width: 0px;\n}" },
        { classValue: "outline-1", expected: ".outline-1 {\n  outline-width: 1px;\n}" },
        { classValue: "outline-2", expected: ".outline-2 {\n  outline-width: 2px;\n}" },
        { classValue: "outline-[5px]", expected: ".outline-\\[5px\\] {\n  outline-width: 5px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Outline Color", () => {
      it.each(generateFullColorTestSuite("outline", "outline-color"))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "outline-red-400/50",
          expected: ".outline-red-400\\/50 {\n  outline-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        {
          classValue: "outline-[#50d71e]/25",
          expected: ".outline-\\[\\#50d71e\\]\\/25 {\n  outline-color: #50d71e40;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Outline Offset", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "outline-offset-0", expected: ".outline-offset-0 {\n  outline-offset: 0px;\n}" },
        { classValue: "outline-offset-[3px]", expected: ".outline-offset-\\[3px\\] {\n  outline-offset: 3px;\n}" },
        {
          classValue: "outline-offset-(--custom-property)",
          expected: ".outline-offset-\\(--custom-property\\) {\n  outline-offset: var(--custom-property);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Outline Style", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "outline-none",
          expected: ".outline-none {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}"
        },
        { classValue: "outline", expected: ".outline {\n  outline-style: solid;\n}" },
        { classValue: "outline-dashed", expected: ".outline-dashed {\n  outline-style: dashed;\n}" },
        { classValue: "outline-dotted", expected: ".outline-dotted {\n  outline-style: dotted;\n}" },
        { classValue: "outline-double", expected: ".outline-double {\n  outline-style: double;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Ring Width", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "ring-0",
          expected:
            ".ring-0 {\n  --fv-ring-offset-shadow: var(--fv-ring-inset) 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color);\n  --fv-ring-shadow: var(--fv-ring-inset) 0 0 0 calc(0px + var(--fv-ring-offset-width)) var(--fv-ring-color);\n  box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow, 0 0 #0000);\n}"
        },
        {
          classValue: "ring",
          expected:
            ".ring {\n  box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow, 0 0 #0000);\n}"
        },
        { classValue: "ring-inset", expected: ".ring-inset {\n  --fv-ring-inset: inset;\n}" },
        {
          classValue: "ring-[10px]",
          expected:
            ".ring-\\[10px\\] {\n  --fv-ring-offset-shadow: var(--fv-ring-inset) 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color);\n  --fv-ring-shadow: var(--fv-ring-inset) 0 0 0 calc(10px + var(--fv-ring-offset-width)) var(--fv-ring-color);\n  box-shadow: var(--fv-ring-offset-shadow), var(--fv-ring-shadow), var(--fv-shadow, 0 0 #0000);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Ring Color", () => {
      it.each(generateFullColorTestSuite("ring", "--fv-ring-color"))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "ring-red-400/50",
          expected: ".ring-red-400\\/50 {\n  --fv-ring-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        { classValue: "ring-[#50d71e]/25", expected: ".ring-\\[\\#50d71e\\]\\/25 {\n  --fv-ring-color: #50d71e40;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Ring Offset Width", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "ring-offset-0",
          expected:
            ".ring-offset-0 {\n  --fv-ring-offset-width: 0px;\n  box-shadow: 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color), var(--fv-ring-shadow);\n}"
        },
        { classValue: "ring-offset-[3px]", expected: ".ring-offset-\\[3px\\] {\n  --fv-ring-offset-width: 3px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Ring Offset Color", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "ring-offset-slate-50",
          expected:
            ".ring-offset-slate-50 {\n  --fv-ring-offset-color: rgb(var(--fv-slate-50, 248 250 252));\n  box-shadow: 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color), var(--fv-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-red-400/50",
          expected:
            ".ring-offset-red-400\\/50 {\n  --fv-ring-offset-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n  box-shadow: 0 0 0 var(--fv-ring-offset-width) var(--fv-ring-offset-color), var(--fv-ring-shadow);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Effects", () => {
    describe("Box Shadow", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "shadow-sm", expected: ".shadow-sm {\n  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n}" },
        {
          classValue: "shadow",
          expected: ".shadow {\n  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n}"
        },
        {
          classValue: "shadow-md",
          expected: ".shadow-md {\n  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);\n}"
        },
        {
          classValue: "shadow-lg",
          expected: ".shadow-lg {\n  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n}"
        },
        { classValue: "shadow-none", expected: ".shadow-none {\n  box-shadow: 0 0 #0000;\n}" },
        {
          classValue: "shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]",
          expected:
            ".shadow-\\[0_35px_60px_-15px_rgba\\(0\\,0\\,0\\,0\\.3\\)\\] {\n  --fv-shadow: 0 35px 60px -15px rgba(0,0,0,0.3);\n  --fv-shadow-colored: 0 35px 60px -15px var(--fv-shadow-color);\n  box-shadow: var(--fv-ring-offset-shadow, 0 0 #0000), var(--fv-ring-shadow, 0 0 #0000), var(--fv-shadow);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Box Shadow Color", () => {
      it.each(generateFullColorTestSuite("shadow", "--fv-shadow-color"))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "shadow-red-400/50",
          expected: ".shadow-red-400\\/50 {\n  --fv-shadow-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        {
          classValue: "shadow-[#50d71e]/25",
          expected: ".shadow-\\[\\#50d71e\\]\\/25 {\n  --fv-shadow-color: #50d71e40;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Opacity", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "opacity-0", expected: ".opacity-0 {\n  opacity: 0;\n}" },
        { classValue: "opacity-95", expected: ".opacity-95 {\n  opacity: 0.95;\n}" },
        { classValue: "opacity-100", expected: ".opacity-100 {\n  opacity: 1;\n}" },
        { classValue: "opacity-[.67]", expected: ".opacity-\\[\\.67\\] {\n  opacity: 0.67;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Mix Blend Mode", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "mix-blend-normal", expected: ".mix-blend-normal {\n  mix-blend-mode: normal;\n}" },
        { classValue: "mix-blend-multiply", expected: ".mix-blend-multiply {\n  mix-blend-mode: multiply;\n}" },
        { classValue: "mix-blend-screen", expected: ".mix-blend-screen {\n  mix-blend-mode: screen;\n}" },
        { classValue: "mix-blend-overlay", expected: ".mix-blend-overlay {\n  mix-blend-mode: overlay;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Background Blend Mode", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-blend-normal", expected: ".bg-blend-normal {\n  background-blend-mode: normal;\n}" },
        { classValue: "bg-blend-multiply", expected: ".bg-blend-multiply {\n  background-blend-mode: multiply;\n}" },
        { classValue: "bg-blend-screen", expected: ".bg-blend-screen {\n  background-blend-mode: screen;\n}" },
        { classValue: "bg-blend-overlay", expected: ".bg-blend-overlay {\n  background-blend-mode: overlay;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Filters", () => {
    describe("Blur", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "blur-none",
          expected: `.blur-none {\n  --fv-blur: ;\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-sm",
          expected: `.blur-sm {\n  --fv-blur: blur(4px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur",
          expected: `.blur {\n  --fv-blur: blur(8px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-[2px]",
          expected: `.blur-\\[2px\\] {\n  --fv-blur: blur(2px);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Brightness", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "brightness-0",
          expected: `.brightness-0 {\n  --fv-brightness: brightness(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "brightness-50",
          expected: `.brightness-50 {\n  --fv-brightness: brightness(0.5);\n  ${baseFilter}\n}`
        },
        {
          classValue: "brightness-[1.75]",
          expected: `.brightness-\\[1\\.75\\] {\n  --fv-brightness: brightness(1.75);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Contrast", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "contrast-0",
          expected: `.contrast-0 {\n  --fv-contrast: contrast(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "contrast-[.25]",
          expected: `.contrast-\\[\\.25\\] {\n  --fv-contrast: contrast(.25);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Drop Shadow", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "drop-shadow-sm",
          expected: `.drop-shadow-sm {\n  --fv-drop-shadow: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05));\n  ${baseFilter}\n}`
        },
        {
          classValue: "drop-shadow-none",
          expected: `.drop-shadow-none {\n  --fv-drop-shadow: drop-shadow(0 0 #0000);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Grayscale", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "grayscale-0",
          expected: `.grayscale-0 {\n  --fv-grayscale: grayscale(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "grayscale",
          expected: `.grayscale {\n  --fv-grayscale: grayscale(100%);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Hue Rotate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "hue-rotate-0",
          expected: `.hue-rotate-0 {\n  --fv-hue-rotate: hue-rotate(0deg);\n  ${baseFilter}\n}`
        },
        {
          classValue: "hue-rotate-[270deg]",
          expected: `.hue-rotate-\\[270deg\\] {\n  --fv-hue-rotate: hue-rotate(270deg);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Invert", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "invert-0",
          expected: `.invert-0 {\n  --fv-invert: invert(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "invert",
          expected: `.invert {\n  --fv-invert: invert(100%);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Saturate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "saturate-0",
          expected: `.saturate-0 {\n  --fv-saturate: saturate(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "saturate-50",
          expected: `.saturate-50 {\n  --fv-saturate: saturate(0.5);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Sepia", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "sepia-0",
          expected: `.sepia-0 {\n  --fv-sepia: sepia(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "sepia",
          expected: `.sepia {\n  --fv-sepia: sepia(100%);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Blur", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-blur-none",
          expected: `.backdrop-blur-none {\n  --fv-backdrop-blur: ;\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur-sm",
          expected: `.backdrop-blur-sm {\n  --fv-backdrop-blur: blur(4px);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur",
          expected: `.backdrop-blur {\n  --fv-backdrop-blur: blur(8px);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Brightness", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-brightness-0",
          expected: `.backdrop-brightness-0 {\n  --fv-backdrop-brightness: brightness(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-brightness-50",
          expected: `.backdrop-brightness-50 {\n  --fv-backdrop-brightness: brightness(0.5);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Contrast", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-contrast-0",
          expected: `.backdrop-contrast-0 {\n  --fv-backdrop-contrast: contrast(0);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Grayscale", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-grayscale-0",
          expected: `.backdrop-grayscale-0 {\n  --fv-backdrop-grayscale: grayscale(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-grayscale",
          expected: `.backdrop-grayscale {\n  --fv-backdrop-grayscale: grayscale(100%);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Hue Rotate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-hue-rotate-0",
          expected: `.backdrop-hue-rotate-0 {\n  --fv-backdrop-hue-rotate: hue-rotate(0deg);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Invert", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-invert-0",
          expected: `.backdrop-invert-0 {\n  --fv-backdrop-invert: invert(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-invert",
          expected: `.backdrop-invert {\n  --fv-backdrop-invert: invert(100%);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Opacity", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-opacity-0",
          expected: `.backdrop-opacity-0 {\n  --fv-backdrop-opacity: opacity(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-opacity-[.67]",
          expected: `.backdrop-opacity-\\[\\.67\\] {\n  --fv-backdrop-opacity: opacity(0.67);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Saturate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-saturate-0",
          expected: `.backdrop-saturate-0 {\n  --fv-backdrop-saturate: saturate(0);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Backdrop Sepia", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-sepia-0",
          expected: `.backdrop-sepia-0 {\n  --fv-backdrop-sepia: sepia(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-sepia",
          expected: `.backdrop-sepia {\n  --fv-backdrop-sepia: sepia(100%);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Tables", () => {
    describe("Border Collapse", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "border-collapse", expected: ".border-collapse {\n  border-collapse: collapse;\n}" },
        { classValue: "border-separate", expected: ".border-separate {\n  border-collapse: separate;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Border Spacing", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "border-spacing-0", expected: ".border-spacing-0 {\n  border-spacing: 0px 0px;\n}" },
        {
          classValue: "border-spacing-x-0",
          expected: ".border-spacing-x-0 {\n  border-spacing: 0px var(--fv-border-spacing-y);\n}"
        },
        {
          classValue: "border-spacing-y-0",
          expected: ".border-spacing-y-0 {\n  border-spacing: var(--fv-border-spacing-x) 0px;\n}"
        },
        { classValue: "border-spacing-px", expected: ".border-spacing-px {\n  border-spacing: 1px 1px;\n}" },
        { classValue: "border-spacing-[7px]", expected: ".border-spacing-\\[7px\\] {\n  border-spacing: 7px 7px;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Table Layout", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "table-auto", expected: ".table-auto {\n  table-layout: auto;\n}" },
        { classValue: "table-fixed", expected: ".table-fixed {\n  table-layout: fixed;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Caption Side", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "caption-top", expected: ".caption-top {\n  caption-side: top;\n}" },
        { classValue: "caption-bottom", expected: ".caption-bottom {\n  caption-side: bottom;\n}" }
      ])("tailwind($classValue)", ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Transitions & Animation", () => {
    describe("Transition Property", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "transition-none",
          expected: `.transition-none {\n  transition-property: none;\n}`
        },
        {
          classValue: "transition-all",
          expected: `.transition-all {\n  transition-property: all;\n  ${baseTransition}\n}`
        },
        {
          classValue: "transition",
          expected: `.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter;\n  ${baseTransition}\n}`
        },
        {
          classValue: "transition-[height]",
          expected: `.transition-\\[height\\] {\n  transition-property: height;\n  ${baseTransition}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Transition Duration", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "duration-0", expected: ".duration-0 {\n  transition-duration: 0ms;\n}" },
        { classValue: "duration-1000", expected: ".duration-1000 {\n  transition-duration: 1000ms;\n}" },
        { classValue: "duration-[2000ms]", expected: ".duration-\\[2000ms\\] {\n  transition-duration: 2000ms;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Transition Timing Function", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "ease-linear", expected: ".ease-linear {\n  transition-timing-function: linear;\n}" },
        { classValue: "ease-in", expected: ".ease-in {\n  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);\n}" },
        {
          classValue: "ease-out",
          expected: ".ease-out {\n  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);\n}"
        },
        {
          classValue: "ease-in-out",
          expected: ".ease-in-out {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}"
        },
        {
          classValue: "ease-[cubic-bezier(0.95,0.05,0.795,0.035)]",
          expected:
            ".ease-\\[cubic-bezier\\(0\\.95\\,0\\.05\\,0\\.795\\,0\\.035\\)\\] {\n  transition-timing-function: cubic-bezier(0.95,0.05,0.795,0.035);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Transition Delay", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "delay-0", expected: ".delay-0 {\n  transition-delay: 0ms;\n}" },
        { classValue: "delay-1000", expected: ".delay-1000 {\n  transition-delay: 1000ms;\n}" },
        { classValue: "delay-[2000ms]", expected: ".delay-\\[2000ms\\] {\n  transition-delay: 2000ms;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Animation", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "animate-none", expected: ".animate-none {\n  animation: none;\n}" },
        { classValue: "animate-spin", expected: ".animate-spin {\n  animation: spin 1s linear infinite;\n}" },
        {
          classValue: "animate-ping",
          expected: ".animate-ping {\n  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;\n}"
        },
        {
          classValue: "animate-pulse",
          expected: ".animate-pulse {\n  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n}"
        },
        { classValue: "animate-bounce", expected: ".animate-bounce {\n  animation: bounce 1s infinite;\n}" },
        {
          classValue: "animate-[wiggle_1s_ease-in-out_infinite]",
          expected: ".animate-\\[wiggle_1s_ease-in-out_infinite\\] {\n  animation: wiggle 1s ease-in-out infinite;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Transforms", () => {
    describe("Scale", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "scale-0",
          expected: `.scale-0 {\n  --fv-scale-x: 0;\n  --fv-scale-y: 0;\n  ${baseScale}\n}`
        },
        { classValue: "scale-x-0", expected: `.scale-x-0 {\n  --fv-scale-x: 0;\n  ${baseScale}\n}` },
        { classValue: "scale-y-0", expected: `.scale-y-0 {\n  --fv-scale-y: 0;\n  ${baseScale}\n}` },
        {
          classValue: "scale-50",
          expected: `.scale-50 {\n  --fv-scale-x: 0.5;\n  --fv-scale-y: 0.5;\n  ${baseScale}\n}`
        },
        {
          classValue: "scale-[1.7]",
          expected: `.scale-\\[1\\.7\\] {\n  --fv-scale-x: 1.7;\n  --fv-scale-y: 1.7;\n  ${baseScale}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Rotate", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "rotate-0", expected: `.rotate-0 {\n  rotate: 0deg;\n}` },
        { classValue: "rotate-180", expected: `.rotate-180 {\n  rotate: 180deg;\n}` },
        {
          classValue: "rotate-[17deg]",
          expected: `.rotate-\\[17deg\\] {\n  rotate: 17deg;\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Translate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "translate-x-0",
          expected: `.translate-x-0 {\n  --fv-translate-x: 0px;\n  ${baseTranslate}\n}`
        },
        {
          classValue: "translate-y-0",
          expected: `.translate-y-0 {\n  --fv-translate-y: 0px;\n  ${baseTranslate}\n}`
        },
        {
          classValue: "translate-x-1/2",
          expected: `.translate-x-1\\/2 {\n  --fv-translate-x: calc(1 / 2 * 100%);\n  ${baseTranslate}\n}`
        },
        {
          classValue: "-translate-x-1/2",
          expected: `.-translate-x-1\\/2 {\n  --fv-translate-x: calc(calc(1 / 2 * 100%) * -1);\n  ${baseTranslate}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Skew", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "skew-x-0", expected: `.skew-x-0 {\n  --fv-skew-x: 0deg;\n  ${baseSkew}\n}` },
        { classValue: "skew-y-0", expected: `.skew-y-0 {\n  --fv-skew-y: 0deg;\n  ${baseSkew}\n}` },
        { classValue: "skew-x-1", expected: `.skew-x-1 {\n  --fv-skew-x: 1deg;\n  ${baseSkew}\n}` }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Transform Origin", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "origin-center", expected: ".origin-center {\n  transform-origin: center;\n}" },
        { classValue: "origin-top", expected: ".origin-top {\n  transform-origin: top;\n}" },
        { classValue: "origin-top-right", expected: ".origin-top-right {\n  transform-origin: top right;\n}" },
        { classValue: "origin-[33%_75%]", expected: ".origin-\\[33\\%_75\\%\\] {\n  transform-origin: 33% 75%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Interactivity", () => {
    describe("Accent Color", () => {
      it.each(generateFullColorTestSuite("accent", "accent-color"))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "accent-red-400/50",
          expected: ".accent-red-400\\/50 {\n  accent-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        { classValue: "accent-[#50d71e]/25", expected: ".accent-\\[\\#50d71e\\]\\/25 {\n  accent-color: #50d71e40;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Appearance", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "appearance-none",
          expected: ".appearance-none {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n}"
        },
        {
          classValue: "appearance-auto",
          expected: ".appearance-auto {\n  -webkit-appearance: auto;\n  -moz-appearance: auto;\n  appearance: auto;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Cursor", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "cursor-auto", expected: ".cursor-auto {\n  cursor: auto;\n}" },
        {
          classValue: "cursor-[url(hand.cur),_pointer]",
          expected: ".cursor-\\[url\\(hand\\.cur\\)\\,_pointer\\] {\n  cursor: url(hand.cur), pointer;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Caret Color", () => {
      it.each(generateFullColorTestSuite("caret", "caret-color"))(
        `tailwind($classValue)`,
        ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        }
      )

      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "caret-red-400/50",
          expected: ".caret-red-400\\/50 {\n  caret-color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        { classValue: "caret-[#50d71e]/25", expected: ".caret-\\[\\#50d71e\\]\\/25 {\n  caret-color: #50d71e40;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Pointer Events", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "pointer-events-none",
          expected: ".pointer-events-none {\n  pointer-events: none;\n}"
        },
        {
          classValue: "pointer-events-auto",
          expected: ".pointer-events-auto {\n  pointer-events: auto;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Resize", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "resize-none", expected: ".resize-none {\n  resize: none;\n}" },
        { classValue: "resize-y", expected: ".resize-y {\n  resize: vertical;\n}" },
        { classValue: "resize-x", expected: ".resize-x {\n  resize: horizontal;\n}" },
        { classValue: "resize", expected: ".resize {\n  resize: both;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Scroll Behavior", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "scroll-auto",
          expected: ".scroll-auto {\n  scroll-behavior: auto;\n}"
        },
        {
          classValue: "scroll-smooth",
          expected: ".scroll-smooth {\n  scroll-behavior: smooth;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Scroll Margin", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "scroll-m-0", expected: ".scroll-m-0 {\n  scroll-margin: 0px;\n}" },
        {
          classValue: "scroll-mx-0",
          expected: ".scroll-mx-0 {\n  scroll-margin-left: 0px;\n  scroll-margin-right: 0px;\n}"
        },
        { classValue: "scroll-mt-0", expected: ".scroll-mt-0 {\n  scroll-margin-top: 0px;\n}" },
        {
          classValue: "scroll-mx-[32rem]",
          expected: ".scroll-mx-\\[32rem\\] {\n  scroll-margin-left: 32rem;\n  scroll-margin-right: 32rem;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Scroll Padding", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "scroll-p-0", expected: ".scroll-p-0 {\n  scroll-padding: 0px;\n}" },
        {
          classValue: "scroll-px-0",
          expected: ".scroll-px-0 {\n  scroll-padding-left: 0px;\n  scroll-padding-right: 0px;\n}"
        },
        { classValue: "scroll-pt-0", expected: ".scroll-pt-0 {\n  scroll-padding-top: 0px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Scroll Snap Align", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "snap-start", expected: ".snap-start {\n  scroll-snap-align: start;\n}" },
        { classValue: "snap-end", expected: ".snap-end {\n  scroll-snap-align: end;\n}" },
        { classValue: "snap-center", expected: ".snap-center {\n  scroll-snap-align: center;\n}" },
        { classValue: "snap-align-none", expected: ".snap-align-none {\n  scroll-snap-align: none;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Scroll Snap Stop", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "snap-normal", expected: ".snap-normal {\n  scroll-snap-stop: normal;\n}" },
        { classValue: "snap-always", expected: ".snap-always {\n  scroll-snap-stop: always;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Scroll Snap Type", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "snap-none", expected: ".snap-none {\n  scroll-snap-type: none;\n}" },
        { classValue: "snap-x", expected: ".snap-x {\n  scroll-snap-type: x var(--fv-scroll-snap-strictness);\n}" },
        { classValue: "snap-y", expected: ".snap-y {\n  scroll-snap-type: y var(--fv-scroll-snap-strictness);\n}" },
        {
          classValue: "snap-both",
          expected: ".snap-both {\n  scroll-snap-type: both var(--fv-scroll-snap-strictness);\n}"
        },
        { classValue: "snap-mandatory", expected: ".snap-mandatory {\n  --fv-scroll-snap-strictness: mandatory;\n}" },
        { classValue: "snap-proximity", expected: ".snap-proximity {\n  --fv-scroll-snap-strictness: proximity;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Touch Action", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "touch-auto", expected: ".touch-auto {\n  touch-action: auto;\n}" },
        { classValue: "touch-none", expected: ".touch-none {\n  touch-action: none;\n}" },
        { classValue: "touch-pan-x", expected: ".touch-pan-x {\n  touch-action: pan-x;\n}" },
        { classValue: "touch-manipulation", expected: ".touch-manipulation {\n  touch-action: manipulation;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("User Select", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "select-none", expected: ".select-none {\n  user-select: none;\n}" },
        { classValue: "select-text", expected: ".select-text {\n  user-select: text;\n}" },
        { classValue: "select-all", expected: ".select-all {\n  user-select: all;\n}" },
        { classValue: "select-auto", expected: ".select-auto {\n  user-select: auto;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Will Change", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "will-change-auto", expected: ".will-change-auto {\n  will-change: auto;\n}" },
        { classValue: "will-change-scroll", expected: ".will-change-scroll {\n  will-change: scroll-position;\n}" },
        { classValue: "will-change-contents", expected: ".will-change-contents {\n  will-change: contents;\n}" },
        { classValue: "will-change-transform", expected: ".will-change-transform {\n  will-change: transform;\n}" },
        {
          classValue: "will-change-[top,left]",
          expected: ".will-change-\\[top\\,left\\] {\n  will-change: top,left;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("SVG", () => {
    describe("Fill", () => {
      it.each(generateFullColorTestSuite("fill", "fill"))(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "fill-none", expected: ".fill-none {\n  fill: none;\n}" },
        {
          classValue: "fill-red-400/50",
          expected: ".fill-red-400\\/50 {\n  fill: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        { classValue: "fill-[#50d71e]/25", expected: ".fill-\\[\\#50d71e\\]\\/25 {\n  fill: #50d71e40;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Stroke", () => {
      it.each(generateFullColorTestSuite("stroke", "stroke"))(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })

      it.each<{ classValue: string; expected: string }>([
        { classValue: "stroke-none", expected: ".stroke-none {\n  stroke: none;\n}" },
        {
          classValue: "stroke-red-400/50",
          expected: ".stroke-red-400\\/50 {\n  stroke: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
        },
        { classValue: "stroke-[#50d71e]/25", expected: ".stroke-\\[\\#50d71e\\]\\/25 {\n  stroke: #50d71e40;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })

    describe("Stroke Width", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "stroke-0", expected: ".stroke-0 {\n  stroke-width: 0;\n}" },
        { classValue: "stroke-2", expected: ".stroke-2 {\n  stroke-width: 2;\n}" },
        { classValue: "stroke-[2px]", expected: ".stroke-\\[2px\\] {\n  stroke-width: 2px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })

  describe("Accessibility", () => {
    describe("Screen Readers", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "sr-only",
          expected:
            ".sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}"
        },
        {
          classValue: "not-sr-only",
          expected:
            ".not-sr-only {\n  position: static;\n  width: auto;\n  height: auto;\n  padding: 0;\n  margin: 0;\n  overflow: visible;\n  clip: auto;\n  white-space: normal;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })
})
