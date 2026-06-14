<script setup lang="ts">
  import { computed, ref, watch } from "vue"
  import type { IconsProps } from "./Icons"
  import { convertToCamelCase } from "fishtvue/utils/stringHandler"
  // ---------------------------------------
  // Issue 1 (icons.md): heroicons подключаются eager namespace-импортом и резолвятся
  // синхронным lookup'ом по PascalCase-имени. Точечный dynamic import
  // (`import(`@heroicons/vue/24/{outline|solid}/${name}.js`)`) был откатан: Vite/Rollup
  // `dynamic-import-vars` НЕ глобит bare-specifier из node_modules → в prod-Vite иконка
  // не резолвилась (`Failed to resolve module specifier`) и отсутствовала в SSR-HTML.
  // Namespace-lookup корректен в prod-Vite, SSR (sync — иконка сразу в HTML) и любом
  // bundler. Trade-off: весь heroicons-набор попадает в bundle (tree-shaking — future-работа,
  // см. components/icons.md §12: const-реестр named-импортов / unplugin-icons).
  // ---------------------------------------
  import * as HeroIconsOutline from "@heroicons/vue/24/outline"
  import * as HeroIconsSolid from "@heroicons/vue/24/solid"
  // ---------------------------------------
  // https://icon-sets.iconify.design/ — fallback для имён вне heroicons
  import { Icon, type IconifyIconName, loadIcons } from "@iconify/vue"
  // ---------------------------------------
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Icons = new Component<"Icons">()
  const options = Icons.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<IconsProps>()
  // ---DEPRECATION-WARN--------------------
  if (props.stileIcon !== undefined && props.variant === undefined) {
    console.warn("[FishtVue] <Icons> 'stileIcon' is deprecated, use 'variant' instead. Will be removed in 1.0.")
  }
  // ---REF-LINK----------------------------
  const isViewIcon = ref(false)
  // ---PROPS-------------------------------
  const type = computed(() => props.type)
  const variant = computed<"outline" | "solid">(() => props.variant ?? props.stileIcon ?? options?.variant ?? "outline")
  const label = computed<string | undefined>(() => (props.label ? props.label : undefined))
  const style = computed(() => props.style)
  const classIcon = computed(() =>
    Icons.setStyle([
      "h-5 w-5 text-gray-900 dark:text-gray-100",
      options?.class ?? "",
      props?.class ?? "",
      "select-none"
    ])
  )

  const heroIcon = ref<any | undefined>(undefined)
  // ---------------------------------------
  function loadTestIcons(icons: (IconifyIconName | string)[]) {
    return new Promise((fulfill, reject) => {
      loadIcons(icons, (loaded, missing) => {
        if (missing.length) {
          reject({ loaded, missing })
        } else {
          fulfill({
            loaded
          })
        }
      })
    })
  }

  async function isIcon(iconName: string) {
    return loadTestIcons([iconName])
      .then((result: any) => {
        return !!result.loaded?.length
      })
      .catch((err) => {
        console.error("Failed to load icons:", err.missing)
        return false
      })
  }

  // `Icons.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84).

  // Issue 1: sync lookup heroicon по PascalCase-имени из eager namespace. На успех —
  // кладём компонент в `heroIcon`; на отсутствие — false (fallback на Iconify ниже).
  // `outline[name]` — bare render-функция heroicons, валидна как `:is` (functional component).
  function resolveHeroIcon(value: string, currentVariant: "outline" | "solid"): boolean {
    const name = convertToCamelCase(value) + "Icon"
    const set = (currentVariant === "solid" ? HeroIconsSolid : HeroIconsOutline) as Record<string, unknown>
    const comp = set[name]
    if (comp) {
      heroIcon.value = comp
      return true
    }
    return false
  }

  watch(
    [() => type.value, () => variant.value],
    async ([value, currentVariant]) => {
      heroIcon.value = undefined
      isViewIcon.value = false
      // sync — heroIcon резолвится до первого await (доступен в SSR-HTML и на первом paint)
      if (resolveHeroIcon(value, currentVariant)) return
      // не heroicon → пробуем Iconify (async: CDN / offline-коллекция)
      isViewIcon.value = await isIcon(value)
    },
    { immediate: true }
  )
  // ---------------------------------------
  defineExpose({
    // ---PROPS-------------------------
    type,
    variant,
    label,
    classIcon,
    style
  })
</script>

<template>
  <i data-icon :role="label ? 'img' : undefined" :aria-label="label">
    <component v-if="heroIcon" :is="heroIcon" :class="classIcon" :style="style" />
    <Icon v-else-if="isViewIcon" :icon="type" :class="classIcon" :style="style" aria-hidden="true" />
  </i>
</template>
