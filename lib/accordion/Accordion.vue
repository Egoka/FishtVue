<script setup lang="ts">
  import { Comment, Fragment, computed, ref, toValue, useId, useSlots, watch } from "vue"
  import type { FunctionalComponent, PropType, VNodeChild } from "vue"
  import { ArrowDownCircleIcon, ChevronDownIcon } from "@heroicons/vue/20/solid"
  import { AccordionClassKey, AccordionEmits, AccordionExpose, AccordionItemData, AccordionProps } from "./Accordion"
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
  const { cls } = Accordion.resolveClasses<AccordionClassKey>(props)
  // ---STATE-------------------------------
  const slots = useSlots()
  // `toValue` (а не `unref`) — единый канон чтения MaybeRef-props (dev-patterns §2, решение 3).
  const dataItems = ref<AccordionItemData[]>(toValue(props.items) ?? [])
  const focusedIndex = ref(0)
  const headerRefs = ref<HTMLButtonElement[]>([])
  const rootRef = ref<HTMLElement | null>(null)
  const uid = useId() ?? "fv-accordion"
  // ---COMPOUND-API (VNode-walk) ----------
  // Считываем декларативные <AccordionItem> из default slot и синтезируем AccordionItemData[].
  // Schema-driven `items` prop при наличии выигрывает. Сопоставление —
  // по имени компонента (defineOptions name / __name), без импорта SFC: импорт AccordionItem.vue
  // в этот SFC ломает type-resolver @vue/compiler-sfc (re-export `declare class ... extends
  // ClassComponent`). Зеркало lib/menu/Menu.vue.
  function normalizeChildren(raw: unknown): Array<any> {
    if (raw === null || raw === undefined) return []
    return Array.isArray(raw) ? (raw as Array<any>) : [raw]
  }
  function isAccordionItemVNode(vn: any): boolean {
    const t = vn?.type
    return !!t && (t?.name === "AccordionItem" || t?.__name === "AccordionItem")
  }
  function flattenVNodes(nodes: Array<any>): Array<any> {
    const out: Array<any> = []
    for (const n of nodes) {
      if (n === null || n === undefined || typeof n === "boolean") continue
      if (typeof n === "object" && n.type === Comment) continue
      if (typeof n === "object" && n.type === Fragment) out.push(...flattenVNodes(normalizeChildren(n.children)))
      else out.push(n)
    }
    return out
  }
  function vnodeChildren(vn: any): Array<any> {
    const def = vn?.children?.default
    return typeof def === "function" ? normalizeChildren(def()) : []
  }
  function extractItemFromVNode(vn: any): AccordionItemData {
    const vnodeProps = vn?.props ?? {}
    const item: AccordionItemData = { ...vnodeProps, title: vnodeProps.title ?? "" }
    if (vnodeProps.open !== undefined) item.open = vnodeProps.open === "" ? true : !!vnodeProps.open
    const children = flattenVNodes(vnodeChildren(vn))
    if (children.length) item._content = () => vnodeChildren(vn)
    return item
  }
  function extractItemsFromVNodes(nodes: Array<any>): AccordionItemData[] {
    return flattenVNodes(nodes)
      .filter((vn) => isAccordionItemVNode(vn))
      .map((vn) => extractItemFromVNode(vn))
  }
  const compoundItems = computed<AccordionItemData[]>(() => {
    const raw = typeof slots.default === "function" ? slots.default() : undefined
    return raw ? extractItemsFromVNodes(normalizeChildren(raw)) : []
  })
  const usingCompound = computed<boolean>(() => {
    const schema = toValue(props.items)
    return !(schema && schema.length)
  })
  const sourceItems = computed<AccordionItemData[]>(() => {
    const schema = toValue(props.items)
    return schema && schema.length ? schema : compoundItems.value
  })
  // renderless-обёртка: рендерит захваченные VNode'ы default-slot'а соответствующего
  // <AccordionItem> внутри панели секции (compound-контент).
  const AccordionContent: FunctionalComponent<{ render?: () => VNodeChild }> = (renderProps) =>
    renderProps.render ? renderProps.render() : null
  AccordionContent.props = { render: { type: Function as PropType<() => VNodeChild>, required: false } }
  AccordionContent.inheritAttrs = false
  watch(
    sourceItems,
    (value) => {
      if (usingCompound.value) {
        // compound: slots дают свежие объекты на каждый re-render — сохраняем open-state по индексу
        const prev = dataItems.value ?? []
        dataItems.value = (value ?? []).map((item, i) => ({
          ...item,
          open: prev[i] !== undefined ? prev[i].open : (item.open ?? false)
        }))
      } else {
        // schema: сохраняем ссылки потребителя (как раньше) — для emit payload и идентичности объектов
        dataItems.value = value ?? []
      }
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
  // Корень: база → options.classes.root → props.classes.root → options.class → props.class (dev-patterns §2 D).
  const classBase = computed(() => cls("root", "divide-y divide-surface-200 dark:divide-surface-800"))
  const classItem = computed(() => cls("item", "py-2", "group/item"))
  const classTitle = computed(() => cls("title", "text-surface-800 dark:text-surface-300"))
  const classPanel = computed(() =>
    cls(
      "panel",
      "text-sm text-surface-600 dark:text-surface-400 motion-safe:transition-all ease-in-out",
      "grid overflow-hidden"
    )
  )
  // B10: forced-colors:outline сохраняет header-кнопку различимой в Windows high-contrast (bg-*/border-* там сбрасываются)
  // L2 (unstyled): setStyle сам оставляет `fv` под `unstyled` (UA-preflight `button.fv` из baseStyle) —
  // отдельный fallback не нужен (component/index.ts, dev-patterns §2 E).
  const classHeader = computed(() =>
    cls("header", "flex items-center justify-between w-full text-start font-semibold py-2 forced-colors:outline")
  )
  const styleIcon = Accordion.setStyle(
    "h-5 w-5 shrink-0 ms-8 text-surface-400 dark:text-surface-500 group-hover/item:text-surface-500 group-hover/item:dark:text-surface-400 motion-safe:transition-all duration-200 ease-out"
  )
  const classPlus = Accordion.setStyle("fill-surface-600 dark:fill-surface-500 shrink-0 ms-8")
  const classRect = Accordion.setStyle("transform origin-center motion-safe:transition duration-200 ease-out")
  const classContent = computed(() => cls("content", "overflow-hidden"))
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
    classBase,
    classItem,
    classTitle,
    classPanel,
    // ---ELEMENTS----------------------
    rootRef,
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
    // prefers-reduced-motion: не держим панель смонтированной — размонтируем мгновенно
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      done()
      return
    }
    setTimeout(done, animationDuration.value)
  }
  function toggle(key: string | number) {
    const index = typeof key === "string" ? Number(key) : key
    if (dataItems.value && dataItems.value[index]) {
      if (!multiple.value && !dataItems.value[index].open) dataItems.value.forEach((item) => (item.open = false))
      dataItems.value[index].open = !dataItems.value[index].open
      // Payload 1.0.0: какая секция переключилась и в какое состояние — прежний «просто массив»
      // не позволял это понять, приходилось диффить снаружи.
      emit("toggle", { key: index, open: !!dataItems.value[index].open, items: dataItems.value })
    }
  }
