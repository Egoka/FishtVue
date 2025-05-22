<script setup lang="ts">
  import { SpeedInsights } from "@vercel/speed-insights/nuxt"
  import { Analytics } from "@vercel/analytics/nuxt"
</script>
<template>
  <AppHeader />
  <div class="max-w-[1440px] w-full h-full grow">
    <div class="w-full">
      <DocBackground />
      <main>
        <slot />
      </main>
    </div>
  </div>
  <SpeedInsights />
  <Analytics />
  <AppFooter />
</template>
