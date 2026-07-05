<script setup lang="ts">
  import type { Ref } from "vue"
  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
  import {
    ArrowLongLeftIcon,
    ArrowLongRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisHorizontalIcon
  } from "@heroicons/vue/20/solid"
  import type { PaginationEmits, PaginationProps } from "./Pagination"
  import { BaseSelectProps, SelectExpose, SelectProps } from "fishtvue/select"
  import Button from "fishtvue/button/Button.vue"
  import Select from "fishtvue/select/Select.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Pagination = new Component<"Pagination">()
  const options = Pagination.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<PaginationProps>(), {
    isInfoText: undefined,
    isPageSizeSelector: undefined,
    isHiddenNavigationButtons: undefined
  })
  const emit = defineEmits<PaginationEmits>()
  // ---STATE-------------------------------
  const paginationRef = ref<HTMLElement>()
  const navPreviousLink = ref<HTMLElement>()
  const navNextLink = ref<HTMLElement>()
  const selectPageSize = ref<SelectExpose>()
  const sizePage = ref<number>()
  const isShortPrevious = ref(false)
  const isShortNext = ref(false)
  const navigationObservers: ResizeObserver[] = []
  // ---PROPS-------------------------------
  const sizePageProp = computed<NonNullable<PaginationProps["sizePage"]>>(() => {
    const sizePageProp = (props.sizePage as PaginationProps["sizePage"]) ?? options?.sizePage ?? 5
    return sizePageProp > 0 ? sizePageProp : 5
  })
  const visibleNumberPages = computed<NonNullable<PaginationProps["visibleNumberPages"]>>(() => {
    const countVisible =
      (props?.visibleNumberPages as PaginationProps["visibleNumberPages"]) ?? options?.visibleNumberPages ?? 5
    return countVisible > 5 ? countVisible : 5
  })
  const total = computed<NonNullable<PaginationProps["total"]>>(() => props.total ?? options?.total ?? 0)
  const isInfoText = computed<PaginationProps["isInfoText"]>(() => props.isInfoText ?? options?.isInfoText ?? false)
  const sizesSelector = computed<PaginationProps["sizesSelector"]>(
    () => (props?.sizesSelector as PaginationProps["sizesSelector"]) ?? options?.sizesSelector
  )
  const isPageSizeSelector = computed<PaginationProps["isPageSizeSelector"]>(
    () => ((props.isPageSizeSelector ?? options?.isPageSizeSelector) || !!sizesSelector.value?.length) ?? false
  )
  const isNavigationButtons = computed<PaginationProps["isHiddenNavigationButtons"]>(
    () => !(props?.isHiddenNavigationButtons ?? options?.isHiddenNavigationButtons)
  )
  const arraySizesSelector = computed<Array<{ key: number; value: string }>>(() =>
    ((sizesSelector.value ?? [...new Set([+(sizePage.value ?? 5), 5, 15, 20, 50, 100, 150])]) as Array<number>)
      .sort((a, b) => a - b)
      .map((size) => ({ key: size, value: `${size} ${Pagination.t("rows") ?? "rows"}` }))
  )
  const pages = computed(() => {
    const countPages = Math.ceil(total.value / (sizePage.value ?? 5))
    let resultArray = Array(countPages)
      .fill(null)
      .map((_, i) => i + 1)
    if (countPages > visibleNumberPages.value) {
      // ---------------
      let beforeCount = (activePage.value ?? 1) - Math.floor((visibleNumberPages.value - 3) / 2)
      let afterCount = (activePage.value ?? 1) + Math.ceil((visibleNumberPages.value - 3) / 2)
      if (!((activePage.value ?? 1) > 1 && beforeCount > 1)) {
        beforeCount = 1
        afterCount = afterCount + (visibleNumberPages.value - (afterCount - beforeCount + 1) - 1)
      }
      if (!((activePage.value ?? 1) < countPages && afterCount < countPages)) {
        afterCount = countPages
        beforeCount = beforeCount - (visibleNumberPages.value - (afterCount - beforeCount + 1) - 1)
      }
      resultArray = resultArray.slice(beforeCount - 1, afterCount)
      // ---------------
      const first = resultArray[0],
        last = resultArray[resultArray.length - 1]
      return [
        first !== 1 ? (first - 1 > 1 ? [1, 0] : [1]) : [],
        resultArray,
        last !== countPages ? (last + 1 < countPages ? [0, countPages] : [countPages]) : []
      ].flat()
    } else {
      return resultArray.length ? resultArray : [0]
    }
  })
  const activePage = ref<NonNullable<PaginationProps["modelValue"]>>()
  watch(
    () => props.modelValue,
    () => {
      activePage.value =
        props.modelValue && typeof props.modelValue === "number" ? (props.modelValue ?? pages.value[0]) : 1
    },
    { immediate: true }
  )
  // Номер последней страницы — для aria-live статуса «Page X of Y» (Issue 5).
  const lastPage = computed<number>(() => pages.value[pages.value.length - 1] ?? 0)
  const mode = computed<NonNullable<PaginationProps["mode"]>>(
    () => (props?.mode as PaginationProps["mode"]) ?? options?.mode ?? Pagination.componentsStyle() ?? "outlined"
  )
  const isStyleMode = computed<boolean>(() => mode.value === "outlined" || mode.value === "filled")
  const modeStyleSelect = computed<string>(() =>
    mode.value === "filled"
      ? "bg-surface-100 dark:bg-surface-900"
      : mode.value === "outlined"
        ? "border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-950"
        : mode.value === "underlined"
          ? ""
          : ""
  )
  const modeStyle = computed<string>(() =>
    mode.value === "filled"
      ? "bg-surface-100 dark:bg-surface-900 rounded-lg mx-1 mt-0 px-2 py-2 hover:bg-surface-200 dark:hover:bg-surface-800"
      : mode.value === "outlined"
        ? "bg-white dark:bg-surface-950 ring-1 ring-inset ring-surface-300 dark:ring-surface-700 rounded-lg mx-1 mt-0 px-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-900"
        : mode.value === "underlined"
          ? "bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent disabled:hover:bg-transparent disabled:dark:hover:bg-transparent active:bg-transparent active:dark:bg-transparent focus-visible:bg-transparent focus-visible:dark:bg-transparent " +
            "rounded-none border-t-2 border-transparent pt-4 px-2 hover:border-surface-300 hover:text-surface-700 dark:hover:border-surface-700 dark:hover:text-surface-300"
          : ""
  )
  const paramsSelect = computed<Partial<BaseSelectProps>>(() => ({
    noQuery: true,
    classSelect: "font-bold text-surface-600 dark:text-surface-500",
    classSelectList: "min-w-[8rem]",
    dataSelect: arraySizesSelector.value,
    paramsFixWindow: {
      position: "top-right"
    }
  }))
  const classBase = ref(
    Pagination.setStyle([
      "flex items-center justify-between w-full overflow-auto border-t border-surface-200 dark:border-surface-800 pb-3 -mt-px print:border-black",
      options?.class ?? "",
      props?.class ?? ""
    ])
  )
  const classShortVersion = computed(() =>
    Pagination.setStyle(["justify-between mx-5 sm:hidden", isStyleMode.value ? "pt-3" : "", "flex flex-1"])
  )
  const classShortContent = computed(() =>
    Pagination.setStyle([
      "flex sm:-mt-px sm:hidden px-3 text-surface-500 font-bold",
      isStyleMode.value ? "pt-2" : "pt-4"
    ])
  )
  const classShortContentActivePage = ref(Pagination.setStyle("text-theme-700 dark:text-theme-400 print:text-black"))
  const classShortContentSeparator = ref(Pagination.setStyle("mx-0.5"))
  const classShortContentCountPages = ref(Pagination.setStyle("text-surface-700 dark:text-surface-400"))
  const classContent = computed(() =>
    Pagination.setStyle([
      "hidden sm:flex sm:flex-1 sm:items-center sm:justify-between",
      isInfoText.value ? "" : "flex-row-reverse"
    ])
  )
  const classInfoText = ref(Pagination.setStyle("w-28 md:w-40 text-center -mb-4"))
  const classInfoTextContent = ref(Pagination.setStyle("text-sm text-surface-600 dark:text-surface-500"))
  const classInfoTextPage = ref(Pagination.setStyle("font-bold dark:text-surface-400"))
  const classNav = computed(() => Pagination.setStyle(["w-full isolate inline-flex rounded-md"]))
  const classPrevious = computed(() =>
    Pagination.setStyle([
      "flex flex-1",
      isInfoText.value || isPageSizeSelector.value ? "-mt-px w-12" : "",
      isStyleMode.value ? "pt-3" : ""
    ])
  )
  const classNext = computed(() =>
    Pagination.setStyle([
      "flex flex-1 justify-end",
      isInfoText.value || isPageSizeSelector.value ? "-mt-px w-12" : "",
      isStyleMode.value ? "pt-3" : ""
    ])
  )
  const classButtonSpan = ref(Pagination.setStyle("sr-only"))
  const classAriaLive = ref(Pagination.setStyle("sr-only"))
  // Issue 6 (RTL): directional иконки prev/next зеркалятся через logical `rtl:-scale-x-100`;
  // физический `ml-3` заменён на logical `ms-3` (auto-флип). Порядок prev/next зеркалит сам
  // `inline-flex` контейнера (main-axis следует document direction).
  const classIcon = ref(Pagination.setStyle("h-5 w-5 rtl:-scale-x-100"))
  const classIconContent = ref(Pagination.setStyle("ms-3 h-5 w-5 text-surface-400 rtl:-scale-x-100"))
  const classIconNotPage = ref(Pagination.setStyle("h-5 w-5 text-surface-400"))
  const classBodyPages = computed(() =>
    Pagination.setStyle(["hidden sm:-mt-px sm:flex", isStyleMode.value ? "pt-3" : ""])
  )
  const classNotPage = computed(() => Pagination.setStyle([isStyleMode.value ? "mt-0 px-2 py-2" : "px-2 pt-5"]))
  const classPageSizeSelector = computed(() =>
    Pagination.setStyle([
      "pl-2 rounded-md flex items-center -mb-3 cursor-pointer",
      isInfoText.value ? "" : "mx-5",
      modeStyleSelect.value
    ])
  )
  const classPageSizeSelectorText = ref(Pagination.setStyle("text-sm text-surface-400 dark:text-surface-500"))
  // Issue 8 (N59/B10): active-страница остаётся различимой в forced-colors (high-contrast)
  // и монохромно читаемой при печати (style-for-print, канон Button/Input/Table).
  const classNavPageActiveState = ref(
    Pagination.setStyle("forced-colors:outline forced-colors:outline-offset-2 print:font-bold print:text-black")
  )
  // ---EXPOSE------------------------------
  defineExpose({
    // ---STATE-------------------------
    paginationRef,
    selectPageSize,
    sizePage,
    // ---PROPS-------------------------
    visibleNumberPages,
    total,
    isInfoText,
    isPageSizeSelector,
    isNavigationButtons,
    arraySizesSelector,
    pages,
    activePage,
    mode,
    modeStyleSelect,
    paramsSelect,
    // ---METHODS-----------------------
    switchPage,
    switchSizePage,
    focus
  })
  // ---MOUNT-UNMOUNT-----------------------
  // `Pagination.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84) — Wave 2.3.
  onMounted(() => {
    if (navPreviousLink.value && navNextLink.value) {
      const limitPrevious = ((navPreviousLink.value.firstChild as HTMLDivElement)?.offsetWidth ?? 0) + 10
      const limitNext = ((navNextLink.value.firstChild as HTMLDivElement)?.offsetWidth ?? 0) + 10
      const limit = Math.max(limitPrevious, limitNext)
      setShortNavigation(navPreviousLink.value, limit, isShortPrevious)
      setShortNavigation(navNextLink.value, limit, isShortNext)
    }
  })
  onBeforeUnmount(() => {
    // отключаем все ResizeObserver'ы при размонтировании
    navigationObservers.forEach((observer) => observer.disconnect())
    navigationObservers.length = 0
  })
  // ---WATCHERS----------------------------
  watch(sizePageProp, (value) => (sizePage.value = value), {
    immediate: true
  })

  // ---METHODS-----------------------------
  function switchPage(value: PaginationProps["modelValue"] | Array<PaginationProps["modelValue"]>) {
    if (Array.isArray(value)) {
      activePage.value = value
        .filter((i) => typeof i === "number")
        ?.reduce((active, page, index, array) => {
          if (page === (activePage.value ?? 1)) {
            return array[index + 1]
          }
          return active
        }, 0)
    } else if (value && typeof +value === "number") {
      activePage.value = value
    }
    emit("update:modelValue", activePage.value)
  }

  function switchSizePage(sizePageValue: SelectProps["modelValue"] | null, _?: Array<any>) {
    sizePage.value =
      typeof sizePageValue === "number"
        ? sizePageValue
        : typeof sizePageValue === "string"
          ? Number(sizePageValue)
          : undefined
    emit("update:sizePage", sizePage.value)
  }

  // Issue 7 (G34): programmatic focus корневого <nav> через exposed paginationRef.
  function focus(options?: FocusOptions) {
    paginationRef.value?.focus(options)
  }

  function setShortNavigation(link: HTMLElement, limit: number, refButton: Ref) {
    if (link) {
      // сохраняем observer, чтобы отключить его в onBeforeUnmount (иначе утечка памяти)
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) refButton.value = (entry as any)?.target["offsetWidth"] < limit
      })
      observer.observe(link)
      navigationObservers.push(observer)
    }
  }
