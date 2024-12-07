import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Loading from "fishtvue/loading/Loading.vue"

describe("Loading Component Tests", () => {
  describe("Loading Component - Without Library Initialization", () => {
    it("renders simple loading spinner by default", () => {
      const wrapper = mount(Loading, {
        props: {
          type: "simple"
        }
      })
      const svgElement = wrapper.find("svg")
      expect(svgElement.exists()).toBe(true)
      expect(svgElement.classes()).toContain("animate-[spin_1.5s_ease-in-out_infinite]")
    })

    it("applies correct animation duration", () => {
      const wrapper = mount(Loading, {
        props: { type: "simple", animationDuration: 3000 }
      })
      const svgElement = wrapper.find("svg")
      expect(svgElement.classes()).toContain("animate-[spin_3s_ease-in-out_infinite]")
    })

    it("applies correct size and color for simple spinner", () => {
      const wrapper = mount(Loading, {
        props: { type: "simple", size: 50, color: "red" }
      })
      const svgElement = wrapper.find("svg")
      expect(svgElement.attributes("width")).toBe("50")
      expect(svgElement.attributes("height")).toBe("50")
      expect(svgElement.attributes("style")).toBe("color: rgb(239, 68, 68);")
    })

    it.each([
      ["Atom", "AtomSpinner"],
      ["Flower", "FlowerSpinner"],
      ["Orbit", "OrbitSpinner"]
    ])('renders the correct spinner type "%s"', (type, expected) => {
      const wrapper = mount(Loading, {
        props: { type }
      })
      const spinner = wrapper.findComponent({ name: expected })
      expect(spinner.exists()).toBe(true)
    })

    it("uses default spinner when invalid type is provided", () => {
      const wrapper = mount(Loading, {
        props: { type: "InvalidType" }
      })
      const spinner = wrapper.findComponent({ name: "HalfCircleSpinner" })
      expect(spinner.exists()).toBe(true)
    })
  })

  describe("Loading Component - With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Loading: options
          }
        })
      }
    })

    it("applies default options from library", () => {
      const app = createAppWithFishtVue({ animationDuration: 4000 })
      const wrapper = mount(Loading, {
        global: {
          plugins: [app]
        },
        props: {
          type: "simple"
        }
      })
      const svgElement = wrapper.find("svg")
      expect(svgElement.classes()).toContain("animate-[spin_4s_ease-in-out_infinite]")
    })

    it("overrides default options with local props", () => {
      const app = createAppWithFishtVue({ animationDuration: 3000 })
      const wrapper = mount(Loading, {
        global: {
          plugins: [app]
        },
        props: {
          type: "simple",
          animationDuration: 1000
        }
      })
      const svgElement = wrapper.find("svg")
      expect(svgElement.classes()).toContain("animate-[spin_1s_ease-in-out_infinite]")
    })

    it.each([
      ["simple", null],
      ["Atom", "AtomSpinner"],
      ["BreedingRhombus", "BreedingRhombusSpinner"],
      ["CirclesToRhombuses", "CirclesToRhombusesSpinner"],
      ["Fingerprint", "FingerprintSpinner"],
      ["Flower", "FlowerSpinner"],
      ["FulfillingBouncingCircle", "FulfillingBouncingCircleSpinner"],
      ["FulfillingSquare", "FulfillingSquareSpinner"],
      ["HalfCircle", "HalfCircleSpinner"],
      ["HollowDots", "HollowDotsSpinner"],
      ["IntersectingCircles", "IntersectingCirclesSpinner"],
      ["LoopingRhombuses", "LoopingRhombusesSpinner"],
      ["Orbit", "OrbitSpinner"],
      ["Pixel", "PixelSpinner"],
      ["Radar", "RadarSpinner"],
      ["ScalingSquares", "ScalingSquaresSpinner"],
      ["SelfBuildingSquare", "SelfBuildingSquareSpinner"],
      ["Semipolar", "SemipolarSpinner"],
      ["Spring", "SpringSpinner"],
      ["SwappingSquares", "SwappingSquaresSpinner"],
      ["TrinityRings", "TrinityRingsSpinner"]
    ])('renders the correct spinner type "%s" with library', (type, expected) => {
      const app = createAppWithFishtVue()
      const wrapper = mount(Loading, {
        global: {
          plugins: [app]
        },
        props: {
          type
        }
      })

      if (expected) {
        const spinner = wrapper.findComponent({ name: expected })
        expect(spinner.exists()).toBe(true)
      } else {
        const svgElement = wrapper.find("[data-loading]")
        expect(svgElement.exists()).toBe(true)
      }
    })
  })
})
