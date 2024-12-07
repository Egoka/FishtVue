import { vi } from "vitest"

export const mockFishtvueTheme = () => {
  vi.mock("fishtvue/theme", async () => {
    const actual = await vi.importActual("fishtvue/theme")
    return {
      ...actual,
      useStyle: vi.fn(() => ({
        isLoaded: true
      }))
    }
  })
}
