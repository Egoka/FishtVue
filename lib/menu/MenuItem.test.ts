import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import MenuItem from "fishtvue/menu/MenuItem.vue"

describe("MenuItem Component (renderless descriptor)", () => {
  it("mounts without rendering visible menu DOM", () => {
    const wrapper = mount(MenuItem, { props: { title: "X" } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find("[data-menu-item]").exists()).toBe(false)
  })

  it("accepts descriptor props", () => {
    const wrapper = mount(MenuItem, {
      props: { title: "A", icon: "user", info: "info", disabled: true, class: "x" }
    })
    expect(wrapper.props("title")).toBe("A")
    expect(wrapper.props("icon")).toBe("user")
    expect(wrapper.props("disabled")).toBe(true)
  })

  it("does not render its default slot content (read by parent Menu)", () => {
    const wrapper = mount(MenuItem, {
      props: { title: "A" },
      slots: { default: () => "child-content" }
    })
    expect(wrapper.text()).not.toContain("child-content")
  })
})
