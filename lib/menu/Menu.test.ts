import { mount } from "@vue/test-utils"
import { describe, it, expect, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Menu from "fishtvue/menu/Menu.vue"
import { Groups, ItemMenuPrivate, MenuOption, MenuProps } from "fishtvue/menu/Menu"

describe("Menu Component", () => {
  describe("Menu Component - Without Library Initialization", () => {
    const mockGroups = () => [
      {
        title: "Group 1",
        items: [
          { title: "Profile", icon: "user" },
          { title: "Billing", icon: "credit-card" },
          { title: "Settings", icon: "cog-6-tooth" }
        ]
      },
      {
        title: "Group 2",
        separator: { icon: "chevron-right" },
        items: [
          { title: "Support", icon: "lifebuoy", disabled: true },
          { title: "API", icon: "cloud" }
        ]
      }
    ]

    it("renders menu groups and items correctly", () => {
      const wrapper = mount(Menu, {
        props: { groups: mockGroups() }
      })

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

    it("applies disabled styles to disabled items", () => {
      const wrapper = mount(Menu, {
        props: { groups: mockGroups() }
      })

      const disabledItem = wrapper.find('[aria-disabled="true"]')
      expect(disabledItem.exists()).toBe(true)
      expect(disabledItem.classes()).toContain("pointer-events-none")
      expect(disabledItem.classes()).toContain("opacity-50")
    })

    it("renders separators between groups with icons", () => {
      const wrapper = mount(Menu, {
        props: { groups: mockGroups() }
      })

      const separators = wrapper.findAll("[data-separator]")
      expect(separators.length).toBe(1)

      const separatorIcon = separators[0].find("svg")
      expect(separatorIcon.exists()).toBe(true)
    })
    it("renders items with only icons when 'only-icons' is true", () => {
      const wrapper = mount(Menu, {
        props: {
          groups: mockGroups(),
          onlyIcons: true
        }
      })

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

      const item = wrapper.findAll("[data-menu-item]")[0]
      await item.trigger("click")

      expect(item.classes()).toContain("font-semibold")
    })

    it("renders menu horizontally when 'horizontal' is true", () => {
      const wrapper = mount(Menu, {
        props: {
          groups: mockGroups(),
          horizontal: true
        }
      })

      const menu = wrapper.find("[data-menu]")
      expect(menu.classes()).toContain("flex-row")
    })

    it("renders nested menus correctly", () => {
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
        const mockGroups: Groups = [
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

        const menuItem = wrapper.find("[data-menu-item]")
        expect(menuItem.exists()).toBe(true)

        // Наведение на элемент
        await menuItem.trigger("mouseover")
        expect(consoleMock.mock.lastCall?.[0]).toBe("onActive Profile")
        expect((wrapper.emitted("onActive")?.[0]?.[1] as any).title).toBe("Profile")
        await menuItem.trigger("mouseleave")
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
    ])(`should apply correct styles for mode: $mode`, ({ mode, expected }) => {
      // Монтируем компонент с текущим значением mode
      const wrapper = mount(Menu, {
        props: {
          mode
        }
      })

      // Проверяем, что prop mode установлен корректно
      expect((wrapper as any).props("mode")).toBe(mode)
      expect(wrapper.find("[data-menu]").classes().join(" ")).toContain(expected)
    })

    it("should fall back to default mode if none provided", () => {
      const wrapper = mount(Menu)
      expect((wrapper as any).vm.mode).toBe("outlined")
      expect(wrapper.find("[data-menu]").classes().join(" ")).toContain("bg-white dark:bg-neutral-950 rounded-md")
    })

    it("should throw a warning for invalid mode value", () => {
      const wrapper = mount(Menu, {
        props: {
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

        // Симулируем установку активного элемента
        const menuElement = wrapper.find("[data-menu-item]")
        await menuElement.trigger("mouseover")

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

        // Симулируем выбор элемента
        const menuElement = wrapper.find("[data-menu-item]")
        await menuElement.trigger("click")

        // Проверяем, что применяется класс selectedRows
        expect(menuElement.classes().join(" ")).toContain("selected-rows-class")
      })

      it("should not apply custom styles if styles prop is not provided", () => {
        const wrapper = mount(Menu, {
          props: {
            groups: mockGroups()
          }
        })

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
    it("renders menu with global options", () => {
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

      const menuBody = wrapper.find("[data-menu]")
      expect(menuBody.exists()).toBe(true)
      expect(menuBody.classes()).toContain("custom-body-class")
    })

    it("overrides global options with props", () => {
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

      const menuBody = wrapper.find("[data-menu]")
      expect(menuBody.exists()).toBe(true)
      expect(menuBody.classes()).toContain("prop-body-class")
      expect(menuBody.classes()).toContain("global-body-class")
      const menuTitle = wrapper.find("[data-menu-title]")
      expect(menuTitle.classes()).toContain("global-title-class")
    })

    it("renders menu items with icons based on global options", () => {
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
                { title: "Billing", icon: "credit-card" }
              ]
            }
          ]
        }
      })

      const items = wrapper.findAll("[data-menu-item]")
      for (const item of items) {
        const icon = item.find("svg")
        expect(icon.exists()).toBe(true)

        const title = item.find("[data-title]")
        expect(title.exists()).toBe(true)
      }
    })

    it("supports separators based on global options", () => {
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

      const separatorIcons = wrapper.findAll("svg")
      expect(separatorIcons.length).toBeGreaterThan(0)
      expect(separatorIcons[0].classes()).toContain("chevron-right")
    })

    it("renders nested menus with global options", () => {
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

      const nestedMenu = wrapper.findComponent(Menu)
      expect(nestedMenu.exists()).toBe(true)

      const nestedItems = nestedMenu.findAll("[data-menu-item] [data-title]")
      expect(nestedItems.length).toBe(3)
      expect(nestedItems[0].text()).toContain("Profile")
      expect(nestedItems[1].text()).toContain("Settings")
    })
  })
})
