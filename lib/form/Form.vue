<script setup lang="ts">
  import {
    Comment,
    Fragment,
    Text,
    computed,
    defineComponent,
    nextTick,
    onMounted,
    reactive,
    ref,
    unref,
    useSlots,
    watch
  } from "vue"
  import {
    FieldComponentType,
    FieldCustom,
    FieldInput,
    FieldType,
    FieldUseInputLayout,
    FormEmits,
    FormProps,
    FormStructure,
    FormValues
  } from "./Form"
  import Icons from "fishtvue/icons/Icons.vue"
  import Input from "fishtvue/input/Input.vue"
  import Aria from "fishtvue/aria/Aria.vue"
  import Select from "fishtvue/select/Select.vue"
  import Calendar from "fishtvue/calendar/Calendar.vue"
  import TextEditor from "fishtvue/texteditor/TextEditor.vue"
  import Switch from "fishtvue/switch/Switch.vue"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  import type { RulesObject } from "fishtvue/utils/rulesHandler"
  import { getAsyncValidate, getValidate, isExistRule, setDefaultRuleMessages } from "fishtvue/utils/rulesHandler"
  import { deepCopy, fieldsOmit } from "fishtvue/utils/objectHandler"
  import { generateUUID } from "fishtvue/utils/functionHandler"
  import { isClient } from "fishtvue/utils/domHandler"
  import { getActiveLocale, useFishtVue } from "fishtvue/config"
  import { getFieldType } from "./fieldRegistry"
  // ---BASE-COMPONENT----------------------
  const Form = new Component<"Form">()
  const options = Form.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<FormProps>(), {
    disabled: undefined
  })
  const emit = defineEmits<FormEmits>()
  // ---REF-LINK----------------------------
  const formRef = ref<HTMLElement>()
  // ---G34 — ref на корневой <form> element (наружу через defineExpose).
  const formElement = ref<HTMLFormElement>()
  // ---STATE-------------------------------
  const calculatedFieldsInput = <Array<keyof FieldType>>[
    "typeComponent",
    "classCol",
    "modelValue",
    "isInvalid",
    "name",
    "rules",
    "beforeIcon",
    "beforeText",
    "afterIcon",
    "afterText"
  ]
  const arrayFieldsValidate = ["Input", "Aria", "Select", "Calendar", "TextEditor"]
  const baseInputs = {
    Input,
    Aria,
    Select,
    Calendar,
    TextEditor,
    Switch
  }
  type BaseInputKey = "Input" | "Aria" | "Select" | "Calendar" | "TextEditor" | "Switch"
  // ---ISSUE 3 — резолв компонента поля: встроенный тип > зарегистрированный custom-тип.
  // Если ни то, ни другое — рендерится Custom-slot (v-else в шаблоне).
  function resolveFieldComponent(typeComponent: string) {
    return baseInputs[typeComponent as BaseInputKey] ?? getFieldType(typeComponent)
  }
  const formStructure = ref<FormStructure[]>()
  // ---COMPOUND-API (VNode-walk <FormSection>/<FormField>) — Issue 2 -------------------
  // Считываем декларативные дети из default slot и синтезируем FormStructure[]. Schema-driven
  // `:structure` при наличии выигрывает (backward compat). Сопоставление по ИМЕНИ компонента —
  // FormField.vue/FormSection.vue НЕ импортируем в этот SFC (импорт SFC в SFC ломает type-resolver
  // @vue/compiler-sfc на re-export `declare class ... extends ClassComponent`; урок Menu/Table).
  const slots = useSlots()
  function compoundNormalize(raw: unknown): Array<any> {
    if (raw === null || raw === undefined) return []
    return Array.isArray(raw) ? (raw as Array<any>) : [raw]
  }
  function isVNodeNamed(vn: any, nameComponent: string): boolean {
    const t = vn?.type
    return !!t && (t?.name === nameComponent || t?.__name === nameComponent)
  }
  function compoundFlatten(nodes: Array<any>): Array<any> {
    const out: Array<any> = []
    for (const n of nodes) {
      if (n === null || n === undefined || typeof n !== "object") continue
      if (n.type === Comment || n.type === Text) continue
      if (n.type === Fragment) out.push(...compoundFlatten(compoundNormalize(n.children)))
      else out.push(n)
    }
    return out
  }
  function compoundChildren(vn: any): Array<any> {
    const def = vn?.children?.default
    return typeof def === "function" ? compoundNormalize(def()) : []
  }
  // Извлекаем поле из <FormField>-vnode: props (+ `type`→`typeComponent`) + захваченный default-slot
  // (custom-контрол). Slot-функции хранятся отдельно (slotsAcc по имени поля) — не в данных поля,
  // чтобы пережить deepCopy в getStructure().
  function extractField(vn: any, slotsAcc: Record<string, any>): FieldType {
    const p = (vn?.props ?? {}) as Record<string, any>
    const childSlots = (vn?.children && typeof vn.children === "object" ? vn.children : {}) as Record<string, any>
    const defaultSlot = typeof childSlots.default === "function" ? childSlots.default : undefined
    const { type, typeComponent, ...rest } = p
    const nameField = (rest.name ?? "") as string
    if (defaultSlot) {
      slotsAcc[nameField] = defaultSlot
      return { ...rest, typeComponent: "Custom", nameTemplate: rest.nameTemplate ?? nameField } as unknown as FieldType
    }
    return { ...rest, typeComponent: (typeComponent ?? type ?? "Input") as FieldComponentType } as unknown as FieldType
  }
  const compoundParsed = computed<{ structure: Array<FormStructure>; slots: Record<string, any> }>(() => {
    const raw = typeof slots.default === "function" ? slots.default() : undefined
    const top = compoundFlatten(compoundNormalize(raw))
    const sections: Array<FormStructure> = []
    const slotsAcc: Record<string, any> = {}
    let implicit: FormStructure | null = null
    for (const vn of top) {
      if (isVNodeNamed(vn, "FormField")) {
        if (!implicit) {
          implicit = { fields: [] }
          sections.push(implicit)
        }
        implicit.fields.push(extractField(vn, slotsAcc))
      } else if (isVNodeNamed(vn, "FormSection")) {
        implicit = null
        const sp = (vn?.props ?? {}) as Record<string, any>
        const section: FormStructure = {
          fields: [],
          isHidden: sp.isHidden,
          class: sp.class,
          classGrid: sp.classGrid,
          title: sp.title,
          description: sp.description
        }
        for (const child of compoundFlatten(compoundChildren(vn)))
          if (isVNodeNamed(child, "FormField")) section.fields.push(extractField(child, slotsAcc))
        sections.push(section)
      }
    }
    return { structure: sections, slots: slotsAcc }
  })
  const compoundStructure = computed<Array<FormStructure>>(() => compoundParsed.value.structure)
  const compoundFieldSlots = computed<Record<string, any>>(() => compoundParsed.value.slots)
  // Стабильный рендерер захваченного со <FormField> default-slot (зеркало Table.RenderColumnSlot):
  // props (render/args) объявлены — slot-props (data/updateModelValue/changeModelValue) доходят корректно.
  const RenderFieldSlot = defineComponent({
    name: "RenderFieldSlot",
    props: { render: { type: Function, default: undefined }, args: { type: Object, default: undefined } },
    setup: (p) => () => (p.render ? (p.render as (a: any) => any)(p.args) : null)
  })
  // ---PROPS-------------------------------
  const name = computed<FormProps["name"]>(() => props.name ?? "")
  const modeStyle = computed<FormProps["modeStyle"]>(() => props.modeStyle ?? options?.modeStyle)
  const modeLabel = computed<NonNullable<FormProps["modeLabel"]>>(
    () => props.modeLabel ?? options?.modeLabel ?? "offsetDynamic"
  )
  const isDisabled = computed<NonNullable<FormProps["disabled"]>>(() => props.disabled ?? false)
  const autocomplete = computed<NonNullable<FormProps["autocomplete"]>>(
    () => (props?.autocomplete as FormProps["autocomplete"]) ?? options?.autocomplete ?? "on"
  )
  const modeValidate = computed<NonNullable<FormProps["modeValidate"]>>(
    () => props.modeValidate ?? options?.modeValidate ?? "onChange"
  )
  // ---ISSUE 4 — native submit / FormData props (проброс на корневой <form>)
  const action = computed<FormProps["action"]>(() => props.action)
  const method = computed<FormProps["method"]>(() => props.method)
  const enctype = computed<FormProps["enctype"]>(() => props.enctype)
  const nativeSubmit = computed<NonNullable<FormProps["nativeSubmit"]>>(() => props.nativeSubmit ?? false)
  // ---------------------------------------
  const formFields = reactive<FormValues>({})
  const formInvalidFields = reactive<{ [key: string]: boolean }>({})
  // Schema `:structure` (если задан, в т.ч. пустой массив) выигрывает; иначе — compound `<FormField>`/
  // `<FormSection>`-дети (Issue 2).
  const structure = computed<Array<FormStructure>>(() => {
    const schema = unref(props.structure)
    if (schema !== undefined && schema !== null) return schema
    return compoundStructure.value
  })
  const submitButton = computed<FormProps["submitButton"]>(
    () => props.submitButton ?? options?.submitButton ?? Form.t("save") ?? "Save"
  )
  // ---------------------------------------
  Form.setStyle("motion-safe:transition motion-safe:ease-in-out motion-safe:duration-500 opacity-100 opacity-0")
  const classBase = computed(() => Form.setStyle([options?.class ?? "", props.class ?? ""]))
  const classStructure = computed(() =>
    Form.setStyle([
      "border-b border-surface-900/10 dark:border-surface-100/10 pb-6 print:border-black",
      options?.structureClass ?? "",
      props?.structureClass ?? ""
    ])
  )
  const classStructureGrid = computed(() =>
    Form.setStyle([
      "grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-10",
      options?.structureClassGrid ?? "",
      props?.structureClassGrid ?? ""
    ])
  )
  const classItemGrid = ref(Form.setStyle("grid motion-safe:transition"))
  const classBeforeSlot = ref(Form.setStyle("flex select-none items-center text-surface-500 sm:text-sm"))
  // RTL: логические margins (ms/me) вместо физических ml/mr — авто-флип при dir="rtl" (Issue 9 / F31)
  const classAfterSlot = ref(Form.setStyle("ms-1 me-3 text-surface-400 dark:text-surface-600 select-none"))
  const classFooter = ref(Form.setStyle("mt-3 flex items-center justify-end gap-x-6"))
  // ---EXPOSE------------------------------
  defineExpose({
    // ---PROPS-------------------------------
    formElement,
    formFields,
    formInvalidFields,
    formStructure,
    // ---METHODS-----------------------------
    setFieldValue,
    setFieldParam,
    getField,
    isFieldInvalid,
    setStructureParam,
    validateFields
  })
  // ---MOUNT-UNMOUNT-----------------------
  // ---CANON — без ручного Form.initStyle(): Component.__hooks() регистрирует vueOnMounted/onServerPrefetch.
  onMounted(() => {
    structure.value?.forEach((item) =>
      item.fields?.forEach((field) => {
        const formFieldsValue = unref(props.formFields)
        formFields[field.name] = formFieldsValue?.[field.name] ?? field.modelValue
      })
    )
  })
  // ---WATCHERS----------------------------
  // ---ISSUE 6 — локализация default validation-messages через rulesHandler, когда активен plugin.
  // setDefaultRuleMessages — global module state; guarded через useFishtVue(), чтобы standalone-Form
  // (без plugin) сохранял встроенные английские defaults. Переприменяется при смене активной локали.
  function applyLocaleToRules(): void {
    if (!useFishtVue()) return
    setDefaultRuleMessages({
      required: Form.t("requiredField") ?? "Required field",
      email: Form.t("invalidEmail") ?? "Invalid email",
      phone: Form.t("invalidPhone") ?? "Invalid phone",
      numeric: Form.t("invalidNumeric") ?? "Invalid numeric",
      regular: Form.t("regexMismatch") ?? "The value does not satisfy the rule",
      range: Form.t("valueOutOfRange") ?? "The value is not within the set range",
      length: Form.t("invalidLength") ?? "Invalid length value",
      async: Form.t("invalidField") ?? "Invalid field",
      custom: Form.t("invalidField") ?? "Invalid field",
      compare: Form.t("compareMismatch") ?? "The field does not fall off"
    })
  }
  watch(() => getActiveLocale(), applyLocaleToRules, { immediate: true })

  watch(
    formFields,
    (value: FormValues) => {
      emit("update:formFields", value)
    },
    { deep: true }
  )

  watch(
    () => props.formFields,
    (newFormFields) => {
      const formFieldsValue = unref(newFormFields)
      if (formFieldsValue) {
        structure.value?.forEach((item) =>
          item.fields?.forEach((field) => {
            if (field.name in formFieldsValue) {
              formFields[field.name] = formFieldsValue[field.name]
            }
          })
        )
      }
    },
    { deep: true, immediate: false }
  )

  watch(
    () => [
      structure.value,
      classStructure.value,
      classStructureGrid.value,
      modeStyle.value,
      modeLabel.value,
      autocomplete.value,
      isDisabled.value
    ],
    () => {
      formStructure.value = getStructure()
      const formFieldsValue = unref(props.formFields)
      if (formFieldsValue) {
        structure.value?.forEach((item) =>
          item.fields?.forEach((field) => {
            if (!(field.name in formFields)) {
              formFields[field.name] = formFieldsValue[field.name] ?? field.modelValue
            }
          })
        )
      }
    },
    { immediate: true }
  )
  // ---METHODS-----------------------------
  function setFieldValue(fieldName: string, value: any): unknown | undefined {
    if (fieldName in formFields) {
      formFields[fieldName] = value
      return formFields[fieldName]
    }
    console.error(`Field with field name '${fieldName}' does not exist in structure`)
    return
  }

  function setFieldParam<T extends FieldComponentType>(fieldName: string, param: keyof FieldType<T>, value: any): void {
    formStructure.value?.forEach((structure, i: number) => {
      structure.fields?.forEach((item, j: number) => {
        if (item.name === fieldName) (formStructure.value?.[i].fields[j] as any)[param] = value
      })
    })
  }

  function getField<T extends FieldComponentType>(fieldName: string): FieldType<T> | null {
    for (const structure of formStructure.value ?? []) {
      const field = structure.fields?.find((item) => item.name === fieldName)
      if (field) return field as FieldType<T>
    }
    return null
  }

  function isFieldInvalid(fieldName: string): boolean | undefined {
    if (fieldName in formFields) {
      return formInvalidFields[fieldName] ?? false
    }
    console.error(`Field with field name '${fieldName}' does not exist in structure`)
    return
  }

  function setStructureParam(indexStructure: number, param: keyof FormStructure, value: any): void {
    formStructure.value?.some((_, index: number) => {
      if (index === indexStructure) (formStructure.value?.[index] as any)[param] = value
    })
  }

  // ---------------------------------------
  function getStructure(): Array<FormStructure> {
    return (
      structure.value?.map((structureItem) => {
        let resultStructure: FormStructure = deepCopy(structureItem)
        resultStructure.class = Form.setStyle([classStructure.value, resultStructure.class])
        resultStructure.classGrid = Form.setStyle([classStructureGrid.value, resultStructure.classGrid])
        if (resultStructure.fields) {
          resultStructure.fields = resultStructure.fields.map((field) => {
            let resultField = deepCopy(field)
            if (!resultField.name) {
              resultField.name = "field_" + generateUUID()
              console.error(`There is no name field. Temporary name ${resultField.name} is set.`)
            }
            if (
              resultField.typeComponent === "Input" ||
              resultField.typeComponent === "Aria" ||
              resultField.typeComponent === "Select" ||
              resultField.typeComponent === "Calendar" ||
              resultField.typeComponent === "TextEditor"
            ) {
              if ("rules" in resultField) {
                resultField.required = !!(resultField.rules as RulesObject)?.required || resultField?.required || false
                if (
                  resultField.required &&
                  (!(resultField.rules as RulesObject)?.required ||
                    typeof (resultField.rules as RulesObject).required === "boolean")
                ) {
                  ;(resultField.rules as RulesObject).required = Form.t("requiredField") ?? "Required field"
                }
              } else if (resultField?.required) {
                resultField.rules = { required: Form.t("requiredField") ?? "Required field" }
              }
              resultField.labelMode ??= modeLabel.value
              if (
                resultField.typeComponent !== "TextEditor" &&
                resultField.typeComponent !== "Calendar" &&
                resultField.typeComponent !== "Select"
              ) {
                ;(resultField as FieldInput).autocomplete ??= autocomplete.value
              }
            }
            if (resultField.typeComponent === "Select")
              resultField.closeButtonBadge = resultField.closeButtonBadge ?? true
            resultField.classCol = Form.setStyle(["col-span-full", resultField.classCol])
            if (modeStyle.value) resultField.mode = resultField.mode ?? modeStyle.value
            resultField.disabled = resultField.disabled ?? isDisabled.value
            return resultField
          })
        }
        return resultStructure
      }) ?? []
    )
  }

  // ---------------------------------------
  async function validateField(field: FieldType) {
    // Встроенные InputLayout-типы валидируются всегда; зарегистрированные custom-типы (Issue 3)
    // и Custom-поля — если несут `rules`.
    if (arrayFieldsValidate.includes(field.typeComponent) || (field as FieldUseInputLayout)?.rules) {
      field = field as FieldUseInputLayout
      if (field?.rules) {
        let { isInvalid, message } = getValidate(formFields[field.name], field.rules, formFields)
        if (!isInvalid && isExistRule(field.rules, "async")) {
          field.loading = true
          const result = await getAsyncValidate(formFields[field.name], field.rules)
          field.loading = false
          isInvalid = result.isInvalid
          message = result.message
        }
        formInvalidFields[field.name] = isInvalid
        field.messageInvalid = message
      }
    }
  }

  function validateFields(nameField?: Array<string> | string): boolean {
    formStructure.value?.forEach((item) =>
      item.fields?.forEach((field) => {
        if (nameField && [nameField].flat().find((item: string) => item === field.name)) validateField(field)
        else if (!formInvalidFields[field.name]) validateField(field)
      })
    )
    const isValidForm = !(Object.values(formInvalidFields).filter((i) => i)?.length > 0)
    if (isValidForm) return isValidForm
    else {
      nextTick(() => {
        if (isClient() && formRef.value instanceof HTMLElement) {
          const invalidField = formRef.value.querySelector(".is-invalid")
          if (invalidField && invalidField.scrollIntoView)
            invalidField?.scrollIntoView({ block: "start", behavior: "smooth" })
        }
      })
      return isValidForm
    }
  }

  // ---------------------------------------
  function inputField(field: any) {
    if (modeValidate.value === "onInput") validateField(field)
  }

  function changeField(field: any) {
    if (modeValidate.value === "onChange") validateField(field)
  }

  // ---ISSUE 4 — native submit + FormData. Невалидная форма всегда блокирует submit
  // (preventDefault). Валидная — эмитит `submit`; реальную browser-отправку (перезагрузка / POST
  // на `action`) разрешаем только при явном opt-in `nativeSubmit` или заданном `action`, иначе
  // SPA-режим (preventDefault). Native-инпуты несут `name` (Form биндит id=field.name → :name=id),
  // поэтому `new FormData(formEl)` собирает значения Input-полей.
  function onSubmit(event: Event) {
    if (!validateFields()) {
      event.preventDefault()
      return
    }
    emit("submit", formFields)
    if (!nativeSubmit.value && !action.value) event.preventDefault()
  }
