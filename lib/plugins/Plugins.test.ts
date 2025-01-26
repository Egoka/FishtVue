import { describe, expect, it } from "vitest"
import plugins from "fishtvue/plugins/Plugins"

describe("Utils Module", () => {
  it("should export nuxtInitPlugin plugin", () => {
    expect(plugins.nuxtInitPlugin).toBeDefined()
  })
})
