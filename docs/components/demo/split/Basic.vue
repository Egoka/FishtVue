<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const panelsBody = ref([
    { name: "toolbar", size: 50, disabled: true, class: "border-b border-gray-200 dark:border-gray-800" },
    { name: "window", class: "h-[400px]" },
    { name: "footer", size: 80, minSize: 30, maxSize: 220 }
  ])
  const panelsWindow = ref([
    { name: "siteBar", size: 40, minSize: 40, maxSize: 120, class: "p-1" },
    { name: "workspace", minSize: 40, class: "p-1" },
    { name: "tools", size: 100, minSize: 30, maxSize: 320 }
  ])
  const panelsTools = ref([
    { name: "tool1", minSize: 20, class: "p-1" },
    { name: "tool2", minSize: 20, class: "p-1" },
    { name: "tool3", minSize: 20, class: "p-1" }
  ])
  const panelsFooter = ref([
    { name: "listBranches", size: 120, minSize: 40, maxSize: 120, class: "p-1" },
    { name: "listCommits", class: "p-1" },
    { name: "infoCommit", size: 180, minSize: 40, maxSize: 320 }
  ])
  const panelsInfoCommit = ref([
    { name: "messageCommit", minSize: 20, class: "p-1" },
    { name: "detailsCommit", minSize: 20, class: "p-1" }
  ])
  const classBlock = ref(
    "w-full h-full p-1 flex justify-center items-center overflow-auto border border-gray-200 dark:border-gray-800 rounded-sm"
  )
</script>
<template>
  <Split
    :panels="panelsBody"
    units="pixels"
    direction="vertical"
    class="h-[30rem] border-b rounded-lg border border-gray-200 dark:border-gray-800">
    <template #toolbar>
      <div
        class="h-full rounded-t-lg w-full py-2 transition-all duration-500 md:h-full text-neutral-600 dark:text-neutral-400 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div class="flex items-center justify-between mx-auto px-6">
          <div class="w-full justify-between md:justify-normal flex items-center gap-8">
            <a href="/" class="flex items-center gap-3">
              <AppLogo class="size-5 fill-neutral-500 dark:fill-neutral-400 mr-2" />
              <span class="font-asap font-bold tracking-wide text-xl md:text-2xl text-neutral-600 dark:text-neutral-200"
                >Fisht</span
              ></a
            >
          </div>
        </div>
      </div>
    </template>
    <template #window>
      <Split :panels="panelsWindow" units="pixels" direction="horizontal">
        <template #siteBar>
          <div :class="['custom-panel-bar', classBlock, 'text-red-500 dark:text-red-400']">
            {{ t("title.siteBar") }}
          </div>
        </template>
        <template #workspace>
          <div :class="['custom-panel-workspace', classBlock, 'text-theme-500 dark:text-theme-400']">
            {{ t("title.Workspace") }}
          </div>
        </template>
        <template #tools>
          <Split :panels="panelsTools" direction="vertical">
            <template #tool1>
              <div :class="['custom-panel-tool', classBlock, 'text-orange-500 dark:text-orange-300']">
                {{ t("title.firstTool") }}
              </div>
            </template>
            <template #tool2>
              <div :class="['custom-panel-tool', classBlock, 'text-orange-500 dark:text-orange-300']">
                {{ t("title.secondTool") }}
              </div>
            </template>
            <template #tool3>
              <div :class="['custom-panel-tool', classBlock, 'text-orange-500 dark:text-orange-300']">
                {{ t("title.thirdTool") }}
              </div>
            </template>
          </Split>
        </template>
      </Split>
    </template>
    <template #footer>
      <div
        class="h-full rounded-b-lg w-full transition-all duration-500 text-neutral-600 dark:text-neutral-400 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <Split :panels="panelsFooter" units="pixels" direction="horizontal">
          <template #listBranches>
            <div :class="['custom-panel-git', classBlock, 'text-blue-500 dark:text-blue-300']">
              {{ t("title.listBranches") }}
            </div>
          </template>
          <template #listCommits>
            <div :class="['custom-panel-git', classBlock, 'text-blue-500 dark:text-blue-300']">
              {{ t("title.listCommits") }}
            </div>
          </template>
          <template #infoCommit>
            <Split :panels="panelsInfoCommit" direction="vertical">
              <template #messageCommit>
                <div :class="['custom-panel-git', classBlock, 'text-blue-500 dark:text-blue-300']">
                  {{ t("title.messageCommit") }}
                </div>
              </template>
              <template #detailsCommit>
                <div :class="['custom-panel-git', classBlock, 'text-blue-500 dark:text-blue-300']">
                  {{ t("title.detailsCommit") }}
                </div>
              </template>
            </Split>
          </template>
        </Split>
      </div>
    </template>
  </Split>
</template>
<style scoped>
  :deep(.custom-panel) {
    --pattern-fg: color-mix(in oklab, var(--color-neutral-500) 30%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }

  :deep(.custom-panel-bar) {
    --pattern-fg: color-mix(in oklab, var(--color-red-500) 30%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
  :deep(.custom-panel-tool) {
    --pattern-fg: color-mix(in oklab, var(--color-orange-500) 30%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }

  :deep(.custom-panel-git) {
    --pattern-fg: color-mix(in oklab, var(--color-blue-500) 30%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }

  :deep(.custom-panel-workspace) {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 30%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>
