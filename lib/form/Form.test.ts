import { mount } from "@vue/test-utils"
import { describe, it, vi, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Form from "fishtvue/form/Form.vue"
import { nextTick } from "vue"
import type { FieldType } from "fishtvue/form/Form"

import * as AllRules from "fishtvue/utils/rulesHandler"
import type { RuleCallback, Rules } from "fishtvue/utils/rulesHandler"

describe("Form Component Tests", () => {
  const structure = () => [
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
      expect(wrapper.vm.getField("email")?.messageInvalid).toBe("Invalid email")
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
      const structure = [
        {
          class: "test-class",
          fields: [
            {
              typeComponent: "Input",
              label: "Test Field",
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

      // Найти все элементы формы
      const formFields = wrapper.findAll("[data-form-group-item]")

      // Проверить, что имя было назначено автоматически
      expect(formFields.length).toBe(1)

      const fieldComponent = formFields[0]

      // Поле должно иметь автоматически сгенерированное имя
      expect(fieldComponent.find("input").attributes("id")).toMatch(/field\d+/) // Проверяем, что имя начинается с "field" и содержит номер
    })

    it("handles a field without 'rules' but with 'required' set to true", async () => {
      const structure = [
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

      // Проверить, что компонент автоматически добавил правило "required"
      const formStructure = (wrapper.props() as any).structure[0].fields[0]
      expect(formStructure.rules).toBeDefined()
      expect(formStructure.rules.required).toEqual(expect.any(String)) // Проверяем, что правило существует и является строкой
      expect(formStructure.rules.required).toBe("Required field")

      // Протестировать валидацию поля
      const input = wrapper.find("[data-form-group-item] input")
      await input.setValue("")
      await wrapper.vm.$nextTick()

      // Убедиться, что поле помечено как невалидное
      expect(wrapper.vm.isFieldInvalid("testField")).toBe(true)
      expect(wrapper.vm.getField("testField").messageInvalid).toBe("Required field")
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
      expect(wrapper.vm.classBase).toContain("special-form-verification-class")
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

      const field = wrapper.vm.getField("name")
      expect(field.mode).toBe("outlined")
      expect(field.labelMode).toBe("static")
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

      const field = wrapper.vm.getField("name")
      expect(field.mode).toBe("underlined")
      expect(field.labelMode).toBe("dynamic")
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
      const structure = [
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
      const structure = [
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
    const structureForSetFieldParam = () => [
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
    const structureForGetField = () => [
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
    const structureForIsFieldInvalid = () => [
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
    const structureForSetStructureParam = () => [
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

    it("updates a parameter of a structure at a specific index", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetStructureParam()
        }
      })

      // Проверяем изначальное значение параметра
      expect(wrapper.vm.formStructure[0].class).toBe("section-1")

      // Изменяем параметр
      wrapper.vm.setStructureParam(0, "class", "new-section-class")

      // Проверяем, что параметр обновился
      expect(wrapper.vm.formStructure[0].class).toBe("new-section-class")
    })

    it("does not modify other structures", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetStructureParam()
        }
      })

      // Изменяем параметр в первой структуре
      wrapper.vm.setStructureParam(0, "class", "new-section-class")

      // Проверяем, что другая структура не изменилась
      expect(wrapper.vm.formStructure[1].class).toBe("section-2")
    })

    it("updates multiple parameters of the same structure", () => {
      const wrapper = mount(Form, {
        props: {
          structure: structureForSetStructureParam()
        }
      })

      // Изменяем параметры
      wrapper.vm.setStructureParam(1, "class", "updated-class")
      wrapper.vm.setStructureParam(1, "classGrid", "updated-grid")

      // Проверяем, что оба параметра обновились
      expect(wrapper.vm.formStructure[1].class).toBe("updated-class")
      expect(wrapper.vm.formStructure[1].classGrid).toBe("updated-grid")
    })
  })

  describe("Form Component - Async Validation", () => {
    const structureForAsync = () => [
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

      // Триггерим валидацию
      let field = wrapper.vm.formStructure[0].fields[0]
      await wrapper.vm.validateField(field)

      // Проверяем, что `getAsyncValidate` был вызван с правильными параметрами
      expect(getAsyncValidateMock).toHaveBeenCalledWith(wrapper.vm.formFields.asyncField, field.rules)
      field = wrapper.vm.formStructure[0].fields[0]
      // Проверяем, что поле не валидное
      expect(wrapper.vm.formInvalidFields["asyncField"]).toBe(true)
      expect(field.messageInvalid).toBe("Invalid async field")
      expect(field.loading).toBe(false) // Убедимся, что loading сброшен
    })
  })
  describe("Form Component - Validation Failure with Scroll", () => {
    const structureForValidation = () => [
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
      document.querySelector = vi.fn()
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

      // Проверить вызов scrollIntoView
      expect(document.querySelector).toHaveBeenCalled()

      // Проверить, что поле стало невалидным
      const field = wrapper.vm.getField("invalidField")

      // Проверить, что сообщение об ошибке соответствует правилу
      expect(field?.messageInvalid).toBe("This field is required.")
      expect(wrapper.vm.isFieldInvalid("invalidField")).toBe(true)
      vi.restoreAllMocks()
    })
  })
})
