<script lang="ts">
  import type { ButtonProps } from "fishtvue/button"
  import type { NuxtLinkProps } from "#app/components/nuxt-link"

  export interface PageHeaderProps {
    headline?: string
    title?: string
    description?: string
    /**
     * Display a list of Button next to the title.
     * `{ color: 'neutral', variant: 'outline' }`{lang="ts-type"}
     */
    links?: Array<
      ButtonProps & {
        label?: string
        to?: NuxtLinkProps["to"]
        target?: NuxtLinkProps["target"]
      }
    >
    class?: any
  }

  export interface PageHeaderSlots {
    headline(props?: {}): any

    title(props?: {}): any

    description(props?: {}): any

    links(props?: {}): any

    default(props?: {}): any
  }
</script>

<script setup lang="ts">
  defineProps<PageHeaderProps>()
  const slots = defineSlots<PageHeaderSlots>()
</script>

<template>
  <div class="relative border-b border-b-neutral-200 dark:border-b-neutral-700 py-8">
    <div
      v-if="headline || !!slots.headline"
      class="mb-2.5 text-sm font-semibold text-theme-500 dark:text-theme-400 flex items-center gap-1.5">
      <slot name="headline">
        {{ headline }}
      </slot>
    </div>

    <div class="">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1
          v-if="title || !!slots.title"
          class="font-asap tracking-wide text-3xl sm:text-4xl text-pretty font-bold text-neutral-900 dark:text-white">
          <slot name="title">
            {{ title }}
          </slot>
        </h1>

        <div v-if="links?.length || !!slots.links" class="flex flex-wrap items-center gap-1.5">
          <slot name="links">
            <NuxtLink v-for="(link, index) in links" :key="index" :to="link.to" :target="link.target ?? '_blank'">
              <Button color="neutral" variant="outline" :classIcon="link?.icon" v-bind="link">
                {{ link.label }}
              </Button>
            </NuxtLink>
          </slot>
        </div>
      </div>

      <div
        v-if="description || !!slots.description"
        class="font-asap text-lg text-pretty text-neutral-500 dark:text-neutral-400 mt-4">
        <slot name="description">
          {{ description }}
        </slot>
      </div>

      <slot />
    </div>
  </div>
</template>
