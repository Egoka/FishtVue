<script setup lang="ts">
  import { computed, ref, watch, onMounted } from "vue"
  import { ChevronDownIcon, ArrowDownCircleIcon } from "@heroicons/vue/20/solid"
  import { AccordionProps, AccordionEmits, AccordionExpose } from "./Accordion"
  import Component from "fishtvue/component"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
  // ---BASE-COMPONENT----------------------
  const Accordion = new Component<"Accordion">()
  const options = Accordion.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<AccordionProps>()
  const emit = defineEmits<AccordionEmits>()
  // ---STATE-------------------------------
  const dataItems = ref(props.dataSource)
  watch(
    () => props.dataSource,
    (value) => {
      dataItems.value = value ?? []
    },
    { deep: true, immediate: true }
  )
  // ---PROPS-------------------------------
  const multiple = computed<NonNullable<AccordionProps["multiple"]>>(() => props.multiple ?? false)
  const animationDuration = computed<NonNullable<AccordionProps["animationDuration"]>>(
    () => props.animationDuration ?? 300
  )
  const typeIcon = computed<NonNullable<AccordionProps["typeIcon"]>>(() => props.typeIcon ?? "Plus")
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
  const classButton = ref(Accordion.setStyle("flex items-center justify-between w-full text-left font-semibold py-2"))
  const styleIcon = ref(
    Accordion.setStyle(
      "h-5 w-5 shrink-0 ml-8 text-slate-400 dark:text-slate-500 group-hover/item:text-slate-500 group-hover/item:dark:text-slate-400 transition-all duration-200 ease-out"
    )
  )
  const classPlus = ref(Accordion.setStyle("fill-slate-200 dark:fill-slate-500 shrink-0 ml-8"))
  const classRect = ref(Accordion.setStyle("transform origin-center transition duration-200 ease-out"))
  const classTemplate = ref(Accordion.setStyle("overflow-hidden"))
  const classNotTemplate = ref(Accordion.setStyle("pb-3"))
  // ---EXPOSE------------------------------
  defineExpose<AccordionExpose>({
    // ---STATE-------------------------
    dataItems,
    // ---PROPS-------------------------
    multiple,
    animationDuration,
    typeIcon,
    classBody,
    classItem,
    classTitle,
    classSubtitle,
    // ---METHODS-----------------------
    toggle
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Accordion.initStyle()
  })
  // ---WATCHERS----------------------------
  watch(
    () => props.dataSource,
    (value) => {
      dataItems.value = value ?? []
    },
    { deep: true }
  )

  // ---METHODS-----------------------------
  function toggle(key: string | number) {
    if (dataItems.value && dataItems.value?.[key]) {
      if (!multiple.value && !dataItems.value?.[key].open)
        (dataItems.value as AccordionProps["dataSource"])?.forEach((item) => (item.open = false))
      dataItems.value[key].open = !dataItems.value?.[key].open
      emit("toggle", dataItems.value)
    }
  }
</script>

<template>
  <div :class="classBody">
    <div v-for="(item, key) in dataItems" :key="key" :class="classItem">
      <h2>
        <button type="button" :class="classButton" @click="toggle(key)" :aria-expanded="item.open">
          <slot name="title" :title="item.title">
            <span :class="classTitle">{{ item.title }}</span>
            <ChevronDownIcon
              v-if="typeIcon === 'ChevronDown'"
              aria-hidden="true"
              :class="[styleIcon, item.open ? 'rotate-180' : '']" />
            <ArrowDownCircleIcon
              v-else-if="typeIcon === 'ArrowDownCircle'"
              aria-hidden="true"
              :class="[styleIcon, item.open ? 'rotate-180' : '']" />
            <svg
              v-else-if="typeIcon === 'Plus'"
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
          </slot>
        </button>
      </h2>
      <div
        role="region"
        :class="[classSubtitle, item.open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0']"
        :style="`transition-duration: ${animationDuration}ms;`">
        <div :class="classTemplate">
          <slot v-if="item.template" :name="item.template" v-bind="fieldsOmit(item, ['template', 'open'])" />
          <p v-else :class="classNotTemplate" v-html="item.subtitle" />
        </div>
      </div>
    </div>
  </div>
</template>
