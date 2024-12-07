import { describe, expect, it } from "vitest"
import { tailwind } from "fishtvue/theme"
import { baseBackdropFilter, baseFilter, baseTransform, baseTransition } from "fishtvue/theme/unoStyle/unoStatic"

describe("unoStyle", () => {
  describe("Special tests", () => {
    it("Not string", () => {
      // @ts-ignore
      expect(tailwind(42)).toBeUndefined()
    })
  })
  describe("Handling Hover, Focus, and Other States", () => {
    describe("Pseudo-classes", () => {
      describe("Hover, focus, and active", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "hover:p-0", expected: ".hover\\:p-0:hover {\n  padding: 0px;\n}" },
          { classValue: "active:p-0", expected: ".active\\:p-0:active {\n  padding: 0px;\n}" },
          { classValue: "visited:p-0", expected: ".visited\\:p-0:visited {\n  padding: 0px;\n}" },
          { classValue: "target:p-0", expected: ".target\\:p-0:target {\n  padding: 0px;\n}" },
          { classValue: "focus:p-0", expected: ".focus\\:p-0:focus {\n  padding: 0px;\n}" },
          { classValue: "focus-within:p-0", expected: ".focus-within\\:p-0:focus-within {\n  padding: 0px;\n}" },
          { classValue: "focus-visible:p-0", expected: ".focus-visible\\:p-0:focus-visible {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
      describe("First, last, odd, and even", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "first:p-0", expected: ".first\\:p-0:first-child {\n  padding: 0px;\n}" },
          { classValue: "last:p-0", expected: ".last\\:p-0:last-child {\n  padding: 0px;\n}" },
          { classValue: "only:p-0", expected: ".only\\:p-0:only-child {\n  padding: 0px;\n}" },
          { classValue: "odd:p-0", expected: ".odd\\:p-0:nth-child(odd) {\n  padding: 0px;\n}" },
          { classValue: "even:p-0", expected: ".even\\:p-0:nth-child(even) {\n  padding: 0px;\n}" },
          { classValue: "first-of-type:p-0", expected: ".first-of-type\\:p-0:first-of-type {\n  padding: 0px;\n}" },
          { classValue: "last-of-type:p-0", expected: ".last-of-type\\:p-0:last-of-type {\n  padding: 0px;\n}" },
          { classValue: "only-of-type:p-0", expected: ".only-of-type\\:p-0:only-of-type {\n  padding: 0px;\n}" },
          { classValue: "empty:p-0", expected: ".empty\\:p-0:empty {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
      describe("Form states", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "disabled:p-0", expected: ".disabled\\:p-0:disabled {\n  padding: 0px;\n}" },
          { classValue: "enabled:p-0", expected: ".enabled\\:p-0:enabled {\n  padding: 0px;\n}" },
          { classValue: "checked:p-0", expected: ".checked\\:p-0:checked {\n  padding: 0px;\n}" },
          { classValue: "indeterminate:p-0", expected: ".indeterminate\\:p-0:indeterminate {\n  padding: 0px;\n}" },
          { classValue: "default:p-0", expected: ".default\\:p-0:default {\n  padding: 0px;\n}" },
          { classValue: "required:p-0", expected: ".required\\:p-0:required {\n  padding: 0px;\n}" },
          { classValue: "valid:p-0", expected: ".valid\\:p-0:valid {\n  padding: 0px;\n}" },
          { classValue: "invalid:p-0", expected: ".invalid\\:p-0:invalid {\n  padding: 0px;\n}" },
          { classValue: "in-range:p-0", expected: ".in-range\\:p-0:in-range {\n  padding: 0px;\n}" },
          { classValue: "out-of-range:p-0", expected: ".out-of-range\\:p-0:out-of-range {\n  padding: 0px;\n}" },
          { classValue: "autofill:p-0", expected: ".autofill\\:p-0:autofill {\n  padding: 0px;\n}" },
          { classValue: "read-only:p-0", expected: ".read-only\\:p-0:read-only {\n  padding: 0px;\n}" },
          {
            classValue: "placeholder-shown:p-0",
            expected: ".placeholder-shown\\:p-0:placeholder-shown {\n  padding: 0px;\n}"
          }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
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
      describe("Before and after", () => {
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "after:p-0",
            expected: ".after\\:p-0::after {\n  content: var(--tw-content);\n  padding: 0px;\n}"
          },
          {
            classValue: "before:p-0",
            expected: ".before\\:p-0::before {\n  content: var(--tw-content);\n  padding: 0px;\n}"
          }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
      describe("Placeholder text", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "placeholder:p-0", expected: ".placeholder\\:p-0::placeholder {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
      describe("File input buttons", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "file:p-0", expected: ".file\\:p-0::file-selector-button {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
      describe("List markers", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "marker:p-0", expected: ".marker\\:p-0::marker {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
      describe("Highlighted text", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "selection:p-0", expected: ".selection\\:p-0::selection {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
      describe("First-line and first-letter", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "first-line:p-0", expected: ".first-line\\:p-0::first-line {\n  padding: 0px;\n}" },
          { classValue: "first-letter:p-0", expected: ".first-letter\\:p-0::first-letter {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
      describe("Dialog backdrops", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "backdrop:p-0", expected: ".backdrop\\:p-0::backdrop {\n  padding: 0px;\n}" }
        ])(`tailwind($classValue)`, ({ classValue, expected }) => {
          expect(tailwind(classValue)).toBe(expected)
        })
      })
    })
    describe("Media and feature queries", () => {
      describe("Responsive breakpoints", () => {
        it.each<{ classValue: string; expected: string }>([
          { classValue: "sm:p-0", expected: "@media (min-width: 640px) {\n.sm\\:p-0 {\n  padding: 0px;\n}\n}" },
          { classValue: "md:p-0", expected: "@media (min-width: 768px) {\n.md\\:p-0 {\n  padding: 0px;\n}\n}" },
          { classValue: "lg:p-0", expected: "@media (min-width: 1024px) {\n.lg\\:p-0 {\n  padding: 0px;\n}\n}" },
          { classValue: "xl:p-0", expected: "@media (min-width: 1280px) {\n.xl\\:p-0 {\n  padding: 0px;\n}\n}" },
          { classValue: "2xl:p-0", expected: "@media (min-width: 1536px) {\n.2xl\\:p-0 {\n  padding: 0px;\n}\n}" }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
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
        it.each<{ classValue: string; expected: string }>([
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
        it.each<{ classValue: string; expected: string }>([
          {
            classValue: "motion-reduce:p-0",
            expected: "@media (prefers-reduced-motion: reduce) {\n.motion-reduce\\:p-0 {\n  padding: 0px;\n}\n}"
          },
          {
            classValue: "motion-safe:p-0",
            expected: "@media (prefers-reduced-motion: no-preference) {\n.motion-safe\\:p-0 {\n  padding: 0px;\n}\n}"
          },
          {
            classValue: "contrast-more:p-0",
            expected: "@media (prefers-contrast: more) {\n.contrast-more\\:p-0 {\n  padding: 0px;\n}\n}"
          },
          {
            classValue: "contrast-less:p-0",
            expected: "@media (prefers-contrast: less) {\n.contrast-less\\:p-0 {\n  padding: 0px;\n}\n}"
          }
        ])("tailwind($classValue)", ({ classValue, expected }) => {
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
              "@supports (backdrop-filter) {\n.supports-\\[backdrop-filter\\]\\:bg-red-500\\/25 {\n  background-color: #ef444440;\n}\n}"
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
    describe("Attribute selectors", () => {
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
    describe.todo("Container", () => {})
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
      it.each<{ classValue: string; expected: string }>([
        { classValue: "inset-0", expected: ".inset-0 {\n  inset: 0px;\n}" },
        { classValue: "inset-x-0", expected: ".inset-x-0 {\n  left: 0px;\n  right: 0px;\n}" },
        { classValue: "inset-y-0", expected: ".inset-y-0 {\n  top: 0px;\n  bottom: 0px;\n}" },
        { classValue: "start-0", expected: ".start-0 {\n  inset-inline-start: 0px;\n}" },
        { classValue: "end-0", expected: ".end-0 {\n  inset-inline-end: 0px;\n}" },
        { classValue: "top-0", expected: ".top-0 {\n  top: 0px;\n}" },
        { classValue: "right-0", expected: ".right-0 {\n  right: 0px;\n}" },
        { classValue: "bottom-0", expected: ".bottom-0 {\n  bottom: 0px;\n}" },
        { classValue: "left-0", expected: ".left-0 {\n  left: 0px;\n}" },
        { classValue: "inset-px", expected: ".inset-px {\n  inset: 1px;\n}" },
        { classValue: "inset-x-px", expected: ".inset-x-px {\n  left: 1px;\n  right: 1px;\n}" },
        { classValue: "inset-y-px", expected: ".inset-y-px {\n  top: 1px;\n  bottom: 1px;\n}" },
        { classValue: "start-px", expected: ".start-px {\n  inset-inline-start: 1px;\n}" },
        { classValue: "end-px", expected: ".end-px {\n  inset-inline-end: 1px;\n}" },
        { classValue: "top-px", expected: ".top-px {\n  top: 1px;\n}" },
        { classValue: "right-px", expected: ".right-px {\n  right: 1px;\n}" },
        { classValue: "bottom-px", expected: ".bottom-px {\n  bottom: 1px;\n}" },
        { classValue: "left-px", expected: ".left-px {\n  left: 1px;\n}" },
        { classValue: "inset-0.5", expected: ".inset-0\\.5 {\n  inset: 0.125rem;\n}" },
        { classValue: "inset-x-0.5", expected: ".inset-x-0\\.5 {\n  left: 0.125rem;\n  right: 0.125rem;\n}" },
        { classValue: "inset-y-0.5", expected: ".inset-y-0\\.5 {\n  top: 0.125rem;\n  bottom: 0.125rem;\n}" },
        { classValue: "start-0.5", expected: ".start-0\\.5 {\n  inset-inline-start: 0.125rem;\n}" },
        { classValue: "end-0.5", expected: ".end-0\\.5 {\n  inset-inline-end: 0.125rem;\n}" },
        { classValue: "top-0.5", expected: ".top-0\\.5 {\n  top: 0.125rem;\n}" },
        { classValue: "right-0.5", expected: ".right-0\\.5 {\n  right: 0.125rem;\n}" },
        { classValue: "bottom-0.5", expected: ".bottom-0\\.5 {\n  bottom: 0.125rem;\n}" },
        { classValue: "left-0.5", expected: ".left-0\\.5 {\n  left: 0.125rem;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "inset-auto", expected: ".inset-auto {\n  inset: auto;\n}" },
        { classValue: "inset-1/2", expected: ".inset-1\\/2 {\n  inset: 50%;\n}" },
        { classValue: "inset-1/3", expected: ".inset-1\\/3 {\n  inset: 33.3333%;\n}" },
        { classValue: "inset-2/3", expected: ".inset-2\\/3 {\n  inset: 66.6667%;\n}" },
        { classValue: "inset-1/4", expected: ".inset-1\\/4 {\n  inset: 25%;\n}" },
        { classValue: "inset-2/4", expected: ".inset-2\\/4 {\n  inset: 50%;\n}" },
        { classValue: "inset-3/4", expected: ".inset-3\\/4 {\n  inset: 75%;\n}" },
        { classValue: "inset-full", expected: ".inset-full {\n  inset: 100%;\n}" },
        { classValue: "inset-x-auto", expected: ".inset-x-auto {\n  left: auto;\n  right: auto;\n}" },
        { classValue: "inset-x-1/2", expected: ".inset-x-1\\/2 {\n  left: 50%;\n  right: 50%;\n}" },
        { classValue: "inset-x-full", expected: ".inset-x-full {\n  left: 100%;\n  right: 100%;\n}" },
        { classValue: "inset-y-auto", expected: ".inset-y-auto {\n  top: auto;\n  bottom: auto;\n}" },
        { classValue: "inset-y-1/2", expected: ".inset-y-1\\/2 {\n  top: 50%;\n  bottom: 50%;\n}" },
        { classValue: "inset-y-full", expected: ".inset-y-full {\n  top: 100%;\n  bottom: 100%;\n}" },
        { classValue: "start-auto", expected: ".start-auto {\n  inset-inline-start: auto;\n}" },
        { classValue: "start-1/2", expected: ".start-1\\/2 {\n  inset-inline-start: 50%;\n}" },
        { classValue: "start-full", expected: ".start-full {\n  inset-inline-start: 100%;\n}" },
        { classValue: "end-auto", expected: ".end-auto {\n  inset-inline-end: auto;\n}" },
        { classValue: "end-1/2", expected: ".end-1\\/2 {\n  inset-inline-end: 50%;\n}" },
        { classValue: "end-full", expected: ".end-full {\n  inset-inline-end: 100%;\n}" },
        { classValue: "top-auto", expected: ".top-auto {\n  top: auto;\n}" },
        { classValue: "top-1/2", expected: ".top-1\\/2 {\n  top: 50%;\n}" },
        { classValue: "top-full", expected: ".top-full {\n  top: 100%;\n}" },
        { classValue: "right-auto", expected: ".right-auto {\n  right: auto;\n}" },
        { classValue: "right-1/2", expected: ".right-1\\/2 {\n  right: 50%;\n}" },
        { classValue: "right-full", expected: ".right-full {\n  right: 100%;\n}" },
        { classValue: "bottom-auto", expected: ".bottom-auto {\n  bottom: auto;\n}" },
        { classValue: "bottom-1/2", expected: ".bottom-1\\/2 {\n  bottom: 50%;\n}" },
        { classValue: "bottom-full", expected: ".bottom-full {\n  bottom: 100%;\n}" },
        { classValue: "left-auto", expected: ".left-auto {\n  left: auto;\n}" },
        { classValue: "left-1/2", expected: ".left-1\\/2 {\n  left: 50%;\n}" },
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
        { classValue: "basis-1/2", expected: ".basis-1\\/2 {\n  flex-basis: 50%;\n}" },
        { classValue: "basis-11/12", expected: ".basis-11\\/12 {\n  flex-basis: 91.6667%;\n}" },
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
      it.each<{ classValue: string; expected: string }>([
        { classValue: "gap-0", expected: ".gap-0 {\n  gap: 0px;\n}" },
        { classValue: "gap-x-0", expected: ".gap-x-0 {\n  column-gap: 0px;\n}" },
        { classValue: "gap-y-0", expected: ".gap-y-0 {\n  row-gap: 0px;\n}" },
        { classValue: "gap-px", expected: ".gap-px {\n  gap: 1px;\n}" },
        { classValue: "gap-x-px", expected: ".gap-x-px {\n  column-gap: 1px;\n}" },
        { classValue: "gap-y-px", expected: ".gap-y-px {\n  row-gap: 1px;\n}" },
        { classValue: "gap-0.5", expected: ".gap-0\\.5 {\n  gap: 0.125rem;\n}" },
        { classValue: "gap-x-0.5", expected: ".gap-x-0\\.5 {\n  column-gap: 0.125rem;\n}" },
        { classValue: "gap-y-0.5", expected: ".gap-y-0\\.5 {\n  row-gap: 0.125rem;\n}" },
        { classValue: "gap-[2.75rem]", expected: ".gap-\\[2\\.75rem\\] {\n  gap: 2.75rem;\n}" },
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
          expected: ".content-\\[\\'\\*\\'\\] {\n  --tw-content: '*';\n  content: var(--tw-content);\n}"
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
        { classValue: "-m-px", expected: ".-m-px {\n  margin: -1px;\n}" },
        {
          classValue: "-mx-[32rem]",
          expected: ".-mx-\\[32rem\\] {\n  margin-left: -32rem;\n  margin-right: -32rem;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })
  describe("Sizing", () => {
    describe("Width", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "w-0", expected: ".w-0 {\n  width: 0px;\n}" },
        { classValue: "w-px", expected: ".w-px {\n  width: 1px;\n}" },
        { classValue: "w-0.5", expected: ".w-0\\.5 {\n  width: 0.125rem;\n}" },
        { classValue: "w-1", expected: ".w-1 {\n  width: 0.25rem;\n}" },
        { classValue: "w-1.5", expected: ".w-1\\.5 {\n  width: 0.375rem;\n}" },
        { classValue: "w-4", expected: ".w-4 {\n  width: 1rem;\n}" },
        { classValue: "w-[96rem]", expected: ".w-\\[96rem\\] {\n  width: 96rem;\n}" },
        { classValue: "w-auto", expected: ".w-auto {\n  width: auto;\n}" },
        { classValue: "w-1/2", expected: ".w-1\\/2 {\n  width: 50%;\n}" },
        { classValue: "w-1/3", expected: ".w-1\\/3 {\n  width: 33.3333%;\n}" },
        { classValue: "w-2/3", expected: ".w-2\\/3 {\n  width: 66.6667%;\n}" },
        { classValue: "w-full", expected: ".w-full {\n  width: 100%;\n}" },
        { classValue: "w-screen", expected: ".w-screen {\n  width: 100vw;\n}" },
        { classValue: "w-svw", expected: ".w-svw {\n  width: 1svw;\n}" },
        { classValue: "w-lvw", expected: ".w-lvw {\n  width: 1lvw;\n}" },
        { classValue: "w-dvw", expected: ".w-dvw {\n  width: 1dvw;\n}" },
        { classValue: "w-min", expected: ".w-min {\n  width: min-content;\n}" },
        { classValue: "w-max", expected: ".w-max {\n  width: max-content;\n}" },
        { classValue: "w-fit", expected: ".w-fit {\n  width: fit-content;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Height", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "h-0", expected: ".h-0 {\n  height: 0px;\n}" },
        { classValue: "h-px", expected: ".h-px {\n  height: 1px;\n}" },
        { classValue: "h-0.5", expected: ".h-0\\.5 {\n  height: 0.125rem;\n}" },
        { classValue: "h-1", expected: ".h-1 {\n  height: 0.25rem;\n}" },
        { classValue: "h-1.5", expected: ".h-1\\.5 {\n  height: 0.375rem;\n}" },
        { classValue: "h-4", expected: ".h-4 {\n  height: 1rem;\n}" },
        { classValue: "h-[96rem]", expected: ".h-\\[96rem\\] {\n  height: 96rem;\n}" },
        { classValue: "h-auto", expected: ".h-auto {\n  height: auto;\n}" },
        { classValue: "h-1/2", expected: ".h-1\\/2 {\n  height: 50%;\n}" },
        { classValue: "h-1/3", expected: ".h-1\\/3 {\n  height: 33.3333%;\n}" },
        { classValue: "h-2/3", expected: ".h-2\\/3 {\n  height: 66.6667%;\n}" },
        { classValue: "h-full", expected: ".h-full {\n  height: 100%;\n}" },
        { classValue: "h-screen", expected: ".h-screen {\n  height: 100vh;\n}" },
        { classValue: "h-svw", expected: ".h-svw {\n  height: 1svw;\n}" },
        { classValue: "h-lvw", expected: ".h-lvw {\n  height: 1lvw;\n}" },
        { classValue: "h-dvw", expected: ".h-dvw {\n  height: 1dvw;\n}" },
        { classValue: "h-min", expected: ".h-min {\n  height: min-content;\n}" },
        { classValue: "h-max", expected: ".h-max {\n  height: max-content;\n}" },
        { classValue: "h-fit", expected: ".h-fit {\n  height: fit-content;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Min-Width", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "min-w-1", expected: ".min-w-1 {\n  min-width: 0.25rem;\n}" },
        { classValue: "min-w-96", expected: ".min-w-96 {\n  min-width: 24rem;\n}" },
        { classValue: "min-w-px", expected: ".min-w-px {\n  min-width: 1px;\n}" },
        { classValue: "min-w-0.5", expected: ".min-w-0\\.5 {\n  min-width: 0.125rem;\n}" },
        { classValue: "min-w-3.5", expected: ".min-w-3\\.5 {\n  min-width: 0.875rem;\n}" },
        { classValue: "min-w-full", expected: ".min-w-full {\n  min-width: 100%;\n}" },
        { classValue: "min-w-min", expected: ".min-w-min {\n  min-width: min-content;\n}" },
        { classValue: "min-w-max", expected: ".min-w-max {\n  min-width: max-content;\n}" },
        { classValue: "min-w-fit", expected: ".min-w-fit {\n  min-width: fit-content;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Min-Height", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "min-h-1", expected: ".min-h-1 {\n  min-height: 0.25rem;\n}" },
        { classValue: "min-h-96", expected: ".min-h-96 {\n  min-height: 24rem;\n}" },
        { classValue: "min-h-px", expected: ".min-h-px {\n  min-height: 1px;\n}" },
        { classValue: "min-h-0.5", expected: ".min-h-0\\.5 {\n  min-height: 0.125rem;\n}" },
        { classValue: "min-h-3.5", expected: ".min-h-3\\.5 {\n  min-height: 0.875rem;\n}" },
        { classValue: "min-h-full", expected: ".min-h-full {\n  min-height: 100%;\n}" },
        { classValue: "min-h-min", expected: ".min-h-min {\n  min-height: min-content;\n}" },
        { classValue: "min-h-max", expected: ".min-h-max {\n  min-height: max-content;\n}" },
        { classValue: "min-h-fit", expected: ".min-h-fit {\n  min-height: fit-content;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Max-Width", () => {
      it.each<{ classValue: string; expected: string }>([
        // { classValue: "max-w-0", expected: ".max-w-0 {\n  max-width: 0px;\n}" },
        // { classValue: "max-w-px", expected: ".max-w-px {\n  max-width: 1px;\n}" },
        // { classValue: "max-w-0.5", expected: ".max-w-0\\.5 {\n  max-width: 0.125rem;\n}" },
        // { classValue: "max-w-1", expected: ".max-w-1 {\n  max-width: 0.25rem;\n}" },
        // { classValue: "max-w-1.5", expected: ".max-w-1\\.5 {\n  max-width: 0.375rem;\n}" },
        // { classValue: "max-w-96", expected: ".max-w-96 {\n  max-width: 24rem;\n}" },
        // { classValue: "max-w-none", expected: ".max-w-none {\n  max-width: none;\n}" },
        // { classValue: "max-w-xs", expected: ".max-w-xs {\n  max-width: 20rem;\n}" },

        // { classValue: "max-w-sm", expected: ".max-w-sm {\n  max-width: 24rem;\n}" },
        // { classValue: "max-w-md", expected: ".max-w-md {\n  max-width: 28rem;\n}" },
        // { classValue: "max-w-lg", expected: ".max-w-lg {\n  max-width: 32rem;\n}" },
        // { classValue: "max-w-xl", expected: ".max-w-xl {\n  max-width: 36rem;\n}" },
        { classValue: "max-w-2xl", expected: ".max-w-2xl {\n  max-width: 42rem;\n}" },
        { classValue: "max-w-3xl", expected: ".max-w-3xl {\n  max-width: 48rem;\n}" },
        { classValue: "max-w-4xl", expected: ".max-w-4xl {\n  max-width: 56rem;\n}" },
        { classValue: "max-w-5xl", expected: ".max-w-5xl {\n  max-width: 64rem;\n}" },
        { classValue: "max-w-6xl", expected: ".max-w-6xl {\n  max-width: 72rem;\n}" },
        { classValue: "max-w-7xl", expected: ".max-w-7xl {\n  max-width: 80rem;\n}" }
        // { classValue: "max-w-full", expected: ".max-w-full {\n  max-width: 100%;\n}" },
        // { classValue: "max-w-min", expected: ".max-w-min {\n  max-width: min-content;\n}" },
        // { classValue: "max-w-max", expected: ".max-w-max {\n  max-width: max-content;\n}" },
        // { classValue: "max-w-fit", expected: ".max-w-fit {\n  max-width: fit-content;\n}" },
        // { classValue: "max-w-prose", expected: ".max-w-prose {\n  max-width: 65ch;\n}" },
        // { classValue: "max-w-screen-sm", expected: ".max-w-screen-sm {\n  max-width: 640px;\n}" },
        // { classValue: "max-w-screen-md", expected: ".max-w-screen-md {\n  max-width: 768px;\n}" },
        // { classValue: "max-w-screen-lg", expected: ".max-w-screen-lg {\n  max-width: 1024px;\n}" },
        // { classValue: "max-w-screen-xl", expected: ".max-w-screen-xl {\n  max-width: 1280px;\n}" },
        // { classValue: "max-w-screen-2xl", expected: ".max-w-screen-2xl {\n  max-width: 1536px;\n}" },

        // { classValue: "max-w-full", expected: ".max-w-full {\n  max-width: 100%;\n}" },
        // { classValue: "max-w-min", expected: ".max-w-min {\n  max-width: min-content;\n}" },
        // { classValue: "max-w-max", expected: ".max-w-max {\n  max-width: max-content;\n}" },
        // { classValue: "max-w-fit", expected: ".max-w-fit {\n  max-width: fit-content;\n}" },
        // { classValue: "max-w-prose", expected: ".max-w-prose {\n  max-width: 65ch;\n}" },
        // { classValue: "max-w-screen-sm", expected: ".max-w-screen-sm {\n  max-width: 640px;\n}" },
        // { classValue: "max-w-screen-md", expected: ".max-w-screen-md {\n  max-width: 768px;\n}" },
        // { classValue: "max-w-screen-lg", expected: ".max-w-screen-lg {\n  max-width: 1024px;\n}" },
        // { classValue: "max-w-screen-xl", expected: ".max-w-screen-xl {\n  max-width: 1280px;\n}" },
        // { classValue: "max-w-screen-2xl", expected: ".max-w-screen-2xl {\n  max-width: 1536px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Max-Height", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "max-h-0", expected: ".max-h-0 {\n  max-height: 0px;\n}" },
        { classValue: "max-h-px", expected: ".max-h-px {\n  max-height: 1px;\n}" },
        { classValue: "max-h-0.5", expected: ".max-h-0\\.5 {\n  max-height: 0.125rem;\n}" },
        { classValue: "max-h-1", expected: ".max-h-1 {\n  max-height: 0.25rem;\n}" },
        { classValue: "max-h-1.5", expected: ".max-h-1\\.5 {\n  max-height: 0.375rem;\n}" },
        { classValue: "max-h-96", expected: ".max-h-96 {\n  max-height: 24rem;\n}" },
        { classValue: "max-h-none", expected: ".max-h-none {\n  max-height: none;\n}" },
        { classValue: "max-h-xs", expected: ".max-h-xs {\n  max-height: 20rem;\n}" },
        { classValue: "max-h-full", expected: ".max-h-full {\n  max-height: 100%;\n}" },
        { classValue: "max-h-min", expected: ".max-h-min {\n  max-height: min-content;\n}" },
        { classValue: "max-h-max", expected: ".max-h-max {\n  max-height: max-content;\n}" },
        { classValue: "max-h-fit", expected: ".max-h-fit {\n  max-height: fit-content;\n}" },
        { classValue: "max-h-prose", expected: ".max-h-prose {\n  max-height: 65ch;\n}" },
        { classValue: "max-h-screen", expected: ".max-h-screen {\n  max-height: 100vh;\n}" },
        { classValue: "max-h-screen-sm", expected: ".max-h-screen-sm {\n  max-height: 640px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Size", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "size-0", expected: ".size-0 {\n  width: 0px;\n  height: 0px;\n}" },
        { classValue: "size-px", expected: ".size-px {\n  width: 1px;\n  height: 1px;\n}" },
        { classValue: "size-0.5", expected: ".size-0\\.5 {\n  width: 0.125rem;\n  height: 0.125rem;\n}" },
        { classValue: "size-1", expected: ".size-1 {\n  width: 0.25rem;\n  height: 0.25rem;\n}" },
        { classValue: "size-1.5", expected: ".size-1\\.5 {\n  width: 0.375rem;\n  height: 0.375rem;\n}" },
        { classValue: "size-96", expected: ".size-96 {\n  width: 24rem;\n  height: 24rem;\n}" },
        { classValue: "size-[14px]", expected: ".size-\\[14px\\] {\n  width: 14px;\n  height: 14px;\n}" },
        { classValue: "size-auto", expected: ".size-auto {\n  width: auto;\n  height: auto;\n}" },
        { classValue: "size-1/2", expected: ".size-1\\/2 {\n  width: 50%;\n  height: 50%;\n}" },
        { classValue: "size-1/3", expected: ".size-1\\/3 {\n  width: 33.3333%;\n  height: 33.3333%;\n}" },
        { classValue: "size-11/12", expected: ".size-11\\/12 {\n  width: 91.6667%;\n  height: 91.6667%;\n}" },
        { classValue: "size-full", expected: ".size-full {\n  width: 100%;\n  height: 100%;\n}" },
        { classValue: "size-min", expected: ".size-min {\n  width: min-content;\n  height: min-content;\n}" },
        { classValue: "size-max", expected: ".size-max {\n  width: max-content;\n  height: max-content;\n}" },
        { classValue: "size-fit", expected: ".size-fit {\n  width: fit-content;\n  height: fit-content;\n}" }
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
        { classValue: "font-['Open_Sans']", expected: `.font-\\[\\'Open_Sans\\'\\] {\n  font-family: 'Open Sans';\n}` }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Font Size", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "text-xs", expected: ".text-xs {\n  font-size: 0.75rem;\n  line-height: 1rem;\n}" },
        { classValue: "text-sm", expected: ".text-sm {\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n}" },
        { classValue: "text-base", expected: ".text-base {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}" },
        { classValue: "text-lg", expected: ".text-lg {\n  font-size: 1.125rem;\n  line-height: 1.75rem;\n}" },
        { classValue: "text-xl", expected: ".text-xl {\n  font-size: 1.25rem;\n  line-height: 1.75rem;\n}" },
        { classValue: "text-2xl", expected: ".text-2xl {\n  font-size: 1.5rem;\n  line-height: 2rem;\n}" },
        { classValue: "text-3xl", expected: ".text-3xl {\n  font-size: 1.875rem;\n  line-height: 2.25rem;\n}" },
        { classValue: "text-4xl", expected: ".text-4xl {\n  font-size: 2.25rem;\n  line-height: 2.5rem;\n}" },
        { classValue: "text-5xl", expected: ".text-5xl {\n  font-size: 3rem;\n  line-height: 1;\n}" },
        { classValue: "text-6xl", expected: ".text-6xl {\n  font-size: 3.75rem;\n  line-height: 1;\n}" },
        { classValue: "text-7xl", expected: ".text-7xl {\n  font-size: 4.5rem;\n  line-height: 1;\n}" },
        { classValue: "text-8xl", expected: ".text-8xl {\n  font-size: 6rem;\n  line-height: 1;\n}" },
        { classValue: "text-9xl", expected: ".text-9xl {\n  font-size: 8rem;\n  line-height: 1;\n}" },
        { classValue: "text-[14px]", expected: ".text-\\[14px\\] {\n  font-size: 14px;\n}" },
        { classValue: "text-base/6", expected: ".text-base\\/6 {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}" },
        { classValue: "text-base/7", expected: ".text-base\\/7 {\n  font-size: 1rem;\n  line-height: 1.75rem;\n}" },
        { classValue: "text-base/loose", expected: ".text-base\\/loose {\n  font-size: 1rem;\n  line-height: 2;\n}" },
        {
          classValue: "text-base/[17px]",
          expected: ".text-base\\/\\[17px\\] {\n  font-size: 1rem;\n  line-height: 17px;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe.todo("Font Smoothing", () => {})
    describe("Font Style", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "italic", expected: ".italic {\n  font-style: italic;\n}" },
        { classValue: "not-italic", expected: ".not-italic {\n  font-style: normal;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Font Weight", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "font-thin", expected: ".font-thin {\n  font-weight: 100;\n}" },
        { classValue: "font-extralight", expected: ".font-extralight {\n  font-weight: 200;\n}" },
        { classValue: "font-light", expected: ".font-light {\n  font-weight: 300;\n}" },
        { classValue: "font-normal", expected: ".font-normal {\n  font-weight: 400;\n}" },
        { classValue: "font-medium", expected: ".font-medium {\n  font-weight: 500;\n}" },
        { classValue: "font-semibold", expected: ".font-semibold {\n  font-weight: 600;\n}" },
        { classValue: "font-bold", expected: ".font-bold {\n  font-weight: 700;\n}" },
        { classValue: "font-extrabold", expected: ".font-extrabold {\n  font-weight: 800;\n}" },
        { classValue: "font-black", expected: ".font-black {\n  font-weight: 900;\n}" },
        { classValue: "font-[1100]", expected: ".font-\\[1100\\] {\n  font-weight: 1100;\n}" }
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
    describe("Text Color", () => {
      it.each<{ classValue: string; expected: string }>([
        // { classValue: "text-inherit", expected: ".text-inherit {\n  color: inherit;\n}" },
        // { classValue: "text-current", expected: ".text-current {\n  color: currentColor;\n}" },
        // { classValue: "text-transparent", expected: ".text-transparent {\n  color: transparent;\n}" },
        // { classValue: "text-black", expected: ".text-black {\n  color: #000000;\n}" },
        // { classValue: "text-white", expected: ".text-white {\n  color: #ffffff;\n}" },
        { classValue: "text-white/0", expected: ".text-white\\/0 {\n  color: #ffffff00;\n}" },
        { classValue: "text-white/50", expected: ".text-white\\/50 {\n  color: #ffffff80;\n}" },
        { classValue: "text-white/100", expected: ".text-white\\/100 {\n  color: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "text-slate-50", expected: ".text-slate-50 {\n  color: #f8fafc;\n}" },
        { classValue: "text-emerald-100", expected: ".text-emerald-100 {\n  color: #d1fae5;\n}" },
        { classValue: "text-green-200", expected: ".text-green-200 {\n  color: #bbf7d0;\n}" },
        { classValue: "text-lime-300", expected: ".text-lime-300 {\n  color: #bef264;\n}" },
        { classValue: "text-red-400", expected: ".text-red-400 {\n  color: #f87171;\n}" },
        { classValue: "text-orange-500", expected: ".text-orange-500 {\n  color: #f97316;\n}" },
        { classValue: "text-amber-600", expected: ".text-amber-600 {\n  color: #d97706;\n}" },
        { classValue: "text-yellow-700", expected: ".text-yellow-700 {\n  color: #a16207;\n}" },
        { classValue: "text-teal-800", expected: ".text-teal-800 {\n  color: #115e59;\n}" },
        { classValue: "text-cyan-900", expected: ".text-cyan-900 {\n  color: #164e63;\n}" },
        { classValue: "text-sky-950", expected: ".text-sky-950 {\n  color: #082f49;\n}" },
        { classValue: "text-[#50d71e]", expected: ".text-\\[\\#50d71e\\] {\n  color: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "text-red-400/0", expected: ".text-red-400\\/0 {\n  color: #f8717100;\n}" },
        { classValue: "text-red-400/50", expected: ".text-red-400\\/50 {\n  color: #f8717180;\n}" },
        { classValue: "text-red-400/100", expected: ".text-red-400\\/100 {\n  color: #f87171;\n}" },
        { classValue: "text-red-400/[.06]", expected: ".text-red-400\\/\\[\\.06\\] {\n  color: #f871710f;\n}" },
        { classValue: "text-[#50d71e]/25", expected: ".text-\\[\\#50d71e\\]\\/25 {\n  color: #50d71e40;\n}" }
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
      it.each<{ classValue: string; expected: string }>([
        { classValue: "decoration-inherit", expected: ".decoration-inherit {\n  text-decoration-color: inherit;\n}" },
        {
          classValue: "decoration-current",
          expected: ".decoration-current {\n  text-decoration-color: currentColor;\n}"
        },
        {
          classValue: "decoration-transparent",
          expected: ".decoration-transparent {\n  text-decoration-color: transparent;\n}"
        },
        { classValue: "decoration-black", expected: ".decoration-black {\n  text-decoration-color: #000000;\n}" },
        { classValue: "decoration-white", expected: ".decoration-white {\n  text-decoration-color: #ffffff;\n}" },
        {
          classValue: "decoration-white/0",
          expected: ".decoration-white\\/0 {\n  text-decoration-color: #ffffff00;\n}"
        },
        {
          classValue: "decoration-white/50",
          expected: ".decoration-white\\/50 {\n  text-decoration-color: #ffffff80;\n}"
        },
        {
          classValue: "decoration-white/100",
          expected: ".decoration-white\\/100 {\n  text-decoration-color: #ffffff;\n}"
        },
        { classValue: "decoration-slate-50", expected: ".decoration-slate-50 {\n  text-decoration-color: #f8fafc;\n}" },
        {
          classValue: "decoration-emerald-100",
          expected: ".decoration-emerald-100 {\n  text-decoration-color: #d1fae5;\n}"
        },
        {
          classValue: "decoration-green-200",
          expected: ".decoration-green-200 {\n  text-decoration-color: #bbf7d0;\n}"
        },
        { classValue: "decoration-lime-300", expected: ".decoration-lime-300 {\n  text-decoration-color: #bef264;\n}" },
        { classValue: "decoration-red-400", expected: ".decoration-red-400 {\n  text-decoration-color: #f87171;\n}" },
        {
          classValue: "decoration-orange-500",
          expected: ".decoration-orange-500 {\n  text-decoration-color: #f97316;\n}"
        },
        {
          classValue: "decoration-amber-600",
          expected: ".decoration-amber-600 {\n  text-decoration-color: #d97706;\n}"
        },
        {
          classValue: "decoration-yellow-700",
          expected: ".decoration-yellow-700 {\n  text-decoration-color: #a16207;\n}"
        },
        { classValue: "decoration-teal-800", expected: ".decoration-teal-800 {\n  text-decoration-color: #115e59;\n}" },
        { classValue: "decoration-cyan-900", expected: ".decoration-cyan-900 {\n  text-decoration-color: #164e63;\n}" },
        { classValue: "decoration-sky-950", expected: ".decoration-sky-950 {\n  text-decoration-color: #082f49;\n}" },
        {
          classValue: "decoration-[#50d71e]",
          expected: ".decoration-\\[\\#50d71e\\] {\n  text-decoration-color: #50d71e;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "decoration-red-400/0",
          expected: ".decoration-red-400\\/0 {\n  text-decoration-color: #f8717100;\n}"
        },
        {
          classValue: "decoration-red-400/50",
          expected: ".decoration-red-400\\/50 {\n  text-decoration-color: #f8717180;\n}"
        },
        {
          classValue: "decoration-red-400/100",
          expected: ".decoration-red-400\\/100 {\n  text-decoration-color: #f87171;\n}"
        },
        {
          classValue: "decoration-red-400/[.06]",
          expected: ".decoration-red-400\\/\\[\\.06\\] {\n  text-decoration-color: #f871710f;\n}"
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
    describe.skip("Content", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "content-none", expected: ".content-none {\n  content: none;\n}" },
        {
          classValue: "content-[attr(before)]",
          expected: ".content-\\[attr\\(before\\)\\] {\n  content: attr(before);\n}"
        },
        {
          classValue: "content-['Hello_World']",
          expected: ".content-\\[\\'Hello_World\\'\\] {\n  content: 'Hello_World';\n}"
        },
        {
          classValue: "content-['Hello_World']",
          expected: ".content-\\[\\'Hello_World\\'\\] {\n  content: 'Hello_World';\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })
  describe("Backgrounds", () => {
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
    describe("Background Color", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-inherit", expected: ".bg-inherit {\n  background-color: inherit;\n}" },
        { classValue: "bg-current", expected: ".bg-current {\n  background-color: currentColor;\n}" },
        { classValue: "bg-transparent", expected: ".bg-transparent {\n  background-color: transparent;\n}" },
        { classValue: "bg-black", expected: ".bg-black {\n  background-color: #000000;\n}" },
        { classValue: "bg-white", expected: ".bg-white {\n  background-color: #ffffff;\n}" },
        { classValue: "bg-white/0", expected: ".bg-white\\/0 {\n  background-color: #ffffff00;\n}" },
        { classValue: "bg-white/50", expected: ".bg-white\\/50 {\n  background-color: #ffffff80;\n}" },
        { classValue: "bg-white/100", expected: ".bg-white\\/100 {\n  background-color: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-slate-50", expected: ".bg-slate-50 {\n  background-color: #f8fafc;\n}" },
        { classValue: "bg-emerald-100", expected: ".bg-emerald-100 {\n  background-color: #d1fae5;\n}" },
        { classValue: "bg-green-200", expected: ".bg-green-200 {\n  background-color: #bbf7d0;\n}" },
        { classValue: "bg-lime-300", expected: ".bg-lime-300 {\n  background-color: #bef264;\n}" },
        { classValue: "bg-red-400", expected: ".bg-red-400 {\n  background-color: #f87171;\n}" },
        { classValue: "bg-orange-500", expected: ".bg-orange-500 {\n  background-color: #f97316;\n}" },
        { classValue: "bg-amber-600", expected: ".bg-amber-600 {\n  background-color: #d97706;\n}" },
        { classValue: "bg-yellow-700", expected: ".bg-yellow-700 {\n  background-color: #a16207;\n}" },
        { classValue: "bg-teal-800", expected: ".bg-teal-800 {\n  background-color: #115e59;\n}" },
        { classValue: "bg-cyan-900", expected: ".bg-cyan-900 {\n  background-color: #164e63;\n}" },
        { classValue: "bg-sky-950", expected: ".bg-sky-950 {\n  background-color: #082f49;\n}" },
        { classValue: "bg-[#50d71e]", expected: ".bg-\\[\\#50d71e\\] {\n  background-color: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-red-400/0", expected: ".bg-red-400\\/0 {\n  background-color: #f8717100;\n}" },
        { classValue: "bg-red-400/50", expected: ".bg-red-400\\/50 {\n  background-color: #f8717180;\n}" },
        { classValue: "bg-red-400/100", expected: ".bg-red-400\\/100 {\n  background-color: #f87171;\n}" },
        { classValue: "bg-red-400/[.06]", expected: ".bg-red-400\\/\\[\\.06\\] {\n  background-color: #f871710f;\n}" },
        { classValue: "bg-[#50d71e]/25", expected: ".bg-\\[\\#50d71e\\]\\/25 {\n  background-color: #50d71e40;\n}" }
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
          expected: ".bg-gradient-to-t {\n  background-image: linear-gradient(to top, var(--tw-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-tr",
          expected:
            ".bg-gradient-to-tr {\n  background-image: linear-gradient(to top right, var(--tw-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-r",
          expected: ".bg-gradient-to-r {\n  background-image: linear-gradient(to right, var(--tw-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-br",
          expected:
            ".bg-gradient-to-br {\n  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-b",
          expected: ".bg-gradient-to-b {\n  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-bl",
          expected:
            ".bg-gradient-to-bl {\n  background-image: linear-gradient(to bottom left, var(--tw-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-l",
          expected: ".bg-gradient-to-l {\n  background-image: linear-gradient(to left, var(--tw-gradient-stops));\n}"
        },
        {
          classValue: "bg-gradient-to-tl",
          expected:
            ".bg-gradient-to-tl {\n  background-image: linear-gradient(to top left, var(--tw-gradient-stops));\n}"
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
            ".from-inherit {\n  --tw-gradient-from: inherit var(--tw-gradient-from-position);\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-current",
          expected:
            ".from-current {\n  --tw-gradient-from: currentColor var(--tw-gradient-from-position);\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-transparent",
          expected:
            ".from-transparent {\n  --tw-gradient-from: transparent var(--tw-gradient-from-position);\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-black",
          expected:
            ".from-black {\n  --tw-gradient-from: #000000 var(--tw-gradient-from-position);\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-white",
          expected:
            ".from-white {\n  --tw-gradient-from: #ffffff var(--tw-gradient-from-position);\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-white/0",
          expected:
            ".from-white\\/0 {\n  --tw-gradient-from: #ffffff00 var(--tw-gradient-from-position);\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-white/50",
          expected:
            ".from-white\\/50 {\n  --tw-gradient-from: #ffffff80 var(--tw-gradient-from-position);\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-white/100",
          expected:
            ".from-white\\/100 {\n  --tw-gradient-from: #ffffff var(--tw-gradient-from-position);\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "from-slate-50",
          expected:
            ".from-slate-50 {\n  --tw-gradient-from: #f8fafc var(--tw-gradient-from-position);\n  --tw-gradient-to: #f8fafc00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-gray-100",
          expected:
            ".from-gray-100 {\n  --tw-gradient-from: #f3f4f6 var(--tw-gradient-from-position);\n  --tw-gradient-to: #f3f4f600 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-zinc-200",
          expected:
            ".from-zinc-200 {\n  --tw-gradient-from: #e4e4e7 var(--tw-gradient-from-position);\n  --tw-gradient-to: #e4e4e700 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-neutral-300",
          expected:
            ".from-neutral-300 {\n  --tw-gradient-from: #d4d4d4 var(--tw-gradient-from-position);\n  --tw-gradient-to: #d4d4d400 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-stone-400",
          expected:
            ".from-stone-400 {\n  --tw-gradient-from: #a8a29e var(--tw-gradient-from-position);\n  --tw-gradient-to: #a8a29e00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-red-500",
          expected:
            ".from-red-500 {\n  --tw-gradient-from: #ef4444 var(--tw-gradient-from-position);\n  --tw-gradient-to: #ef444400 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-orange-600",
          expected:
            ".from-orange-600 {\n  --tw-gradient-from: #ea580c var(--tw-gradient-from-position);\n  --tw-gradient-to: #ea580c00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-amber-700",
          expected:
            ".from-amber-700 {\n  --tw-gradient-from: #b45309 var(--tw-gradient-from-position);\n  --tw-gradient-to: #b4530900 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-yellow-800",
          expected:
            ".from-yellow-800 {\n  --tw-gradient-from: #854d0e var(--tw-gradient-from-position);\n  --tw-gradient-to: #854d0e00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-lime-900",
          expected:
            ".from-lime-900 {\n  --tw-gradient-from: #365314 var(--tw-gradient-from-position);\n  --tw-gradient-to: #36531400 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-green-950",
          expected:
            ".from-green-950 {\n  --tw-gradient-from: #052e16 var(--tw-gradient-from-position);\n  --tw-gradient-to: #052e1600 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-[#50d71e]",
          expected:
            ".from-\\[\\#50d71e\\] {\n  --tw-gradient-from: #50d71e var(--tw-gradient-from-position);\n  --tw-gradient-to: #50d71e00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "from-0%", expected: ".from-0\\% {\n  --tw-gradient-from-position: 0%;\n}" },
        { classValue: "from-100%", expected: ".from-100\\% {\n  --tw-gradient-from-position: 100%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "from-red-400/0",
          expected:
            ".from-red-400\\/0 {\n  --tw-gradient-from: #f8717100 var(--tw-gradient-from-position);\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-red-400/50",
          expected:
            ".from-red-400\\/50 {\n  --tw-gradient-from: #f8717180 var(--tw-gradient-from-position);\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-red-400/100",
          expected:
            ".from-red-400\\/100 {\n  --tw-gradient-from: #f87171 var(--tw-gradient-from-position);\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-red-400/[.06]",
          expected:
            ".from-red-400\\/\\[\\.06\\] {\n  --tw-gradient-from: #f871710f var(--tw-gradient-from-position);\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "from-[#50d71e]/25",
          expected:
            ".from-\\[\\#50d71e\\]\\/25 {\n  --tw-gradient-from: #50d71e40 var(--tw-gradient-from-position);\n  --tw-gradient-to: #50d71e00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}"
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
            ".via-inherit {\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), inherit var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-current",
          expected:
            ".via-current {\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), currentColor var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-transparent",
          expected:
            ".via-transparent {\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), transparent var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-black",
          expected:
            ".via-black {\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #000000 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-white",
          expected:
            ".via-white {\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #ffffff var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-white/0",
          expected:
            ".via-white\\/0 {\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #ffffff00 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-white/50",
          expected:
            ".via-white\\/50 {\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #ffffff80 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-white/100",
          expected:
            ".via-white\\/100 {\n  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #ffffff var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "via-slate-50",
          expected:
            ".via-slate-50 {\n  --tw-gradient-to: #f8fafc00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #f8fafc var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-gray-100",
          expected:
            ".via-gray-100 {\n  --tw-gradient-to: #f3f4f600 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #f3f4f6 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-zinc-200",
          expected:
            ".via-zinc-200 {\n  --tw-gradient-to: #e4e4e700 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #e4e4e7 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-neutral-300",
          expected:
            ".via-neutral-300 {\n  --tw-gradient-to: #d4d4d400 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #d4d4d4 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-stone-400",
          expected:
            ".via-stone-400 {\n  --tw-gradient-to: #a8a29e00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #a8a29e var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-red-500",
          expected:
            ".via-red-500 {\n  --tw-gradient-to: #ef444400 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #ef4444 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-orange-600",
          expected:
            ".via-orange-600 {\n  --tw-gradient-to: #ea580c00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #ea580c var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-amber-700",
          expected:
            ".via-amber-700 {\n  --tw-gradient-to: #b4530900 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #b45309 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-yellow-800",
          expected:
            ".via-yellow-800 {\n  --tw-gradient-to: #854d0e00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #854d0e var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-lime-900",
          expected:
            ".via-lime-900 {\n  --tw-gradient-to: #36531400 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #365314 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-green-950",
          expected:
            ".via-green-950 {\n  --tw-gradient-to: #052e1600 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #052e16 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-[#50d71e]",
          expected:
            ".via-\\[\\#50d71e\\] {\n  --tw-gradient-to: #50d71e00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #50d71e var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "via-0%", expected: ".via-0\\% {\n  --tw-gradient-from-position: 0%;\n}" },
        { classValue: "via-100%", expected: ".via-100\\% {\n  --tw-gradient-from-position: 100%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "via-red-400/0",
          expected:
            ".via-red-400\\/0 {\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #f8717100 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-red-400/50",
          expected:
            ".via-red-400\\/50 {\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #f8717180 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-red-400/100",
          expected:
            ".via-red-400\\/100 {\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #f87171 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-red-400/[.06]",
          expected:
            ".via-red-400\\/\\[\\.06\\] {\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #f871710f var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        },
        {
          classValue: "via-[#50d71e]/25",
          expected:
            ".via-\\[\\#50d71e\\]\\/25 {\n  --tw-gradient-to: #50d71e00 var(--tw-gradient-to-position);\n  --tw-gradient-stops: var(--tw-gradient-from), #50d71e40 var(--tw-gradient-via-position), var(--tw-gradient-to);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Gradient Color Stops TO", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "to-inherit",
          expected: ".to-inherit {\n  --tw-gradient-to: inherit var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-current",
          expected: ".to-current {\n  --tw-gradient-to: currentColor var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-transparent",
          expected: ".to-transparent {\n  --tw-gradient-to: transparent var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-black",
          expected: ".to-black {\n  --tw-gradient-to: #000000 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-white",
          expected: ".to-white {\n  --tw-gradient-to: #ffffff var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-white/0",
          expected: ".to-white\\/0 {\n  --tw-gradient-to: #ffffff00 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-white/50",
          expected: ".to-white\\/50 {\n  --tw-gradient-to: #ffffff80 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-white/100",
          expected: ".to-white\\/100 {\n  --tw-gradient-to: #ffffff var(--tw-gradient-to-position);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "to-slate-50",
          expected: ".to-slate-50 {\n  --tw-gradient-to: #f8fafc var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-gray-100",
          expected: ".to-gray-100 {\n  --tw-gradient-to: #f3f4f6 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-zinc-200",
          expected: ".to-zinc-200 {\n  --tw-gradient-to: #e4e4e7 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-neutral-300",
          expected: ".to-neutral-300 {\n  --tw-gradient-to: #d4d4d4 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-stone-400",
          expected: ".to-stone-400 {\n  --tw-gradient-to: #a8a29e var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-red-500",
          expected: ".to-red-500 {\n  --tw-gradient-to: #ef4444 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-orange-600",
          expected: ".to-orange-600 {\n  --tw-gradient-to: #ea580c var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-amber-700",
          expected: ".to-amber-700 {\n  --tw-gradient-to: #b45309 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-yellow-800",
          expected: ".to-yellow-800 {\n  --tw-gradient-to: #854d0e var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-lime-900",
          expected: ".to-lime-900 {\n  --tw-gradient-to: #365314 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-green-950",
          expected: ".to-green-950 {\n  --tw-gradient-to: #052e16 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-[#50d71e]",
          expected: ".to-\\[\\#50d71e\\] {\n  --tw-gradient-to: #50d71e var(--tw-gradient-to-position);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "to-0%", expected: ".to-0\\% {\n  --tw-gradient-to-position: 0%;\n}" },
        { classValue: "to-100%", expected: ".to-100\\% {\n  --tw-gradient-to-position: 100%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "to-red-400/0",
          expected: ".to-red-400\\/0 {\n  --tw-gradient-to: #f8717100 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-red-400/50",
          expected: ".to-red-400\\/50 {\n  --tw-gradient-to: #f8717180 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-red-400/100",
          expected: ".to-red-400\\/100 {\n  --tw-gradient-to: #f87171 var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-red-400/[.06]",
          expected: ".to-red-400\\/\\[\\.06\\] {\n  --tw-gradient-to: #f871710f var(--tw-gradient-to-position);\n}"
        },
        {
          classValue: "to-[#50d71e]/25",
          expected: ".to-\\[\\#50d71e\\]\\/25 {\n  --tw-gradient-to: #50d71e40 var(--tw-gradient-to-position);\n}"
        }
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
          classValue: "rounded-e-lg",
          expected: ".rounded-e-lg {\n  border-start-end-radius: 0.5rem;\n  border-end-end-radius: 0.5rem;\n}"
        },
        {
          classValue: "rounded-t-xl",
          expected: ".rounded-t-xl {\n  border-top-left-radius: 0.75rem;\n  border-top-right-radius: 0.75rem;\n}"
        },
        {
          classValue: "rounded-r-2xl",
          expected: ".rounded-r-2xl {\n  border-top-right-radius: 1rem;\n  border-bottom-right-radius: 1rem;\n}"
        },
        {
          classValue: "rounded-b-3xl",
          expected: ".rounded-b-3xl {\n  border-bottom-left-radius: 1.5rem;\n  border-bottom-right-radius: 1.5rem;\n}"
        },
        {
          classValue: "rounded-l-full",
          expected: ".rounded-l-full {\n  border-top-left-radius: 9999px;\n  border-bottom-left-radius: 9999px;\n}"
        },

        { classValue: "rounded-ss-none", expected: ".rounded-ss-none {\n  border-start-start-radius: 0px;\n}" },
        { classValue: "rounded-ss-sm", expected: ".rounded-ss-sm {\n  border-start-start-radius: 0.125rem;\n}" },
        { classValue: "rounded-se", expected: ".rounded-se {\n  border-start-end-radius: 0.25rem;\n}" },
        { classValue: "rounded-ee-md", expected: ".rounded-ee-md {\n  border-end-end-radius: 0.375rem;\n}" },
        { classValue: "rounded-es-lg", expected: ".rounded-es-lg {\n  border-end-start-radius: 0.5rem;\n}" },
        { classValue: "rounded-tl-xl", expected: ".rounded-tl-xl {\n  border-top-left-radius: 0.75rem;\n}" },
        { classValue: "rounded-tr-2xl", expected: ".rounded-tr-2xl {\n  border-top-right-radius: 1rem;\n}" },
        { classValue: "rounded-br-3xl", expected: ".rounded-br-3xl {\n  border-bottom-right-radius: 1.5rem;\n}" },
        { classValue: "rounded-bl-full", expected: ".rounded-bl-full {\n  border-bottom-left-radius: 9999px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "rounded-[12px]", expected: ".rounded-\\[12px\\] {\n  border-radius: 12px;\n}" },
        {
          classValue: "rounded-s-[16px]",
          expected: ".rounded-s-\\[16px\\] {\n  border-start-start-radius: 16px;\n  border-end-start-radius: 16px;\n}"
        },
        {
          classValue: "rounded-e-[8px]",
          expected: ".rounded-e-\\[8px\\] {\n  border-start-end-radius: 8px;\n  border-end-end-radius: 8px;\n}"
        },
        {
          classValue: "rounded-t-[50%]",
          expected: ".rounded-t-\\[50\\%\\] {\n  border-top-left-radius: 50%;\n  border-top-right-radius: 50%;\n}"
        },
        {
          classValue: "rounded-r-[1rem]",
          expected: ".rounded-r-\\[1rem\\] {\n  border-top-right-radius: 1rem;\n  border-bottom-right-radius: 1rem;\n}"
        },
        {
          classValue: "rounded-b-[20px]",
          expected:
            ".rounded-b-\\[20px\\] {\n  border-bottom-left-radius: 20px;\n  border-bottom-right-radius: 20px;\n}"
        },
        {
          classValue: "rounded-l-[2em]",
          expected: ".rounded-l-\\[2em\\] {\n  border-top-left-radius: 2em;\n  border-bottom-left-radius: 2em;\n}"
        },
        {
          classValue: "rounded-ss-[30px]",
          expected: ".rounded-ss-\\[30px\\] {\n  border-start-start-radius: 30px;\n}"
        },
        { classValue: "rounded-se-[25px]", expected: ".rounded-se-\\[25px\\] {\n  border-start-end-radius: 25px;\n}" },
        { classValue: "rounded-ee-[15px]", expected: ".rounded-ee-\\[15px\\] {\n  border-end-end-radius: 15px;\n}" },
        { classValue: "rounded-es-[5%]", expected: ".rounded-es-\\[5\\%\\] {\n  border-end-start-radius: 5%;\n}" },
        { classValue: "rounded-tl-[3rem]", expected: ".rounded-tl-\\[3rem\\] {\n  border-top-left-radius: 3rem;\n}" },
        { classValue: "rounded-tr-[40px]", expected: ".rounded-tr-\\[40px\\] {\n  border-top-right-radius: 40px;\n}" },
        {
          classValue: "rounded-br-[10px]",
          expected: ".rounded-br-\\[10px\\] {\n  border-bottom-right-radius: 10px;\n}"
        },
        { classValue: "rounded-bl-[50%]", expected: ".rounded-bl-\\[50\\%\\] {\n  border-bottom-left-radius: 50%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Divide Width", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "divide-x",
          expected:
            ".divide-x > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-x-reverse: 0;\n  border-right-width: calc(1px* var(--tw-divide-x-reverse));\n  border-left-width: calc(1px* calc(1 - var(--tw-divide-x-reverse)));\n}"
        },
        {
          classValue: "divide-x-0",
          expected:
            ".divide-x-0 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-x-reverse: 0;\n  border-right-width: calc(0px* var(--tw-divide-x-reverse));\n  border-left-width: calc(0px* calc(1 - var(--tw-divide-x-reverse)));\n}"
        },
        {
          classValue: "divide-x-1",
          expected:
            ".divide-x-1 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-x-reverse: 0;\n  border-right-width: calc(1px* var(--tw-divide-x-reverse));\n  border-left-width: calc(1px* calc(1 - var(--tw-divide-x-reverse)));\n}"
        },
        {
          classValue: "divide-x-2",
          expected:
            ".divide-x-2 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-x-reverse: 0;\n  border-right-width: calc(2px* var(--tw-divide-x-reverse));\n  border-left-width: calc(2px* calc(1 - var(--tw-divide-x-reverse)));\n}"
        },
        {
          classValue: "divide-x-reverse",
          expected: ".divide-x-reverse > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-x-reverse: 1;\n}"
        },
        {
          classValue: "divide-x-[5px]",
          expected:
            ".divide-x-\\[5px\\] > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-x-reverse: 0;\n  border-right-width: calc(5px* var(--tw-divide-x-reverse));\n  border-left-width: calc(5px* calc(1 - var(--tw-divide-x-reverse)));\n}"
        },
        {
          classValue: "divide-y",
          expected:
            ".divide-y > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-y-reverse: 0;\n  border-top-width: calc(1px* calc(1 - var(--tw-divide-y-reverse)));\n  border-bottom-width: calc(1px* var(--tw-divide-y-reverse));\n}"
        },
        {
          classValue: "divide-y-0",
          expected:
            ".divide-y-0 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-y-reverse: 0;\n  border-top-width: calc(0px* calc(1 - var(--tw-divide-y-reverse)));\n  border-bottom-width: calc(0px* var(--tw-divide-y-reverse));\n}"
        },
        {
          classValue: "divide-y-1",
          expected:
            ".divide-y-1 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-y-reverse: 0;\n  border-top-width: calc(1px* calc(1 - var(--tw-divide-y-reverse)));\n  border-bottom-width: calc(1px* var(--tw-divide-y-reverse));\n}"
        },
        {
          classValue: "divide-y-2",
          expected:
            ".divide-y-2 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-y-reverse: 0;\n  border-top-width: calc(2px* calc(1 - var(--tw-divide-y-reverse)));\n  border-bottom-width: calc(2px* var(--tw-divide-y-reverse));\n}"
        },

        {
          classValue: "divide-y-reverse",
          expected: ".divide-y-reverse > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-y-reverse: 1;\n}"
        },
        {
          classValue: "divide-y-[5px]",
          expected:
            ".divide-y-\\[5px\\] > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-y-reverse: 0;\n  border-top-width: calc(5px* calc(1 - var(--tw-divide-y-reverse)));\n  border-bottom-width: calc(5px* var(--tw-divide-y-reverse));\n}"
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
          classValue: "divide-current",
          expected: ".divide-current > :not([hidden]) ~ :not([hidden]) {\n  border-color: currentColor;\n}"
        },
        {
          classValue: "divide-transparent",
          expected: ".divide-transparent > :not([hidden]) ~ :not([hidden]) {\n  border-color: transparent;\n}"
        },
        {
          classValue: "divide-black",
          expected: ".divide-black > :not([hidden]) ~ :not([hidden]) {\n  border-color: #000000;\n}"
        },
        {
          classValue: "divide-white",
          expected: ".divide-white > :not([hidden]) ~ :not([hidden]) {\n  border-color: #ffffff;\n}"
        },
        {
          classValue: "divide-white/0",
          expected: ".divide-white\\/0 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #ffffff00;\n}"
        },
        {
          classValue: "divide-white/50",
          expected: ".divide-white\\/50 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #ffffff80;\n}"
        },
        {
          classValue: "divide-white/100",
          expected: ".divide-white\\/100 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #ffffff;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "divide-slate-50",
          expected: ".divide-slate-50 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #f8fafc;\n}"
        },
        {
          classValue: "divide-emerald-100",
          expected: ".divide-emerald-100 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #d1fae5;\n}"
        },
        {
          classValue: "divide-green-200",
          expected: ".divide-green-200 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #bbf7d0;\n}"
        },
        {
          classValue: "divide-lime-300",
          expected: ".divide-lime-300 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #bef264;\n}"
        },
        {
          classValue: "divide-red-400",
          expected: ".divide-red-400 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #f87171;\n}"
        },
        {
          classValue: "divide-orange-500",
          expected: ".divide-orange-500 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #f97316;\n}"
        },
        {
          classValue: "divide-amber-600",
          expected: ".divide-amber-600 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #d97706;\n}"
        },
        {
          classValue: "divide-yellow-700",
          expected: ".divide-yellow-700 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #a16207;\n}"
        },
        {
          classValue: "divide-teal-800",
          expected: ".divide-teal-800 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #115e59;\n}"
        },
        {
          classValue: "divide-cyan-900",
          expected: ".divide-cyan-900 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #164e63;\n}"
        },
        {
          classValue: "divide-sky-950",
          expected: ".divide-sky-950 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #082f49;\n}"
        },
        {
          classValue: "divide-[#50d71e]",
          expected: ".divide-\\[\\#50d71e\\] > :not([hidden]) ~ :not([hidden]) {\n  border-color: #50d71e;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "divide-red-400/0",
          expected: ".divide-red-400\\/0 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #f8717100;\n}"
        },
        {
          classValue: "divide-red-400/50",
          expected: ".divide-red-400\\/50 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #f8717180;\n}"
        },
        {
          classValue: "divide-red-400/100",
          expected: ".divide-red-400\\/100 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #f87171;\n}"
        },
        {
          classValue: "divide-red-400/[.06]",
          expected: ".divide-red-400\\/\\[\\.06\\] > :not([hidden]) ~ :not([hidden]) {\n  border-color: #f871710f;\n}"
        },
        {
          classValue: "divide-[#50d71e]/25",
          expected: ".divide-\\[\\#50d71e\\]\\/25 > :not([hidden]) ~ :not([hidden]) {\n  border-color: #50d71e40;\n}"
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
        },
        {
          classValue: "divide-dotted",
          expected: ".divide-dotted > :not([hidden]) ~ :not([hidden]) {\n  border-style: dotted;\n}"
        },
        {
          classValue: "divide-double",
          expected: ".divide-double > :not([hidden]) ~ :not([hidden]) {\n  border-style: double;\n}"
        },
        {
          classValue: "divide-none",
          expected: ".divide-none > :not([hidden]) ~ :not([hidden]) {\n  border-style: none;\n}"
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
        { classValue: "border-s", expected: ".border-s {\n  border-inline-start-width: 1px;\n}" },
        { classValue: "border-e-0", expected: ".border-e-0 {\n  border-inline-end-width: 0px;\n}" },
        { classValue: "border-t-2", expected: ".border-t-2 {\n  border-top-width: 2px;\n}" },
        { classValue: "border-r-4", expected: ".border-r-4 {\n  border-right-width: 4px;\n}" },
        { classValue: "border-b-8", expected: ".border-b-8 {\n  border-bottom-width: 8px;\n}" },
        { classValue: "border-l", expected: ".border-l {\n  border-left-width: 1px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "border-[12px]", expected: ".border-\\[12px\\] {\n  border-width: 12px;\n}" },
        {
          classValue: "border-x-[2rem]",
          expected: ".border-x-\\[2rem\\] {\n  border-left-width: 2rem;\n  border-right-width: 2rem;\n}"
        },
        {
          classValue: "border-y-[0.5em]",
          expected: ".border-y-\\[0\\.5em\\] {\n  border-top-width: 0.5em;\n  border-bottom-width: 0.5em;\n}"
        },
        { classValue: "border-s-[8px]", expected: ".border-s-\\[8px\\] {\n  border-inline-start-width: 8px;\n}" },
        { classValue: "border-e-[3px]", expected: ".border-e-\\[3px\\] {\n  border-inline-end-width: 3px;\n}" },
        { classValue: "border-t-[10%]", expected: ".border-t-\\[10\\%\\] {\n  border-top-width: 10%;\n}" },
        { classValue: "border-r-[4px]", expected: ".border-r-\\[4px\\] {\n  border-right-width: 4px;\n}" },
        { classValue: "border-b-[1rem]", expected: ".border-b-\\[1rem\\] {\n  border-bottom-width: 1rem;\n}" },
        { classValue: "border-l-[15px]", expected: ".border-l-\\[15px\\] {\n  border-left-width: 15px;\n}" },
        { classValue: "border-[5%]", expected: ".border-\\[5\\%\\] {\n  border-width: 5%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Border Color", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "border-inherit", expected: ".border-inherit {\n  border-color: inherit;\n}" },
        { classValue: "border-current", expected: ".border-current {\n  border-color: currentColor;\n}" },
        { classValue: "border-transparent", expected: ".border-transparent {\n  border-color: transparent;\n}" },
        { classValue: "border-black", expected: ".border-black {\n  border-color: #000000;\n}" },
        { classValue: "border-white", expected: ".border-white {\n  border-color: #ffffff;\n}" },
        { classValue: "border-white/0", expected: ".border-white\\/0 {\n  border-color: #ffffff00;\n}" },
        { classValue: "border-white/50", expected: ".border-white\\/50 {\n  border-color: #ffffff80;\n}" },
        { classValue: "border-white/100", expected: ".border-white\\/100 {\n  border-color: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "border-slate-50", expected: ".border-slate-50 {\n  border-color: #f8fafc;\n}" },
        { classValue: "border-emerald-100", expected: ".border-emerald-100 {\n  border-color: #d1fae5;\n}" },
        { classValue: "border-green-200", expected: ".border-green-200 {\n  border-color: #bbf7d0;\n}" },
        { classValue: "border-lime-300", expected: ".border-lime-300 {\n  border-color: #bef264;\n}" },
        { classValue: "border-red-400", expected: ".border-red-400 {\n  border-color: #f87171;\n}" },
        { classValue: "border-orange-500", expected: ".border-orange-500 {\n  border-color: #f97316;\n}" },
        { classValue: "border-amber-600", expected: ".border-amber-600 {\n  border-color: #d97706;\n}" },
        { classValue: "border-yellow-700", expected: ".border-yellow-700 {\n  border-color: #a16207;\n}" },
        { classValue: "border-teal-800", expected: ".border-teal-800 {\n  border-color: #115e59;\n}" },
        { classValue: "border-cyan-900", expected: ".border-cyan-900 {\n  border-color: #164e63;\n}" },
        { classValue: "border-sky-950", expected: ".border-sky-950 {\n  border-color: #082f49;\n}" },
        { classValue: "border-[#50d71e]", expected: ".border-\\[\\#50d71e\\] {\n  border-color: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "border-red-400/0", expected: ".border-red-400\\/0 {\n  border-color: #f8717100;\n}" },
        { classValue: "border-red-400/50", expected: ".border-red-400\\/50 {\n  border-color: #f8717180;\n}" },
        { classValue: "border-red-400/100", expected: ".border-red-400\\/100 {\n  border-color: #f87171;\n}" },
        {
          classValue: "border-red-400/[.06]",
          expected: ".border-red-400\\/\\[\\.06\\] {\n  border-color: #f871710f;\n}"
        },
        { classValue: "border-[#50d71e]/25", expected: ".border-\\[\\#50d71e\\]\\/25 {\n  border-color: #50d71e40;\n}" }
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
        { classValue: "outline-4", expected: ".outline-4 {\n  outline-width: 4px;\n}" },
        { classValue: "outline-8", expected: ".outline-8 {\n  outline-width: 8px;\n}" },
        { classValue: "outline-[5px]", expected: ".outline-\\[5px\\] {\n  outline-width: 5px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Outline Color", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "outline-inherit", expected: ".outline-inherit {\n  outline-color: inherit;\n}" },
        { classValue: "outline-current", expected: ".outline-current {\n  outline-color: currentColor;\n}" },
        { classValue: "outline-transparent", expected: ".outline-transparent {\n  outline-color: transparent;\n}" },
        { classValue: "outline-black", expected: ".outline-black {\n  outline-color: #000000;\n}" },
        { classValue: "outline-white", expected: ".outline-white {\n  outline-color: #ffffff;\n}" },
        { classValue: "outline-white/0", expected: ".outline-white\\/0 {\n  outline-color: #ffffff00;\n}" },
        { classValue: "outline-white/50", expected: ".outline-white\\/50 {\n  outline-color: #ffffff80;\n}" },
        { classValue: "outline-white/100", expected: ".outline-white\\/100 {\n  outline-color: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "outline-slate-50", expected: ".outline-slate-50 {\n  outline-color: #f8fafc;\n}" },
        { classValue: "outline-emerald-100", expected: ".outline-emerald-100 {\n  outline-color: #d1fae5;\n}" },
        { classValue: "outline-green-200", expected: ".outline-green-200 {\n  outline-color: #bbf7d0;\n}" },
        { classValue: "outline-lime-300", expected: ".outline-lime-300 {\n  outline-color: #bef264;\n}" },
        { classValue: "outline-red-400", expected: ".outline-red-400 {\n  outline-color: #f87171;\n}" },
        { classValue: "outline-orange-500", expected: ".outline-orange-500 {\n  outline-color: #f97316;\n}" },
        { classValue: "outline-amber-600", expected: ".outline-amber-600 {\n  outline-color: #d97706;\n}" },
        { classValue: "outline-yellow-700", expected: ".outline-yellow-700 {\n  outline-color: #a16207;\n}" },
        { classValue: "outline-teal-800", expected: ".outline-teal-800 {\n  outline-color: #115e59;\n}" },
        { classValue: "outline-cyan-900", expected: ".outline-cyan-900 {\n  outline-color: #164e63;\n}" },
        { classValue: "outline-sky-950", expected: ".outline-sky-950 {\n  outline-color: #082f49;\n}" },
        { classValue: "outline-[#50d71e]", expected: ".outline-\\[\\#50d71e\\] {\n  outline-color: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "outline-red-400/0", expected: ".outline-red-400\\/0 {\n  outline-color: #f8717100;\n}" },
        { classValue: "outline-red-400/50", expected: ".outline-red-400\\/50 {\n  outline-color: #f8717180;\n}" },
        { classValue: "outline-red-400/100", expected: ".outline-red-400\\/100 {\n  outline-color: #f87171;\n}" },
        {
          classValue: "outline-red-400/[.06]",
          expected: ".outline-red-400\\/\\[\\.06\\] {\n  outline-color: #f871710f;\n}"
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
        { classValue: "outline-offset-8", expected: ".outline-offset-8 {\n  outline-offset: 8px;\n}" },
        { classValue: "outline-offset-[3px]", expected: ".outline-offset-\\[3px\\] {\n  outline-offset: 3px;\n}" }
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
            ".ring-0 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}"
        },
        {
          classValue: "ring-1",
          expected:
            ".ring-1 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}"
        },
        {
          classValue: "ring-2",
          expected:
            ".ring-2 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}"
        },
        {
          classValue: "ring",
          expected:
            ".ring {\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}"
        },
        {
          classValue: "ring-4",
          expected:
            ".ring-4 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}"
        },
        {
          classValue: "ring-8",
          expected:
            ".ring-8 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(8px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}"
        },
        { classValue: "ring-inset", expected: ".ring-inset {\n  --tw-ring-inset: inset;\n}" },
        {
          classValue: "ring-[10px]",
          expected:
            ".ring-\\[10px\\] {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(10px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Ring Color", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "ring-inherit", expected: ".ring-inherit {\n  --tw-ring-color: inherit;\n}" },
        { classValue: "ring-current", expected: ".ring-current {\n  --tw-ring-color: currentColor;\n}" },
        { classValue: "ring-transparent", expected: ".ring-transparent {\n  --tw-ring-color: transparent;\n}" },
        { classValue: "ring-black", expected: ".ring-black {\n  --tw-ring-color: #000000;\n}" },
        { classValue: "ring-white", expected: ".ring-white {\n  --tw-ring-color: #ffffff;\n}" },
        { classValue: "ring-white/0", expected: ".ring-white\\/0 {\n  --tw-ring-color: #ffffff00;\n}" },
        { classValue: "ring-white/50", expected: ".ring-white\\/50 {\n  --tw-ring-color: #ffffff80;\n}" },
        { classValue: "ring-white/100", expected: ".ring-white\\/100 {\n  --tw-ring-color: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "ring-slate-50", expected: ".ring-slate-50 {\n  --tw-ring-color: #f8fafc;\n}" },
        { classValue: "ring-emerald-100", expected: ".ring-emerald-100 {\n  --tw-ring-color: #d1fae5;\n}" },
        { classValue: "ring-green-200", expected: ".ring-green-200 {\n  --tw-ring-color: #bbf7d0;\n}" },
        { classValue: "ring-lime-300", expected: ".ring-lime-300 {\n  --tw-ring-color: #bef264;\n}" },
        { classValue: "ring-red-400", expected: ".ring-red-400 {\n  --tw-ring-color: #f87171;\n}" },
        { classValue: "ring-orange-500", expected: ".ring-orange-500 {\n  --tw-ring-color: #f97316;\n}" },
        { classValue: "ring-amber-600", expected: ".ring-amber-600 {\n  --tw-ring-color: #d97706;\n}" },
        { classValue: "ring-yellow-700", expected: ".ring-yellow-700 {\n  --tw-ring-color: #a16207;\n}" },
        { classValue: "ring-teal-800", expected: ".ring-teal-800 {\n  --tw-ring-color: #115e59;\n}" },
        { classValue: "ring-cyan-900", expected: ".ring-cyan-900 {\n  --tw-ring-color: #164e63;\n}" },
        { classValue: "ring-sky-950", expected: ".ring-sky-950 {\n  --tw-ring-color: #082f49;\n}" },
        { classValue: "ring-[#50d71e]", expected: ".ring-\\[\\#50d71e\\] {\n  --tw-ring-color: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "ring-red-400/0", expected: ".ring-red-400\\/0 {\n  --tw-ring-color: #f8717100;\n}" },
        { classValue: "ring-red-400/50", expected: ".ring-red-400\\/50 {\n  --tw-ring-color: #f8717180;\n}" },
        { classValue: "ring-red-400/100", expected: ".ring-red-400\\/100 {\n  --tw-ring-color: #f87171;\n}" },
        {
          classValue: "ring-red-400/[.06]",
          expected: ".ring-red-400\\/\\[\\.06\\] {\n  --tw-ring-color: #f871710f;\n}"
        },
        { classValue: "ring-[#50d71e]/25", expected: ".ring-\\[\\#50d71e\\]\\/25 {\n  --tw-ring-color: #50d71e40;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Ring Offset Width", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "ring-offset-0",
          expected:
            ".ring-offset-0 {\n  --tw-ring-offset-width: 0px;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-1",
          expected:
            ".ring-offset-1 {\n  --tw-ring-offset-width: 1px;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-2",
          expected:
            ".ring-offset-2 {\n  --tw-ring-offset-width: 2px;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-4",
          expected:
            ".ring-offset-4 {\n  --tw-ring-offset-width: 4px;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-8",
          expected:
            ".ring-offset-8 {\n  --tw-ring-offset-width: 8px;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        { classValue: "ring-offset-[3px]", expected: ".ring-offset-\\[3px\\] {\n  --tw-ring-offset-width: 3px;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Ring Offset Color", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "ring-offset-inherit",
          expected: ".ring-offset-inherit {\n  --tw-ring-offset-color: inherit;\n}"
        },
        {
          classValue: "ring-offset-current",
          expected: ".ring-offset-current {\n  --tw-ring-offset-color: currentColor;\n}"
        },
        {
          classValue: "ring-offset-transparent",
          expected: ".ring-offset-transparent {\n  --tw-ring-offset-color: transparent;\n}"
        },
        { classValue: "ring-offset-black", expected: ".ring-offset-black {\n  --tw-ring-offset-color: #000000;\n}" },
        { classValue: "ring-offset-white", expected: ".ring-offset-white {\n  --tw-ring-offset-color: #ffffff;\n}" },
        {
          classValue: "ring-offset-white/0",
          expected: ".ring-offset-white\\/0 {\n  --tw-ring-offset-color: #ffffff00;\n}"
        },
        {
          classValue: "ring-offset-white/50",
          expected: ".ring-offset-white\\/50 {\n  --tw-ring-offset-color: #ffffff80;\n}"
        },
        {
          classValue: "ring-offset-white/100",
          expected: ".ring-offset-white\\/100 {\n  --tw-ring-offset-color: #ffffff;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "ring-offset-slate-50",
          expected:
            ".ring-offset-slate-50 {\n  --tw-ring-offset-color: #f8fafc;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-emerald-100",
          expected:
            ".ring-offset-emerald-100 {\n  --tw-ring-offset-color: #d1fae5;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-green-200",
          expected:
            ".ring-offset-green-200 {\n  --tw-ring-offset-color: #bbf7d0;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-lime-300",
          expected:
            ".ring-offset-lime-300 {\n  --tw-ring-offset-color: #bef264;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-red-400",
          expected:
            ".ring-offset-red-400 {\n  --tw-ring-offset-color: #f87171;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-orange-500",
          expected:
            ".ring-offset-orange-500 {\n  --tw-ring-offset-color: #f97316;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-amber-600",
          expected:
            ".ring-offset-amber-600 {\n  --tw-ring-offset-color: #d97706;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-yellow-700",
          expected:
            ".ring-offset-yellow-700 {\n  --tw-ring-offset-color: #a16207;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-teal-800",
          expected:
            ".ring-offset-teal-800 {\n  --tw-ring-offset-color: #115e59;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-cyan-900",
          expected:
            ".ring-offset-cyan-900 {\n  --tw-ring-offset-color: #164e63;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-sky-950",
          expected:
            ".ring-offset-sky-950 {\n  --tw-ring-offset-color: #082f49;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-[#50d71e]",
          expected:
            ".ring-offset-\\[\\#50d71e\\] {\n  --tw-ring-offset-color: #50d71e;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "ring-offset-red-400/0",
          expected:
            ".ring-offset-red-400\\/0 {\n  --tw-ring-offset-color: #f8717100;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-red-400/50",
          expected:
            ".ring-offset-red-400\\/50 {\n  --tw-ring-offset-color: #f8717180;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-red-400/100",
          expected:
            ".ring-offset-red-400\\/100 {\n  --tw-ring-offset-color: #f87171;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-red-400/[.06]",
          expected:
            ".ring-offset-red-400\\/\\[\\.06\\] {\n  --tw-ring-offset-color: #f871710f;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
        },
        {
          classValue: "ring-offset-[#50d71e]/25",
          expected:
            ".ring-offset-\\[\\#50d71e\\]\\/25 {\n  --tw-ring-offset-color: #50d71e40;\n  box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);\n}"
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
        {
          classValue: "shadow-xl",
          expected:
            ".shadow-xl {\n  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);\n}"
        },
        { classValue: "shadow-2xl", expected: ".shadow-2xl {\n  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n}" },
        {
          classValue: "shadow-inner",
          expected: ".shadow-inner {\n  box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n}"
        },
        { classValue: "shadow-none", expected: ".shadow-none {\n  box-shadow: 0 0 #0000;\n}" },
        {
          classValue: "shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]",
          expected:
            ".shadow-\\[0_35px_60px_-15px_rgba\\(0\\,0\\,0\\,0\\.3\\)\\] {\n  --tw-shadow: 0 35px 60px -15px rgba(0,0,0,0.3);\n  --tw-shadow-colored: 0 35px 60px -15px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Box Shadow Color", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "shadow-inherit", expected: ".shadow-inherit {\n  --tw-shadow-color: inherit;\n}" },
        { classValue: "shadow-current", expected: ".shadow-current {\n  --tw-shadow-color: currentColor;\n}" },
        { classValue: "shadow-transparent", expected: ".shadow-transparent {\n  --tw-shadow-color: transparent;\n}" },
        { classValue: "shadow-black", expected: ".shadow-black {\n  --tw-shadow-color: #000000;\n}" },
        { classValue: "shadow-white", expected: ".shadow-white {\n  --tw-shadow-color: #ffffff;\n}" },
        { classValue: "shadow-white/0", expected: ".shadow-white\\/0 {\n  --tw-shadow-color: #ffffff00;\n}" },
        { classValue: "shadow-white/50", expected: ".shadow-white\\/50 {\n  --tw-shadow-color: #ffffff80;\n}" },
        { classValue: "shadow-white/100", expected: ".shadow-white\\/100 {\n  --tw-shadow-color: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "shadow-slate-50", expected: ".shadow-slate-50 {\n  --tw-shadow-color: #f8fafc;\n}" },
        { classValue: "shadow-emerald-100", expected: ".shadow-emerald-100 {\n  --tw-shadow-color: #d1fae5;\n}" },
        { classValue: "shadow-green-200", expected: ".shadow-green-200 {\n  --tw-shadow-color: #bbf7d0;\n}" },
        { classValue: "shadow-lime-300", expected: ".shadow-lime-300 {\n  --tw-shadow-color: #bef264;\n}" },
        { classValue: "shadow-red-400", expected: ".shadow-red-400 {\n  --tw-shadow-color: #f87171;\n}" },
        { classValue: "shadow-orange-500", expected: ".shadow-orange-500 {\n  --tw-shadow-color: #f97316;\n}" },
        { classValue: "shadow-amber-600", expected: ".shadow-amber-600 {\n  --tw-shadow-color: #d97706;\n}" },
        { classValue: "shadow-yellow-700", expected: ".shadow-yellow-700 {\n  --tw-shadow-color: #a16207;\n}" },
        { classValue: "shadow-teal-800", expected: ".shadow-teal-800 {\n  --tw-shadow-color: #115e59;\n}" },
        { classValue: "shadow-cyan-900", expected: ".shadow-cyan-900 {\n  --tw-shadow-color: #164e63;\n}" },
        { classValue: "shadow-sky-950", expected: ".shadow-sky-950 {\n  --tw-shadow-color: #082f49;\n}" },
        { classValue: "shadow-[#50d71e]", expected: ".shadow-\\[\\#50d71e\\] {\n  --tw-shadow-color: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "shadow-red-400/0", expected: ".shadow-red-400\\/0 {\n  --tw-shadow-color: #f8717100;\n}" },
        { classValue: "shadow-red-400/50", expected: ".shadow-red-400\\/50 {\n  --tw-shadow-color: #f8717180;\n}" },
        { classValue: "shadow-red-400/100", expected: ".shadow-red-400\\/100 {\n  --tw-shadow-color: #f87171;\n}" },
        {
          classValue: "shadow-red-400/[.06]",
          expected: ".shadow-red-400\\/\\[\\.06\\] {\n  --tw-shadow-color: #f871710f;\n}"
        },
        {
          classValue: "shadow-[#50d71e]/25",
          expected: ".shadow-\\[\\#50d71e\\]\\/25 {\n  --tw-shadow-color: #50d71e40;\n}"
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
        { classValue: "mix-blend-overlay", expected: ".mix-blend-overlay {\n  mix-blend-mode: overlay;\n}" },
        { classValue: "mix-blend-darken", expected: ".mix-blend-darken {\n  mix-blend-mode: darken;\n}" },
        { classValue: "mix-blend-lighten", expected: ".mix-blend-lighten {\n  mix-blend-mode: lighten;\n}" },
        {
          classValue: "mix-blend-color-dodge",
          expected: ".mix-blend-color-dodge {\n  mix-blend-mode: color-dodge;\n}"
        },
        { classValue: "mix-blend-color-burn", expected: ".mix-blend-color-burn {\n  mix-blend-mode: color-burn;\n}" },
        { classValue: "mix-blend-hard-light", expected: ".mix-blend-hard-light {\n  mix-blend-mode: hard-light;\n}" },
        { classValue: "mix-blend-soft-light", expected: ".mix-blend-soft-light {\n  mix-blend-mode: soft-light;\n}" },
        { classValue: "mix-blend-difference", expected: ".mix-blend-difference {\n  mix-blend-mode: difference;\n}" },
        { classValue: "mix-blend-exclusion", expected: ".mix-blend-exclusion {\n  mix-blend-mode: exclusion;\n}" },
        { classValue: "mix-blend-hue", expected: ".mix-blend-hue {\n  mix-blend-mode: hue;\n}" },
        { classValue: "mix-blend-saturation", expected: ".mix-blend-saturation {\n  mix-blend-mode: saturation;\n}" },
        { classValue: "mix-blend-color", expected: ".mix-blend-color {\n  mix-blend-mode: color;\n}" },
        { classValue: "mix-blend-luminosity", expected: ".mix-blend-luminosity {\n  mix-blend-mode: luminosity;\n}" },
        {
          classValue: "mix-blend-plus-darker",
          expected: ".mix-blend-plus-darker {\n  mix-blend-mode: plus-darker;\n}"
        },
        {
          classValue: "mix-blend-plus-lighter",
          expected: ".mix-blend-plus-lighter {\n  mix-blend-mode: plus-lighter;\n}"
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Background Blend Mode", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "bg-blend-normal", expected: ".bg-blend-normal {\n  background-blend-mode: normal;\n}" },
        { classValue: "bg-blend-multiply", expected: ".bg-blend-multiply {\n  background-blend-mode: multiply;\n}" },
        { classValue: "bg-blend-screen", expected: ".bg-blend-screen {\n  background-blend-mode: screen;\n}" },
        { classValue: "bg-blend-overlay", expected: ".bg-blend-overlay {\n  background-blend-mode: overlay;\n}" },
        { classValue: "bg-blend-darken", expected: ".bg-blend-darken {\n  background-blend-mode: darken;\n}" },
        { classValue: "bg-blend-lighten", expected: ".bg-blend-lighten {\n  background-blend-mode: lighten;\n}" },
        {
          classValue: "bg-blend-color-dodge",
          expected: ".bg-blend-color-dodge {\n  background-blend-mode: color-dodge;\n}"
        },
        {
          classValue: "bg-blend-color-burn",
          expected: ".bg-blend-color-burn {\n  background-blend-mode: color-burn;\n}"
        },
        {
          classValue: "bg-blend-hard-light",
          expected: ".bg-blend-hard-light {\n  background-blend-mode: hard-light;\n}"
        },
        {
          classValue: "bg-blend-soft-light",
          expected: ".bg-blend-soft-light {\n  background-blend-mode: soft-light;\n}"
        },
        {
          classValue: "bg-blend-difference",
          expected: ".bg-blend-difference {\n  background-blend-mode: difference;\n}"
        },
        { classValue: "bg-blend-exclusion", expected: ".bg-blend-exclusion {\n  background-blend-mode: exclusion;\n}" },
        { classValue: "bg-blend-hue", expected: ".bg-blend-hue {\n  background-blend-mode: hue;\n}" },
        {
          classValue: "bg-blend-saturation",
          expected: ".bg-blend-saturation {\n  background-blend-mode: saturation;\n}"
        },
        { classValue: "bg-blend-color", expected: ".bg-blend-color {\n  background-blend-mode: color;\n}" },
        {
          classValue: "bg-blend-luminosity",
          expected: ".bg-blend-luminosity {\n  background-blend-mode: luminosity;\n}"
        }
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
          expected: `.blur-none {\n  --tw-blur: ;\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-sm",
          expected: `.blur-sm {\n  --tw-blur: blur(4px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur",
          expected: `.blur {\n  --tw-blur: blur(8px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-md",
          expected: `.blur-md {\n  --tw-blur: blur(12px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-lg",
          expected: `.blur-lg {\n  --tw-blur: blur(16px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-xl",
          expected: `.blur-xl {\n  --tw-blur: blur(24px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-2xl",
          expected: `.blur-2xl {\n  --tw-blur: blur(40px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-3xl",
          expected: `.blur-3xl {\n  --tw-blur: blur(64px);\n  ${baseFilter}\n}`
        },
        {
          classValue: "blur-[2px]",
          expected: `.blur-\\[2px\\] {\n  --tw-blur: blur(2px);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Brightness", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "brightness-0",
          expected: `.brightness-0 {\n  --tw-brightness: brightness(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "brightness-50",
          expected: `.brightness-50 {\n  --tw-brightness: brightness(0.5);\n  ${baseFilter}\n}`
        },
        {
          classValue: "brightness-200",
          expected: `.brightness-200 {\n  --tw-brightness: brightness(2);\n  ${baseFilter}\n}`
        },
        {
          classValue: "brightness-[1.75]",
          expected: `.brightness-\\[1\\.75\\] {\n  --tw-brightness: brightness(1.75);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Contrast", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "contrast-0",
          expected: `.contrast-0 {\n  --tw-contrast: contrast(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "contrast-50",
          expected: `.contrast-50 {\n  --tw-contrast: contrast(0.5);\n  ${baseFilter}\n}`
        },
        {
          classValue: "contrast-200",
          expected: `.contrast-200 {\n  --tw-contrast: contrast(2);\n  ${baseFilter}\n}`
        },
        {
          classValue: "contrast-[.25]",
          expected: `.contrast-\\[\\.25\\] {\n  --tw-contrast: contrast(.25);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Drop Shadow", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "drop-shadow-sm",
          expected: `.drop-shadow-sm {\n  --tw-drop-shadow: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05));\n  ${baseFilter}\n}`
        },
        {
          classValue: "drop-shadow",
          expected: `.drop-shadow {\n  --tw-drop-shadow: drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06));\n  ${baseFilter}\n}`
        },
        {
          classValue: "drop-shadow-md",
          expected: `.drop-shadow-md {\n  --tw-drop-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));\n  ${baseFilter}\n}`
        },
        {
          classValue: "drop-shadow-lg",
          expected: `.drop-shadow-lg {\n  --tw-drop-shadow: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));\n  ${baseFilter}\n}`
        },
        {
          classValue: "drop-shadow-xl",
          expected: `.drop-shadow-xl {\n  --tw-drop-shadow: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));\n  ${baseFilter}\n}`
        },
        {
          classValue: "drop-shadow-2xl",
          expected: `.drop-shadow-2xl {\n  --tw-drop-shadow: drop-shadow(0 25px 25px rgb(0 0 0 / 0.15));\n  ${baseFilter}\n}`
        },
        {
          classValue: "drop-shadow-none",
          expected: `.drop-shadow-none {\n  --tw-drop-shadow: drop-shadow(0 0 #0000);\n  ${baseFilter}\n}`
        },
        {
          classValue: "drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]",
          expected: `.drop-shadow-\\[0_35px_35px_rgba\\(0\\,0\\,0\\,0\\.25\\)\\] {\n  --tw-drop-shadow: drop-shadow(0 35px 35px rgba(0,0,0,0.25));\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Grayscale", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "grayscale-0",
          expected: `.grayscale-0 {\n  --tw-grayscale: grayscale(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "grayscale",
          expected: `.grayscale {\n  --tw-grayscale: grayscale(100%);\n  ${baseFilter}\n}`
        },
        {
          classValue: "grayscale-[50%]",
          expected: `.grayscale-\\[50\\%\\] {\n  --tw-grayscale: grayscale(50%);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Hue Rotate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "hue-rotate-0",
          expected: `.hue-rotate-0 {\n  --tw-hue-rotate: hue-rotate(0deg);\n  ${baseFilter}\n}`
        },
        {
          classValue: "hue-rotate-15",
          expected: `.hue-rotate-15 {\n  --tw-hue-rotate: hue-rotate(15deg);\n  ${baseFilter}\n}`
        },
        {
          classValue: "hue-rotate-180",
          expected: `.hue-rotate-180 {\n  --tw-hue-rotate: hue-rotate(180deg);\n  ${baseFilter}\n}`
        },
        {
          classValue: "hue-rotate-[270deg]",
          expected: `.hue-rotate-\\[270deg\\] {\n  --tw-hue-rotate: hue-rotate(270deg);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Invert", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "invert-0",
          expected: `.invert-0 {\n  --tw-invert: invert(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "invert",
          expected: `.invert {\n  --tw-invert: invert(100%);\n  ${baseFilter}\n}`
        },
        {
          classValue: "invert-[50%]",
          expected: `.invert-\\[50\\%\\] {\n  --tw-invert: invert(50%);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Saturate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "saturate-0",
          expected: `.saturate-0 {\n  --tw-saturate: saturate(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "saturate-50",
          expected: `.saturate-50 {\n  --tw-saturate: saturate(0.5);\n  ${baseFilter}\n}`
        },
        {
          classValue: "saturate-200",
          expected: `.saturate-200 {\n  --tw-saturate: saturate(2);\n  ${baseFilter}\n}`
        },
        {
          classValue: "saturate-[.25]",
          expected: `.saturate-\\[\\.25\\] {\n  --tw-saturate: saturate(.25);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Sepia", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "sepia-0",
          expected: `.sepia-0 {\n  --tw-sepia: sepia(0);\n  ${baseFilter}\n}`
        },
        {
          classValue: "sepia",
          expected: `.sepia {\n  --tw-sepia: sepia(100%);\n  ${baseFilter}\n}`
        },
        {
          classValue: "sepia-[50%]",
          expected: `.sepia-\\[50\\%\\] {\n  --tw-sepia: sepia(50%);\n  ${baseFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Blur", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-blur-none",
          expected: `.backdrop-blur-none {\n  --tw-backdrop-blur: ;\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur-sm",
          expected: `.backdrop-blur-sm {\n  --tw-backdrop-blur: blur(4px);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur",
          expected: `.backdrop-blur {\n  --tw-backdrop-blur: blur(8px);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur-md",
          expected: `.backdrop-blur-md {\n  --tw-backdrop-blur: blur(12px);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur-lg",
          expected: `.backdrop-blur-lg {\n  --tw-backdrop-blur: blur(16px);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur-xl",
          expected: `.backdrop-blur-xl {\n  --tw-backdrop-blur: blur(24px);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur-2xl",
          expected: `.backdrop-blur-2xl {\n  --tw-backdrop-blur: blur(40px);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur-3xl",
          expected: `.backdrop-blur-3xl {\n  --tw-backdrop-blur: blur(64px);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-blur-[2px]",
          expected: `.backdrop-blur-\\[2px\\] {\n  --tw-backdrop-blur: blur(2px);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Brightness", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-brightness-0",
          expected: `.backdrop-brightness-0 {\n  --tw-backdrop-brightness: brightness(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-brightness-50",
          expected: `.backdrop-brightness-50 {\n  --tw-backdrop-brightness: brightness(0.5);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-brightness-200",
          expected: `.backdrop-brightness-200 {\n  --tw-backdrop-brightness: brightness(2);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-brightness-[1.75]",
          expected: `.backdrop-brightness-\\[1\\.75\\] {\n  --tw-backdrop-brightness: brightness(1.75);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Contrast", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-contrast-0",
          expected: `.backdrop-contrast-0 {\n  --tw-backdrop-contrast: contrast(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-contrast-50",
          expected: `.backdrop-contrast-50 {\n  --tw-backdrop-contrast: contrast(0.5);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-contrast-200",
          expected: `.backdrop-contrast-200 {\n  --tw-backdrop-contrast: contrast(2);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-contrast-[.25]",
          expected: `.backdrop-contrast-\\[\\.25\\] {\n  --tw-backdrop-contrast: contrast(.25);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Grayscale", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-grayscale-0",
          expected: `.backdrop-grayscale-0 {\n  --tw-backdrop-grayscale: grayscale(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-grayscale",
          expected: `.backdrop-grayscale {\n  --tw-backdrop-grayscale: grayscale(100%);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-grayscale-[50%]",
          expected: `.backdrop-grayscale-\\[50\\%\\] {\n  --tw-backdrop-grayscale: grayscale(50%);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Hue Rotate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-hue-rotate-0",
          expected: `.backdrop-hue-rotate-0 {\n  --tw-backdrop-hue-rotate: hue-rotate(0deg);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-hue-rotate-15",
          expected: `.backdrop-hue-rotate-15 {\n  --tw-backdrop-hue-rotate: hue-rotate(15deg);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-hue-rotate-180",
          expected: `.backdrop-hue-rotate-180 {\n  --tw-backdrop-hue-rotate: hue-rotate(180deg);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-hue-rotate-[270deg]",
          expected: `.backdrop-hue-rotate-\\[270deg\\] {\n  --tw-backdrop-hue-rotate: hue-rotate(270deg);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Invert", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-invert-0",
          expected: `.backdrop-invert-0 {\n  --tw-backdrop-invert: invert(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-invert",
          expected: `.backdrop-invert {\n  --tw-backdrop-invert: invert(100%);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-invert-[50%]",
          expected: `.backdrop-invert-\\[50\\%\\] {\n  --tw-backdrop-invert: invert(50%);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Opacity", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-opacity-0",
          expected: `.backdrop-opacity-0 {\n  --tw-backdrop-opacity: opacity(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-opacity-5",
          expected: `.backdrop-opacity-5 {\n  --tw-backdrop-opacity: opacity(0.05);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-opacity-[.67]",
          expected: `.backdrop-opacity-\\[\\.67\\] {\n  --tw-backdrop-opacity: opacity(0.67);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Saturate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-saturate-0",
          expected: `.backdrop-saturate-0 {\n  --tw-backdrop-saturate: saturate(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-saturate-200",
          expected: `.backdrop-saturate-200 {\n  --tw-backdrop-saturate: saturate(2);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-saturate-[.25]",
          expected: `.backdrop-saturate-\\[\\.25\\] {\n  --tw-backdrop-saturate: saturate(.25);\n  ${baseBackdropFilter}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Backdrop Sepia", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "backdrop-sepia-0",
          expected: `.backdrop-sepia-0 {\n  --tw-backdrop-sepia: sepia(0);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-sepia",
          expected: `.backdrop-sepia {\n  --tw-backdrop-sepia: sepia(100%);\n  ${baseBackdropFilter}\n}`
        },
        {
          classValue: "backdrop-sepia-[50%]",
          expected: `.backdrop-sepia-\\[50\\%\\] {\n  --tw-backdrop-sepia: sepia(50%);\n  ${baseBackdropFilter}\n}`
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
          expected: ".border-spacing-x-0 {\n  border-spacing: 0px var(--tw-border-spacing-y);\n}"
        },
        {
          classValue: "border-spacing-y-0",
          expected: ".border-spacing-y-0 {\n  border-spacing: var(--tw-border-spacing-x) 0px;\n}"
        },
        { classValue: "border-spacing-px", expected: ".border-spacing-px {\n  border-spacing: 1px 1px;\n}" },
        {
          classValue: "border-spacing-x-px",
          expected: ".border-spacing-x-px {\n  border-spacing: 1px var(--tw-border-spacing-y);\n}"
        },
        {
          classValue: "border-spacing-y-px",
          expected: ".border-spacing-y-px {\n  border-spacing: var(--tw-border-spacing-x) 1px;\n}"
        },
        {
          classValue: "border-spacing-0.5",
          expected: ".border-spacing-0\\.5 {\n  border-spacing: 0.125rem 0.125rem;\n}"
        },
        {
          classValue: "border-spacing-x-0.5",
          expected: ".border-spacing-x-0\\.5 {\n  border-spacing: 0.125rem var(--tw-border-spacing-y);\n}"
        },
        {
          classValue: "border-spacing-y-0.5",
          expected: ".border-spacing-y-0\\.5 {\n  border-spacing: var(--tw-border-spacing-x) 0.125rem;\n}"
        },
        { classValue: "border-spacing-1", expected: ".border-spacing-1 {\n  border-spacing: 0.25rem 0.25rem;\n}" },
        {
          classValue: "border-spacing-x-1",
          expected: ".border-spacing-x-1 {\n  border-spacing: 0.25rem var(--tw-border-spacing-y);\n}"
        },
        {
          classValue: "border-spacing-y-1",
          expected: ".border-spacing-y-1 {\n  border-spacing: var(--tw-border-spacing-x) 0.25rem;\n}"
        },
        { classValue: "border-spacing-[7px]", expected: ".border-spacing-\\[7px\\] {\n  border-spacing: 7px 7px;\n}" },
        {
          classValue: "border-spacing-x-[7px]",
          expected: ".border-spacing-x-\\[7px\\] {\n  border-spacing: 7px var(--tw-border-spacing-y);\n}"
        },
        {
          classValue: "border-spacing-y-[7px]",
          expected: ".border-spacing-y-\\[7px\\] {\n  border-spacing: var(--tw-border-spacing-x) 7px;\n}"
        }
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
          expected: `.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  ${baseTransition}\n}`
        },
        {
          classValue: "transition-colors",
          expected: `.transition-colors {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  ${baseTransition}\n}`
        },
        {
          classValue: "transition-opacity",
          expected: `.transition-opacity {\n  transition-property: opacity;\n  ${baseTransition}\n}`
        },
        {
          classValue: "transition-shadow",
          expected: `.transition-shadow {\n  transition-property: box-shadow;\n  ${baseTransition}\n}`
        },
        {
          classValue: "transition-transform",
          expected: `.transition-transform {\n  transition-property: transform;\n  ${baseTransition}\n}`
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
          expected: `.scale-0 {\n  --tw-scale-x: 0;\n  --tw-scale-y: 0;\n  ${baseTransform}\n}`
        },
        { classValue: "scale-x-0", expected: `.scale-x-0 {\n  --tw-scale-x: 0;\n  ${baseTransform}\n}` },
        { classValue: "scale-y-0", expected: `.scale-y-0 {\n  --tw-scale-y: 0;\n  ${baseTransform}\n}` },
        {
          classValue: "scale-50",
          expected: `.scale-50 {\n  --tw-scale-x: 0.5;\n  --tw-scale-y: 0.5;\n  ${baseTransform}\n}`
        },
        { classValue: "scale-x-50", expected: `.scale-x-50 {\n  --tw-scale-x: 0.5;\n  ${baseTransform}\n}` },
        { classValue: "scale-y-50", expected: `.scale-y-50 {\n  --tw-scale-y: 0.5;\n  ${baseTransform}\n}` },
        {
          classValue: "scale-[1.7]",
          expected: `.scale-\\[1\\.7\\] {\n  --tw-scale-x: 1.7;\n  --tw-scale-y: 1.7;\n  ${baseTransform}\n}`
        },
        {
          classValue: "scale-x-[1.7]",
          expected: `.scale-x-\\[1\\.7\\] {\n  --tw-scale-x: 1.7;\n  ${baseTransform}\n}`
        },
        { classValue: "scale-y-[1.7]", expected: `.scale-y-\\[1\\.7\\] {\n  --tw-scale-y: 1.7;\n  ${baseTransform}\n}` }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Rotate", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "rotate-0", expected: `.rotate-0 {\n  --tw-rotate: 0deg;\n  ${baseTransform}\n}` },
        { classValue: "rotate-180", expected: `.rotate-180 {\n  --tw-rotate: 180deg;\n  ${baseTransform}\n}` },
        {
          classValue: "rotate-[17deg]",
          expected: `.rotate-\\[17deg\\] {\n  --tw-rotate: 17deg;\n  ${baseTransform}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Translate", () => {
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "translate-0",
          expected: `.translate-0 {\n  --tw-translate-x: 0px;\n  --tw-translate-y: 0px;\n  ${baseTransform}\n}`
        },
        { classValue: "translate-x-0", expected: `.translate-x-0 {\n  --tw-translate-x: 0px;\n  ${baseTransform}\n}` },
        { classValue: "translate-y-0", expected: `.translate-y-0 {\n  --tw-translate-y: 0px;\n  ${baseTransform}\n}` },
        {
          classValue: "translate-x-px",
          expected: `.translate-x-px {\n  --tw-translate-x: 1px;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-y-px",
          expected: `.translate-y-px {\n  --tw-translate-y: 1px;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-x-0.5",
          expected: `.translate-x-0\\.5 {\n  --tw-translate-x: 0.125rem;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-y-0.5",
          expected: `.translate-y-0\\.5 {\n  --tw-translate-y: 0.125rem;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-x-1",
          expected: `.translate-x-1 {\n  --tw-translate-x: 0.25rem;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-y-1",
          expected: `.translate-y-1 {\n  --tw-translate-y: 0.25rem;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-x-1/2",
          expected: `.translate-x-1\\/2 {\n  --tw-translate-x: 50%;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-x-3/4",
          expected: `.translate-x-3\\/4 {\n  --tw-translate-x: 75%;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-x-full",
          expected: `.translate-x-full {\n  --tw-translate-x: 100%;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-y-1/2",
          expected: `.translate-y-1\\/2 {\n  --tw-translate-y: 50%;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-y-3/4",
          expected: `.translate-y-3\\/4 {\n  --tw-translate-y: 75%;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-y-full",
          expected: `.translate-y-full {\n  --tw-translate-y: 100%;\n  ${baseTransform}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        {
          classValue: "translate-[17rem]",
          expected: `.translate-\\[17rem\\] {\n  --tw-translate-x: 17rem;\n  --tw-translate-y: 17rem;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-x-[17rem]",
          expected: `.translate-x-\\[17rem\\] {\n  --tw-translate-x: 17rem;\n  ${baseTransform}\n}`
        },
        {
          classValue: "translate-y-[17rem]",
          expected: `.translate-y-\\[17rem\\] {\n  --tw-translate-y: 17rem;\n  ${baseTransform}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Skew", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "skew-x-0", expected: `.skew-x-0 {\n  --tw-skew-x: 0deg;\n  ${baseTransform}\n}` },
        { classValue: "skew-y-0", expected: `.skew-y-0 {\n  --tw-skew-y: 0deg;\n  ${baseTransform}\n}` },
        { classValue: "skew-x-1", expected: `.skew-x-1 {\n  --tw-skew-x: 1deg;\n  ${baseTransform}\n}` },
        { classValue: "skew-y-1", expected: `.skew-y-1 {\n  --tw-skew-y: 1deg;\n  ${baseTransform}\n}` },
        {
          classValue: "skew-x-[17deg]",
          expected: `.skew-x-\\[17deg\\] {\n  --tw-skew-x: 17deg;\n  ${baseTransform}\n}`
        },
        {
          classValue: "skew-y-[17deg]",
          expected: `.skew-y-\\[17deg\\] {\n  --tw-skew-y: 17deg;\n  ${baseTransform}\n}`
        }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Transform Origin", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "origin-center", expected: ".origin-center {\n  transform-origin: center;\n}" },
        { classValue: "origin-top", expected: ".origin-top {\n  transform-origin: top;\n}" },
        { classValue: "origin-top-right", expected: ".origin-top-right {\n  transform-origin: top right;\n}" },
        { classValue: "origin-right", expected: ".origin-right {\n  transform-origin: right;\n}" },
        { classValue: "origin-bottom-right", expected: ".origin-bottom-right {\n  transform-origin: bottom right;\n}" },
        { classValue: "origin-bottom", expected: ".origin-bottom {\n  transform-origin: bottom;\n}" },
        { classValue: "origin-bottom-left", expected: ".origin-bottom-left {\n  transform-origin: bottom left;\n}" },
        { classValue: "origin-left", expected: ".origin-left {\n  transform-origin: left;\n}" },
        { classValue: "origin-top-left", expected: ".origin-top-left {\n  transform-origin: top left;\n}" },
        { classValue: "origin-[33%_75%]", expected: ".origin-\\[33\\%_75\\%\\] {\n  transform-origin: 33% 75%;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
  })
  describe("Interactivity", () => {
    describe("Accent Color", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "accent-inherit", expected: ".accent-inherit {\n  accent-color: inherit;\n}" },
        { classValue: "accent-current", expected: ".accent-current {\n  accent-color: currentColor;\n}" },
        { classValue: "accent-transparent", expected: ".accent-transparent {\n  accent-color: transparent;\n}" },
        { classValue: "accent-black", expected: ".accent-black {\n  accent-color: #000000;\n}" },
        { classValue: "accent-white", expected: ".accent-white {\n  accent-color: #ffffff;\n}" },
        { classValue: "accent-white/0", expected: ".accent-white\\/0 {\n  accent-color: #ffffff00;\n}" },
        { classValue: "accent-white/50", expected: ".accent-white\\/50 {\n  accent-color: #ffffff80;\n}" },
        { classValue: "accent-white/100", expected: ".accent-white\\/100 {\n  accent-color: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "accent-slate-50", expected: ".accent-slate-50 {\n  accent-color: #f8fafc;\n}" },
        { classValue: "accent-emerald-100", expected: ".accent-emerald-100 {\n  accent-color: #d1fae5;\n}" },
        { classValue: "accent-green-200", expected: ".accent-green-200 {\n  accent-color: #bbf7d0;\n}" },
        { classValue: "accent-lime-300", expected: ".accent-lime-300 {\n  accent-color: #bef264;\n}" },
        { classValue: "accent-red-400", expected: ".accent-red-400 {\n  accent-color: #f87171;\n}" },
        { classValue: "accent-orange-500", expected: ".accent-orange-500 {\n  accent-color: #f97316;\n}" },
        { classValue: "accent-amber-600", expected: ".accent-amber-600 {\n  accent-color: #d97706;\n}" },
        { classValue: "accent-yellow-700", expected: ".accent-yellow-700 {\n  accent-color: #a16207;\n}" },
        { classValue: "accent-teal-800", expected: ".accent-teal-800 {\n  accent-color: #115e59;\n}" },
        { classValue: "accent-cyan-900", expected: ".accent-cyan-900 {\n  accent-color: #164e63;\n}" },
        { classValue: "accent-sky-950", expected: ".accent-sky-950 {\n  accent-color: #082f49;\n}" },
        { classValue: "accent-[#50d71e]", expected: ".accent-\\[\\#50d71e\\] {\n  accent-color: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "accent-red-400/0", expected: ".accent-red-400\\/0 {\n  accent-color: #f8717100;\n}" },
        { classValue: "accent-red-400/50", expected: ".accent-red-400\\/50 {\n  accent-color: #f8717180;\n}" },
        { classValue: "accent-red-400/100", expected: ".accent-red-400\\/100 {\n  accent-color: #f87171;\n}" },
        {
          classValue: "accent-red-400/[.06]",
          expected: ".accent-red-400\\/\\[\\.06\\] {\n  accent-color: #f871710f;\n}"
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
      it.each<{ classValue: string; expected: string }>([
        { classValue: "caret-inherit", expected: ".caret-inherit {\n  caret-color: inherit;\n}" },
        { classValue: "caret-current", expected: ".caret-current {\n  caret-color: currentColor;\n}" },
        { classValue: "caret-transparent", expected: ".caret-transparent {\n  caret-color: transparent;\n}" },
        { classValue: "caret-black", expected: ".caret-black {\n  caret-color: #000000;\n}" },
        { classValue: "caret-white", expected: ".caret-white {\n  caret-color: #ffffff;\n}" },
        { classValue: "caret-white/0", expected: ".caret-white\\/0 {\n  caret-color: #ffffff00;\n}" },
        { classValue: "caret-white/50", expected: ".caret-white\\/50 {\n  caret-color: #ffffff80;\n}" },
        { classValue: "caret-white/100", expected: ".caret-white\\/100 {\n  caret-color: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "caret-slate-50", expected: ".caret-slate-50 {\n  caret-color: #f8fafc;\n}" },
        { classValue: "caret-emerald-100", expected: ".caret-emerald-100 {\n  caret-color: #d1fae5;\n}" },
        { classValue: "caret-green-200", expected: ".caret-green-200 {\n  caret-color: #bbf7d0;\n}" },
        { classValue: "caret-lime-300", expected: ".caret-lime-300 {\n  caret-color: #bef264;\n}" },
        { classValue: "caret-red-400", expected: ".caret-red-400 {\n  caret-color: #f87171;\n}" },
        { classValue: "caret-orange-500", expected: ".caret-orange-500 {\n  caret-color: #f97316;\n}" },
        { classValue: "caret-amber-600", expected: ".caret-amber-600 {\n  caret-color: #d97706;\n}" },
        { classValue: "caret-yellow-700", expected: ".caret-yellow-700 {\n  caret-color: #a16207;\n}" },
        { classValue: "caret-teal-800", expected: ".caret-teal-800 {\n  caret-color: #115e59;\n}" },
        { classValue: "caret-cyan-900", expected: ".caret-cyan-900 {\n  caret-color: #164e63;\n}" },
        { classValue: "caret-sky-950", expected: ".caret-sky-950 {\n  caret-color: #082f49;\n}" },
        { classValue: "caret-[#50d71e]", expected: ".caret-\\[\\#50d71e\\] {\n  caret-color: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "caret-red-400/0", expected: ".caret-red-400\\/0 {\n  caret-color: #f8717100;\n}" },
        { classValue: "caret-red-400/50", expected: ".caret-red-400\\/50 {\n  caret-color: #f8717180;\n}" },
        { classValue: "caret-red-400/100", expected: ".caret-red-400\\/100 {\n  caret-color: #f87171;\n}" },
        { classValue: "caret-red-400/[.06]", expected: ".caret-red-400\\/\\[\\.06\\] {\n  caret-color: #f871710f;\n}" },
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
        {
          classValue: "scroll-my-0",
          expected: ".scroll-my-0 {\n  scroll-margin-top: 0px;\n  scroll-margin-bottom: 0px;\n}"
        },
        { classValue: "scroll-ms-0", expected: ".scroll-ms-0 {\n  scroll-margin-inline-start: 0px;\n}" },
        { classValue: "scroll-me-0", expected: ".scroll-me-0 {\n  scroll-margin-inline-end: 0px;\n}" },
        { classValue: "scroll-mt-0", expected: ".scroll-mt-0 {\n  scroll-margin-top: 0px;\n}" },
        { classValue: "scroll-mr-0", expected: ".scroll-mr-0 {\n  scroll-margin-right: 0px;\n}" },
        { classValue: "scroll-mb-0", expected: ".scroll-mb-0 {\n  scroll-margin-bottom: 0px;\n}" },
        { classValue: "scroll-ml-0", expected: ".scroll-ml-0 {\n  scroll-margin-left: 0px;\n}" },
        { classValue: "scroll-m-px", expected: ".scroll-m-px {\n  scroll-margin: 1px;\n}" },
        { classValue: "scroll-m-0.5", expected: ".scroll-m-0\\.5 {\n  scroll-margin: 0.125rem;\n}" },
        { classValue: "scroll-m-1", expected: ".scroll-m-1 {\n  scroll-margin: 0.25rem;\n}" },
        { classValue: "scroll-m-1.5", expected: ".scroll-m-1\\.5 {\n  scroll-margin: 0.375rem;\n}" },
        { classValue: "scroll-m-32", expected: ".scroll-m-32 {\n  scroll-margin: 8rem;\n}" },
        {
          classValue: "scroll-mx-32",
          expected: ".scroll-mx-32 {\n  scroll-margin-left: 8rem;\n  scroll-margin-right: 8rem;\n}"
        },
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
        {
          classValue: "scroll-py-0",
          expected: ".scroll-py-0 {\n  scroll-padding-top: 0px;\n  scroll-padding-bottom: 0px;\n}"
        },
        { classValue: "scroll-ps-0", expected: ".scroll-ps-0 {\n  scroll-padding-inline-start: 0px;\n}" },
        { classValue: "scroll-pe-0", expected: ".scroll-pe-0 {\n  scroll-padding-inline-end: 0px;\n}" },
        { classValue: "scroll-pt-0", expected: ".scroll-pt-0 {\n  scroll-padding-top: 0px;\n}" },
        { classValue: "scroll-pr-0", expected: ".scroll-pr-0 {\n  scroll-padding-right: 0px;\n}" },
        { classValue: "scroll-pb-0", expected: ".scroll-pb-0 {\n  scroll-padding-bottom: 0px;\n}" },
        { classValue: "scroll-pl-0", expected: ".scroll-pl-0 {\n  scroll-padding-left: 0px;\n}" },
        { classValue: "scroll-p-px", expected: ".scroll-p-px {\n  scroll-padding: 1px;\n}" },
        { classValue: "scroll-p-0.5", expected: ".scroll-p-0\\.5 {\n  scroll-padding: 0.125rem;\n}" },
        { classValue: "scroll-p-1", expected: ".scroll-p-1 {\n  scroll-padding: 0.25rem;\n}" },
        { classValue: "scroll-p-1.5", expected: ".scroll-p-1\\.5 {\n  scroll-padding: 0.375rem;\n}" },
        { classValue: "scroll-p-32", expected: ".scroll-p-32 {\n  scroll-padding: 8rem;\n}" },
        {
          classValue: "scroll-px-32",
          expected: ".scroll-px-32 {\n  scroll-padding-left: 8rem;\n  scroll-padding-right: 8rem;\n}"
        },
        {
          classValue: "scroll-px-[32rem]",
          expected: ".scroll-px-\\[32rem\\] {\n  scroll-padding-left: 32rem;\n  scroll-padding-right: 32rem;\n}"
        }
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
        { classValue: "snap-x", expected: ".snap-x {\n  scroll-snap-type: x var(--tw-scroll-snap-strictness);\n}" },
        { classValue: "snap-y", expected: ".snap-y {\n  scroll-snap-type: y var(--tw-scroll-snap-strictness);\n}" },
        {
          classValue: "snap-both",
          expected: ".snap-both {\n  scroll-snap-type: both var(--tw-scroll-snap-strictness);\n}"
        },
        { classValue: "snap-mandatory", expected: ".snap-mandatory {\n  --tw-scroll-snap-strictness: mandatory;\n}" },
        { classValue: "snap-proximity", expected: ".snap-proximity {\n  --tw-scroll-snap-strictness: proximity;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Touch Action", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "touch-auto", expected: ".touch-auto {\n  touch-action: auto;\n}" },
        { classValue: "touch-none", expected: ".touch-none {\n  touch-action: none;\n}" },
        { classValue: "touch-pan-x", expected: ".touch-pan-x {\n  touch-action: pan-x;\n}" },
        { classValue: "touch-pan-left", expected: ".touch-pan-left {\n  touch-action: pan-left;\n}" },
        { classValue: "touch-pan-right", expected: ".touch-pan-right {\n  touch-action: pan-right;\n}" },
        { classValue: "touch-pan-y", expected: ".touch-pan-y {\n  touch-action: pan-y;\n}" },
        { classValue: "touch-pan-up", expected: ".touch-pan-up {\n  touch-action: pan-up;\n}" },
        { classValue: "touch-pan-down", expected: ".touch-pan-down {\n  touch-action: pan-down;\n}" },
        { classValue: "touch-pinch-zoom", expected: ".touch-pinch-zoom {\n  touch-action: pinch-zoom;\n}" },
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
      it.each<{ classValue: string; expected: string }>([
        { classValue: "fill-none", expected: ".fill-none {\n  fill: none;\n}" },
        { classValue: "fill-inherit", expected: ".fill-inherit {\n  fill: inherit;\n}" },
        { classValue: "fill-current", expected: ".fill-current {\n  fill: currentColor;\n}" },
        { classValue: "fill-transparent", expected: ".fill-transparent {\n  fill: transparent;\n}" },
        { classValue: "fill-black", expected: ".fill-black {\n  fill: #000000;\n}" },
        { classValue: "fill-white", expected: ".fill-white {\n  fill: #ffffff;\n}" },
        { classValue: "fill-white/0", expected: ".fill-white\\/0 {\n  fill: #ffffff00;\n}" },
        { classValue: "fill-white/50", expected: ".fill-white\\/50 {\n  fill: #ffffff80;\n}" },
        { classValue: "fill-white/100", expected: ".fill-white\\/100 {\n  fill: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "fill-slate-50", expected: ".fill-slate-50 {\n  fill: #f8fafc;\n}" },
        { classValue: "fill-emerald-100", expected: ".fill-emerald-100 {\n  fill: #d1fae5;\n}" },
        { classValue: "fill-green-200", expected: ".fill-green-200 {\n  fill: #bbf7d0;\n}" },
        { classValue: "fill-lime-300", expected: ".fill-lime-300 {\n  fill: #bef264;\n}" },
        { classValue: "fill-red-400", expected: ".fill-red-400 {\n  fill: #f87171;\n}" },
        { classValue: "fill-orange-500", expected: ".fill-orange-500 {\n  fill: #f97316;\n}" },
        { classValue: "fill-amber-600", expected: ".fill-amber-600 {\n  fill: #d97706;\n}" },
        { classValue: "fill-yellow-700", expected: ".fill-yellow-700 {\n  fill: #a16207;\n}" },
        { classValue: "fill-teal-800", expected: ".fill-teal-800 {\n  fill: #115e59;\n}" },
        { classValue: "fill-cyan-900", expected: ".fill-cyan-900 {\n  fill: #164e63;\n}" },
        { classValue: "fill-sky-950", expected: ".fill-sky-950 {\n  fill: #082f49;\n}" },
        { classValue: "fill-[#50d71e]", expected: ".fill-\\[\\#50d71e\\] {\n  fill: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "fill-red-400/0", expected: ".fill-red-400\\/0 {\n  fill: #f8717100;\n}" },
        { classValue: "fill-red-400/50", expected: ".fill-red-400\\/50 {\n  fill: #f8717180;\n}" },
        { classValue: "fill-red-400/100", expected: ".fill-red-400\\/100 {\n  fill: #f87171;\n}" },
        { classValue: "fill-red-400/[.06]", expected: ".fill-red-400\\/\\[\\.06\\] {\n  fill: #f871710f;\n}" },
        { classValue: "fill-[#50d71e]/25", expected: ".fill-\\[\\#50d71e\\]\\/25 {\n  fill: #50d71e40;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
    })
    describe("Stroke", () => {
      it.each<{ classValue: string; expected: string }>([
        { classValue: "stroke-none", expected: ".stroke-none {\n  stroke: none;\n}" },
        { classValue: "stroke-inherit", expected: ".stroke-inherit {\n  stroke: inherit;\n}" },
        { classValue: "stroke-current", expected: ".stroke-current {\n  stroke: currentColor;\n}" },
        { classValue: "stroke-transparent", expected: ".stroke-transparent {\n  stroke: transparent;\n}" },
        { classValue: "stroke-black", expected: ".stroke-black {\n  stroke: #000000;\n}" },
        { classValue: "stroke-white", expected: ".stroke-white {\n  stroke: #ffffff;\n}" },
        { classValue: "stroke-white/0", expected: ".stroke-white\\/0 {\n  stroke: #ffffff00;\n}" },
        { classValue: "stroke-white/50", expected: ".stroke-white\\/50 {\n  stroke: #ffffff80;\n}" },
        { classValue: "stroke-white/100", expected: ".stroke-white\\/100 {\n  stroke: #ffffff;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "stroke-slate-50", expected: ".stroke-slate-50 {\n  stroke: #f8fafc;\n}" },
        { classValue: "stroke-emerald-100", expected: ".stroke-emerald-100 {\n  stroke: #d1fae5;\n}" },
        { classValue: "stroke-green-200", expected: ".stroke-green-200 {\n  stroke: #bbf7d0;\n}" },
        { classValue: "stroke-lime-300", expected: ".stroke-lime-300 {\n  stroke: #bef264;\n}" },
        { classValue: "stroke-red-400", expected: ".stroke-red-400 {\n  stroke: #f87171;\n}" },
        { classValue: "stroke-orange-500", expected: ".stroke-orange-500 {\n  stroke: #f97316;\n}" },
        { classValue: "stroke-amber-600", expected: ".stroke-amber-600 {\n  stroke: #d97706;\n}" },
        { classValue: "stroke-yellow-700", expected: ".stroke-yellow-700 {\n  stroke: #a16207;\n}" },
        { classValue: "stroke-teal-800", expected: ".stroke-teal-800 {\n  stroke: #115e59;\n}" },
        { classValue: "stroke-cyan-900", expected: ".stroke-cyan-900 {\n  stroke: #164e63;\n}" },
        { classValue: "stroke-sky-950", expected: ".stroke-sky-950 {\n  stroke: #082f49;\n}" },
        { classValue: "stroke-[#50d71e]", expected: ".stroke-\\[\\#50d71e\\] {\n  stroke: #50d71e;\n}" }
      ])(`tailwind($classValue)`, ({ classValue, expected }) => {
        expect(tailwind(classValue)).toBe(expected)
      })
      it.each<{ classValue: string; expected: string }>([
        { classValue: "stroke-red-400/0", expected: ".stroke-red-400\\/0 {\n  stroke: #f8717100;\n}" },
        { classValue: "stroke-red-400/50", expected: ".stroke-red-400\\/50 {\n  stroke: #f8717180;\n}" },
        { classValue: "stroke-red-400/100", expected: ".stroke-red-400\\/100 {\n  stroke: #f87171;\n}" },
        { classValue: "stroke-red-400/[.06]", expected: ".stroke-red-400\\/\\[\\.06\\] {\n  stroke: #f871710f;\n}" },
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
  describe("SVG", () => {
    describe("Fill", () => {
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
