<script setup lang="ts">
  import { computed, onMounted, ref, useSlots, watch } from "vue"
  import type { BaseDataItem, IDataItem, SelectEmits, SelectExpose, SelectProps } from "./Select"
  import type { FixWindowExpose } from "fishtvue/fixwindow"
  import type { InputLayoutExpose } from "fishtvue/inputlayout"
  import LD from "lodash"
  import gsap from "gsap"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Input from "fishtvue/input/Input.vue"
  import Badge from "fishtvue/badge/Badge.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Select = new Component<"Select">()
  const options = Select.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<SelectProps>()
  const emit = defineEmits<SelectEmits>()
  const slots = useSlots()
  // ---REF-LINK----------------------------
  const layout = ref<InputLayoutExpose>()
  const selectListWindow = ref<FixWindowExpose>()
  const selectBody = ref<HTMLElement>()
  const selectList = ref<HTMLElement>()
  const selectSearch = ref<HTMLElement>()
  const selectItems = ref<HTMLElement>()
  // ---STATE-------------------------------
  const isFocus = ref<boolean>(false)
  const activeItem = ref<number>(0)
  const query = ref<string>("")
  const isOpenList = ref<boolean>(false)
  const classLayout = ref<SelectProps["class"]>()
  const value = ref<SelectProps["modelValue"]>()
  watch(
    () => props.modelValue,
    () => {
      value.value = props.modelValue ?? ""
    },
    { immediate: true }
  )
  // ---PROPS-------------------------------
  // const id = ref(props.id ?? getCurrentInstance()?.uid)
  const visibleValue = ref<any[]>([])
  const valueKeys = computed<any[]>(() => {
    return keySelect.value ? visibleValue.value.map((item) => item[keySelect.value ?? ""]) : []
  })
  const keySelect = computed<NonNullable<SelectProps["keySelect"]>>(() =>
    props?.dataSelect && props?.dataSelect.length
      ? typeof props?.dataSelect[0] === "object"
        ? props?.keySelect && Object.keys(props?.dataSelect[0]).includes(props.keySelect)
          ? props.keySelect
          : Object.keys(props.dataSelect[0])[0]
        : "id"
      : "id"
  )
  const valueSelect = computed<SelectProps["valueSelect"] | null>(() => {
    if (props?.dataSelect && props?.dataSelect.length) {
      if (typeof props?.dataSelect[0] === "object") {
        if (props?.valueSelect && Object.keys(props?.dataSelect[0]).includes(props.valueSelect)) {
          return props?.valueSelect
        } else {
          return Object.keys(props?.dataSelect[0])[1]
        }
      } else {
        return "value"
      }
    } else {
      return null
    }
  })
  const dataSelect = computed<SelectProps["dataSelect"]>(() =>
    !!keySelect.value && !!valueSelect.value
      ? (props?.dataSelect as Array<IDataItem>).map((item) => ({
          [keySelect.value ?? ""]: typeof item === "object" && keySelect.value ? item[keySelect.value ?? ""] : item,
          [valueSelect.value ?? ""]: typeof item === "object" && keySelect.value ? item[valueSelect.value ?? ""] : item
        }))
      : (props?.dataSelect ?? [])
  )
  const autoFocus = computed<NonNullable<SelectProps["autoFocus"]>>(() => props?.autoFocus ?? false)
  const mode = computed<NonNullable<SelectProps["mode"]>>(() => props.mode ?? "outlined")
  const isDisabled = computed<NonNullable<SelectProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<SelectProps["loading"]>>(() => props.loading ?? false)
  const isInvalid = computed<NonNullable<SelectProps["isInvalid"]>>(() => props.isInvalid ?? false)
  const messageInvalid = computed<SelectProps["messageInvalid"]>(() => props.messageInvalid)
  const isValue = computed<boolean>(() =>
    Boolean(
      isMultiple.value ? (value.value ? String(value.value).length : value.value) : (value.value ?? isOpenList.value)
    )
  )
  const isMultiple = computed<NonNullable<SelectProps["multiple"]>>(() => props?.multiple ?? false)
  const maxVisible = computed<SelectProps["maxVisible"] | undefined>(() => props?.maxVisible)
  const noData = computed<NonNullable<SelectProps["noData"]>>(() => props?.noData ?? "Нет данных")
  const isQuery = computed<NonNullable<SelectProps["noQuery"]>>(() => !props?.noQuery)
  const classMaskQuery = computed<NonNullable<SelectProps["classMaskQuery"]>>(() =>
    Select.setStyle(props?.classMaskQuery ?? "font-bold text-theme-700 dark:text-theme-300")
  )
  const dataList = computed<Array<any>>(() => {
    if (dataSelect.value?.length && valueSelect.value && isQuery.value) {
      return LD.map(
        LD.filter(dataSelect.value, (item) =>
          String(typeof item === "object" ? item[valueSelect.value as string] : item)
            .toLowerCase()
            .includes(query.value.toLowerCase())
        ),
        (item: any) => {
          item.marker = query.value.length
            ? String(item[valueSelect.value as string]).replace(
                new RegExp(query.value, "gi"),
                `<span class="${classMaskQuery.value}">$&</span>`
              )
            : String(item[valueSelect.value as string])
          return item
        }
      )
    } else {
      return dataSelect.value ?? []
    }
  })
  const paramsFixWindow = computed<NonNullable<SelectProps["paramsFixWindow"]>>(() => ({
    position: "bottom-left",
    eventOpen: "click",
    eventClose: "hover",
    marginPx: 5,
    ...props?.paramsFixWindow
  }))
  Select.setStyle(`transition ease-in-out duration-300 opacity-100 translate-x-0 opacity-0 -translate-x-5`)
  const classBase = computed<SelectProps["classSelect"]>(() => {
    return Select.setStyle([
      "selectBody w-full min-h-[36px] max-h-16 focus:outline-0 focus:ring-0",
      options?.classSelect ?? "",
      props?.classSelect ?? "",
      "classSelect flex overflow-auto cursor-pointer"
    ])
  })
  const classSelectList = computed<SelectProps["classSelectList"]>(() =>
    Select.setStyle([
      "min-w-[10rem] mt-1 max-h-60 transition-all",
      "text-base rounded-md ring-1 ring-black/5 shadow-xl focus:outline-none sm:text-sm",
      mode.value === "outlined" ? "border border-gray-300 dark:border-gray-600 bg-white dark:bg-black" : "",
      mode.value === "underlined"
        ? "rounded-none border-0 border-gray-300 dark:border-gray-700 border-b bg-stone-50 dark:bg-stone-950"
        : "",
      mode.value === "filled" ? "border-0 bg-stone-100 dark:bg-stone-900" : "",
      options?.classSelectList ?? "",
      props?.classSelectList ?? "",
      "classSelectList overflow-auto"
    ])
  )
  const valueLayout = computed(() =>
    valueSelect.value ? visibleValue.value?.map((item) => item[valueSelect.value as string])?.join(", ") : null
  )
  const classSelectContent = ref(Select.setStyle("flex items-center flex-wrap"))
  const classSelectItem = ref(Select.setStyle("z-1"))
  const classDataListNoData = ref(Select.setStyle("h-9 px-4 text-sm text-gray-500"))
  const classNoData = ref(Select.setStyle("p-4 text-sm text-gray-500"))
  const classGradientSelectList = computed(() =>
    Select.setStyle([
      "w-full h-5 bg-gradient-to-t to-transparent pointer-events-none",
      mode.value === "outlined" ? "from-white dark:from-black via-white dark:via-black" : "",
      mode.value === "underlined" ? "from-stone-50 dark:from-stone-950 via-stone-50 dark:via-stone-950" : "",
      mode.value === "filled" ? "from-stone-100 dark:from-stone-900 via-stone-100 dark:via-stone-900" : "",
      "sticky z-20"
    ])
  )
  const iconCheck = computed(() =>
    Select.setStyle("flex absolute inset-y-0 left-0 items-center pl-2 text-theme-700 dark:text-theme-400")
  )
  const classGradientSelectListTop = computed(() =>
    Select.setStyle([classGradientSelectList.value, "bg-gradient-to-b top-0"])
  )
  const classGradientSelectListButton = computed(() =>
    Select.setStyle([classGradientSelectList.value, "bg-gradient-to-t top-[220px]"])
  )
  const classLiItem = computed(() =>
    Select.setStyle([
      "text-gray-900 dark:text-gray-100 items-center h-9 mt-2 mx-2 pl-8 pr-4 last:mb-5",
      "hover:bg-theme-200 hover:dark:bg-theme-900 hover:text-theme-700 dark:hover:text-theme-100",
      "focus-visible:bg-theme-200 focus-visible:dark:bg-theme-900 focus-visible:text-theme-700 dark:focus-visible:text-theme-100 focus-visible:ring-1 focus-visible:ring-theme-100 focus-visible:dark:ring-theme-800 focus-visible:outline-none",
      mode.value === "outlined" ? "rounded-md" : "",
      mode.value === "filled" ? "rounded-md" : "",
      "group/li relative cursor-default select-none flex transition-colors duration-75"
    ])
  )
  const classItemSelectValue = computed(() =>
    Select.setStyle("text-gray-600 dark:text-gray-300 group-hover/li:text-theme-700 dark:group-hover/li:text-theme-200")
  )
  const inputLayout = computed(() => {
    return {
      isValue: isValue.value,
      mode: mode.value,
      classBody: props.classBody,
      class: props.class,
      label: props.label,
      labelMode: props.labelMode,
      isInvalid: isInvalid.value,
      messageInvalid: messageInvalid.value,
      required: props.required,
      loading: isLoading.value,
      disabled: isDisabled.value,
      help: props.help,
      clear: props.clear
    }
  })
  // ---EXPOSE------------------------------
  defineExpose<SelectExpose>({
    // ---STATE-------------------------
    layout,
    selectListWindow,
    selectBody,
    selectList,
    selectSearch,
    selectItems,
    activeItem,
    query,
    isOpenList,
    classLayout,
    value,
    // ---PROPS-------------------------
    visibleValue,
    valueKeys,
    keySelect,
    valueSelect,
    dataSelect,
    autoFocus,
    mode,
    isDisabled,
    isLoading,
    isInvalid,
    messageInvalid,
    isValue,
    isMultiple,
    maxVisible,
    noData,
    isQuery,
    classMaskQuery,
    dataList,
    paramsFixWindow,
    classBase,
    classSelectList,
    // ---METHODS-----------------------
    focusSelect,
    openSelect,
    closeSelect,
    select
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Select.initStyle()
    if (autoFocus.value) {
      openSelect()
    }
    new ResizeObserver(() => {
      if (isOpenList.value) selectListWindow.value?.updatePosition()
    }).observe(selectBody.value as HTMLElement)
  })
  // ---WATCHERS----------------------------
  watch(isFocus, (value) => {
    if (value) {
      document.addEventListener("keydown", openSelectOnEnter)
    } else {
      document.removeEventListener("keydown", openSelectOnEnter)
    }
  })
  watch(isOpenList, (value) => {
    if (value) {
      document.addEventListener("keydown", keydownSelect)
    } else {
      document.removeEventListener("keydown", keydownSelect)
    }
    focusSelect(value)
    emit("isActive", value)
  })
  watch(
    value,
    () => {
      if (dataSelect.value && value.value && keySelect.value) {
        if (isMultiple.value) {
          visibleValue.value =
            dataSelect.value?.filter((item) =>
              Array.isArray(value.value)
                ? value.value?.includes(typeof item === "object" ? item[keySelect.value ?? ""] : item)
                : (typeof item === "object" ? item[keySelect.value ?? ""] : item) === value.value
            ) ?? []
        } else {
          const result = dataSelect.value?.find((item) =>
            Array.isArray(value.value)
              ? value.value?.includes(typeof item === "object" ? item[keySelect.value ?? ""] : item)
              : (typeof item === "object" ? item[keySelect.value ?? ""] : item) === value.value
          )
          visibleValue.value = result ? [result] : []
        }
      } else {
        visibleValue.value = []
      }
    },
    { immediate: true }
  )
  // watch([layout.value?.beforeWidth, layout.value?.afterWidth], () => {
  //   console.log("[layout.value?.beforeWidth, layout.value?.afterWidth],")
  //   selectListWindow.value?.updatePosition()
  // })

  // ---METHODS-----------------------------
  function changeFocus(currentIndex, direction) {
    const listItems = (selectItems.value as any)?.$el.querySelectorAll("li")
    let newIndex = currentIndex + direction
    listItems[currentIndex].setAttribute("tabindex", "-1")
    listItems[currentIndex].blur()
    if (newIndex < 0) newIndex = listItems.length - 1
    else if (newIndex >= listItems.length) newIndex = 0
    listItems[newIndex].setAttribute("tabindex", "0")
    listItems[newIndex].focus()
    activeItem.value = newIndex
  }

  function keydownSelect(event: KeyboardEvent) {
    if (event.key === "Tab") activeItem.value += 1
    else if (event.key === "Enter") select(dataList.value[activeItem.value])
    else if (["Escape", "Esc"].includes(event.key)) isOpenList.value = false
    else if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      const currentIndex = Array.prototype.indexOf.call(
        (selectItems.value as any)?.$el.querySelectorAll("li"),
        document.activeElement
      )
      if (currentIndex !== -1) {
        event.preventDefault()
        if (event.key === "ArrowDown") changeFocus(currentIndex, 1)
        else if (event.key === "ArrowUp") changeFocus(currentIndex, -1)
      } else changeFocus(1, -1)
    } else if ("which" in event ? event.which : (event as any).keyCode >= 32) selectSearch.value?.focus()
  }

  function openSelectOnEnter(event: KeyboardEvent) {
    if (event.key === "Enter") openSelect()
  }

  // ---------------------------------------
  function focusSelect(focus: boolean) {
    isFocus.value = focus
    classLayout.value =
      (props.class ?? "") +
      (isFocus.value
        ? " border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700"
        : "")
  }

  function openSelect() {
    if (isDisabled.value) return
    isOpenList.value = true
  }

  function closeSelect(event: MouseEvent) {
    if (isOpenList.value && selectBody.value && selectList) {
      isOpenList.value =
        event.composedPath().includes(selectBody.value as HTMLElement) ||
        event.composedPath().includes(selectList.value as HTMLElement)
      if (isOpenList.value === false) {
        emit("change:modelValue", value.value, visibleValue.value)
      }
    }
  }

  // ---------------------------------------
  function select(selectValue: BaseDataItem | null) {
    if (selectValue && keySelect.value) {
      activeItem.value = dataList.value.findIndex(
        (value) =>
          value[keySelect.value ?? ""] ===
          (typeof selectValue === "object" ? selectValue[keySelect.value ?? ""] : selectValue)
      )
      const index = visibleValue.value.findIndex(
        (value) =>
          value[keySelect.value ?? ""] ===
          (typeof selectValue === "object" ? selectValue[keySelect.value ?? ""] : selectValue)
      )
      if (index >= 0) {
        visibleValue.value.splice(index, 1)
      } else {
        if (!isMultiple.value) {
          visibleValue.value = []
        }
        visibleValue.value.push(selectValue)
      }
    } else {
      visibleValue.value = []
    }
    value.value = valueKeys.value.length ? (isMultiple.value ? valueKeys.value : valueKeys.value[0]) : null
    emit("update:isInvalid", false)
    emit("update:modelValue", value.value, visibleValue.value)
  }

  // ---------------------------------------
  function onBeforeEnter(el: any) {
    el.style.opacity = 0
    el.style.height = 0
  }

  function onEnter(el: any, done: any) {
    gsap.to(el, {
      opacity: 1,
      height: "38px",
      delay: el.dataset.index * (dataList.value?.length >= 80 ? 0 : 0.01),
      onComplete: done
    })
  }

  const delay = computed<number>((): number => {
    const d = dataSelect.value?.length
    if (!d) return 0
    if (d >= 0 && d < 10) return 0.15
    else if (d >= 10 && d < 30) return 0.05
    else if (d >= 30 && d < 80) return 0.01
    return 0
  })

  function onLeave(el: any, done: any) {
    gsap.to(el, { opacity: 0, height: 0, delay: el.dataset.index * delay.value, onComplete: done })
  }
