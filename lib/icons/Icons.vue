<script setup lang="ts">
  import { computed, onMounted, ref, watch } from "vue"
  import type { IconsExpose, IconsProps } from "./Icons"
  import { convertToCamelCase } from "fishtvue/utils/stringHandler"
  // ---------------------------------------
  import * as HeroIconsOutline from "@heroicons/vue/24/outline"
  import * as HeroIconsSolid from "@heroicons/vue/24/solid"
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
  // ---REF-LINK----------------------------
  const heroIcons: Record<NonNullable<IconsProps["stileIcon"]>, any> = {
    outline: HeroIconsOutline,
    solid: HeroIconsSolid
  }
  const isViewIcon = ref(false)
  // ---PROPS-------------------------------
  const type = computed(() => props.type)
  const stileIcon = computed(() => props.stileIcon ?? "outline")
  const style = computed(() => props.style)
  const classIcon = computed(() =>
    Icons.setStyle([
      "h-5 w-5 text-gray-900 dark:text-gray-100",
      options?.class ?? "",
      props?.class ?? "",
      "select-none"
    ])
  )

  const heroIcon = ref<any | undefined>(heroIcons[stileIcon.value][convertToCamelCase(type.value) + "Icon"])
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

  onMounted(async () => {
    Icons.initStyle()
  })
  watch(
    () => type.value,
    async (value) => {
      const heroI = heroIcons[stileIcon.value][convertToCamelCase(value) + "Icon"]
      if (!heroI) isViewIcon.value = await isIcon(value)
      else heroIcon.value = heroI
    },
    { immediate: true }
  )
  // ---------------------------------------
  defineExpose<IconsExpose>({
    // ---PROPS-------------------------
    type,
    classIcon,
    style
  })
</script>

<template>
  <i data-icon>
    <component v-if="heroIcon" :is="heroIcon" :class="classIcon" :style="style" aria-hidden="true" />
    <Icon v-else-if="isViewIcon" :icon="type" :class="classIcon" :style="style" aria-hidden="true" />
  </i>
</template>
