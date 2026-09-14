import { flushPromises, mount } from "@vue/test-utils"
import { h, nextTick } from "vue"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Menu from "fishtvue/menu/Menu.vue"
import MenuItem from "fishtvue/menu/MenuItem.vue"
import MenuGroup from "fishtvue/menu/MenuGroup.vue"
import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
import { MenuGroupData, MenuItemDataPrivate, MenuOption, MenuProps } from "fishtvue/menu/Menu"
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
  // чтобы plain-mount тесты не подхватывали leaked options (напр. orientation: "horizontal").
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
          orientation: "horizontal"
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
      it("emits 'item-active', 'item-inactive' and 'item-click' event on menu item", async () => {
        const consoleMock = vi.spyOn(console, "log")
        const mockGroups: Array<MenuGroupData> = [
          {
            title: "Group 1",
            items: [
              {
                title: "Profile",
                onActive(event: PointerEvent, item: MenuItemDataPrivate) {
                  console.log("onActive Profile", event, item)
                },
                onInactive(event: PointerEvent, item: MenuItemDataPrivate) {
                  console.log("onInactive Profile", event, item)
                },
                onClick(event: PointerEvent, item: MenuItemDataPrivate) {
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
        expect((wrapper.emitted("item-active")?.[0]?.[1] as any).title).toBe("Profile")
        await menuItem.trigger("pointerleave")
        expect(consoleMock.mock.lastCall?.[0]).toBe("onInactive Profile")
        expect((wrapper.emitted("item-active")?.[0]?.[1] as any).title).toBe("Profile")
        await menuItem.trigger("click")
        expect(consoleMock.mock.lastCall?.[0]).toBe("onClick Profile")
        expect((wrapper.emitted("item-active")?.[0]?.[1] as any).title).toBe("Profile")
      })
    })

    it.each([
      { mode: "filled", expected: "bg-surface-100 dark:bg-surface-900 rounded-md" },
      { mode: "outlined", expected: "bg-white dark:bg-surface-950 rounded-md" },
      { mode: "underlined", expected: "bg-surface-50 dark:bg-surface-950" }
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
      expect(wrapper.find("[data-menu]").classes().join(" ")).toContain("bg-white dark:bg-surface-950 rounded-md")
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

    describe("Menu Component - aspect-ключи itemActive / itemSelected", () => {
      const customStyles = {
        itemActive: "active-rows-class",
        itemSelected: "selected-rows-class"
      }

      it("should apply the custom itemActive class", async () => {
        const wrapper = mount(Menu, {
          props: {
            groups: mockGroups(),
            classes: customStyles
          } as MenuProps
        })
        await nextTick()

        // Симулируем установку активного элемента
        const menuElement = wrapper.find("[data-menu-item]")
        await menuElement.trigger("pointerenter")

        // Проверяем, что применяется класс itemActive
        expect(menuElement.classes().join(" ")).toContain("active-rows-class")
      })

      it("should apply the custom itemSelected class", async () => {
        const wrapper = mount(Menu, {
          props: {
            selected: true,
            groups: mockGroups(),
            classes: customStyles
          } as MenuProps
        })
        await nextTick()

        // Симулируем выбор элемента
        const menuElement = wrapper.find("[data-menu-item]")
        await menuElement.trigger("click")

        // Проверяем, что применяется класс itemSelected
        expect(menuElement.classes().join(" ")).toContain("selected-rows-class")
      })

      it("should not apply custom classes if classes prop is not provided", async () => {
        const wrapper = mount(Menu, {
          props: {
            groups: mockGroups()
          }
        })
        await nextTick()

        // Проверяем, что классы itemActive и itemSelected не применяются по умолчанию
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
        classes: { root: "custom-body-class" }
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
        classes: { root: "global-body-class", title: "global-title-class" }
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
          classes: { root: "prop-body-class" }
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
        classes: { separatorIcon: "chevron-right" },
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

      // Icons (props 1.0): hand-off `class` ложится на корень <i data-icon>, не на svg
      const separatorIcons = wrapper.findAll("[data-icon]")
      expect(separatorIcons.length).toBeGreaterThan(0)
      expect(separatorIcons[0].classes()).toContain("chevron-right")
    })

    it("renders nested menus with global options", async () => {
      const app: any = createAppWithFishtVue({
        orientation: "horizontal"
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

      const hr = mount(Menu, { props: { orientation: "horizontal", groups: [{ items: [{ title: "A" }] }] } })
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

    it("Enter activates the focused item (emits item-click)", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "Enter" })
      expect(v.emitted("item-click")).toBeTruthy()
      expect((v.emitted("item-click")![0][1] as any).title).toBe("Apple")
    })

    it("Space activates the focused item (emits item-click)", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: " " })
      expect(v.emitted("item-click")).toBeTruthy()
    })

    it("typeahead focuses item by first letter", async () => {
      const v = mount(Menu, { props: { groups: kbGroups() } })
      await nextTick()
      await v.find("[data-menu]").trigger("keydown", { key: "c" })
      await nextTick()
      expect(v.findAll("[data-menu-item]")[2].attributes("tabindex")).toBe("0")
    })

    it("horizontal: ArrowRight/ArrowLeft navigate items", async () => {
      const v = mount(Menu, { props: { orientation: "horizontal", groups: kbGroups() } })
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
        props: { orientation: "horizontal", groups: [{ items: [{ title: "A" }, { title: "B" }] }] }
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
      expect((wrapper.vm as any).classItemEndIcon).toContain("rtl:-scale-x-100")
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

  // ---1.0.0 — контракт props ---------------------------------------------------------------------
  describe("Menu Component - Props contract 1.0.0", () => {
    const groups = () => [{ title: "G", items: [{ title: "I", icon: "check", info: "i", menu: { groups: [] } }] }]

    const withOptions = (options: MenuOption = {}) => ({
      install(app: any) {
        app.use(FishtVue, { componentsOptions: { Menu: options } })
      }
    })

    it("объявляет ровно новый набор props (снятые — отсутствуют)", async () => {
      const wrapper = mount(Menu, { props: { groups: groups() } })
      await nextTick()
      expect(wrapper.props()).toEqual({
        mode: undefined,
        selected: undefined,
        orientation: undefined,
        firstLetter: undefined,
        onlyIcons: undefined,
        width: undefined,
        height: undefined,
        class: undefined,
        classes: undefined,
        title: undefined,
        separator: undefined,
        fixWindowProps: undefined,
        groups: groups()
      })
    })

    it("`class` садится только на корень `[data-menu]`", async () => {
      const wrapper = mount(Menu, { props: { title: "T", groups: groups(), class: "probe-root" } })
      await nextTick()
      expect(wrapper.find("[data-menu]").attributes("class")).toContain("probe-root")
      for (const selector of ["[data-menu-title]", "[data-menu-group]", "[data-menu-item]"]) {
        expect(wrapper.find(selector).attributes("class") ?? "").not.toContain("probe-root")
      }
    })

    it.each([
      ["root", "[data-menu]"],
      ["title", "[data-menu-title]"],
      ["group", "[data-menu-group]"],
      ["groupTitle", "[data-menu-group-title]"],
      ["item", "[data-menu-item]"],
      ["itemIcon", "[data-menu-item-icon]"],
      ["itemTitle", "[data-menu-item-title]"],
      ["itemInfo", "[data-menu-item-info]"],
      ["itemEndIcon", "[data-menu-item-end-icon]"]
    ])("classes.%s → %s", async (key, selector) => {
      const wrapper = mount(Menu, {
        props: { title: "T", groups: groups(), classes: { [key]: "probe-key" } as any }
      })
      await nextTick()
      await flushHero()
      expect(wrapper.find(selector).attributes("class")).toContain("probe-key")
    })

    it("`classes.separator` ложится на корень <Separator>, `separatorIcon` — на иконку внутри", async () => {
      const wrapper = mount(Menu, {
        props: {
          classes: { separator: "probe-sep", separatorIcon: "probe-sep-icon" },
          groups: [
            { title: "G1", items: [{ title: "A" }] },
            { title: "G2", separator: { icon: "chevron-right" }, items: [{ title: "B" }] }
          ]
        }
      })
      await nextTick()
      await flushHero()
      expect(wrapper.find("[data-separator]").attributes("class")).toContain("probe-sep")
      expect(wrapper.find("[data-separator] [data-icon]").attributes("class")).toContain("probe-sep-icon")
    })

    it("props.classes перебивает options.classes по twMerge, неконфликтный класс options остаётся", async () => {
      const wrapper = mount(Menu, {
        global: { plugins: [withOptions({ classes: { item: "p-2 italic" } }) as any] },
        props: { groups: groups(), classes: { item: "p-4" } }
      })
      await nextTick()
      const cls = wrapper.find("[data-menu-item]").attributes("class") ?? ""
      expect(cls).toContain("p-4")
      expect(cls).not.toContain("p-2")
      expect(cls).toContain("italic")
    })

    it("`item.class` — самый частный потребитель, выигрывает у `classes.item`", async () => {
      const wrapper = mount(Menu, {
        props: {
          groups: [{ items: [{ title: "A", class: "p-8" }] }],
          classes: { item: "p-2" }
        }
      })
      await nextTick()
      const cls = wrapper.find("[data-menu-item]").attributes("class") ?? ""
      expect(cls).toContain("p-8")
      expect(cls).not.toContain("p-2")
    })

    it("потребитель идёт после базы — `classes.root` перебивает хвостовой `overflow-auto`", async () => {
      const wrapper = mount(Menu, { props: { groups: groups(), classes: { root: "overflow-visible" } } })
      await nextTick()
      const cls = wrapper.vm.classBase as string
      expect(cls).toContain("overflow-visible")
      expect(cls).not.toContain("overflow-auto")
    })

    it("`class` побеждает `classes.root`, а тот — `options.class`", async () => {
      const wrapper = mount(Menu, {
        global: { plugins: [withOptions({ class: "p-1", classes: { root: "p-2" } }) as any] },
        props: { groups: groups(), classes: { root: "p-3" }, class: "p-4" }
      })
      await nextTick()
      const cls = wrapper.vm.classBase as string
      expect(cls).toContain("p-4")
      for (const loser of ["p-1", "p-2", "p-3"]) expect(cls).not.toContain(loser)
    })

    it("подменю наследует `classes.root`, но не `class` верхнего меню", async () => {
      const wrapper = mount(Menu, {
        attachTo: document.body,
        props: {
          class: "probe-top-only",
          classes: { root: "probe-inherited" },
          groups: [{ items: [{ title: "A", menu: { groups: [{ items: [{ title: "B" }] }] } }] }]
        }
      })
      await nextTick()
      await flushHero()
      const menus = document.querySelectorAll("[data-menu]")
      expect(menus.length).toBe(2)
      const submenu = menus[1] as HTMLElement
      expect(submenu.className).toContain("probe-inherited")
      expect(submenu.className).not.toContain("probe-top-only")
      wrapper.unmount()
    })

    it("unstyled сохраняет `class`/`classes`, но режет базу и `fishtvue-menu`", async () => {
      const wrapper = mount(Menu, {
        global: {
          plugins: [
            {
              install(app: any) {
                app.use(FishtVue, { unstyled: true })
              }
            } as any
          ]
        },
        props: { groups: groups(), class: "probe-root", classes: { item: "probe-item" } }
      })
      await nextTick()
      const root = wrapper.find("[data-menu]").attributes("class") ?? ""
      const item = wrapper.find("[data-menu-item]").attributes("class") ?? ""
      expect(root).toContain("probe-root")
      expect(root).not.toContain("fishtvue-")
      expect(root).not.toContain("shadow-md")
      expect(item).toContain("probe-item")
      expect(item).not.toContain("cursor-pointer")
    })

    // ---aspect-ключи ----------------------------------------------------
    it.each([
      ["animation", "motion-safe:duration-500", "[data-menu]"],
      ["itemActive", "bg-surface-200/50", "[data-menu-item]"],
      ["itemSelected", "bg-surface-200", "[data-menu-item]"]
    ])('aspect `%s`: default на месте, `""` его отключает', async (key, fallback, selector) => {
      const base = mount(Menu, { props: { selected: true, groups: groups() } })
      await nextTick()
      if (key !== "animation") {
        await base.find("[data-menu-item]").trigger(key === "itemActive" ? "pointerenter" : "click")
      }
      expect(base.find(selector).attributes("class")).toContain(fallback)

      const off = mount(Menu, { props: { selected: true, groups: groups(), classes: { [key]: "" } as any } })
      await nextTick()
      if (key !== "animation") {
        await off.find("[data-menu-item]").trigger(key === "itemActive" ? "pointerenter" : "click")
      }
      expect(off.find(selector).attributes("class") ?? "").not.toContain(fallback)
    })

    // ---T2 — имена концептов --------------------------------------------
    it("`orientation` заменил булев `horizontal`; снятое имя уходит fallthrough-атрибутом", async () => {
      const wrapper = mount(Menu, { props: { groups: groups(), horizontal: true } as any })
      await nextTick()
      const root = wrapper.find("[data-menu]")
      expect(root.attributes("horizontal")).toBe("true")
      expect(root.attributes("aria-orientation")).toBe("vertical")
      expect(root.attributes("data-orientation")).toBe("vertical")

      const horizontal = mount(Menu, { props: { groups: groups(), orientation: "horizontal" } })
      await nextTick()
      expect(horizontal.find("[data-menu]").attributes("aria-orientation")).toBe("horizontal")
      expect(horizontal.find("[data-menu]").attributes("data-orientation")).toBe("horizontal")
    })

    it("`width`/`height` — top-level props (бывшие `styles.width`/`styles.height`)", async () => {
      const wrapper = mount(Menu, { props: { groups: groups(), width: 200, height: "10rem" } })
      await nextTick()
      const style = wrapper.find("[data-menu]").attributes("style") ?? ""
      expect(style).toContain("width: 200px")
      expect(style).toContain("height: 10rem")
    })

    it("`fixWindowProps` заменил `paramsWindowMenu`", async () => {
      const wrapper = mount(Menu, {
        props: { groups: groups(), fixWindowProps: { openDelay: 777 } }
      })
      await nextTick()
      expect((wrapper.vm as any).fixWindowProps.openDelay).toBe(777)
    })

    // ---T3 — булевы ------------------------------------------------------
    it("`firstLetter`: absent → undefined в props(), default false, слой options достижим", async () => {
      const bare = mount(Menu, { props: { groups: [{ items: [{ title: "Apple" }] }] } })
      await nextTick()
      expect(bare.props().firstLetter).toBeUndefined()
      expect(bare.vm.firstLetter).toBe(false)
      expect(bare.find("[data-menu-item-icon]").exists()).toBe(false)

      const fromOptions = mount(Menu, {
        global: { plugins: [withOptions({ firstLetter: true }) as any] },
        props: { groups: [{ items: [{ title: "Apple" }] }] }
      })
      await nextTick()
      expect(fromOptions.vm.firstLetter).toBe(true)
      expect(fromOptions.find("[data-menu-item-icon]").text()).toBe("A")

      const fromProps = mount(Menu, {
        global: { plugins: [withOptions({ firstLetter: true }) as any] },
        props: { groups: [{ items: [{ title: "Apple" }] }], firstLetter: false }
      })
      await nextTick()
      expect(fromProps.vm.firstLetter).toBe(false)
    })

    it("`separator.visible` заменил `isVisible` (default true, false прячет разделитель)", async () => {
      const two = () => [
        { title: "G1", items: [{ title: "A" }] },
        { title: "G2", items: [{ title: "B" }] }
      ]
      const shown = mount(Menu, { props: { groups: two() } })
      await nextTick()
      expect(shown.find("[data-separator]").exists()).toBe(true)

      const hidden = mount(Menu, { props: { groups: two(), separator: { visible: false } } })
      await nextTick()
      expect(hidden.find("[data-separator]").exists()).toBe(false)
    })

    // ---T4 — emits -------------------------------------------------------
    it("события — `item-click`/`item-active`/`item-inactive`; старые camelCase не эмитятся", async () => {
      const wrapper = mount(Menu, { props: { groups: groups() } })
      await nextTick()
      const item = wrapper.find("[data-menu-item]")
      await item.trigger("pointerenter")
      await item.trigger("pointerleave")
      await item.trigger("click")

      expect(wrapper.emitted("item-active")).toBeTruthy()
      expect(wrapper.emitted("item-inactive")).toBeTruthy()
      expect(wrapper.emitted("item-click")).toBeTruthy()
      expect((wrapper.emitted("item-click")![0][1] as any).title).toBe("I")
      for (const legacy of ["onActive", "onInactive", "onClick"]) {
        expect(wrapper.emitted(legacy)).toBeUndefined()
      }
    })
  })

  // ---B10 — semantic surface tokens вместо hardcoded gray-family classes -------------------------
  describe("Menu Component - B10 semantic surface tokens", () => {
    const legacyGrayFamily = /\b(?:bg|text|border|ring|divide)-(?:neutral|stone|zinc|slate|gray)-\d+/

    it.each([
      { mode: "filled", expected: "bg-surface-100 dark:bg-surface-900 rounded-md" },
      { mode: "outlined", expected: "bg-white dark:bg-surface-950 rounded-md" },
      { mode: "underlined", expected: "bg-surface-50 dark:bg-surface-950" }
    ])("mode: $mode uses surface-family background (not neutral/stone)", async ({ mode, expected }) => {
      const wrapper = mount(Menu, {
        props: { mode: mode as StyleMode, groups: [{}] }
      })
      await nextTick()
      const cls = wrapper.find("[data-menu]").classes().join(" ")
      expect(cls).toContain(expected)
      expect(cls).not.toMatch(legacyGrayFamily)
    })

    it("root border + text use surface-family (not neutral/zinc)", async () => {
      const wrapper = mount(Menu, { props: { groups: [{ items: [{ title: "A" }] }] } })
      await nextTick()
      const cls = wrapper.find("[data-menu]").classes()
      expect(cls).toContain("border-surface-200")
      expect(cls).toContain("dark:border-surface-800")
      expect(cls).toContain("dark:text-surface-300")
      expect(cls.join(" ")).not.toMatch(legacyGrayFamily)
    })

    it("separator icon uses surface-family text (not neutral)", async () => {
      const wrapper = mount(Menu, {
        props: {
          groups: [
            { title: "G1", items: [{ title: "A" }] },
            { title: "G2", separator: { icon: "chevron-right" }, items: [{ title: "B" }] }
          ]
        }
      })
      await nextTick()
      await flushHero()
      const icon = wrapper.find("[data-separator] [data-icon]")
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain("text-surface-200")
      expect(icon.classes()).toContain("dark:text-surface-800")
      expect(icon.classes().join(" ")).not.toMatch(legacyGrayFamily)
    })

    it("group title uses surface-family text (not neutral)", async () => {
      const wrapper = mount(Menu, {
        props: { groups: [{ title: "Group 1", items: [{ title: "A" }] }] }
      })
      await nextTick()
      const cls = wrapper.find("[data-menu-group-title]").classes()
      expect(cls).toContain("text-surface-400")
      expect(cls).toContain("dark:text-surface-500")
      expect(cls.join(" ")).not.toMatch(legacyGrayFamily)
    })

    it("active row state uses surface-family background (not neutral)", async () => {
      const wrapper = mount(Menu, {
        props: { groups: [{ items: [{ title: "A" }] }] }
      })
      await nextTick()
      const menuItem = wrapper.find("[data-menu-item]")
      await menuItem.trigger("pointerenter")
      const cls = menuItem.classes()
      expect(cls).toContain("bg-surface-200/50")
      expect(cls).toContain("dark:bg-surface-700/50")
      expect(cls.join(" ")).not.toMatch(legacyGrayFamily)
    })

    it("selected row state uses surface-family background (not neutral)", async () => {
      const wrapper = mount(Menu, {
        props: { selected: true, groups: [{ items: [{ title: "A" }] }] }
      })
      await nextTick()
      const menuItem = wrapper.find("[data-menu-item]")
      await menuItem.trigger("click")
      const cls = menuItem.classes()
      expect(cls).toContain("bg-surface-200")
      expect(cls).toContain("dark:bg-surface-700")
      expect(cls.join(" ")).not.toMatch(legacyGrayFamily)
    })
  })
})
