import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import { tailwind } from "fishtvue/theme/unoStyle/tailwind"
import Label from "fishtvue/label/Label.vue"

/**
 * RTL для Label — [label.md Issue 9](../../Documentation/issues/label.md), решение R22.
 *
 * Задача выглядела как «заменить физические классы на логические», но у горизонтальных смещений
 * логического аналога нет: `translate-x` — это арифметика, а не отступ, и в RTL нужна **смена
 * знака**, а не зеркальное свойство. Поэтому направление вынесено в множитель `--fv-label-dir`
 * (1 в LTR, -1 в RTL), а величины остались прежними — в LTR вывод побайтово тот же.
 *
 * JS-детекта направления нет: `useDirectionality()` сознательно не заводился (решение R22),
 * вся арифметика живёт в CSS.
 */
describe("Label — RTL через множитель направления", () => {
  it("движок разбирает классы смещения и переключатель направления (не fail-closed)", () => {
    // самая хрупкая часть: arbitrary value с calc и var внутри, плюс arbitrary property под rtl:
    const shift = tailwind("translate-x-[calc(16px*var(--fv-label-dir,1))]")
    expect(shift).toBeDefined()
    expect(shift).toContain("--fv-translate-x: calc(16px * var(--fv-label-dir,1))")

    const flip = tailwind("rtl:[--fv-label-dir:-1]")
    expect(flip).toBeDefined()
    expect(flip).toContain("--fv-label-dir: -1")
    expect(flip).toContain('[dir="rtl"]')
  })

  it("переключатель направления присутствует при любом типе лейбла", () => {
    for (const type of ["dynamic", "offsetDynamic", "offsetStatic", "static", "vanishing", "none"] as const) {
      const wrapper = mount(Label, { props: { label: "Email", labelMode: type } })
      expect(wrapper.find("[data-label]").classes()).toContain("rtl:[--fv-label-dir:-1]")
      wrapper.unmount()
    }
  })

  it("звёздочка обязательного поля использует логический отступ", () => {
    const wrapper = mount(Label, { props: { label: "Email", required: true } })
    const classes = wrapper.find("[data-label]").classes().join(" ")

    expect(classes).toContain("after:ms-0.5")
    expect(classes).not.toContain("after:ml-0.5")
    wrapper.unmount()
  })

  it("пользовательский translateX тоже умножается на направление", () => {
    const wrapper = mount(Label, { props: { label: "Email", translateX: 24 } })

    expect(wrapper.find("[data-label]").attributes("style")).toContain(
      "--fv-translate-x: calc(24px * var(--fv-label-dir, 1))"
    )
    wrapper.unmount()
  })
})