</script>

<template>
  <nav
    ref="paginationRef"
    data-pagination
    role="navigation"
    :aria-label="Pagination.t('pagination.label')"
    :class="classBase">
    <!-- aria-live статус смены страницы для screen reader (Issue 5) -->
    <span
      v-if="lastPage"
      data-pagination-live
      :class="classAriaLive"
      role="status"
      aria-live="polite"
      aria-atomic="true">
      {{ Pagination.t("pagination.page") }} {{ activePage }} {{ Pagination.t("of") }} {{ lastPage }}
    </span>
    <div data-pagination-short-version :class="classShortVersion">
      <Button
        data-pagination-short-previous
        :class="['m-0 font-medium text-surface-600 dark:text-surface-400', modeStyle]"
        :disabled="[0, activePage].includes(pages[pages.length - 1])"
        @click="switchPage(pages.slice().reverse())">
        {{ Pagination.t("previous") ?? "Previous" }}
      </Button>
      <!-- -------------------------------- -->
      <div data-pagination-content :class="classShortContent">
        <span :class="classShortContentActivePage">{{ activePage }}</span>
        <span :class="classShortContentSeparator">/</span>
        <span :class="classShortContentCountPages">{{ pages[pages.length - 1] }}</span>
      </div>
      <!-- -------------------------------- -->
      <Button
        data-pagination-short-next
        :class="['m-0 font-medium text-surface-600 dark:text-surface-400', modeStyle]"
        :disabled="[0, activePage].includes(pages[pages.length - 1])"
        @click="switchPage(pages)">
        {{ Pagination.t("next") ?? "Next" }}
      </Button>
    </div>
    <!-- -------------------------------- -->
    <div data-pagination-content :class="classContent">
      <!-- -------------------------------- -->
      <div v-if="isInfoText" data-pagination-content-info :class="classInfoText">
        <p :class="classInfoTextContent">
          <span :class="classInfoTextPage">
            {{
              (sizePage ?? 5) * (activePage ?? 1) +
              (total - (sizePage ?? 5) * (activePage ?? 1) < 0 ? total - (sizePage ?? 5) * (activePage ?? 1) : 0)
            }}
          </span>
          {{ Pagination.t("of") ?? "of" }}
          <span :class="classInfoTextPage">{{ total }}</span>
          {{ Pagination.t("lines") ?? "lines" }}
        </p>
      </div>
      <!-- -------------------------------- -->
      <!-- единственный navigation landmark — корневой <nav>; внутри обычный контейнер (Issue 4) -->
      <div v-if="pages.length" data-pagination-nav :class="classNav">
        <div ref="navPreviousLink" data-pagination-nav-previous :class="classPrevious">
          <Button
            v-if="isNavigationButtons"
            :class="['m-0 font-medium text-surface-600 dark:text-surface-400', modeStyle]"
            :disabled="[0, activePage].includes(pages[0])"
            @click="switchPage(pages.slice().reverse())">
            <template v-if="isInfoText || isPageSizeSelector || isShortPrevious">
              <span :class="classButtonSpan">{{ Pagination.t("previous") ?? "Previous" }}</span>
              <ChevronLeftIcon :class="classIcon" aria-hidden="true" />
            </template>
            <template v-else>
              <ArrowLongLeftIcon :class="classIconContent" aria-hidden="true" />
              {{ Pagination.t("previous") ?? "Previous" }}
            </template>
          </Button>
        </div>
        <div data-pagination-nav-pages :class="classBodyPages">
          <template v-for="(page, key) in pages" :key="`${page}-${key}`">
            <Button
              v-if="page > 0"
              data-pagination-nav-page
              :aria-current="page === activePage ? 'page' : false"
              :aria-label="`${Pagination.t('pagination.page')} ${page}`"
              :class="[
                'font-medium select-none m-0',
                page === activePage ? 'text-theme-600 dark:text-theme-400' : 'text-surface-600 dark:text-surface-400',
                mode === 'filled'
                  ? 'max-w-9 w-9 flex justify-center rounded-lg mx-0.5 mt-0 py-2 ' +
                    (page === activePage
                      ? 'bg-theme-100 dark:bg-theme-950 hover:bg-theme-200 dark:hover:bg-theme-900'
                      : 'bg-surface-100 dark:bg-surface-900 hover:bg-surface-200 dark:hover:bg-surface-800')
                  : mode === 'outlined'
                    ? 'max-w-9 w-9 flex justify-center ring-1 ring-inset rounded-lg mx-0.5 mt-0 py-2 ' +
                      (page === activePage
                        ? 'ring-theme-300 dark:ring-theme-700 bg-white dark:bg-surface-950 hover:bg-theme-100 dark:hover:bg-theme-950'
                        : 'bg-white dark:bg-surface-950 ring-surface-300 dark:ring-surface-700 hover:bg-surface-100 dark:hover:bg-surface-900')
                    : mode === 'underlined'
                      ? 'mt-0 border-t-2 px-4 pt-4 bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent disabled:hover:bg-transparent disabled:dark:hover:bg-transparent active:bg-transparent active:dark:bg-transparent focus-visible:bg-transparent focus-visible:dark:bg-transparent rounded-none ' +
                        (page === activePage
                          ? 'border-theme-400 dark:border-theme-700'
                          : 'border-transparent hover:border-surface-300 hover:text-surface-700 dark:hover:border-surface-700 dark:hover:text-surface-300')
                      : '',
                page === activePage ? classNavPageActiveState : ''
              ]"
              @click="switchPage(page)">
              {{ page }}
            </Button>
            <span v-else :class="classNotPage">
              <EllipsisHorizontalIcon :class="classIconNotPage" aria-hidden="true" />
            </span>
          </template>
        </div>
        <div :class="classShortContent">
          <span :class="classShortContentActivePage">{{ activePage }}</span>
          <span :class="classShortContentSeparator">/</span>
          <span :class="classShortContentCountPages">{{ pages[pages.length - 1] }}</span>
        </div>
        <div ref="navNextLink" data-pagination-nav-next :class="classNext">
          <Button
            v-if="isNavigationButtons"
            :class="['m-0 font-medium text-surface-600 dark:text-surface-400', modeStyle]"
            :disabled="[0, activePage].includes(pages[pages.length - 1])"
            @click="switchPage(pages)">
            <template v-if="isInfoText || isPageSizeSelector || isShortNext">
              <span :class="classButtonSpan">{{ Pagination.t("next") ?? "Next" }}</span>
              <ChevronRightIcon :class="classIcon" aria-hidden="true" />
            </template>
            <template v-else>
              {{ Pagination.t("next") ?? "Next" }}
              <ArrowLongRightIcon :class="classIconContent" aria-hidden="true" />
            </template>
          </Button>
        </div>
      </div>
      <!-- -------------------------------- -->
      <div
        v-if="isPageSizeSelector"
        data-pagination-selector
        :class="classPageSizeSelector"
        @click="selectPageSize?.openSelect()">
        <p :class="classPageSizeSelectorText">{{ Pagination.t("show") ?? "Show:" }}</p>
        <Select
          v-bind="paramsSelect"
          ref="selectPageSize"
          :mode="mode"
          :model-value="sizePage"
          :class="[
            mode === 'outlined' ? 'border-none' : mode === 'underlined' ? 'bg-transparent dark:bg-transparent' : ''
          ]"
          :class-body="['m-0 min-w-[5rem] max-w-[5rem]']"
          @update:model-value="switchSizePage">
        </Select>
      </div>
    </div>
  </nav>
</template>
