<script setup lang="ts">
  import { debounce } from "lodash"
  import { useI18n } from "vue-i18n"
  import type { FuseResult, FuseResultMatch } from "fuse.js"
  import Fuse from "fuse.js"
  import { useSearchHotkeys } from "~/composables/useSearchHotkeys"
  import sanitizeHtml from "sanitize-html"

  interface SearchItem {
    id: string
    title: string
    content: string
    titles: string[]
  }

  const { locale, t } = useI18n()
  const localePath = useLocalePath()
  const isOpenDialogWindow = ref(false)
  const buttonRef = ref<HTMLButtonElement>()
  const inputRef = ref<HTMLInputElement>()

  // Загрузка данных
  const { data, error, refresh } = await useAsyncData<SearchItem[]>(
    `search-${locale.value}`,
    () => queryCollectionSearchSections(locale.value),
    { server: true, lazy: true }
  )

  watch(error, () => {
    if (error.value) {
      console.error("Failed to load search data:", error.value)
      // useToast().add({ title: 'Error', description: 'Failed to load search data.', color: 'red' });
    }
  })

  // Инициализация Fuse.js
  const fuse = ref<Fuse<SearchItem>>()
  const updateFuse = () => {
    fuse.value = new Fuse(data.value ?? [], {
      keys: [
        { name: "title", weight: 0.7 }, // Высокий приоритет для title
        { name: "content", weight: 0.2 },
        { name: "titles", weight: 0.1 }
      ],
      includeMatches: true,
      includeScore: true,
      threshold: 0.2,
      ignoreLocation: true,
      minMatchCharLength: 2
    })
  }

  // Обновление данных при смене локали
  watch(
    () => locale.value,
    async () => {
      await refresh() // Запрашиваем новые данные
      updateFuse() // Обновляем Fuse после загрузки
    }
  )

  // Поиск
  const visibleResultsCountConst = 5
  const searchTerm = ref("")
  const loading = ref(false)
  const fuseResults = shallowRef<FuseResult<SearchItem>[]>()
  const visibleResultsCount = ref(visibleResultsCountConst)
  const searchCache = new Map<string, FuseResult<SearchItem>[]>()

  const search = ref<Function>(() => {}) // Заглушка по умолчанию
  if (process.client) {
    search.value = debounce(() => {
      if (!searchTerm.value) {
        fuseResults.value = []
        visibleResultsCount.value = visibleResultsCountConst
        searchCache.clear()
        loading.value = false
        return
      }

      if (searchCache.has(searchTerm.value)) {
        fuseResults.value = prioritizeTitleMatches(searchCache.get(searchTerm.value) ?? [])
        loading.value = false
        return
      }

      const results = fuse.value?.search(searchTerm.value) ?? []
      const sortedResults = prioritizeTitleMatches(results)
      fuseResults.value = sortedResults
      searchCache.set(searchTerm.value, sortedResults)

      if (searchCache.size > 50) {
        const firstKey = searchCache.keys().next().value
        if (firstKey) searchCache.delete(firstKey)
      }
      loading.value = false
    }, 300)
  }

  watch(searchTerm, () => {
    loading.value = true
    visibleResultsCount.value = visibleResultsCountConst
    search.value()
  })

  // Приоритизация совпадений по title
  const prioritizeTitleMatches = (results: FuseResult<SearchItem>[]) => {
    return results.sort((a, b) => {
      const aHasTitleMatch = a.matches?.some((m) => m.key === "title") ? -1 : 1
      const bHasTitleMatch = b.matches?.some((m) => m.key === "title") ? -1 : 1
      if (aHasTitleMatch !== bHasTitleMatch) return aHasTitleMatch - bHasTitleMatch
      return (a.score ?? 0) - (b.score ?? 0) // Сортировка по score, если оба имеют/не имеют title
    })
  }

  // Обработка активного элемента
  const activeIndex = ref<number | null>(null)
  const toggleIndex = (index: number) => {
    activeIndex.value = activeIndex.value === index ? null : index
  }

  // Навигация
  const toPath = (path: string) => {
    isOpenDialogWindow.value = false
    navigateTo(localePath(path ?? ""))
  }

  // Подсветка совпадений
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  const highlightMatch = (text: string, matches: FuseResultMatch[] = [], maxLength: number = 100) => {
    const cleanText = sanitizeHtml(truncateText(text, maxLength), {
      allowedTags: [],
      allowedAttributes: {}
    })

    if (!matches.length) return cleanText

    const sortedIndices = matches
      .flatMap((match) => match.indices)
      .filter(([start, end]) => end - start + 1 >= 3 && start < cleanText.length && end < cleanText.length)
      .sort((a, b) => b[0] - a[0])

    let result = cleanText
    sortedIndices.forEach(([start, end]) => {
      const before = result.slice(0, start)
      const matched = result.slice(start, end + 1)
      const after = result.slice(end + 1)
      result = `${before}<mark>${matched}</mark>${after}`
    })

    return result
  }

  // Показать больше результатов
  const showMore = () => {
    visibleResultsCount.value += visibleResultsCountConst * 3
  }

  // Клавиатурная навигация
  const handleKeyNavigation = (event: KeyboardEvent) => {
    if (!isOpenDialogWindow.value || !fuseResults.value?.length) return
    const indexActiveIndex = fuseResults.value.findIndex((r) => r.refIndex === activeIndex.value)
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        activeIndex.value =
          activeIndex.value == null
            ? fuseResults.value[0].refIndex
            : Math.min(
                fuseResults.value[indexActiveIndex + 1].refIndex,
                fuseResults.value[fuseResults.value.length - 1].refIndex
              )
        break
      case "ArrowUp":
        event.preventDefault()
        activeIndex.value =
          activeIndex.value == null
            ? fuseResults.value[0].refIndex
            : Math.max(fuseResults.value[indexActiveIndex - 1].refIndex, fuseResults.value[0].refIndex)
        break
      case "Enter":
        if (activeIndex.value != null) {
          event.preventDefault()
          toPath(fuseResults.value[indexActiveIndex].item.id)
        }
        break
      case "Escape":
        event.preventDefault()
        isOpenDialogWindow.value = false
        break
    }
  }

  onMounted(() => {
    updateFuse()
    document.removeEventListener("keydown", handleKeyNavigation) // Предотвращаем дублирование
    document.addEventListener("keydown", handleKeyNavigation)
  })

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyNavigation)
  })

  useSearchHotkeys(isOpenDialogWindow)
