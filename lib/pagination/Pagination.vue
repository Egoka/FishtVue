<script setup lang="ts">
  import { computed, ref, onMounted, watch } from "vue"
  import {
    ArrowLongLeftIcon,
    ArrowLongRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisHorizontalIcon
  } from "@heroicons/vue/20/solid"
  import type { PaginationProps, PaginationEmits, PaginationExpose } from "./Pagination"
  import type { BaseSelectProps, SelectExpose } from "fishtvue/select"
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
  const selectPageSize = ref<SelectExpose>()
  const sizePage = ref<number>()
  // ---PROPS-------------------------------
  const sizePageProp = computed<NonNullable<PaginationProps["sizePage"]>>(() => {
    const sizePageProp = props.sizePage ?? options?.sizePage
    return sizePageProp && sizePageProp > 0 ? sizePageProp : 5
  })
  const visibleNumberPages = computed<NonNullable<PaginationProps["visibleNumberPages"]>>(() => {
    const countVisible = props?.visibleNumberPages ?? options?.visibleNumberPages
    return countVisible && countVisible >= 5 ? countVisible : 5
  })
  const total = computed<NonNullable<PaginationProps["total"]>>(() => props.total ?? options?.total ?? 0)
  const isInfoText = computed<PaginationProps["isInfoText"]>(() => props.isInfoText ?? options?.isInfoText ?? false)
  const sizesSelector = computed<PaginationProps["sizesSelector"]>(() => props?.sizesSelector ?? options?.sizesSelector)
  const isPageSizeSelector = computed<PaginationProps["isPageSizeSelector"]>(
    () => ((props.isPageSizeSelector ?? options?.isPageSizeSelector) || !!sizesSelector.value?.length) ?? false
  )
  const isNavigationButtons = computed<PaginationProps["isHiddenNavigationButtons"]>(
    () => !(props?.isHiddenNavigationButtons ?? options?.isHiddenNavigationButtons)
  )
  const arraySizesSelector = computed<Array<{ key: number; value: string }>>(() =>
    ((sizesSelector.value ?? [...new Set([+(sizePage.value ?? 5), 5, 15, 20, 50, 100, 150])]) as Array<number>)
      .sort((a, b) => a - b)
      .map((size) => ({ key: size, value: `${size} rows` }))
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
        typeof (+props.modelValue as any) === "number" && +props.modelValue ? (+props.modelValue ?? pages.value[0]) : 1
    },
    { immediate: true }
  )
  const mode = computed<NonNullable<PaginationProps["mode"]>>(
    () => props?.mode ?? options?.mode ?? Pagination.componentsStyle() ?? "outlined"
  )
  const isStyleMode = computed<boolean>(() => mode.value === "outlined" || mode.value === "filled")
  const modeStyleSelect = computed<string>(() =>
    mode.value === "filled"
      ? "bg-stone-100 dark:bg-stone-900"
      : mode.value === "outlined"
        ? "border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-950"
        : mode.value === "underlined"
          ? ""
          : ""
  )
  const modeStyle = computed<string>(() =>
    mode.value === "filled"
      ? "bg-stone-100 dark:bg-stone-900 rounded-lg mx-1 mt-0 px-2 py-2 hover:bg-stone-200 dark:hover:bg-stone-800"
      : mode.value === "outlined"
        ? "bg-white dark:bg-neutral-950 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 rounded-lg mx-1 mt-0 px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        : mode.value === "underlined"
          ? "bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent disabled:hover:bg-transparent disabled:dark:hover:bg-transparent active:bg-transparent active:dark:bg-transparent focus-visible:bg-transparent focus-visible:dark:bg-transparent " +
            "rounded-none border-t-2 border-transparent pt-4 px-2 hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-700 dark:hover:text-gray-300"
          : ""
  )
  const paramsSelect = computed<Partial<BaseSelectProps>>(() => ({
    noQuery: true,
    classSelect: "font-bold text-gray-600 dark:text-gray-500",
    classSelectList: "min-w-[8rem]",
    dataSelect: arraySizesSelector.value,
    paramsFixWindow: {
      position: "top-right"
    }
  }))
  const classBase = ref(
    Pagination.setStyle([
      "flex items-center justify-between w-full border-t border-gray-200 dark:border-gray-800 pb-3 -mt-px",
      options?.class ?? "",
      props?.class ?? ""
    ])
  )
  const classShortVersion = computed(() =>
    Pagination.setStyle(["justify-between mx-5 sm:hidden", isStyleMode.value ? "pt-3" : "", "flex flex-1"])
  )
  const classShortContent = computed(() =>
    Pagination.setStyle([
      "flex sm:-mt-px sm:hidden px-3 text-neutral-500 font-bold",
      isStyleMode.value ? "pt-2" : "pt-4"
    ])
  )
  const classShortContentActivePage = ref(Pagination.setStyle("text-theme-700 dark:text-theme-400"))
  const classShortContentSeparator = ref(Pagination.setStyle("mx-0.5"))
  const classShortContentCountPages = ref(Pagination.setStyle("text-neutral-700 dark:text-neutral-400"))
  const classContent = computed(() =>
    Pagination.setStyle([
      "hidden sm:flex sm:flex-1 sm:items-center sm:justify-between",
      isInfoText.value ? "" : "flex-row-reverse"
    ])
  )
  const classInfoText = ref(Pagination.setStyle("w-28 md:w-40 text-center -mb-4"))
  const classInfoTextContent = ref(Pagination.setStyle("text-sm text-gray-600 dark:text-gray-500"))
  const classInfoTextPage = ref(Pagination.setStyle("font-bold dark:text-gray-400"))
  const classNav = computed(() =>
    Pagination.setStyle([
      "isolate inline-flex rounded-md",
      isInfoText.value || isPageSizeSelector.value ? "w-full" : ""
    ])
  )
  const classPrevious = computed(() =>
    Pagination.setStyle([
      isInfoText.value || isPageSizeSelector.value ? "-mt-px flex flex-1 w-12" : "",
      isStyleMode.value ? "pt-3" : ""
    ])
  )
  const classNext = computed(() =>
    Pagination.setStyle([
      isInfoText.value || isPageSizeSelector.value ? "-mt-px flex flex-1 w-12 justify-end" : "",
      isStyleMode.value ? "pt-3" : ""
    ])
  )
  const classButtonSpan = ref(Pagination.setStyle("sr-only"))
  const classIcon = ref(Pagination.setStyle("h-5 w-5"))
  const classIconContent = ref(Pagination.setStyle("mr-3 h-5 w-5 text-gray-400"))
  const classIconNotPage = ref(Pagination.setStyle("h-5 w-5 text-gray-400"))
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
  const classPageSizeSelectorText = ref(Pagination.setStyle("text-sm text-gray-400 dark:text-gray-500"))
  // ---EXPOSE------------------------------
  defineExpose<PaginationExpose>({
    // ---STATE-------------------------
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
    paramsSelect,
    // ---METHODS-----------------------
    switchPage,
    switchSizePage
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Pagination.initStyle()
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

  function switchSizePage(sizePageValue: PaginationProps["modelValue"]) {
    sizePage.value = sizePageValue
    emit("update:sizePage", sizePageValue)
  }
</script>

<template>
  <div data-pagination :class="classBase">
    <div data-pagination-short-version :class="classShortVersion">
      <Button
        data-pagination-short-previous
        :class="['m-0 w-5 font-medium text-gray-600 dark:text-gray-400', modeStyle]"
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
        :class="['m-0 font-medium text-gray-600 dark:text-gray-400', modeStyle]"
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
      <nav v-if="pages.length" data-pagination-nav :class="classNav" aria-label="Pagination">
        <div data-pagination-nav-previous :class="classPrevious">
          <Button
            v-if="isNavigationButtons"
            :class="['m-0 font-medium text-gray-600 dark:text-gray-400', modeStyle]"
            :disabled="[0, activePage].includes(pages[0])"
            @click="switchPage(pages.slice().reverse())">
            <template v-if="isInfoText || isPageSizeSelector">
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
              :class="[
                'font-medium select-none m-0',
                page === activePage ? 'text-theme-600 dark:text-theme-400' : 'text-gray-600 dark:text-gray-400',
                mode === 'filled'
                  ? 'max-w-9 w-9 flex justify-center rounded-lg mx-0.5 mt-0 py-2 ' +
                    (page === activePage
                      ? 'bg-theme-100 dark:bg-theme-950 hover:bg-theme-200 dark:hover:bg-theme-900'
                      : 'bg-stone-100 dark:bg-stone-900 hover:bg-neutral-200 dark:hover:bg-neutral-800')
                  : mode === 'outlined'
                    ? 'max-w-9 w-9 flex justify-center ring-1 ring-inset rounded-lg mx-0.5 mt-0 py-2 ' +
                      (page === activePage
                        ? 'ring-theme-300 dark:ring-theme-700 bg-white dark:bg-neutral-950 hover:bg-theme-100 dark:hover:bg-theme-950'
                        : 'bg-white dark:bg-neutral-950 ring-neutral-300 dark:ring-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900')
                    : mode === 'underlined'
                      ? 'mt-0 border-t-2 px-4 pt-4 bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent disabled:hover:bg-transparent disabled:dark:hover:bg-transparent active:bg-transparent active:dark:bg-transparent focus-visible:bg-transparent focus-visible:dark:bg-transparent rounded-none ' +
                        (page === activePage
                          ? 'border-theme-400 dark:border-theme-700'
                          : 'border-transparent hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-700 dark:hover:text-gray-300')
                      : ''
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
        <div data-pagination-nav-next :class="classNext">
          <Button
            v-if="isNavigationButtons"
            :class="['m-0 font-medium text-gray-600 dark:text-gray-400', modeStyle]"
            :disabled="[0, activePage].includes(pages[pages.length - 1])"
            @click="switchPage(pages)">
            <template v-if="isInfoText || isPageSizeSelector">
              <span :class="classButtonSpan">{{ Pagination.t("next") ?? "Next" }}</span>
              <ChevronRightIcon :class="classIcon" aria-hidden="true" />
            </template>
            <template v-else>
              {{ Pagination.t("next") ?? "Next" }}
              <ArrowLongRightIcon :class="classIconContent" aria-hidden="true" />
            </template>
          </Button>
        </div>
      </nav>
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
  </div>
</template>
