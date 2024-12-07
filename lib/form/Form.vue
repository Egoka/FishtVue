<script setup lang="ts">
  import { computed, ref, watch, onMounted, reactive, nextTick } from "vue"
  import {
    FormProps,
    FormEmits,
    FormExpose,
    FieldType,
    FormValues,
    FormStructure,
    FieldUseInputLayout,
    FieldCustom
  } from "./Form"
  import Icons from "fishtvue/icons/Icons.vue"
  import Input from "fishtvue/input/Input.vue"
  import Aria from "fishtvue/aria/Aria.vue"
  import Select from "fishtvue/select/Select.vue"
  import Calendar from "fishtvue/calendar/Calendar.vue"
  import TextEditor from "fishtvue/texteditor/TextEditor.vue"
  import Switch from "fishtvue/switch/Switch.vue"
  import Button from "fishtvue/button/Button.vue"
  import Badge from "fishtvue/badge/Badge.vue"
  import Component from "fishtvue/component"
  import { getAsyncValidate, getValidate, isExistRule } from "fishtvue/utils/rulesHandler"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
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
  // ---PROPS-------------------------------
  const name = computed<FormProps["name"]>(() => props.name ?? "")
  const modeStyle = computed<FormProps["modeStyle"]>(() => props.modeStyle ?? options?.modeStyle)
  const modeLabel = computed<NonNullable<FormProps["modeLabel"]>>(
    () => props.modeLabel ?? options?.modeLabel ?? "offsetDynamic"
  )
  const isDisabled = computed<NonNullable<FormProps["disabled"]>>(() => props.disabled ?? false)
  const autocomplete = computed<NonNullable<FormProps["autocomplete"]>>(
    () => props?.autocomplete ?? options?.autocomplete ?? "on"
  )
  const modeValidate = computed<NonNullable<FormProps["modeValidate"]>>(
    () => props.modeValidate ?? options?.modeValidate ?? "onChange"
  )
  // ---------------------------------------
  const formFields = reactive<FormValues>({})
  const formInvalidFields = reactive<{ [key: string]: boolean }>({})
  const formStructure = computed<Array<FormStructure>>(() => getStructure(props.structure))
  const submitButton = computed<FormProps["submitButton"]>(
    () => props.submitButton ?? options?.submitButton ?? Form.t("save") ?? "Save"
  )
  // ---------------------------------------
  Form.setStyle("transition ease-in-out duration-500 opacity-100 opacity-0")
  const classBase = computed(() => Form.setStyle([options?.class ?? "", props.class ?? ""]))
  const classItemGrid = ref(Form.setStyle("grid transition"))
  const classBeforeSlot = ref(Form.setStyle("flex select-none items-center text-gray-500 sm:text-sm"))
  const classAfterSlot = ref(Form.setStyle("ml-1 mr-3 text-gray-400 dark:text-gray-600 select-none"))
  const classSelectItemIsQuery = ref(
    Form.setStyle("text-gray-600 dark:text-gray-300 group-hover:text-theme-700 dark:group-hover:text-theme-400")
  )
  const classSelectItemNotQuery = ref(Form.setStyle("text-gray-500 dark:text-gray-300"))
  const classFooter = ref(Form.setStyle("mt-6 flex items-center justify-end gap-x-6"))
  // ---EXPOSE------------------------------
  defineExpose<FormExpose>({
    // ---PROPS-------------------------------
    formFields,
    // ---METHODS-----------------------------
    setFieldValue,
    setFieldParam,
    getField,
    isFieldInvalid,
    setStructureParam,
    validateFields
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Form.initStyle()
    props.structure?.forEach((item) =>
      item.fields?.forEach((field: FieldType) => {
        formFields[field.name] = props.formFields?.[field.name] ?? field.modelValue
      })
    )
  })
  // ---WATCHERS----------------------------
  watch(
    formFields,
    (value: FormValues) => {
      emit("update:formFields", value)
    },
    { deep: true }
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

  function setFieldParam(fieldName: string, param: keyof FieldType, value: any): void {
    formStructure.value.forEach((structure, i: number) => {
      structure.fields?.forEach((item: FieldType, j: number) => {
        if (item.name === fieldName) (formStructure.value[i].fields[j] as any)[param] = value
      })
    })
  }

  function getField(fieldName: string): FieldType | null {
    let field: FieldType | null = null
    formStructure.value.forEach((structure) => {
      structure.fields?.forEach((item: FieldType) => {
        if (item.name === fieldName) field = item
      })
    })
    return field
  }

  function isFieldInvalid(fieldName: string): boolean | undefined {
    if (fieldName in formFields) {
      return formInvalidFields[fieldName] ?? false
    }
    console.error(`Field with field name '${fieldName}' does not exist in structure`)
    return
  }

  function setStructureParam(indexStructure: number, param: keyof FormStructure, value: any): void {
    formStructure.value.some((_, index: number) => {
      if (index === indexStructure) (formStructure.value[index] as any)[param] = value
    })
  }

  // ---------------------------------------
  function getStructure(structures: Array<FormStructure>): Array<FormStructure> {
    return structures.map((structure) => {
      if (!structure?.class?.length)
        structure.class = Form.setStyle([
          "border-b border-gray-900/10",
          options?.structureClass ?? "",
          props?.structureClass ?? ""
        ])
      if (!structure?.classGrid?.length)
        structure.classGrid = Form.setStyle([
          "grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-10",
          options?.structureClassGrid ?? "",
          props?.structureClassGrid ?? ""
        ])
      if (structure.fields) {
        structure.fields = structure.fields.map((field: FieldType) => {
          if (!field.name) {
            field.name = "field" + Math.floor(Math.random() * 100)
            console.error(`There is no name field. Temporary name ${field.name} is set.`)
          }
          if (arrayFieldsValidate.includes(field.typeComponent)) {
            field = field as FieldUseInputLayout
            if ("rules" in field && field?.rules) {
              field.required = !!field.rules["required"] || field?.required || false
              if (field.required && (!field.rules["required"] || typeof field.rules["required"] === "boolean")) {
                field.rules["required"] = Form.t("requiredField") ?? "Required field"
              }
            } else if (field?.required) {
              field.rules = { required: Form.t("requiredField") ?? "Required field" }
            }
            field.labelMode = field.labelMode ?? modeLabel.value
          }
          field.classCol = Form.setStyle([field.classCol ?? "col-span-full"])
          if (modeStyle.value)
            (field as FieldUseInputLayout).mode = (field as FieldUseInputLayout).mode || modeStyle.value
          field.disabled = field.disabled ?? isDisabled.value
          return field
        })
      }
      return structure
    })
  }

  // ---------------------------------------
  async function validateField(field: FieldType) {
    if (arrayFieldsValidate.includes(field.typeComponent)) {
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
    props.structure?.forEach((item) =>
      item.fields?.forEach((field) => {
        if (nameField && [nameField].flat().find((item: string) => item === field.name)) validateField(field)
        else if (!formInvalidFields[field.name]) validateField(field)
      })
    )
    const isValidForm = !(Object.values(formInvalidFields).filter((i) => i)?.length > 0)
    if (isValidForm) return isValidForm
    else {
      nextTick(() => document.querySelector(".is-invalid")?.scrollIntoView({ block: "start", behavior: "smooth" }))
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

  function submit() {
    if (validateFields()) emit("submit", formFields)
  }
</script>

<template>
  <form data-form :name="name" :autocomplete="autocomplete" :class="classBase" @submit.prevent="submit">
    <div ref="formRef">
      <template v-for="(structure, key) in formStructure" :key="key">
        <transition
          leave-active-class="transition ease-in-out duration-500"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition ease-in-out duration-500"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-show="!structure.isHidden" data-form-item :class="structure.class">
            <slot name="itemTitle" :structure="fieldsOmit(structure, ['class', 'classGrid', 'fields']) as any" />
            <div data-form-group :class="[structure.classGrid, classItemGrid]">
              <div v-for="(field, itemKey) in structure.fields" :key="itemKey" :class="field.classCol">
                <transition
                  leave-active-class="transition ease-in-out duration-500"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                  enter-active-class="transition ease-in-out duration-500"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100">
                  <div v-show="!field.isHidden" data-form-group-item>
                    <component
                      v-if="Object.keys(baseInputs).includes(field.typeComponent)"
                      :is="baseInputs[field.typeComponent]"
                      v-model:model-value="formFields[field.name]"
                      v-model:is-invalid="formInvalidFields[field.name]"
                      v-bind="{ ...fieldsOmit(field, calculatedFieldsInput), id: field.name }"
                      @update:model-value="inputField(field)"
                      @change:model-value="changeField(field)">
                      <template #before>
                        <Icons
                          v-if="(field as FieldUseInputLayout)?.insert?.beforeIcon"
                          :type="(field as FieldUseInputLayout)?.insert?.beforeIcon ?? ''"
                          class="mr-2 h-5 w-5 text-gray-400 dark:text-gray-600" />
                        <span v-if="(field as FieldUseInputLayout)?.insert?.beforeText" :class="classBeforeSlot">
                          {{ (field as FieldUseInputLayout)?.insert?.beforeText }}
                        </span>
                      </template>
                      <template #after>
                        <p
                          v-if="(field as FieldUseInputLayout)?.insert?.afterText && formFields[field.name]"
                          :class="classAfterSlot">
                          {{ (field as FieldUseInputLayout)?.insert?.afterText }}
                        </p>
                        <Icons
                          v-if="(field as FieldUseInputLayout)?.insert?.afterIcon"
                          :type="(field as FieldUseInputLayout)?.insert?.afterIcon ?? ''"
                          class="mr-2 h-5 w-5 text-gray-400 dark:text-gray-600" />
                      </template>
                      <template #values="{ selected, key, deleteSelect }">
                        <Badge
                          mode="neutral"
                          close-button
                          class-content="fill-theme-500"
                          @delete="deleteSelect(selected)"
                          class="m-1 mb-0 text-xs bg-theme-50 text-theme-700 ring-theme-600/20 dark:bg-theme-950 dark:text-theme-300 dark:ring-theme-400/20">
                          {{ selected[key] }}
                        </Badge>
                      </template>
                      <template #item="{ item, key, isQuery }">
                        <div v-if="!isQuery" v-html="item?.marker ?? item[key]" :class="classSelectItemIsQuery" />
                        <div v-else :class="classSelectItemNotQuery">{{ item[key] }}</div>
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
                        (value) => {
                          formFields[field.name] = value
                          inputField(field)
                        }
                      "
                      :changeModelValue="
                        (value) => {
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
