import { flushPromises, mount } from "@vue/test-utils"
import { h, nextTick } from "vue"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Menu from "fishtvue/menu/Menu.vue"
import MenuItem from "fishtvue/menu/MenuItem.vue"
import MenuGroup from "fishtvue/menu/MenuGroup.vue"
import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
import { GroupMenu, ItemMenuPrivate, MenuOption, MenuProps } from "fishtvue/menu/Menu"
import { StyleMode } from "fishtvue/types"

// Issue 7: heroicons (item / separator SVG) теперь резолвятся async — ждём microtasks + macrotask.
const flushHero = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r))
  await flushPromises()
}

describe("Menu Component", () => {
  // Глобальные componentsOptions (через app.use(FishtVue, …)) пишутся в window.FishtVue и
  // протекают между тестами (см. MEMORY: i18n & test isolation). Чистим до/после каждого теста,
  // чтобы plain-mount тесты не подхватывали leaked options (напр. horizontal: true).
  beforeEach(() => {
    delete (window as any).FishtVue
  })
  afterEach(() => {
    delete (window as any).FishtVue
  })

  describe("Menu Component - Without Library Initialization", () => {
    const mockGroups = () => [
      {
        title: "Group 1",
        items: [
          { title: "Profile", icon: "user" },
          { title: "Billing", icon: "envelope" },
          { title: "Settings", icon: "cog-6-tooth" }
        ]
      },
      {
        title: "Group 2",
        separator: { icon: "chevron-right" },
        items: [
          { title: "Support", icon: "question-mark-circle", disabled: true },
          { title: "API", icon: "bell" }
        ]
      }
    ]

    it("renders menu groups and items correctly", async () => {
      const wrapper = mount(Menu, {
        props: { groups: mockGroups() }
      })
      await nextTick()

      // Проверяем группы меню
      const groups = wrapper.findAll("[data-menu-group]")
      expect(groups.length).toBe(2)

      // Проверяем пункты первой группы
      const group1Items = groups[0].findAll("[data-menu-item]")
      expect(group1Items.length).toBe(3)
      expect(group1Items[0].text()).toContain("Profile")
      expect(group1Items[1].text()).toContain("Billing")
      expect(group1Items[2].text()).toContain("Settings")

      // Проверяем пункты второй группы
      const group2Items = groups[1].findAll("[data-menu-item]")
      expect(group2Items.length).toBe(2)
      expect(group2Items[0].text()).toContain("Support")
      expect(group2Items[1].text()).toContain("API")
    })

    it("applies disabled styles to disabled items", async () => {
      const wrapper = mount(Menu, {
        props: { groups: mockGroups() }
      })
      await nextTick()

      const disabledItem = wrapper.find('[aria-disabled="true"]')
      expect(disabledItem.exists()).toBe(true)
      expect(disabledItem.classes()).toContain("pointer-events-none")
      expect(disabledItem.classes()).toContain("opacity-50")
    })

    it("renders separators between groups with icons", async () => {
      const wrapper = mount(Menu, {
        props: { groups: mockGroups() }
      })
      await nextTick()
      await flushHero()

      const separators = wrapper.findAll("[data-separator]")
      expect(separators.length).toBe(1)

      const separatorIcon = separators[0].find("svg")
      expect(separatorIcon.exists()).toBe(true)
    })
    it("renders items with only icons when 'only-icons' is true", async () => {
      const wrapper = mount(Menu, {
        props: {
          groups: mockGroups(),
          onlyIcons: true
        }
      })
      await flushHero()

      const items = wrapper.findAll("[data-menu-item]")
      for (const item of items) {
        const icon = item.find("svg")
        expect(icon.exists()).toBe(true)

        const title = item.find("[data-title]")
        expect(title.exists()).toBe(true)
      }
    })

    it("applies selected styles to selected items", async () => {
      const wrapper = mount(Menu, {
        props: {
          groups: mockGroups(),
          selected: true
        }
      })
      await nextTick()

      const item = wrapper.findAll("[data-menu-item]")[0]
      await item.trigger("click")

      expect(item.classes()).toContain("font-semibold")
    })

    it("renders menu horizontally when 'horizontal' is true", async () => {
      const wrapper = mount(Menu, {
        props: {
          groups: mockGroups(),
          horizontal: true
        }
      })
      await nextTick()

      const menu = wrapper.find("[data-menu]")
      expect(menu.classes()).toContain("flex-row")
    })

    it("renders nested menus correctly", async () => {
      const nestedGroups = [
        {
          title: "Main",
          items: [
            {
              title: "Profile",
              icon: "user",
              menu: {
                groups: [
                  {
                    title: "Submenu",
                    items: [
                      { title: "Settings", icon: "cog-6-tooth" },
                      { title: "Log out", icon: "logout" }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ]

      const wrapper = mount(Menu, {
        props: { groups: nestedGroups }
      })
      await nextTick()

      const mainItem = wrapper.find("[data-menu-item]")
      expect(mainItem.text()).toContain("Profile")

      const nestedMenu = wrapper.findComponent(Menu)
      expect(nestedMenu.exists()).toBe(true)

      const nestedItems = nestedMenu.findAll("[data-menu-item]  [data-title]")
      expect(nestedItems.length).toBe(3)
      expect(nestedItems[0].text()).toContain("Profile")
      expect(nestedItems[1].text()).toContain("Settings")
      expect(nestedItems[2].text()).toContain("Log out")
    })

    describe("Menu Component - Methods overItem and leaveItem", () => {
      it("emits 'onActive', 'onInactive' and 'onClick' event on menu item", async () => {
        const consoleMock = vi.spyOn(console, "log")
        const mockGroups: Array<GroupMenu> = [
          {
            title: "Group 1",
            items: [
              {
                title: "Profile",
                onActive(event: PointerEvent, item: ItemMenuPrivate) {
                  console.log("onActive Profile", event, item)
                },
                onInactive(event: PointerEvent, item: ItemMenuPrivate) {
                  console.log("onInactive Profile", event, item)
                },
                onClick(event: PointerEvent, item: ItemMenuPrivate) {
                  console.log("onClick Profile", event, item)
                }
              },
              { title: "Billing" }
            ]
          }
        ]

        const wrapper = mount(Menu, {
          props: {
            groups: mockGroups
          }
        })
        await nextTick()

        const menuItem = wrapper.find("[data-menu-item]")
        expect(menuItem.exists()).toBe(true)

        // Наведение на элемент
        await menuItem.trigger("pointerenter")
        expect(consoleMock.mock.lastCall?.[0]).toBe("onActive Profile")
        expect((wrapper.emitted("onActive")?.[0]?.[1] as any).title).toBe("Profile")
        await menuItem.trigger("pointerleave")
        expect(consoleMock.mock.lastCall?.[0]).toBe("onInactive Profile")
        expect((wrapper.emitted("onActive")?.[0]?.[1] as any).title).toBe("Profile")
        await menuItem.trigger("click")
        expect(consoleMock.mock.lastCall?.[0]).toBe("onClick Profile")
        expect((wrapper.emitted("onActive")?.[0]?.[1] as any).title).toBe("Profile")
      })
    })

    it.each([
      { mode: "filled", expected: "bg-stone-100 dark:bg-stone-900 rounded-md" },
      { mode: "outlined", expected: "bg-white dark:bg-neutral-950 rounded-md" },
      { mode: "underlined", expected: "bg-stone-50 dark:bg-stone-950" }
    ])(`should apply correct styles for mode: $mode`, async ({ mode, expected }) => {
      // Монтируем компонент с текущим значением mode
      const wrapper = mount(Menu, {
        props: {
          mode: mode as StyleMode,
          groups: [{}]
        }
      })
      await nextTick()

      // Проверяем, что prop mode установлен корректно
      expect((wrapper as any).props("mode")).toBe(mode)
      expect(wrapper.find("[data-menu]").classes().join(" ")).toContain(expected)
    })

    it("should fall back to default mode if none provided", async () => {
      const wrapper = mount(Menu, {
        props: {
          groups: [{}]
        }
      })
      await nextTick()
      expect((wrapper as any).vm.mode).toBe("outlined")
      expect(wrapper.find("[data-menu]").classes().join(" ")).toContain("bg-white dark:bg-neutral-950 rounded-md")
    })

    it("should throw a warning for invalid mode value", () => {
      const wrapper = mount(Menu, {
        props: {
          // @ts-ignore
          mode: "invalid-mode" // Некорректное значение
        }
      })
      expect(wrapper.vm.mode).toBe("invalid-mode")
      expect(wrapper.vm.modeStyle).toBe("")
    })

    describe("Menu Component - styles prop", () => {
      const customStyles = {
        activeRows: "active-rows-class",
        selectedRows: "selected-rows-class"
      }

      it("should apply the custom activeRows style class", async () => {
        const wrapper = mount(Menu, {
          props: {
            groups: mockGroups(),
            styles: customStyles
          } as MenuProps
        })
        await nextTick()

        // Симулируем установку активного элемента
        const menuElement = wrapper.find("[data-menu-item]")
        await menuElement.trigger("pointerenter")

        // Проверяем, что применяется класс activeRows
        expect(menuElement.classes().join(" ")).toContain("active-rows-class")
      })

      it("should apply the custom selectedRows style class", async () => {
        const wrapper = mount(Menu, {
          props: {
            selected: true,
            groups: mockGroups(),
            styles: customStyles
          } as MenuProps
        })
        await nextTick()

        // Симулируем выбор элемента
        const menuElement = wrapper.find("[data-menu-item]")
        await menuElement.trigger("click")

        // Проверяем, что применяется класс selectedRows
        expect(menuElement.classes().join(" ")).toContain("selected-rows-class")
      })

      it("should not apply custom styles if styles prop is not provided", async () => {
        const wrapper = mount(Menu, {
          props: {
            groups: mockGroups()
          }
        })
        await nextTick()

        // Проверяем, что классы activeRows и selectedRows не применяются по умолчанию
        const menuElement = wrapper.find("[data-menu-item]")
        expect(menuElement.classes().join(" ")).not.toContain("active-rows-class")
        expect(menuElement.classes().join(" ")).not.toContain("selected-rows-class")
      })
    })
  })

  describe("Menu Component - FishtVue Integration", () => {
    const createAppWithFishtVue = (options: MenuOption = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Menu: options
          }
        })
      }
    })
    it("renders menu with global options", async () => {
      const app: any = createAppWithFishtVue({
        styles: {
          class: { body: "custom-body-class" }
        }
      })

      const wrapper = mount(Menu, {
        global: { plugins: [app] },
        props: {
          groups: [
            {
              title: "Group 1",
              items: [{ title: "Profile" }]
            }
          ]
        }
      })
      await nextTick()

      const menuBody = wrapper.find("[data-menu]")
      expect(menuBody.exists()).toBe(true)
      expect(menuBody.classes()).toContain("custom-body-class")
    })

    it("overrides global options with props", async () => {
      const app: any = createAppWithFishtVue({
        styles: {
          class: { body: "global-body-class", title: "global-title-class" }
        }
      })

      const wrapper = mount(Menu, {
        global: { plugins: [app] },
        props: {
          title: "Menu",
          groups: [
            {
              title: "Group 1",
              items: [{ title: "Profile" }]
            }
          ],
          styles: {
            class: { body: "prop-body-class" }
          }
        } as MenuProps
      })
      await nextTick()

      const menuBody = wrapper.find("[data-menu]")
      expect(menuBody.exists()).toBe(true)
      expect(menuBody.classes()).toContain("prop-body-class")
      expect(menuBody.classes()).toContain("global-body-class")
      const menuTitle = wrapper.find("[data-menu-title]")
      expect(menuTitle.classes()).toContain("global-title-class")
    })

    it("renders menu items with icons based on global options", async () => {
      const app: any = createAppWithFishtVue({
        onlyIcons: true
      })

      const wrapper = mount(Menu, {
        global: { plugins: [app] },
        props: {
          groups: [
            {
              title: "Group 1",
              items: [
                { title: "Profile", icon: "user" },
                { title: "Billing", icon: "envelope" }
              ]
            }
          ]
        }
      })
      await flushHero()

      const items = wrapper.findAll("[data-menu-item]")
      for (const item of items) {
        const icon = item.find("svg")
        expect(icon.exists()).toBe(true)

        const title = item.find("[data-title]")
        expect(title.exists()).toBe(true)
      }
    })

    it("supports separators based on global options", async () => {
      const app: any = createAppWithFishtVue({
        styles: { class: { separatorIcon: "chevron-right" } },
        separator: { icon: "chevron-right" }
      })

      const wrapper = mount(Menu, {
        global: { plugins: [app] },
        props: {
          groups: [
            {
              title: "Group 1",
              items: [{ title: "Profile" }]
            },
            {
              title: "Group 2",
              items: [{ title: "Settings" }]
            }
          ]
        }
      })
      await nextTick()
      await flushHero()

      const separatorIcons = wrapper.findAll("svg")
      expect(separatorIcons.length).toBeGreaterThan(0)
      expect(separatorIcons[0].classes()).toContain("chevron-right")
    })

    it("renders nested menus with global options", async () => {
      const app: any = createAppWithFishtVue({
        horizontal: true
      })

      const wrapper = mount(Menu, {
        global: { plugins: [app] },
        props: {
          groups: [
            {
              title: "Group 1",
              items: [
                {
                  title: "Profile",
                  menu: {
                    groups: [
                      {
                        title: "Submenu",
                        items: [{ title: "Settings" }, { title: "Log out" }]
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      })
      await nextTick()

      const nestedMenu = wrapper.findComponent(Menu)
      expect(nestedMenu.exists()).toBe(true)

      const nestedItems = nestedMenu.findAll("[data-menu-item] [data-title]")
      expect(nestedItems.length).toBe(3)
      expect(nestedItems[0].text()).toContain("Profile")
      expect(nestedItems[1].text()).toContain("Settings")
    })
  })

  // ---ISSUE 1 — XSS guard через #item-info slot вместо v-html -----------------------------------
  describe("Menu Component - XSS guard (item.info)", () => {
    const xss = '<img src=x onerror="window.__menuXss = true">'

    it("renders item.info as text, not as HTML (no injected <img>)", async () => {
      const wrapper = mount(Menu, {
        props: { groups: [{ items: [{ title: "A", info: xss }] }] }
      })
      await nextTick()
      const info = wrapper.find("[data-info='true']")
      expect(info.exists()).toBe(true)
      // v-html создал бы реальный <img>; text-interpolation — нет
      expect(info.find("img").exists()).toBe(false)
      expect(info.text()).toContain("<img")
    })

    it("renders item.info as text inside FixWindow branch (onlyIcons)", async () => {
      const wrapper = mount(Menu, {
        props: { onlyIcons: true, groups: [{ items: [{ title: "A", icon: "user", info: xss }] }] }
      })
      await nextTick()
      const info = wrapper.find("[data-info='true']")
      expect(info.exists()).toBe(true)
      expect(info.find("img").exists()).toBe(false)
    })

    it("uses #item-info scoped slot when provided", async () => {
      const wrapper = mount(Menu, {
        props: { groups: [{ items: [{ title: "A", info: "raw-info" }] }] },
        slots: {
          "item-info": (scope: any) => h("b", { class: "custom-info" }, scope?.info)
        }
      })
      await nextTick()
      const custom = wrapper.find("b.custom-info")
      expect(custom.exists()).toBe(true)
      expect(custom.text()).toContain("raw-info")
    })
  })

  // ---ISSUE 9 — prefers-reduced-motion -----------------------------------------------------------
  describe("Menu Component - reduced motion", () => {
    it("applies motion-safe transition on the menu container by default", async () => {
      const wrapper = mount(Menu, { props: { groups: [{ items: [{ title: "A" }] }] } })
      await nextTick()
      const cls = wrapper.find("[data-menu]").classes().join(" ")
      expect(cls).toContain("motion-safe:transition-all")
    })
  })

  // ---ISSUE 4 — ARIA ----------------------------------------------------------------------------
  describe("Menu Component - ARIA", () => {
    it("sets aria-orientation on root (vertical / horizontal)", async () => {
      const v = mount(Menu, { props: { groups: [{ items: [{ title: "A" }] }] } })
      await nextTick()
      expect(v.find("[data-menu]").attributes("aria-orientation")).toBe("vertical")

      const hr = mount(Menu, { props: { horizontal: true, groups: [{ items: [{ title: "A" }] }] } })
      await nextTick()
      expect(hr.find("[data-menu]").attributes("aria-orientation")).toBe("horizontal")
    })

    it("sets aria-haspopup + aria-expanded on items with a submenu", async () => {
      const v = mount(Menu, {
        props: { groups: [{ items: [{ title: "P", menu: { groups: [{ items: [{ title: "S" }] }] } }] }] }
      })
      await nextTick()
      const item = v.find("[data-menu-item]")
      expect(item.attributes("aria-haspopup")).toBe("menu")
      expect(item.attributes("aria-expanded")).toBe("false")
    })

    it("omits aria-haspopup on plain items", async () => {
      const v = mount(Menu, { props: { groups: [{ items: [{ title: "A" }] }] } })
      await nextTick()
      expect(v.find("[data-menu-item]").attributes("aria-haspopup")).toBeUndefined()
    })

    it("toggles aria-expanded when the submenu FixWindow opens/closes", async () => {
      const v = mount(Menu, {
        props: { groups: [{ items: [{ title: "P", menu: { groups: [{ items: [{ title: "S" }] }] } }] }] }
      })
      await nextTick()
      const item = v.find("[data-menu-item]")
      const fw = v.findComponent(FixWindow)
      expect(fw.exists()).toBe(true)
      fw.vm.$emit("open")
      await nextTick()
      expect(item.attributes("aria-expanded")).toBe("true")
      fw.vm.$emit("close")
      await nextTick()
      expect(item.attributes("aria-expanded")).toBe("false")
    })

    it("marks group separators with role=separator", async () => {
      const v = mount(Menu, {
        props: {
          groups: [
            { title: "G1", items: [{ title: "A" }] },
            { title: "G2", items: [{ title: "B" }] }
          ]
        }
      })
      await nextTick()
      const sep = v.find("[data-separator]")
      expect(sep.exists()).toBe(true)
      expect(sep.attributes("role")).toBe("separator")
    })
  })

  // ---ISSUE 3 — keyboard navigation -------------------------------------------------------------
  describe("Menu Component - keyboard navigation", () => {
    const kbGroups = () => [{ items: [{ title: "Apple" }, { title: "Banana", disabled: true }, { title: "Cherry" }] }]

    it("uses roving tabindex (first focusable=0, rest=-1, no -2)", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      const items = v.findAll("[data-menu-item]")
      expect(items[0].attributes("tabindex")).toBe("0")
      expect(items[1].attributes("tabindex")).toBe("-1")
      expect(items[2].attributes("tabindex")).toBe("-1")
      items.forEach((i) => expect(i.attributes("tabindex")).not.toBe("-2"))
    })

    it("ArrowDown moves roving focus to the next focusable item (skips disabled)", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowDown" })
      await nextTick()
      const items = v.findAll("[data-menu-item]")
      expect(items[0].attributes("tabindex")).toBe("-1")
      expect(items[2].attributes("tabindex")).toBe("0")
    })

    it("ArrowUp moves roving focus back", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "End" })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowUp" })
      await nextTick()
      const items = v.findAll("[data-menu-item]")
      expect(items[0].attributes("tabindex")).toBe("0")
    })

    it("Home/End jump to first/last focusable", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "End" })
      await nextTick()
      expect(v.findAll("[data-menu-item]")[2].attributes("tabindex")).toBe("0")
      await v.find("[data-menu]").trigger("keydown", { key: "Home" })
      await nextTick()
      expect(v.findAll("[data-menu-item]")[0].attributes("tabindex")).toBe("0")
    })

    it("Enter activates the focused item (emits onClick)", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "Enter" })
      expect(v.emitted("onClick")).toBeTruthy()
      expect((v.emitted("onClick")![0][1] as any).title).toBe("Apple")
    })

    it("Space activates the focused item (emits onClick)", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: " " })
      expect(v.emitted("onClick")).toBeTruthy()
    })

    it("typeahead focuses item by first letter", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "c" })
      await nextTick()
      expect(v.findAll("[data-menu-item]")[2].attributes("tabindex")).toBe("0")
    })

    it("horizontal: ArrowRight/ArrowLeft navigate items", async () => {
      const v = mount(Menu, { props: { horizontal: true, groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowRight" })
      await nextTick()
      expect(v.findAll("[data-menu-item]")[2].attributes("tabindex")).toBe("0")
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowLeft" })
      await nextTick()
      expect(v.findAll("[data-menu-item]")[0].attributes("tabindex")).toBe("0")
    })
  })

  // ---ISSUE 6 — submenu focus trap --------------------------------------------------------------
  describe("Menu Component - submenu focus trap", () => {
    it("enables focus-trap on the submenu FixWindow after keyboard interaction", async () => {
      const v = mount(Menu, {
        props: {
          groups: [{ items: [{ title: "P", menu: { groups: [{ items: [{ title: "S" }] }] } }] }]
        }
      })
      await nextTick()
      // до клавиатуры focus-trap не активен (hover не должен красть фокус)
      expect(v.findComponent(FixWindow).props("focusTrap")).toBeFalsy()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowRight" })
      await nextTick()
      expect(v.findComponent(FixWindow).props("focusTrap")).toBe(true)
    })
  })

  // ---ISSUE 2 — compound API <Menu><MenuItem>/<MenuGroup> ---------------------------------------
  describe("Menu Component - compound API", () => {
    it("renders top-level <MenuItem> children as items", async () => {
      const v = mount(Menu, {
        slots: { default: () => [h(MenuItem, { title: "Open" }), h(MenuItem, { title: "Save" })] }
      })
      await nextTick()
      const items = v.findAll("[data-menu-item]")
      expect(items.length).toBe(2)
      expect(items[0].text()).toContain("Open")
      expect(items[1].text()).toContain("Save")
    })

    it("groups children with <MenuGroup>", async () => {
      const v = mount(Menu, {
        slots: {
          default: () => [h(MenuGroup, { title: "File" }, () => [h(MenuItem, { title: "Open" })])]
        }
      })
      await nextTick()
      expect(v.find("[data-menu-group-title]").text()).toContain("File")
      expect(v.findAll("[data-menu-item]").length).toBe(1)
    })

    it("treats nested <MenuItem> as a submenu", async () => {
      const v = mount(Menu, {
        slots: {
          default: () => [h(MenuItem, { title: "Parent" }, () => [h(MenuItem, { title: "Child" })])]
        }
      })
      await nextTick()
      const parent = v.find("[data-menu-item]")
      expect(parent.attributes("aria-haspopup")).toBe("menu")
      expect(v.findComponent(Menu).exists()).toBe(true)
    })

    it("uses text content as title fallback", async () => {
      const v = mount(Menu, { slots: { default: () => [h(MenuItem, null, () => "Inline")] } })
      await nextTick()
      expect(v.find("[data-menu-item]").text()).toContain("Inline")
    })

    it(":groups prop wins over compound children (backward compat)", async () => {
      const v = mount(Menu, {
        props: { groups: [{ items: [{ title: "FromProp" }] }] },
        slots: { default: () => [h(MenuItem, { title: "FromSlot" })] }
      })
      await nextTick()
      expect(v.text()).toContain("FromProp")
      expect(v.text()).not.toContain("FromSlot")
    })

    it("forwards @click handler from <MenuItem>", async () => {
      const onClick = vi.fn()
      const v = mount(Menu, {
        slots: { default: () => [h(MenuItem, { title: "X", onClick })] }
      })
      await nextTick()
      await v.find("[data-menu-item]").trigger("click")
      expect(onClick).toHaveBeenCalled()
    })
  })

  // ---ISSUE 3/6 — keyboard submenu open/close ---------------------------------------------------
  describe("Menu Component - keyboard submenu open/close", () => {
    const subGroups = () => [{ items: [{ title: "Parent", menu: { groups: [{ items: [{ title: "Child" }] }] } }] }]

    it("ArrowRight (vertical) opens submenu of focused item → aria-expanded true", async () => {
      const v = mount(Menu, { props: { groups: subGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowRight" })
      await nextTick()
      expect(v.find("[data-menu-item]").attributes("aria-expanded")).toBe("true")
    })

    it("ArrowLeft closes the open submenu", async () => {
      const v = mount(Menu, { props: { groups: subGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowRight" })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowLeft" })
      await nextTick()
      expect(v.find("[data-menu-item]").attributes("aria-expanded")).toBe("false")
    })

    it("Escape closes the open submenu", async () => {
      const v = mount(Menu, { props: { groups: subGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowRight" })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "Escape" })
      await nextTick()
      expect(v.find("[data-menu-item]").attributes("aria-expanded")).toBe("false")
    })

    it("ArrowRight on an item without submenu is a no-op (no error, no expanded)", async () => {
      const v = mount(Menu, { props: { groups: [{ items: [{ title: "A" }] }] } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "ArrowRight" })
      await nextTick()
      expect(v.find("[data-menu-item]").attributes("aria-expanded")).toBeUndefined()
    })

    it("typeahead with no match keeps focus unchanged", async () => {
      const v = mount(Menu, { props: { groups: [{ items: [{ title: "Apple" }, { title: "Cherry" }] }] } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "z" })
      await nextTick()
      expect(v.findAll("[data-menu-item]")[0].attributes("tabindex")).toBe("0")
    })
  })

  // ---G34 — root element ref expose --------------------------------------------------------------
  describe("Menu Component - Expose root element ref (G34)", () => {
    it("exposes rootRef pointing at the [data-menu] root", async () => {
      const wrapper = mount(Menu, { props: { groups: [{ items: [{ title: "A" }] }] } })
      await nextTick()
      const root = wrapper.find("[data-menu]")
      expect(root.exists()).toBe(true)
      expect((wrapper.vm as any).rootRef).toBe(root.element)
    })

    it("rootRef is null until groups render (root behind v-if)", () => {
      const wrapper = mount(Menu, { props: { groups: [] } })
      expect((wrapper.vm as any).rootRef).toBeNull()
    })
  })

  // ---F31 — RTL logical classes -----------------------------------------------------------------
  describe("Menu Component - RTL logical classes (F31)", () => {
    it("group title uses logical ms/me/text-start (not ml/mr/text-left)", async () => {
      const wrapper = mount(Menu, {
        props: {
          groups: [
            { title: "G1", items: [{ title: "A" }] },
            { title: "G2", items: [{ title: "B" }] }
          ]
        }
      })
      await nextTick()
      const cls = wrapper.find("[data-menu-group-title]").classes()
      expect(cls).toContain("ms-4")
      expect(cls).toContain("me-2")
      expect(cls).toContain("text-start")
      expect(cls).not.toContain("ml-4")
      expect(cls).not.toContain("mr-2")
      expect(cls).not.toContain("text-left")
    })

    it("horizontal item uses logical me-0.5 (not mr-0.5)", async () => {
      const wrapper = mount(Menu, {
        props: { horizontal: true, groups: [{ items: [{ title: "A" }, { title: "B" }] }] }
      })
      await nextTick()
      const cls = wrapper.find("[data-menu-item]").classes()
      expect(cls).toContain("me-0.5")
      expect(cls).not.toContain("mr-0.5")
    })

    it("item info uses logical ms-auto/ps (not ml-auto/pl)", async () => {
      const wrapper = mount(Menu, { props: { groups: [{ items: [{ title: "A", info: "⌘K" }] }] } })
      await nextTick()
      const info = wrapper.find("[data-info='true']")
      expect(info.exists()).toBe(true)
      expect(info.classes()).toContain("ms-auto")
      expect(info.classes()).not.toContain("ml-auto")
      expect(info.classes().join(" ")).toContain("ps-2")
      expect(info.classes().join(" ")).not.toContain("pl-2")
    })

    it("submenu chevron mirrors under RTL via rtl:-scale-x-100", async () => {
      const wrapper = mount(Menu, {
        props: { groups: [{ items: [{ title: "P", menu: { groups: [{ items: [{ title: "S" }] }] } }] }] }
      })
      await nextTick()
      expect((wrapper.vm as any).classItemRightIcon).toContain("rtl:-scale-x-100")
    })
  })

  // ---F31 — RTL submenu placement flip ----------------------------------------------------------
  describe("Menu Component - RTL submenu placement flip (F31)", () => {
    // Таргетированный mock: getComputedStyle([data-menu] root) → rtl; остальные элементы —
    // оригинал (чтобы не ломать FixWindow и прочие getComputedStyle-вызовы).
    let restoreGCS: (() => void) | null = null
    const mockRtl = () => {
      const orig = window.getComputedStyle
      ;(window as any).getComputedStyle = (el: Element, pseudo?: string) =>
        el?.matches?.("[data-menu]") ? ({ direction: "rtl" } as any) : orig(el, pseudo as any)
      restoreGCS = () => {
        ;(window as any).getComputedStyle = orig
      }
    }
    afterEach(() => {
      restoreGCS?.()
      restoreGCS = null
    })

    const submenuGroups = () => [{ items: [{ title: "P", menu: { groups: [{ items: [{ title: "S" }] }] } }] }]
    const onlyIconsGroups = () => [{ items: [{ title: "A", icon: "user" }] }]

    it("keeps physical submenu position in LTR (right-top)", async () => {
      const wrapper = mount(Menu, { props: { groups: submenuGroups() } })
      await flushPromises()
      await nextTick()
      const fw = wrapper.findComponent(FixWindow)
      expect(fw.exists()).toBe(true)
      expect(fw.props("position")).toBe("right-top")
    })

    it("flips submenu side to left-top under dir=rtl", async () => {
      mockRtl()
      const wrapper = mount(Menu, { props: { groups: submenuGroups() } })
      await flushPromises()
      await nextTick()
      const fw = wrapper.findComponent(FixWindow)
      expect(fw.props("position")).toBe("left-top")
    })

    it("keeps onlyIcons tooltip physical (right) in LTR", async () => {
      const wrapper = mount(Menu, { props: { onlyIcons: true, groups: onlyIconsGroups() } })
      await flushHero()
      await nextTick()
      const fw = wrapper.findComponent(FixWindow)
      expect(fw.exists()).toBe(true)
      expect(fw.props("position")).toBe("right")
    })

    it("flips onlyIcons tooltip side from right to left under dir=rtl", async () => {
      mockRtl()
      const wrapper = mount(Menu, { props: { onlyIcons: true, groups: onlyIconsGroups() } })
      await flushHero()
      await nextTick()
      const fw = wrapper.findComponent(FixWindow)
      expect(fw.props("position")).toBe("left")
    })
  })
})