</script>

<template>
  <form
    ref="formElement"
    data-form
    :name="name"
    :action="action"
    :method="method"
    :enctype="enctype"
    :autocomplete="autocomplete"
    :class="classBase"
    @submit="onSubmit">
    <div ref="formRef">
      <template v-for="(structure, key) in formStructure as FormStructure[]" :key="key">
        <transition
          leave-active-class="motion-safe:transition motion-safe:ease-in-out motion-safe:duration-500"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="motion-safe:transition motion-safe:ease-in-out motion-safe:duration-500"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-show="!structure.isHidden" data-form-item :class="structure.class">
            <slot name="itemTitle" :structure="fieldsOmit(structure, ['class', 'classGrid', 'fields']) as any" />
            <div data-form-group :class="[structure.classGrid, classItemGrid]">
              <div v-for="(field, itemKey) in structure.fields" :key="itemKey" :class="field.classCol">
                <transition
                  leave-active-class="motion-safe:transition motion-safe:ease-in-out motion-safe:duration-500"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                  enter-active-class="motion-safe:transition motion-safe:ease-in-out motion-safe:duration-500"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100">
                  <div v-show="!field.isHidden" data-form-group-item>
                    <component
                      v-if="resolveFieldComponent(field.typeComponent)"
                      :is="resolveFieldComponent(field.typeComponent)"
                      v-model:model-value="formFields[field.name]"
                      v-model:is-invalid="formInvalidFields[field.name]"
                      v-bind="{ ...fieldsOmit(field, calculatedFieldsInput), id: field.name }"
                      @update:model-value="inputField(field)"
                      @change:model-value="changeField(field)">
                      <template #before>
                        <Icons
                          v-if="(field as FieldUseInputLayout)?.insert?.beforeIcon"
                          :type="(field as FieldUseInputLayout)?.insert?.beforeIcon ?? ''"
                          class="me-2 h-5 w-5 text-surface-400 dark:text-surface-600" />
                        <span v-if="(field as FieldUseInputLayout)?.insert?.beforeText" :class="classBeforeSlot">
                          {{ (field as FieldUseInputLayout)?.insert?.beforeText }}
                        </span>
                      </template>
                      <template #after>
                        <p v-if="(field as FieldUseInputLayout)?.insert?.afterText" :class="classAfterSlot">
                          {{ (field as FieldUseInputLayout)?.insert?.afterText }}
                        </p>
                        <Icons
                          v-if="(field as FieldUseInputLayout)?.insert?.afterIcon"
                          :type="(field as FieldUseInputLayout)?.insert?.afterIcon ?? ''"
                          class="me-2 h-5 w-5 text-surface-400 dark:text-surface-600" />
                      </template>
                      <template #footerPicker>
                        <slot
                          name="footerPicker"
                          :data="{
                            ...fieldsOmit(field, calculatedFieldsInput),
                            id: field.name
                          }"></slot>
                      </template>
                    </component>
                    <RenderFieldSlot
                      v-else-if="compoundFieldSlots[field.name]"
                      :render="compoundFieldSlots[field.name]"
                      :args="{
                        data: {
                          ...field,
                          id: field.name,
                          modelValue: formFields[field.name],
                          isInvalid: formInvalidFields[field.name]
                        },
                        updateModelValue: (value: unknown) => {
                          formFields[field.name] = value
                          inputField(field)
                        },
                        changeModelValue: (value: unknown) => {
                          formFields[field.name] = value
                          changeField(field)
                        }
                      }" />
                    <slot
                      v-else
                      :name="(field as FieldCustom)?.nameTemplate"
                      :data="
                        {
                          ...field,
                          id: field.name,
                          modelValue: formFields[field.name],
                          isInvalid: formInvalidFields[field.name]
                        } as FieldCustom & FormValues
                      "
                      :updateModelValue="
                        (value: unknown) => {
                          formFields[field.name] = value
                          inputField(field)
                        }
                      "
                      :changeModelValue="
                        (value: unknown) => {
                          formFields[field.name] = value
                          changeField(field)
                        }
                      "></slot>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </transition>
      </template>
    </div>
    <div data-form-footer :class="classFooter">
      <slot name="footer">
        <Button v-if="submitButton" type="submit">{{ submitButton }}</Button>
      </slot>
    </div>
  </form>
</template>
