import { describe, it, expect } from "vitest"
import utils from "fishtvue/utils/Utils"

describe("Utils Module", () => {
  it("should export domHandler module", () => {
    expect(utils.domHandler).toBeDefined()
  })

  it("should export dateHandler module", () => {
    expect(utils.dateHandler).toBeDefined()
  })

  it("should export arrayHandler module", () => {
    expect(utils.arrayHandler).toBeDefined()
  })

  it("should export stringHandler module", () => {
    expect(utils.stringHandler).toBeDefined()
  })

  it("should export objectHandler module", () => {
    expect(utils.objectHandler).toBeDefined()
  })

  it("should export functionHandler module", () => {
    expect(utils.functionHandler).toBeDefined()
  })

  it("should export tailwindHandler module", () => {
    expect(utils.tailwindHandler).toBeDefined()
  })
})
