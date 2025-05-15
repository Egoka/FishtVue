<script setup lang="ts">
  import { cn } from "#imports"

  // const localePath = useLocalePath()

  interface ProseComponent {
    title: string
    subtitle: string
    link?: string
    class?: string
  }

  const props = defineProps<ProseComponent>()
  const slots = useSlots()

  const title = computed(() => props.title ?? "")
  const subtitle = computed(() => props.subtitle ?? "")
  const link = computed(() => props.link ?? "")

  // function open(linkTo: string) {
  //   if (!linkTo) return
  //   navigateTo(localePath(linkTo))
  // }
</script>

<template>
  <div
    :class="
      cn(
        link ? 'cursor-pointer' : '',
        'group flex flex-col items-start p-6',
        'rounded-xl border border-stone-200 dark:border-stone-800 hover:border-theme-400/80 hover:dark:border-theme-800/40',
        'bg-gray-200/50 hover:bg-stone-200/50 dark:bg-stone-900/50 dark:hover:bg-stone-950/50',
        'transition-all duration-500',
        props.class
      )
    ">
    <!--    @click="open(link)"-->
    <!--    <div v-if="link" class="relative -right-[97%]">-->
    <!--      <AppIcons-->
    <!--          icon="uim:arrow-up-right"-->
    <!--          class="absolute size-5 shrink-0 opacity-0 group-hover:opacity-100 text-transparent dark:text-transparent group-hover:text-theme-600 group-hover:dark:text-theme-500 transition-all duration-200 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></AppIcons>-->
    <!--    </div>-->
    <div>
      <div class="font-semibold text-lg mb-1">{{ title }}</div>
      <div class="text-stone-600 dark:text-stone-400 font-medium">{{ subtitle }}</div>
    </div>
    <div v-if="slots?.default" class="flex justify-center flex-shrink-0 mx-auto mt-4" @click.stop>
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
