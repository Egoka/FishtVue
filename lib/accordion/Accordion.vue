<script setup lang="ts">
  import { computed, ref, unref, useId, watch } from "vue"
  import { ArrowDownCircleIcon, ChevronDownIcon } from "@heroicons/vue/20/solid"
  import { AccordionEmits, AccordionExpose, AccordionItem, AccordionProps } from "./Accordion"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
  // ---BASE-COMPONENT----------------------
  const Accordion = new Component<"Accordion">()
  const options = Accordion.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<AccordionProps>(), {
    multiple: undefined
  })
  const emit = defineEmits<AccordionEmits>()
  // ---STATE-------------------------------
  const dataItems = ref<AccordionItem[]>(unref(props.dataSource) ?? [])
  const focusedIndex = ref(0)
  const headerRefs = ref<HTMLButtonElement[]>([])
  const uid = useId() ?? "fv-accordion"
  watch(
    () => props.dataSource,
    (value) => {
      dataItems.value = unref(value) ?? []
      if (focusedIndex.value > dataItems.value.length - 1) {
        focusedIndex.value = Math.max(0, dataItems.value.length - 1)
      }
    },
    { deep: true, immediate: true }
  )
  // ---PROPS-------------------------------
  const multiple = computed<NonNullable<AccordionProps["multiple"]>>(() => props.multiple ?? options?.multiple ?? false)
  const animationDuration = computed<NonNullable<AccordionProps["animationDuration"]>>(
    () => props.animationDuration ?? options?.animationDuration ?? 300
  )
  const icon = computed<NonNullable<AccordionProps["icon"]>>(() => props.icon ?? options?.icon ?? "Plus")
  Accordion.setStyle("rotate-0")
  Accordion.setStyle("rotate-90")
  Accordion.setStyle("rotate-180")
  Accordion.setStyle("rotate-360")
  Accordion.setStyle("grid-rows-[1fr] opacity-100")
  Accordion.setStyle("grid-rows-[0fr] opacity-0")
  const classBody = computed(() =>
    Accordion.setStyle(["divide-y divide-slate-200 dark:divide-slate-800", options?.class ?? "", props?.class ?? ""])
  )
  const classItem = computed(() =>
    Accordion.setStyle(["py-2", options?.classItem ?? "", props.classItem ?? "", "group/item"])
  )
  const classTitle = computed(() =>
    Accordion.setStyle(["text-slate-800 dark:text-slate-300", options?.classTitle ?? "", props.classTitle ?? ""])
  )
  const classSubtitle = computed(() =>
    Accordion.setStyle([
      "text-sm text-slate-600 dark:text-slate-400 transition-all ease-in-out",
      options?.classSubtitle ?? "",
      props.classSubtitle ?? "",
      "grid overflow-hidden"
    ])
  )
  const classButton = Accordion.setStyle("flex items-center justify-between w-full text-left font-semibold py-2")
  const styleIcon = Accordion.setStyle(
    "h-5 w-5 shrink-0 ml-8 text-slate-400 dark:text-slate-500 group-hover/item:text-slate-500 group-hover/item:dark:text-slate-400 transition-all duration-200 ease-out"
  )
  const classPlus = Accordion.setStyle("fill-slate-600 dark:fill-slate-500 shrink-0 ml-8")
  const classRect = Accordion.setStyle("transform origin-center transition duration-200 ease-out")
  const classTemplate = Accordion.setStyle("overflow-hidden")
  const classNotTemplate = Accordion.setStyle("pb-3")
  // ---IDS-FOR-ARIA-----------------------
  const headerId = (i: number | string) => `${uid}-h-${i}`
  const panelId = (i: number | string) => `${uid}-p-${i}`
  // ---EXPOSE------------------------------
  defineExpose<AccordionExpose>({
    // ---STATE-------------------------
    dataItems,
    // ---PROPS-------------------------
    multiple,
    animationDuration,
    icon,
    classBody,
    classItem,
    classTitle,
    classSubtitle,
    // ---METHODS-----------------------
    toggle,
    focus
  })
  // ---METHODS-----------------------------
  function setButtonRef(el: any, index: number) {
    if (el) headerRefs.value[index] = el as HTMLButtonElement
  }
  function focus(index: number) {
    if (!dataItems.value?.length) return
    const max = dataItems.value.length - 1
    const target = Math.min(Math.max(0, index), max)
    focusedIndex.value = target
    headerRefs.value[target]?.focus()
  }
  function onKeydown(e: KeyboardEvent) {
    if (!dataItems.value?.length) return
    const max = dataItems.value.length - 1
    let next = focusedIndex.value
    switch (e.key) {
      case "ArrowDown":
        next = Math.min(focusedIndex.value + 1, max)
        break
      case "ArrowUp":
        next = Math.max(focusedIndex.value - 1, 0)
        break
      case "Home":
        next = 0
        break
      case "End":
        next = max
        break
      default:
        return
    }
    e.preventDefault()
    focus(next)
  }
  function onRootLeave(_el: Element, done: () => void) {
    setTimeout(done, animationDuration.value)
  }
  function toggle(key: string | number) {
    const index = typeof key === "string" ? Number(key) : key
    if (dataItems.value && dataItems.value[index]) {
      if (!multiple.value && !dataItems.value[index].open) dataItems.value.forEach((item) => (item.open = false))
      dataItems.value[index].open = !dataItems.value[index].open
      emit("toggle", dataItems.value)
    }
  }
