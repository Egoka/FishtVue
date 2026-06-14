import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import AccordionItem from "fishtvue/accordion/AccordionItem.vue"

describe("AccordionItem Component (renderless descriptor)", () => {
  it("mounts without rendering visible accordion DOM", () => {
    const wrapper = mount(AccordionItem, { props: { title: "X" } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find("[data-accordion]").exists()).toBe(false)
  })

  it("accepts descriptor props", () => {
    const wrapper = mount(AccordionItem, { props: { title: "A", subtitle: "s", open: true } })
    expect(wrapper.props("title")).toBe("A")
    expect(wrapper.props("subtitle")).toBe("s")
    expect(wrapper.props("open")).toBe(true)
  })

  it("does not render its default slot content (read by parent Accordion)", () => {
    const wrapper = mount(AccordionItem, {
      props: { title: "A" },
      slots: { default: () => "child-content" }
    })
    expect(wrapper.text()).not.toContain("child-content")
  })
})
