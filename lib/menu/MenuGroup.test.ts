import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import MenuGroup from "fishtvue/menu/MenuGroup.vue"

describe("MenuGroup Component (renderless descriptor)", () => {
  it("mounts without rendering visible menu DOM", () => {
    const wrapper = mount(MenuGroup, { props: { title: "File" } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find("[data-menu-group]").exists()).toBe(false)
  })

  it("accepts descriptor props", () => {
    const wrapper = mount(MenuGroup, { props: { title: "File", class: "x" } })
    expect(wrapper.props("title")).toBe("File")
    expect(wrapper.props("class")).toBe("x")
  })

  it("does not render its default slot content (read by parent Menu)", () => {
    const wrapper = mount(MenuGroup, {
      props: { title: "File" },
      slots: { default: () => "child-content" }
    })
    expect(wrapper.text()).not.toContain("child-content")
  })
})