</script>

<template>
  <Button
    ref="buttonRef"
    mode="ghost"
    @click="isOpenDialogWindow = true"
    class="m-0 transition-colors duration-300"
    aria-label="Open search dialog">
    <AppIcons icon="material-symbols:search-rounded" class="size-5 text-neutral-600 dark:text-neutral-400" />
    <FixWindow
      :delay="3"
      class="hidden lg:flex lg:border-transparent px-2 py-0.5 rounded-xs bg-neutral-100 dark:bg-neutral-900">
      {{ t("Search") }}
    </FixWindow>
  </Button>
  <ClientOnly>
    <Dialog
      v-model="isOpenDialogWindow"
      notAnimate
      toTeleport="#__nuxt"
      position="top"
      class="top-20 p-0 mx-auto transform-gpu overflow-hidden rounded-xl bg-white shadow-xl sm:max-w-lg w-full dark:bg-neutral-950 dark:ring-1 ring-theme-100 dark:ring-theme-900">
      <Input
        ref="inputRef"
        v-model="searchTerm"
        :placeholder="t('Searching', 'Search...')"
        auto-focus
        :loading="loading"
        label-mode="vanishing"
        autocomplete="off"
        mode="outlined"
        class-input="text-lg"
        class-body="m-2 z-20 bg-white dark:bg-neutral-950"
        class="border-0 ring-0"
        clear
        aria-label="Search input">
        <template #before>
          <AppIcons icon="material-symbols:search-rounded" class="size-5 text-gray-400 dark:text-gray-600" />
        </template>
      </Input>
      <div
        v-if="fuseResults?.length"
        class="search border-t border-slate-200 bg-white dark:bg-theme-950/50 px-2 py-3 empty:hidden dark:border-slate-400/10">
        <TransitionGroup
          name="ul"
          tag="ul"
          role="listbox"
          class="overflow-auto max-h-[360px]"
          :aria-activedescendant="activeIndex ? `documentation-item-${activeIndex}` : undefined">
          <li
            v-for="result in fuseResults.slice(0, visibleResultsCount)"
            :key="result.refIndex"
            :id="`documentation-item-${result.refIndex}`"
            role="option"
            :aria-selected="result.refIndex === activeIndex"
            class="group block cursor-default rounded-lg mt-4 px-3 py-2 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700/30 touch:p-4 transition-all duration-200"
            @pointerenter="toggleIndex(result.refIndex)"
            @pointerleave="toggleIndex(result.refIndex)"
            @click="toPath(result.item.id)">
            <div
              :id="`:${result.refIndex}:-title`"
              class="text-sm text-slate-700 group-aria-selected:text-theme-600 dark:text-slate-300 dark:group-aria-selected:text-theme-400 transition-all duration-200"
              v-html="
                highlightMatch(
                  result.item.title,
                  result.matches?.filter((m: FuseResultMatch) => m.key === 'title'),
                  100
                )
              " />
            <div
              v-if="result.item.titles.length"
              :id="`:${result.refIndex}:-hierarchy`"
              class="mt-0.5 truncate text-xs font-bold whitespace-nowrap text-slate-500 dark:text-slate-400">
              <template v-for="(title, key) in result.item.titles" :key="key">
                <span>{{ title }}</span>
                <span v-if="result.item.titles.length - 1 !== key" class="mx-2 text-theme-300 dark:text-theme-700"
                  >/</span
                >
                <span v-else class="sr-only">/</span>
              </template>
            </div>
            <div
              v-if="result.item.content.length"
              :id="`:${result.refIndex}:-content`"
              :aria-hidden="result.refIndex !== activeIndex"
              class="mt-3 truncate text-xs text-slate-500 dark:text-slate-400"
              v-html="
                highlightMatch(
                  result.item.content,
                  result.matches?.filter((m: FuseResultMatch) => m.key === 'content'),
                  150
                )
              " />
          </li>
          <Button
            v-if="fuseResults.length > visibleResultsCount"
            mode="ghost"
            class="mt-2 mx-auto text-sm text-theme-600 dark:text-theme-400 hover:bg-theme-200 dark:hover:bg-theme-900 hover:text-theme-600 dark:hover:text-theme-400 flex items-center justify-center"
            @click="showMore">
            <AppIcons icon="material-symbols:expand-more" class="size-4" />
            {{ t("Show more", "Show more") }}
          </Button>
        </TransitionGroup>
      </div>

      <div
        v-if="!loading && searchTerm && !fuseResults?.length"
        class="h-48 content-center text-sm text-center text-slate-500 dark:text-slate-400">
        {{ t("No results found", "No results found") }}
      </div>
    </Dialog>
  </ClientOnly>
</template>

<style scoped>
  :global(html .search mark) {
    color: var(--color-theme-600);
    background-color: transparent;
    font-weight: 500;
  }

  :global(html.dark .search mark) {
    color: var(--color-theme-400);
    background-color: transparent;
    font-weight: 500;
  }

  /* Анимация для списка результатов */
  .ul-move,
  .ul-enter-active,
  .ul-leave-active {
    transition: all 0.3s ease;
  }

  .ul-enter-from,
  .ul-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  /* Анимация для содержимого элементов */
  .content-expand-enter-active,
  .content-expand-leave-active {
    transition: all 0.3s ease-in-out;
    max-height: 500px; /* Достаточно большое значение для контента */
    overflow: hidden;
  }

  .content-expand-enter-from,
  .content-expand-leave-to {
    max-height: 0;
    opacity: 0;
    margin: 0;
  }

  /* Увеличение области клика для сенсорных устройств */
  .touch\:p-4 {
    @media (pointer: coarse) {
      padding: 1rem;
    }
  }
</style>
