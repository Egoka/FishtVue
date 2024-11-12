<script setup lang="ts">
  import { computed, onMounted, ref } from "vue"
  import type { IconsProps, IconsExpose } from "./Icons"
  import { convertToCamelCase } from "fishtvue/utils/stringHandler"
  // ---------------------------------------
  import * as HeroIcons from "@heroicons/vue/24/solid"
  // ---------------------------------------
  // https://icon-sets.iconify.design/
  import { Icon, type IconifyIconName, loadIcons } from "@iconify/vue"
  // ---------------------------------------
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Icons = new Component<"Icons">()
  const options = Icons.getOptions()
  const prefix = Icons.getPrefix()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<IconsProps>()
  // ---REF-LINK----------------------------
  const heroIcons: any = HeroIcons
  const isViewIcon = ref(false)
  // ---PROPS-------------------------------
  const type = computed(() => props.type)
  const style = computed(() => props.style)
  const classIcon = computed(() =>
    Icons.setStyle(["h-5 w-5 text-gray-900 dark:text-gray-100", options?.class ?? "", props.class, "select-none"])
  )
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
    if (!heroIcons[convertToCamelCase(type.value) + "Icon"]) {
      isViewIcon.value = await isIcon(type.value)
    }
  })
  // ---------------------------------------
  defineExpose<IconsExpose>({
    // ---PROPS-------------------------
    type,
    classIcon,
    style
  })
</script>

<template>
  <i :class="`${prefix}icons`">
    <component
      v-if="heroIcons[convertToCamelCase(type) + 'Icon']"
      :is="heroIcons[convertToCamelCase(type) + 'Icon']"
      :class="classIcon"
      :style="style"
      aria-hidden="true" />
    <Icon v-else-if="isViewIcon" :icon="type" :class="classIcon" :style="style" aria-hidden="true" />
  </i>
</template>