</script>

<template>
  <Transition :css="false" @leave="onRootLeave">
    <div v-if="dataItems?.length" ref="rootRef" :class="classBase" data-accordion @keydown="onKeydown">
      <div
        v-for="(item, key) in dataItems as AccordionItemData[]"
        :key="key"
        :class="classItem"
        role="group"
        data-accordion-group>
        <h2>
          <button
            :id="headerId(key)"
            :ref="(el) => setButtonRef(el, key)"
            type="button"
            :class="classHeader"
            :aria-expanded="!!item.open"
            :aria-controls="panelId(key)"
            :tabindex="key === focusedIndex ? 0 : -1"
            data-accordion-button
            @click="toggle(key)"
            @focus="focusedIndex = key">
            <slot name="title" :title="item.title">
              <span data-accordion-title :class="classTitle">{{ item.title }}</span>
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
          data-accordion-panel
          role="region"
          :aria-labelledby="headerId(key)"
          :class="[classPanel, item.open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0']"
          :style="`transition-duration: ${animationDuration}ms;`">
          <div data-accordion-content :class="classContent">
            <AccordionContent v-if="item._content" :render="item._content" />
            <slot
              v-else-if="item.template"
              :name="item.template"
              v-bind="fieldsOmit(item, ['template', 'open', '_content'])" />
            <slot v-else name="item-subtitle" v-bind="fieldsOmit(item, ['template', 'open', '_content'])">
              <p v-if="item.subtitle" :class="classNotTemplate">{{ item.subtitle }}</p>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
