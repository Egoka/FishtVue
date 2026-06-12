<script setup lang="ts">
  import { computed, onMounted, ref, watch } from "vue"
  import type { IconsProps } from "./Icons"
  import { convertToCamelCase } from "fishtvue/utils/stringHandler"
  // ---------------------------------------
  // Issue 7: heroicons грузятся точечно через dynamic import (один файл на иконку), а не
  // namespace-импортом всего набора `@heroicons/vue/24/{outline,solid}` (тянул ~2k иконок в
  // bundle). Trade-off: иконка резолвится async (нет в SSR-HTML, появляется после hydration).
  // Гарантированный compile-time tree-shaking + SSR — через unplugin-icons (см. components/icons.md).
  // ---------------------------------------
  // https://icon-sets.iconify.design/
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

  // Issue 7: точечный dynamic import конкретной heroicon. На успех — кладём компонент в
  // `heroIcon`; на отсутствие/ошибку — fallback на Iconify (как раньше).
  async function resolveHeroIcon(value: string, currentVariant: "outline" | "solid"): Promise<boolean> {
    const name = convertToCamelCase(value) + "Icon"
    try {
      // Статический префикс на ветку — чтобы bundler мог проанализировать dynamic import
      // (двух-переменный шаблон Vite не глобит → "Missing specifier").
      const mod: Record<string, any> =
        currentVariant === "solid"
          ? await import(`@heroicons/vue/24/solid/${name}.js`)
          : await import(`@heroicons/vue/24/outline/${name}.js`)
      const comp = mod[name] ?? mod.default
      if (comp) {
        heroIcon.value = comp
        return true
      }
    } catch {
      // нет такой heroicon — попробуем Iconify ниже
    }
    return false
  }

  watch(
    [() => type.value, () => variant.value],
    async ([value, currentVariant]) => {
      heroIcon.value = undefined
      isViewIcon.value = false
      const resolved = await resolveHeroIcon(value, currentVariant)
      if (!resolved) isViewIcon.value = await isIcon(value)
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
