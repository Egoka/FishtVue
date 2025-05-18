<script setup lang="ts">
  import { useRoute } from "vue-router"
  import { useAsyncData } from "#app"
  import { useI18n } from "vue-i18n"
  import { computed, onMounted, ref } from "vue"
  import type { PageCollectionItemBase } from "@nuxt/content"

  definePageMeta({ layout: "docs" })
  const { locale, t } = useI18n()
  const route = useRoute()
  const nuxtApp = useNuxtApp()
  const isNavigating = ref(false)
  const showLoading = ref(false)
  let loadingTimeout: NodeJS.Timeout | null = null

  // Отслеживаем состояния навигации с задержкой
  onMounted(() => {
    nuxtApp.hook("page:start", () => {
      isNavigating.value = true

      // Устанавливаем таймер для показа загрузки
      loadingTimeout = setTimeout(() => {
        if (isNavigating.value) {
          showLoading.value = true
        }
      }, 300)
    })

    nuxtApp.hook("page:finish", () => {
      isNavigating.value = false
      showLoading.value = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    })

    nuxtApp.hook("page:error", () => {
      isNavigating.value = false
      showLoading.value = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    })
  })

  const path = computed(() => route.path.replace(`/${locale.value}`, "") ?? "/")

  const { data: page } = await useAsyncData(`path-${path.value}`, () =>
    queryCollection(locale.value).path(path.value).first()
  )
  if (page.value?.id) provide("pageId", page.value.id)
  let tabMenu = ref<PageCollectionItemBase[]>()
  let surround = ref()

  if (page.value?.id) {
    const regex = new RegExp(`([^/.]+)\\.${page.value.extension}$`)
    let category = page.value.id.match(regex)?.[1]
    category = category !== "index" && !page.value.navigation ? `/${category}` : ""
    const path = route.path.replace(`/${locale.value}`, "").replace(category, "") ?? "/"

    const result = await useAsyncData(
      `path-addition-${path}`,
      () =>
        Promise.all([
          queryCollection(locale.value).where("path", "LIKE", `${path}%`).all(),
          queryCollectionItemSurroundings(locale.value, path, { fields: ["title", "description"] })
        ]),
      { transform: ([tabMenu, surround]) => ({ tabMenu, surround }) }
    )
    tabMenu.value = result.data.value?.tabMenu
    surround.value = result.data.value?.surround
  }

  const tabMenuItems = computed(() =>
    tabMenu.value?.map((item) => {
      const regex = new RegExp(`([^/.]+)\\.${item.extension}$`)
      const title = (item as any)?.name ?? item?.meta?.name ?? item.id.match(regex)?.[1]
      return {
        title: title === "index" ? "usage" : title,
        path: item.path
      }
    })
  )
</script>

<template>
  <div class="px-6 md:px-8 lg:pl-4 lg:pr-4 pt-6 md:pt-12 overflow-x-hidden flex-1 min-h-[85vh]">
    <DocTabMenu v-if="page" :tab-menu-items="tabMenuItems" />
    <Button v-if="page && page?.body.toc?.links?.length" mode="outline" class="w-max relative lg:hidden">
      {{ t("onPage") }}
      <FixWindow
        typePosition="absolute"
        position="bottom-left"
        eventOpen="click"
        eventClose="hover"
        class="max-w-80 max-h-96 overflow-auto bg-neutral-100 dark:bg-neutral-800 p-5 text-left rounded-xl flex-col space-y-6 no-scrollbar border dark:border-neutral-800">
        <DocOutline v-if="page?.body.toc?.links?.length" :headers="page?.body.toc?.links" />
      </FixWindow>
    </Button>
    <article class="w-full prose prose-stone dark:prose-invert max-w-none min-h-[calc(100vh-30rem)]">
      <template v-if="showLoading">
        <div class="animate-pulse mt-8">
          <div class="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-1/3 mb-4"></div>
          <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3 mb-8"></div>
          <div class="space-y-4">
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/6"></div>
          </div>
        </div>
      </template>
      <template v-else>
        <DocHeader v-if="page" :title="page?.title" :description="page?.description" :links="page?.links" />
        <div v-if="page" class="mt-8 space-y-12">
          <ContentRenderer :value="page" />
        </div>
        <template v-else>
          <Doc404 />
        </template>
      </template>
    </article>
    <DocFooter v-if="page" :control="surround" />
    <AppFooter class="w-[93vw] md:w-full md:px-8" />
  </div>

  <div
    v-if="page?.body.toc?.links?.length"
    class="hidden lg:flex w-64 flex-shrink-0 py-12 pl-2 sticky top-[5.25rem] overflow-y-auto md:overflow-x-hidden h-[calc(100vh-5rem)] flex-col space-y-6 no-scrollbar">
    <DocOutline :headers="page?.body.toc?.links" />
    <DocCommunity />
    <div class="fixed bottom-0 z-10 w-64 h-12 bg-gradient-to-b from-transparent to-neutral-100 dark:to-neutral-900" />
  </div>
  <div v-else class="w-10"></div>
</template>
