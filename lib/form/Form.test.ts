import { flushPromises, mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue, { getActiveLocale } from "fishtvue/config"
import Form from "fishtvue/form/Form.vue"
import Calendar from "fishtvue/calendar/Calendar.vue"
import FormField from "fishtvue/form/FormField.vue"
import FormSection from "fishtvue/form/FormSection.vue"
import { registerFieldType } from "fishtvue/form/fieldRegistry"
import { defineComponent, h, nextTick } from "vue"
import type { FieldType, FormProps } from "fishtvue/form/Form"

import type { RuleCallback, Rules } from "fishtvue/utils/rulesHandler"
import * as AllRules from "fishtvue/utils/rulesHandler"

describe("Form Component Tests", () => {
  // Изоляция global state: window.FishtVue мутируется FishtVue-плагином и протекает между
  // тест-файлами (зеркалит Select.test.ts); setDefaultRuleMessages — global module state.
  // Чистим до и после каждого теста, чтобы no-plugin кейсы (Form.t → ключ) были детерминированы.
  beforeEach(() => {
    delete (window as any).FishtVue
    AllRules.setDefaultRuleMessages({})
  })
  afterEach(() => {
    delete (window as any).FishtVue
    AllRules.setDefaultRuleMessages({})
  })

  const structure = (): FormProps["structure"] => [
    {
      fields: [
        { name: "name", typeComponent: "Input", label: "Name", modelValue: "" },
        { name: "email", typeComponent: "Input", label: "Email", modelValue: "" },
        { name: "newsletter", typeComponent: "Switch", label: "Newsletter", modelValue: false }
      ]
    }
  ]

  const formFields = () => ({
    name: "John Doe",
    email: "john.doe@example.com",
    newsletter: true
  })

  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure(),
          formFields: formFields()
        }
      })

      // Проверка структуры формы
      expect(wrapper.find("form[data-form]").exists()).toBe(true)
      expect(wrapper.findAll("[data-form-item]").length).toBe(1) // Одна структура
      expect(wrapper.findAll("[data-form-group-item]").length).toBe(3) // Три поля
    })

    it("applies custom classes", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure(),
          formFields: formFields(),
          class: "custom-form-class"
        }
      })

      expect(wrapper.find("form[data-form]").classes()).toContain("custom-form-class")
    })

    it("updates formFields on input", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure(),
          formFields: formFields()
        }
      })

      // Изменение значения
      const input = wrapper.find('input[id="name"]')
      await input.setValue("Jane Doe")

      expect(wrapper.emitted("update:formFields")).toBeTruthy()
      expect(wrapper.emitted("update:formFields")?.[0][0]).toEqual({
        name: "Jane Doe",
        email: "john.doe@example.com",
        newsletter: true
      })
    })

    it("renders slots correctly", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure()
        },
        slots: {
          itemTitle: "<div class='custom-item-title'>Item Title</div>",
          footer: "<button class='custom-footer-button'>Submit</button>"
        }
      })

      expect(wrapper.find(".custom-item-title").exists()).toBe(true)
      expect(wrapper.find(".custom-footer-button").exists()).toBe(true)
    })

    it("validates fields on change with modeValidate: 'onChange'", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                {
                  name: "email",
                  typeComponent: "Input",
                  label: "Email",
                  rules: { required: true, email: true },
                  modelValue: ""
                }
              ]
            }
          ],
          modeValidate: "onChange"
        }
      })

      const input = wrapper.find('input[id="email"]')
      await input.setValue("invalid-email")

      expect(wrapper.vm.isFieldInvalid("email")).toBe(true)
      expect(wrapper.vm.getField<"Input">("email")?.messageInvalid).toBe("Invalid email")
    })

    it("emits submit event with correct form values", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure(),
          formFields: formFields()
        }
      })

      const form = wrapper.find("form")
      await form.trigger("submit")
      expect(wrapper.emitted("submit")).toBeTruthy()
      expect(wrapper.emitted("submit")?.[0][0]).toEqual(formFields())
    })

    it("handles a field without a 'name' property and assigns a temporary name", async () => {
      const structure: FormProps["structure"] = [
        {
          class: "test-class",
          fields: [
            {
              typeComponent: "Input",
              label: "Test Field",
              modelValue: ""
            } as FieldType<"Input">
          ]
        }
      ]

      const wrapper = mount(Form, {
        props: {
          structure,
          formFields: {}
        }
      })

      // Найти все элементы формы
      const formFields = wrapper.findAll("[data-form-group-item]")

      // Проверить, что имя было назначено автоматически
      expect(formFields.length).toBe(1)

      const fieldComponent = formFields[0]

      // Поле должно иметь автоматически сгенерированное имя
      expect(fieldComponent.find("input").attributes("id")).toMatch(/field_\w+/)
    })

    it("handles a field without 'rules' but with 'required' set to true", async () => {
      const structure: FormProps["structure"] = [
        {
          class: "test-class",
          fields: [
            {
              typeComponent: "Input",
              name: "testField",
              label: "Test Field",
              required: true,
              modelValue: ""
            }
          ]
        }
      ]

      const wrapper = mount(Form, {
        props: {
          structure,
          formFields: {}
        }
      })

      // Найти элемент поля
      const inputField = wrapper.find("[data-form-group-item]")

      // Проверить, что поле имеет атрибут required
      expect(inputField.exists()).toBe(true)
      expect(inputField.find("[data-label]").attributes("class")).toContain("after:content-['*']")

      // Дождаться обновления структуры формы
      await nextTick()

      // Проверить, что компонент автоматически добавил правило "required"
      const field = wrapper.vm.getField("testField")
      expect(field).toBeDefined()
      expect(field?.rules).toBeDefined()
      // Проверяем, что rules является объектом (RulesObject), а не массивом
      const rules = field?.rules && !Array.isArray(field.rules) ? field.rules : null
      expect(rules).toBeDefined()
      expect(rules?.required).toEqual(expect.any(String)) // Проверяем, что правило существует и является строкой
      // Issue 3 (2026-05-20): Component.t() returns key as last resort when plugin not installed.
      // В "Without Library Initialization" блоке FishtVue не подключён → t("requiredField") → "requiredField"
      // (раньше → undefined → "Required field" via ?? fallback). С install плагина — "Required field".
      expect(rules?.required).toBe("requiredField")

      // Протестировать валидацию поля
      const input = wrapper.find("[data-form-group-item] input")
      await input.setValue("")
      await wrapper.vm.$nextTick()

      // Убедиться, что поле помечено как невалидное
      expect(wrapper.vm.isFieldInvalid("testField")).toBe(true)
      // Issue 3 (2026-05-20): see comment above — t() returns key without plugin.
      expect(wrapper.vm.getField<"Input">("testField")?.messageInvalid).toBe("requiredField")
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithForm = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Form: options
          }
        })
      }
    })

    // Test with global options from library
    it("applies default options from library", () => {
      const app = createAppWithForm({
        class: "special-form-verification-class",
        modeStyle: "filled",
        modeLabel: "vanishing",
        modeValidate: "onSubmit",
        submitButton: "Send",
        structureClass: "structure-class",
        structureClassGrid: "structure-class-grid",
        autocomplete: "off"
      })

      const wrapper = mount(Form, {
        global: { plugins: [app] },
        props: {
          structure: structure()
        }
      })

      expect(wrapper.vm.modeStyle).toBe("filled")
      expect(wrapper.vm.modeLabel).toBe("vanishing")
      expect(wrapper.vm.modeValidate).toBe("onSubmit")
      expect(wrapper.vm.submitButton).toBe("Send")
      expect(wrapper.vm.autocomplete).toBe("off")
      expect(wrapper.find("[data-form]").attributes("class")).toContain("special-form-verification-class")
      expect(wrapper.find("[data-form-item]").attributes("class")).toContain("structure-class")
      expect(wrapper.find("[data-form-group]").attributes("class")).toContain("structure-class-grid")
    })

    it("applies global options to structure and fields", () => {
      const app = createAppWithForm({
        modeStyle: "outlined",
        modeLabel: "static"
      })
      const wrapper = mount(Form, {
        props: { structure: structure() },
        global: { plugins: [app] }
      })

      const field = wrapper.vm.getField<"Input">("name")
      expect(field?.mode).toBe("outlined")
      expect(field?.labelMode).toBe("static")
    })

    it("overrides global options with local props", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure(),
          modeStyle: "underlined",
          modeLabel: "dynamic"
        },
        global: {
          plugins: [
            createAppWithForm({
              modeStyle: "outlined",
              modeLabel: "static"
            })
          ]
        }
      })

      const field = wrapper.vm.getField<"Input">("name")
      expect(field?.mode).toBe("underlined")
      expect(field?.labelMode).toBe("dynamic")
    })
  })

  describe("Field Interaction Tests", () => {
    it("fills and validates all fields", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure(),
          formFields: formFields()
        },
        attachTo: document.body
      })

      // Заполнение всех полей
      const nameInput = wrapper.find('input[id="name"]')
      await nameInput.setValue("Jane Doe")

      const emailInput = wrapper.find('input[id="email"]')
      await emailInput.setValue("jane.doe@example.com")

      const switchInput = wrapper.find("[data-input-checkbox]")
      await switchInput.trigger("click")

      expect(wrapper.emitted("update:formFields")).toBeTruthy()
      expect(wrapper.emitted("update:formFields")?.slice(-1)[0][0]).toEqual({
        name: "Jane Doe",
        email: "jane.doe@example.com",
        newsletter: false
      })
    })

    it("submits the form after filling all fields", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure(),
          formFields: formFields()
        },
        attachTo: document.body
      })

      // Заполнение всех полей
      const nameInput = wrapper.find('input[id="name"]')
      await nameInput.setValue("Jane Doe")

      const emailInput = wrapper.find('input[id="email"]')
      await emailInput.setValue("jane.doe@example.com")

      const submitButton = wrapper.find("[data-form-footer] button[type='submit']")
      await submitButton.trigger("click")

      expect(wrapper.emitted("submit")).toBeTruthy()
      expect(wrapper.emitted("submit")?.[0][0]).toEqual({
        name: "Jane Doe",
        email: "jane.doe@example.com",
        newsletter: true
      })
    })
  })

  describe("Form Component - setFieldValue Method", () => {
    it("updates the field value correctly using setFieldValue method", async () => {
      // Структура формы
      const structure: FormProps["structure"] = [
        {
          class: "test-class",
          fields: [
            {
              typeComponent: "Input",
              name: "testField",
              label: "Test Field",
              modelValue: "Initial Value"
            }
          ]
        }
      ]

      // Монтируем компонент
      const wrapper = mount(Form, {
        props: {
          structure,
          formFields: {
            testField: "Initial Value"
          }
        }
      })

      // Проверяем начальное значение поля
      expect(wrapper.vm.formFields.testField).toBe("Initial Value")

      // Вызываем метод setFieldValue для обновления значения
      wrapper.vm.setFieldValue("testField", "Updated Value")

      // Проверяем, что значение поля обновлено
      expect(wrapper.vm.formFields.testField).toBe("Updated Value")
      await nextTick()
      // Проверяем, что DOM обновился
      const inputField = wrapper.find("[data-form-group-item] input")
      expect((inputField.element as any).value).toBe("Updated Value")
    })

    it("logs an error if the field name does not exist", () => {
      // Мокаем console.error
      const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {})

      // Структура формы
      const structure: FormProps["structure"] = [
        {
          class: "test-class",
          fields: [
            {
              typeComponent: "Input",
              name: "testField",
              label: "Test Field",
              modelValue: "Initial Value"
            }
          ]
        }
      ]

      // Монтируем компонент
      const wrapper = mount(Form, {
        props: {
          structure,
          formFields: {
            testField: "Initial Value"
          }
        }
      })

      // Проверяем, что метод вызывает console.error для отсутствующего поля
      wrapper.vm.setFieldValue("nonExistentField", "Some Value")

      // Убеждаемся, что console.error был вызван
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Field with field name 'nonExistentField' does not exist in structure"
      )

      // Восстанавливаем оригинальный console.error
      consoleErrorMock.mockRestore()
    })
  })

  describe("Form Component - setFieldParam Method", () => {
    const structureForSetFieldParam = (): FormProps["structure"] => [
      {
        class: "section-1",
        fields: [
          {
            typeComponent: "Input",
            name: "testField1",
            label: "Test Field 1",
            modelValue: "Initial Value 1"
          },
          {
            typeComponent: "Input",
            name: "testField2",
            label: "Test Field 2",
            modelValue: "Initial Value 2"
          }
        ]
      },
      {
        class: "section-2",
        fields: [
          {
            typeComponent: "Input",
            name: "testField3",
            label: "Test Field 3",
            modelValue: "Initial Value 3"
          }
        ]
      }
    ]

    it("updates the specified field parameter successfully", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetFieldParam()
        }
      })

      // Вызываем метод setFieldParam
      wrapper.vm.setFieldParam("testField2", "label", "Updated Label")

      // Проверяем, что параметр обновился
      const updatedField = wrapper.vm.getField("testField2")
      expect(updatedField?.label).toBe("Updated Label")
    })

    it("does not update anything if the field name is not found", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetFieldParam()
        }
      })

      // Вызываем метод setFieldParam с несуществующим именем поля
      wrapper.vm.setFieldParam("nonExistentField", "label", "New Label")

      // Проверяем, что структура осталась неизменной
      const field = wrapper.vm.getField("testField1")
      expect(field?.label).toBe("Test Field 1")
    })

    it("updates a parameter for a field in a different section", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetFieldParam()
        }
      })

      // Вызываем метод setFieldParam для поля в другой секции
      wrapper.vm.setFieldParam("testField3", "modelValue", "Updated Value")

      // Проверяем, что значение обновилось
      const updatedField = wrapper.vm.getField("testField3")
      expect(updatedField?.modelValue).toBe("Updated Value")
    })

    it("handles an invalid parameter gracefully without breaking", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetFieldParam()
        }
      })

      // Попробуем обновить несуществующий параметр
      wrapper.vm.setFieldParam("testField1", "nonExistentParam" as keyof FieldType, "Some Value")

      // Убеждаемся, что ничего не изменилось
      const updatedField = wrapper.vm.getField("testField1")
      expect(updatedField?.label).toBe("Test Field 1")
    })
  })

  describe("Form Component - getField Method", () => {
    const structureForGetField = (): FormProps["structure"] => [
      {
        class: "section-1",
        fields: [
          {
            typeComponent: "Input",
            name: "testField1",
            label: "Test Field 1",
            modelValue: "Initial Value 1"
          },
          {
            typeComponent: "Input",
            name: "testField2",
            label: "Test Field 2",
            modelValue: "Initial Value 2"
          }
        ]
      },
      {
        class: "section-2",
        fields: [
          {
            typeComponent: "Input",
            name: "testField3",
            label: "Test Field 3",
            modelValue: "Initial Value 3"
          }
        ]
      }
    ]

    it("returns the correct field when the field exists in the structure", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForGetField()
        }
      })

      // Получаем поле по имени
      const field = wrapper.vm.getField("testField2")

      // Проверяем, что возвращается корректное поле
      expect(field).toBeTruthy()
      expect(field?.name).toBe("testField2")
      expect(field?.label).toBe("Test Field 2")
      expect(field?.modelValue).toBe("Initial Value 2")
    })

    it("returns null when the field name does not exist in the structure", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForGetField()
        }
      })

      // Пробуем получить несуществующее поле
      const field = wrapper.vm.getField("nonExistentField")

      // Проверяем, что возвращается null
      expect(field).toBeNull()
    })

    it("returns a field from a different section", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForGetField()
        }
      })

      // Получаем поле из другой секции
      const field = wrapper.vm.getField("testField3")

      // Проверяем, что поле найдено корректно
      expect(field).toBeTruthy()
      expect(field?.name).toBe("testField3")
      expect(field?.label).toBe("Test Field 3")
      expect(field?.modelValue).toBe("Initial Value 3")
    })

    it("handles an empty structure gracefully", () => {
      const wrapper = mount(Form, {
        props: {
          structure: []
        }
      })

      // Пробуем получить поле из пустой структуры
      const field = wrapper.vm.getField("testField1")

      // Проверяем, что возвращается null
      expect(field).toBeNull()
    })
  })

  describe("Form Component - isFieldInvalid Method", () => {
    const structureForIsFieldInvalid = (): FormProps["structure"] => [
      {
        class: "section-1",
        fields: [
          {
            typeComponent: "Input",
            name: "testField1",
            label: "Test Field 1",
            modelValue: "Value 1"
          },
          {
            typeComponent: "Input",
            name: "testField2",
            label: "Test Field 2",
            modelValue: ""
          }
        ]
      }
    ]

    it("returns false for a valid field", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForIsFieldInvalid(),
          formFields: {
            testField1: "Valid value"
          }
        }
      })

      // Установим состояние валидности для поля
      wrapper.vm.formInvalidFields.testField1 = false

      // Проверим, что поле не является невалидным
      const result = wrapper.vm.isFieldInvalid("testField1")
      expect(result).toBe(false)
    })

    it("returns true for an invalid field", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForIsFieldInvalid(),
          formFields: {
            testField2: ""
          }
        }
      })

      // Установим состояние валидности для поля
      wrapper.vm.formInvalidFields.testField2 = true

      // Проверим, что поле является невалидным
      const result = wrapper.vm.isFieldInvalid("testField2")
      expect(result).toBe(true)
    })

    it("returns undefined and logs an error for a non-existent field", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const wrapper = mount(Form, {
        props: {
          structure: structureForIsFieldInvalid(),
          formFields: {
            testField1: "Valid value"
          }
        }
      })

      // Проверяем, что функция возвращает undefined и логирует ошибку
      const result = wrapper.vm.isFieldInvalid("nonExistentField")
      expect(result).toBeUndefined()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Field with field name 'nonExistentField' does not exist in structure"
      )

      consoleErrorSpy.mockRestore()
    })

    it("handles a field without an explicitly set invalid state", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForIsFieldInvalid(),
          formFields: {
            testField1: "Valid value"
          }
        }
      })

      // Не устанавливаем явное состояние валидности для поля
      delete wrapper.vm.formInvalidFields.testField1

      // Проверяем, что по умолчанию функция возвращает false
      expect(wrapper.vm.isFieldInvalid("testField1")).toBe(false)
    })
  })

  describe("Form Component - setStructureParam Method", () => {
    const structureForSetStructureParam = (): FormProps["structure"] => [
      {
        class: "section-1",
        classGrid: "grid-cols-1",
        fields: [
          { typeComponent: "Input", name: "testField1", label: "Field 1", modelValue: "Value 1" },
          { typeComponent: "Input", name: "testField2", label: "Field 2", modelValue: "" }
        ]
      },
      {
        class: "section-2",
        classGrid: "grid-cols-2",
        fields: [{ typeComponent: "Input", name: "testField3", label: "Field 3", modelValue: "Value 3" }]
      }
    ]

    it("updates a parameter of a structure at a specific index", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetStructureParam()
        }
      })

      // Дождаться инициализации структуры формы
      await nextTick()

      // Проверяем изначальное значение параметра
      expect(wrapper.vm.formStructure?.[0].class).toContain("section-1")

      // Изменяем параметр
      wrapper.vm.setStructureParam(0, "class", "new-section-class")

      // Проверяем, что параметр обновился
      expect(wrapper.vm.formStructure?.[0].class).toBe("new-section-class")
    })

    it("does not modify other structures", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetStructureParam()
        }
      })

      // Дождаться инициализации структуры формы
      await nextTick()

      // Изменяем параметр в первой структуре
      wrapper.vm.setStructureParam(0, "class", "new-section-class")

      // Проверяем, что другая структура не изменилась
      expect(wrapper.vm.formStructure?.[1].class).toContain("section-2")
    })

    it("updates multiple parameters of the same structure", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetStructureParam()
        }
      })

      // Дождаться инициализации структуры формы
      await nextTick()

      // Изменяем параметры
      wrapper.vm.setStructureParam(1, "class", "updated-class")
      wrapper.vm.setStructureParam(1, "classGrid", "updated-grid")

      // Проверяем, что оба параметра обновились
      expect(wrapper.vm.formStructure?.[1].class).toBe("updated-class")
      expect(wrapper.vm.formStructure?.[1].classGrid).toBe("updated-grid")
    })
  })

  describe("Form Component - Async Validation", () => {
    const structureForAsync = (): FormProps["structure"] => [
      {
        class: "section-1",
        classGrid: "grid-cols-1",
        fields: [
          {
            typeComponent: "Input",
            name: "asyncField",
            label: "Async Field",
            modelValue: "",
            rules: {
              async: {
                message: "Invalid async field",
                validationCallback(value: any): Promise<RuleCallback> {
                  async function getData() {
                    return await new Promise((resolve) => {
                      if (value === "on") setTimeout(() => resolve({ data: [1, 2, 3] }), 100)
                      else resolve("no data")
                    })
                  }

                  return new Promise((resolve, reject) => {
                    getData()
                      .then((data: any) => {
                        if (Array.isArray(data) && data.length)
                          resolve({
                            isInvalid: false
                          })
                        resolve({
                          isInvalid: true
                        })
                      })
                      .catch(() => {
                        reject({
                          isInvalid: true
                        })
                      })
                  })
                }
              }
            } as Rules
          }
        ]
      }
    ]

    it("performs async validation and passes", async () => {
      const getAsyncValidateMock = vi.spyOn(AllRules, "getAsyncValidate")
      const wrapper = mount(Form, {
        props: {
          structure: structureForAsync()
        }
      })

      // Дождаться инициализации структуры формы
      await nextTick()

      // Триггерим валидацию
      const field = wrapper.vm.formStructure?.[0].fields?.[0]
      expect(field).toBeDefined()
      if (field) {
        wrapper.vm.validateFields("asyncField")

        // Ждем завершения асинхронной валидации
        // Проверяем, что loading установлен в true
        await nextTick()
        if ("loading" in field) {
          expect(field.loading).toBe(true)
        }

        // Ждем завершения промиса валидации (100ms + небольшой запас)
        await new Promise((resolve) => setTimeout(resolve, 150))
        await nextTick()

        // Проверяем, что `getAsyncValidate` был вызван с правильными параметрами
        expect(getAsyncValidateMock).toHaveBeenCalledWith(wrapper.vm.formFields.asyncField, field.rules)

        // Проверяем, что поле не валидное
        expect(wrapper.vm.formInvalidFields["asyncField"]).toBe(true)

        // Проверяем свойства поля (только для полей с InputLayout)
        if ("messageInvalid" in field && "loading" in field) {
          expect(field.messageInvalid).toBe("Invalid async field")
          expect(field.loading).toBe(false) // Убедимся, что loading сброшен
        }
      }
    })
  })
  describe("Form Component - Validation Failure with Scroll", () => {
    const structureForValidation = (): FormProps["structure"] => [
      {
        class: "section-1",
        classGrid: "grid-cols-1",
        fields: [
          {
            typeComponent: "Input",
            name: "invalidField",
            label: "Invalid Field",
            modelValue: "",
            rules: { required: "This field is required." }
          }
        ]
      }
    ]

    it("fails validation and calls scrollIntoView", async () => {
      // Подменяем scrollIntoView на jsdom Element.prototype — он отсутствует в jsdom по умолчанию.
      // Эта проверка валидирует, что Form.validateFields() выполняет scroll к первому
      // элементу `.is-invalid`. Раньше тест полагался на побочный вызов
      // `document.querySelector("header")` из InputLayout — этот coupling устранён
      // в Issue 5 inputlayout.md (replaced by `offsetTop` prop), поэтому проверяем
      // конечный эффект напрямую через scrollIntoView spy.
      const scrollIntoViewSpy = vi.fn()
      const origScrollIntoView = (HTMLElement.prototype as any).scrollIntoView
      ;(HTMLElement.prototype as any).scrollIntoView = scrollIntoViewSpy

      const wrapper = mount(Form, {
        props: {
          structure: structureForValidation()
        }
      })

      // Найти форму
      const form = wrapper.find("form")

      // Триггерить submit
      await form.trigger("submit")

      // Проверить результат validateFields
      expect(wrapper.vm.validateFields()).toBe(false)
      await nextTick()

      // Проверить вызов scrollIntoView (на найденном .is-invalid элементе)
      expect(scrollIntoViewSpy).toHaveBeenCalled()

      // Проверить, что поле стало невалидным
      const field = wrapper.vm.getField<"Input">("invalidField")

      // Проверить, что сообщение об ошибке соответствует правилу
      expect(field?.messageInvalid).toBe("This field is required.")
      expect(wrapper.vm.isFieldInvalid("invalidField")).toBe(true)

      // Восстановить prototype
      ;(HTMLElement.prototype as any).scrollIntoView = origScrollIntoView
    })
  })

  // ---ISSUE 1 — XSS guard: Form must not v-html Select option values ---
  describe("Form Component - XSS guard for Select fields (Issue 1)", () => {
    const selectStructure = (payload: string): FormProps["structure"] => [
      {
        fields: [
          {
            name: "role",
            typeComponent: "Select",
            label: "Role",
            dataSelect: [{ id: 1, value: payload }]
          } as FieldType<"Select">
        ]
      }
    ]

    it("does not execute an XSS payload from a Select option value", async () => {
      const xssPayload = '<img src=x onerror="window.__formXss=true">'
      ;(window as any).__formXss = false

      const wrapper = mount(Form, {
        props: { structure: selectStructure(xssPayload), formFields: {} },
        attachTo: document.body
      })

      // Открываем inline-rendered Select dropdown.
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()

      const html = wrapper.html() + document.body.innerHTML
      // Раньше Form переопределял Select #item slot через v-html — payload исполнялся как HTML.
      // Теперь Select рендерит значение через text-interpolation: raw <img> DOM-узла быть не должно.
      expect(html).not.toMatch(/<img[^>]*src=x/i)
      expect(html).not.toMatch(/<img[^>]+onerror/i)
      expect((window as any).__formXss).toBe(false)
      // Payload остаётся escaped-текстом — это подтверждает, что text-interpolation guard сработал.
      expect(html).toContain("&lt;img")

      wrapper.unmount()
      delete (window as any).__formXss
    })

    it("renders a Select field and defaults closeButtonBadge", () => {
      const wrapper = mount(Form, {
        props: { structure: selectStructure("alpha"), formFields: {} }
      })
      expect(wrapper.find("[data-select]").exists()).toBe(true)
      const field = wrapper.vm.getField<"Select">("role")
      expect(field?.closeButtonBadge).toBe(true)
    })
  })

  // ---ISSUE 8 — coverage: async-valid, compare, custom field, multi-section ---
  describe("Form Component - Coverage (Issue 8)", () => {
    it("passes async validation for a valid value", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                {
                  name: "asyncField",
                  typeComponent: "Input",
                  label: "Async",
                  modelValue: "",
                  rules: {
                    async: {
                      message: "Invalid async field",
                      validationCallback(value: any): Promise<RuleCallback> {
                        return Promise.resolve({ isInvalid: value !== "ok" })
                      }
                    }
                  } as Rules
                }
              ]
            }
          ]
        }
      })
      await nextTick()
      wrapper.vm.setFieldValue("asyncField", "ok")
      wrapper.vm.validateFields("asyncField")
      await flushPromises()
      await nextTick()
      expect(wrapper.vm.formInvalidFields["asyncField"]).toBe(false)
    })

    it("validates a compare rule against another field", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                { name: "password", typeComponent: "Input", label: "Password", modelValue: "secret" },
                {
                  name: "confirm",
                  typeComponent: "Input",
                  label: "Confirm",
                  modelValue: "",
                  rules: {
                    compare: {
                      compareFields: ["password"],
                      validationCallback(value: any, fields: any): RuleCallback {
                        return { isInvalid: value !== fields.password, message: "Passwords don't match" }
                      }
                    }
                  } as Rules
                }
              ]
            }
          ],
          formFields: { password: "secret", confirm: "nope" }
        }
      })
      await nextTick()
      wrapper.vm.validateFields("confirm")
      expect(wrapper.vm.isFieldInvalid("confirm")).toBe(true)
      expect(wrapper.vm.getField<"Input">("confirm")?.messageInvalid).toBe("Passwords don't match")
    })

    it("renders a custom field and bridges updateModelValue/changeModelValue", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                {
                  name: "rating",
                  typeComponent: "Custom",
                  nameTemplate: "rating",
                  label: "Rating"
                } as FieldType<"Custom">
              ]
            }
          ],
          formFields: { rating: 1 }
        },
        slots: {
          rating: `<template #rating="{ data, updateModelValue, changeModelValue }">
            <button data-custom-up @click="updateModelValue((data.modelValue ?? 0) + 1)">up</button>
            <button data-custom-change @click="changeModelValue(99)">change</button>
          </template>`
        }
      })
      await nextTick()
      expect(wrapper.find("[data-custom-up]").exists()).toBe(true)

      await wrapper.find("[data-custom-up]").trigger("click")
      expect(wrapper.vm.formFields.rating).toBe(2)

      await wrapper.find("[data-custom-change]").trigger("click")
      expect(wrapper.vm.formFields.rating).toBe(99)
      expect(wrapper.emitted("update:formFields")).toBeTruthy()
    })

    it("validates required fields across multiple sections", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            { fields: [{ name: "a", typeComponent: "Input", label: "A", required: true, modelValue: "" }] },
            { fields: [{ name: "b", typeComponent: "Input", label: "B", required: true, modelValue: "" }] }
          ],
          formFields: { a: "", b: "" }
        }
      })
      await nextTick()
      expect(wrapper.vm.validateFields()).toBe(false)
      expect(wrapper.vm.isFieldInvalid("a")).toBe(true)
      expect(wrapper.vm.isFieldInvalid("b")).toBe(true)
    })
  })

  // ---ISSUE 6 — validation messages localised via setDefaultRuleMessages (placed last: mutates global state) ---
  describe("Form Component - Validation message localization (Issue 6)", () => {
    const createAppWithLocale = (locale: any) => ({
      install(app: any) {
        app.use(FishtVue, { locale })
      }
    })

    const emailStructure = (): FormProps["structure"] => [
      {
        fields: [
          {
            name: "email",
            typeComponent: "Input",
            label: "Email",
            rules: { required: true, email: true },
            modelValue: ""
          }
        ]
      }
    ]

    it("localizes default validation messages to ru when active locale is ru", async () => {
      const wrapper = mount(Form, {
        props: { structure: emailStructure(), modeValidate: "onChange" },
        global: { plugins: [createAppWithLocale({ activeLocale: "ru" })] }
      })

      const input = wrapper.find('input[id="email"]')
      await input.setValue("invalid-email")

      expect(wrapper.vm.isFieldInvalid("email")).toBe(true)
      expect(wrapper.vm.getField<"Input">("email")?.messageInvalid).toBe("Неверный email")
    })

    it("keeps en messages under the default locale", async () => {
      const wrapper = mount(Form, {
        props: { structure: emailStructure(), modeValidate: "onChange" },
        global: { plugins: [createAppWithLocale({})] }
      })

      const input = wrapper.find('input[id="email"]')
      await input.setValue("invalid-email")

      expect(wrapper.vm.getField<"Input">("email")?.messageInvalid).toBe("Invalid email")
    })
  })

  // ---ISSUES 5, 7, 9 — cross-cutting closes (unstyled / date locale / motion-RTL-print) ---
  describe("Form Component - Cross-cutting (Issues 5, 7, 9)", () => {
    const createAppConfig = (config: Record<string, any>) => ({
      install(app: any) {
        app.use(FishtVue, config)
      }
    })

    // ---ISSUE 9 — reduced-motion: field grid transitions are motion-safe ---
    it("uses motion-safe transitions on the field grid (Issue 9)", () => {
      const wrapper = mount(Form, { props: { structure: structure() } })
      const groupClasses = wrapper.find("[data-form-group]").classes()
      expect(groupClasses).toContain("motion-safe:transition")
      expect(groupClasses).not.toContain("transition")
    })

    // ---ISSUE 9 — RTL: inserted slot content uses logical margins (me-*), not physical (mr-*) ---
    it("uses RTL-safe logical margins on inserted slot content (Issue 9)", () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                {
                  name: "amount",
                  typeComponent: "Input",
                  label: "Amount",
                  modelValue: "",
                  insert: { afterText: "USD", afterIcon: "Check", beforeIcon: "Banknotes" }
                }
              ]
            }
          ]
        }
      })
      const afterText = wrapper.findAll("p").find((p) => p.text().includes("USD"))
      expect(afterText).toBeTruthy()
      expect(afterText!.classes()).toContain("me-3")
      expect(afterText!.classes()).not.toContain("mr-3")
    })

    // ---ISSUE 5 — unstyled config drops Form root styles (cross-cutting Component.setStyle guard) ---
    it("renders the form root without classes under unstyled: true (Issue 5)", () => {
      const wrapper = mount(Form, {
        props: { structure: structure(), class: "user-form-class" },
        global: { plugins: [createAppConfig({ unstyled: true })] }
      })
      const cls = wrapper.find("form[data-form]").attributes("class")
      expect(cls === undefined || cls === "").toBe(true)
    })

    it("keeps the form root class when not unstyled (Issue 5 contrast)", () => {
      const wrapper = mount(Form, {
        props: { structure: structure(), class: "user-form-class" },
        global: { plugins: [createAppConfig({ unstyled: false })] }
      })
      expect(wrapper.find("form[data-form]").classes()).toContain("user-form-class")
    })

    // ---ISSUE 7 — date fields inherit the active locale via Calendar self-localization ---
    it("leaves date-field locale to Calendar self-localization under active locale (Issue 7)", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [{ fields: [{ name: "date", typeComponent: "Calendar", label: "Date" }] }]
        },
        global: { plugins: [createAppConfig({ locale: { activeLocale: "ru" } })] }
      })
      await flushPromises()
      const cal = wrapper.findComponent(Calendar)
      expect(cal.exists()).toBe(true)
      // Form must not inject a paramsDatePicker.locale override — Calendar self-localizes.
      expect((cal.props("paramsDatePicker") as any)?.locale).toBeUndefined()
      // The active locale Calendar resolves to is "ru" in this plugin context.
      expect(getActiveLocale()).toBe("ru")
    })
  })

  // ---ISSUE 4 — native <form> submission + FormData integration ---
  describe("Form Component - Native submit & FormData (Issue 4)", () => {
    it("exposes field name attributes and collects values via native FormData", async () => {
      const wrapper = mount(Form, {
        props: { structure: structure(), formFields: formFields() },
        attachTo: document.body
      })
      await nextTick()
      // Input fields carry a native `name` (Form binds id=field.name → Input maps :name=id).
      expect(wrapper.find('input[name="name"]').exists()).toBe(true)
      expect(wrapper.find('input[name="email"]').exists()).toBe(true)

      const formEl = wrapper.find("form[data-form]").element
      const fd = new window.FormData(formEl as any)
      expect(fd.get("name")).toBe("John Doe")
      expect(fd.get("email")).toBe("john.doe@example.com")
      wrapper.unmount()
    })

    it("reflects action/method/enctype on the native form element", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structure(),
          action: "/api/submit",
          method: "post",
          enctype: "multipart/form-data"
        }
      })
      const formEl = wrapper.find("form[data-form]")
      expect(formEl.attributes("action")).toBe("/api/submit")
      expect(formEl.attributes("method")).toBe("post")
      expect(formEl.attributes("enctype")).toBe("multipart/form-data")
    })

    it("prevents native submission and does not emit when validation fails", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            { fields: [{ name: "req", typeComponent: "Input", label: "Req", required: true, modelValue: "" }] }
          ],
          nativeSubmit: true
        }
      })
      await nextTick()
      const submitEvent = new Event("submit", { cancelable: true, bubbles: true })
      wrapper.find("form").element.dispatchEvent(submitEvent)
      expect(submitEvent.defaultPrevented).toBe(true)
      expect(wrapper.emitted("submit")).toBeFalsy()
    })

    it("emits submit and prevents page reload by default (SPA mode)", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [{ fields: [{ name: "a", typeComponent: "Input", label: "A", modelValue: "ok" }] }]
        }
      })
      await nextTick()
      const submitEvent = new Event("submit", { cancelable: true, bubbles: true })
      wrapper.find("form").element.dispatchEvent(submitEvent)
      expect(submitEvent.defaultPrevented).toBe(true)
      expect(wrapper.emitted("submit")).toBeTruthy()
    })

    it("allows native submission when nativeSubmit is set and the form is valid", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [{ fields: [{ name: "a", typeComponent: "Input", label: "A", modelValue: "ok" }] }],
          nativeSubmit: true
        },
        attachTo: document.body
      })
      await nextTick()
      const submitEvent = new Event("submit", { cancelable: true, bubbles: true })
      wrapper.find("form").element.dispatchEvent(submitEvent)
      expect(submitEvent.defaultPrevented).toBe(false)
      expect(wrapper.emitted("submit")).toBeTruthy()
      wrapper.unmount()
    })

    it("exposes the root form element (G34)", () => {
      const wrapper = mount(Form, { props: { structure: structure() } })
      expect(wrapper.vm.formElement).toBeTruthy()
      expect(wrapper.vm.formElement?.tagName).toBe("FORM")
    })
  })

  // ---ISSUE 3 — custom field types via registerFieldType ---
  describe("Form Component - Custom field types (Issue 3)", () => {
    const StubField = defineComponent({
      name: "StubField",
      props: { modelValue: { type: String, default: "" }, id: { type: String, default: "" } },
      emits: ["update:modelValue"],
      template: `<input
        data-stub-field
        :name="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)" />`
    })

    it("renders a registered custom field type", async () => {
      registerFieldType("StubField", StubField)
      const wrapper = mount(Form, {
        props: {
          structure: [
            { fields: [{ name: "custom", typeComponent: "StubField", label: "Custom", modelValue: "hi" } as any] }
          ],
          formFields: { custom: "hi" }
        }
      })
      await nextTick()
      expect(wrapper.find("[data-stub-field]").exists()).toBe(true)
      expect(wrapper.find("[data-stub-field]").attributes("name")).toBe("custom")
    })

    it("bridges v-model for a registered field type", async () => {
      registerFieldType("StubField", StubField)
      const wrapper = mount(Form, {
        props: {
          structure: [
            { fields: [{ name: "custom", typeComponent: "StubField", label: "Custom", modelValue: "" } as any] }
          ],
          formFields: { custom: "" }
        }
      })
      await nextTick()
      await wrapper.find("[data-stub-field]").setValue("typed")
      expect(wrapper.vm.formFields.custom).toBe("typed")
    })

    it("falls through to the Custom slot for unregistered types", () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                { name: "rating", typeComponent: "Custom", nameTemplate: "rating", label: "R" } as FieldType<"Custom">
              ]
            }
          ]
        },
        slots: { rating: `<div data-custom-slot>custom</div>` }
      })
      expect(wrapper.find("[data-custom-slot]").exists()).toBe(true)
      expect(wrapper.find("[data-stub-field]").exists()).toBe(false)
    })
  })

  // ---ISSUE 2 — compound <Form><FormSection><FormField> API (VNode-walk) ---
  describe("Form Component - Compound API (Issue 2)", () => {
    it("renders a compound FormField as an Input bound to formFields", async () => {
      const wrapper = mount(Form, {
        slots: {
          default: () => h(FormField, { name: "email", type: "Input", label: "Email", modelValue: "" })
        }
      })
      await nextTick()
      expect(wrapper.find('input[id="email"]').exists()).toBe(true)
      expect(wrapper.find('input[name="email"]').exists()).toBe(true)

      await wrapper.find('input[id="email"]').setValue("a@b.com")
      expect(wrapper.vm.formFields.email).toBe("a@b.com")
    })

    it("groups fields under a FormSection", async () => {
      const wrapper = mount(Form, {
        slots: {
          default: () =>
            h(FormSection, { title: "User" }, () => [
              h(FormField, { name: "name", type: "Input", label: "Name", modelValue: "" }),
              h(FormField, { name: "email", type: "Input", label: "Email", modelValue: "" })
            ])
        }
      })
      await nextTick()
      expect(wrapper.findAll("[data-form-item]").length).toBe(1)
      expect(wrapper.findAll("[data-form-group-item]").length).toBe(2)
    })

    it("renders a custom control via the FormField default slot", async () => {
      const wrapper = mount(Form, {
        slots: {
          default: () =>
            h(FormField, { name: "rating" }, { default: () => h("div", { "data-compound-custom": "" }, "custom") })
        }
      })
      await nextTick()
      expect(wrapper.find("[data-compound-custom]").exists()).toBe(true)
    })

    it("lets schema structure win over compound children (backward compat)", async () => {
      const wrapper = mount(Form, {
        props: {
          structure: [{ fields: [{ name: "schemaField", typeComponent: "Input", label: "S", modelValue: "" }] }]
        },
        slots: {
          default: () => h(FormField, { name: "compoundField", type: "Input", modelValue: "" })
        }
      })
      await nextTick()
      expect(wrapper.find('input[id="schemaField"]').exists()).toBe(true)
      expect(wrapper.find('input[id="compoundField"]').exists()).toBe(false)
    })
  })

  // ---B10 — semantic surface tokens вместо hardcoded gray-family classes -------------------------
  describe("Form Component - B10 semantic surface tokens", () => {
    const legacyGrayFamily = /\b(?:bg|text|border|ring|divide)-(?:neutral|stone|zinc|slate|gray)-\d+/

    it("section divider uses surface-family border (not gray), keeping the /10 opacity suffix", () => {
      const wrapper = mount(Form, { props: { structure: structure() } })
      const cls = wrapper.find("[data-form-item]").classes().join(" ")
      expect(cls).toContain("border-surface-900/10")
      expect(cls).toContain("dark:border-surface-100/10")
      expect(cls).not.toMatch(legacyGrayFamily)
    })

    it("insert.beforeText slot prefix uses surface-family text (not gray)", () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                {
                  name: "amount",
                  typeComponent: "Input",
                  label: "Amount",
                  modelValue: "",
                  insert: { beforeText: "USD" }
                }
              ]
            }
          ]
        }
      })
      const beforeText = wrapper.findAll("span").find((span) => span.text().includes("USD"))
      expect(beforeText).toBeTruthy()
      const cls = beforeText!.classes().join(" ")
      expect(cls).toContain("text-surface-500")
      expect(cls).not.toMatch(legacyGrayFamily)
    })

    it("insert.afterText slot suffix uses surface-family text (not gray)", () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                {
                  name: "amount",
                  typeComponent: "Input",
                  label: "Amount",
                  modelValue: "",
                  insert: { afterText: "USD" }
                }
              ]
            }
          ]
        }
      })
      const afterText = wrapper.findAll("p").find((p) => p.text().includes("USD"))
      expect(afterText).toBeTruthy()
      const cls = afterText!.classes().join(" ")
      expect(cls).toContain("text-surface-400")
      expect(cls).toContain("dark:text-surface-600")
      expect(cls).not.toMatch(legacyGrayFamily)
    })

    it("insert.beforeIcon/afterIcon use surface-family text (not gray)", () => {
      const wrapper = mount(Form, {
        props: {
          structure: [
            {
              fields: [
                {
                  name: "amount",
                  typeComponent: "Input",
                  label: "Amount",
                  modelValue: "",
                  insert: { beforeIcon: "trash", afterIcon: "check" }
                }
              ]
            }
          ]
        }
      })
      const icons = wrapper.findAll("[data-icon] svg")
      expect(icons.length).toBeGreaterThanOrEqual(2)
      icons.forEach((icon) => {
        const cls = icon.classes().join(" ")
        expect(cls).toContain("text-surface-400")
        expect(cls).toContain("dark:text-surface-600")
        expect(cls).not.toMatch(legacyGrayFamily)
      })
    })
  })
})