</script>

<template>
  <InputLayout ref="layout" :value="valueLayout" :class="classLayout" v-bind="inputLayout" @clear="select(null)">
    <div
      ref="selectBody"
      tabindex="0"
      :class="classBase"
      @focusin="focusSelect(true)"
      @focusout="focusSelect(false)"
      @click="openSelect">
      <div :class="classSelectContent">
        <template v-if="isMultiple">
          <transition-group
            leave-active-class="transition ease-in-out duration-300"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-5"
            enter-active-class="transition ease-in-out duration-300"
            enter-from-class="opacity-0 -translate-x-5"
            enter-to-class="opacity-100 translate-x-0">
            <div
              v-for="item in typeof maxVisible === 'number' ? visibleValue.slice(0, maxVisible) : visibleValue"
              :key="item[keySelect]"
              :class="classSelectItem">
              <slot name="values" :selected="item" :key="valueSelect ? valueSelect : keySelect" :delete-select="select">
                <Badge
                  mode="neutral"
                  :close-button="props?.closeButtonBadge"
                  class-content="fill-theme-500"
                  @delete="select(item)"
                  class="mx-1 text-xs bg-theme-50 text-theme-700 ring-theme-600/20 dark:bg-theme-950 dark:text-theme-300 dark:ring-theme-400/20 transition-colors duration-500">
                  {{ valueSelect ? item[valueSelect] : item[keySelect] }}
                </Badge>
              </slot>
            </div>
            <div v-if="typeof maxVisible === 'number' && visibleValue.length > maxVisible" :class="classSelectItem">
              <slot name="values" :selected="visibleValue.length" :delete-select="select">
                <Badge
                  mode="neutral"
                  :close-button="props?.closeButtonBadge"
                  class-content="fill-theme-500"
                  @delete="select(null)"
                  class="m-1 mb-0 pl-2 text-xs bg-theme-50 text-theme-700 ring-theme-600/20 dark:bg-theme-950 dark:text-theme-300 dark:ring-theme-400/20 transition-colors duration-500">
                  <Icons type="Funnel" class="h-3 w-3 mr-1 text-theme-400 dark:text-theme-600" />
                  {{ visibleValue.length }}
                </Badge>
              </slot>
            </div>
          </transition-group>
        </template>
        <template v-else>
          <div v-for="(item, key) in visibleValue" :key="`${item[keySelect]}-${key}`" :class="classSelectItem">
            <slot name="values" :selected="item" :key="valueSelect ? valueSelect : keySelect">
              <div>{{ valueSelect ? item[valueSelect] : item[keySelect] }}</div>
            </slot>
          </div>
        </template>
      </div>
    </div>
    <template #body>
      <FixWindow
        ref="selectListWindow"
        v-bind="paramsFixWindow"
        :model-value="isOpenList"
        :class-body="['z-20', `ml-[${layout?.beforeWidth}px]`]"
        @close="closeSelect">
        <div
          ref="selectList"
          :class="classSelectList"
          :style="`width: ${(selectBody as HTMLElement)?.clientWidth ?? 0}px`">
          <div :class="classGradientSelectListTop" />
          <div :class="classGradientSelectListButton" />
          <Input
            v-if="isQuery"
            ref="selectSearch"
            v-model="query"
            label="Найти..."
            :mode="mode"
            label-mode="vanishing"
            clear
            class-base="sticky top-2 z-20"
            :class-body="[
              `m-2 mb-5 rounded-md`,
              mode === 'outlined' ? 'ring-stone-200 dark:ring-black' : '',
              mode === 'underlined' ? 'ring-stone-200 dark:ring-stone-950' : '',
              mode === 'filled' ? 'ring-stone-100 dark:ring-stone-900' : ''
            ]"
            @focus="activeItem = -1">
            <template #before>
              <Icons type="<MagnifyingGlass" class="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </template>
          </Input>
          <TransitionGroup
            name="ul"
            tag="ul"
            :css="false"
            ref="selectItems"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave">
            <template v-if="dataSelect?.length">
              <li
                v-for="(item, index) in dataList"
                :key="`${item[keySelect]}`"
                :tabindex="activeItem === index ? 0 : -1"
                :data-index="index"
                :class="classLiItem"
                @click="select(item)">
                <slot name="item" :item="item" :key="valueSelect" :isQuery="isQuery && item?.marker">
                  <div v-if="isQuery && item?.marker" v-html="item?.marker" :class="classItemSelectValue" />
                  <div v-else :class="classItemSelectValue">
                    {{ valueSelect ? item[valueSelect] : item }}
                  </div>
                </slot>
                <span v-if="visibleValue?.find((i) => i[keySelect] === item[keySelect])" :class="iconCheck">
                  <Icons type="Check" class="w-5 h-5" />
                </span>
              </li>
              <div v-if="!dataList?.length" :class="classDataListNoData" v-html="noData" />
            </template>
            <div v-else :class="classNoData" v-html="noData" />
          </TransitionGroup>
        </div>
      </FixWindow>
      <slot />
    </template>
    <template #before>
      <slot v-if="slots.before" name="before" />
    </template>
    <template #after>
      <slot v-if="slots.after" name="after" />
    </template>
  </InputLayout>
</template>
