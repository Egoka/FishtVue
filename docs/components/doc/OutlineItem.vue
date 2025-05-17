<script setup lang="ts">
  import type { TocLink } from "~/app.config"

  defineProps<{
    headers: TocLink[] | undefined
    root?: boolean
  }>()

  function onClick(event: Event) {
    event.preventDefault()
    const target = event.target as HTMLAnchorElement
    const id = target.href!.split("#")[1]
    const heading = document.getElementById(decodeURIComponent(id))

    if (heading) {
      // Получаем позицию элемента
      const elementPosition = heading.getBoundingClientRect().top
      // Учитываем текущий скролл
      const offsetPosition = elementPosition + window.pageYOffset
      // Добавляем отступ для fixed header (100px)
      const finalPosition = offsetPosition - 100

      window.scrollTo({
        top: finalPosition,
        behavior: "smooth"
      })

      // Устанавливаем фокус после завершения скролла
      setTimeout(() => {
        heading.focus({ preventScroll: true })
        // Обновляем URL с хэшем без перезагрузки страницы
        history.pushState(null, "", `#${id}`)
      }, 800) // Задержка для завершения анимации скролла
    }
  }

  const classLink = ref(
    "block whitespace-nowrap overflow-hidden text-ellipsis text-neutral-600  dark:text-neutral-400 data-[active]:text-neutral-800 dark:data-[active]:text-neutral-200 hover:text-neutral-800  dark:hover:text-neutral-200 text-sm leading-8 w-full transition-colors duration-300"
  )
</script>

<template>
  <ul :class="root ? 'root' : 'nested'">
    <li v-for="{ children, id, text } in headers" :key="text">
      <NuxtLink
        :class="[root ? 'font-medium' : '', 'outline-link', classLink]"
        :href="`#${id}`"
        :title="text"
        @click="onClick">
        {{ text }}
      </NuxtLink>
      <template v-if="children?.length">
        <DocOutlineItem :headers="children" />
      </template>
    </li>
  </ul>
</template>

<style scoped>
  .root {
    position: relative;
    z-index: 1;
    padding-right: 16px;
    padding-left: 16px;
  }

  .nested {
    padding-left: 16px;
  }

  .outline-link.nested {
    padding-left: 13px;
  }
</style>