</script>

<template>
  <Transition :css="false" @leave="onRootLeave">
    <div v-if="dataItems?.length" :class="classBody" data-accordion @keydown="onKeydown">
      <div
        v-for="(item, key) in dataItems as AccordionItem[]"
        :key="key"
        :class="classItem"
        role="group"
        data-accordion-group>
        <h2>
          <button
            :id="headerId(key)"
            :ref="(el) => setButtonRef(el, key)"
            type="button"
            :class="classButton"
            :aria-expanded="!!item.open"
            :aria-controls="panelId(key)"
            :tabindex="key === focusedIndex ? 0 : -1"
            data-accordion-button
            @click="toggle(key)"
            @focus="focusedIndex = key">
            <slot name="title" :title="item.title">
              <span :class="classTitle">{{ item.title }}</span>
              <svg
                v-if="icon === 'Plus'"
                class="PlusIcon"
                :class="classPlus"
                width="10"
                height="10"
                xmlns="http://www.w3.org/2000/svg">
                <rect
                  y="4"
                  width="10"
                  height="2"
                  rx="1"
                  :class="[classRect, item.open ? 'rotate-360' : 'rotate-0']"></rect>
                <rect
                  y="4"
                  width="10"
                  height="2"
                  rx="1"
                  :class="[classRect, item.open ? 'rotate-180' : 'rotate-90']"></rect>
              </svg>
              <ChevronDownIcon
                v-else-if="icon === 'ChevronDown'"
                aria-hidden="true"
                :class="['ChevronDownIcon', styleIcon, item.open ? 'rotate-180' : '']" />
              <ArrowDownCircleIcon
                v-else-if="icon === 'ArrowDownCircle'"
                aria-hidden="true"
                :class="['ArrowDownCircleIcon', styleIcon, item.open ? 'rotate-180' : '']" />
              <Icons v-else :type="icon" :class="[styleIcon, item.open ? 'rotate-180' : '']" />
            </slot>
          </button>
        </h2>
        <div
          :id="panelId(key)"
          role="region"
          :aria-labelledby="headerId(key)"
          :class="[classSubtitle, item.open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0']"
          :style="`transition-duration: ${animationDuration}ms;`">
          <div data-accordion-content :class="classTemplate">
            <slot v-if="item.template" :name="item.template" v-bind="fieldsOmit(item, ['template', 'open'])" />
            <slot v-else name="item-subtitle" v-bind="fieldsOmit(item, ['template', 'open'])">
              <p v-if="item.subtitle" :class="classNotTemplate">{{ item.subtitle }}</p>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
