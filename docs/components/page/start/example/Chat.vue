<script setup lang="ts">
  import { activeChat, chatPanels, chatsData } from "~/components/page/start/dataExemple"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const panels = ref(chatPanels())
  const chats = ref(chatsData())
  const chat = ref(activeChat())
  const activationChat = ref("Fisht Team")
  const chatContainer = ref<HTMLElement | null>(null)

  const scrollToBottom = () => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }

  onMounted(() => {
    scrollToBottom()
  })

  watch(chat, () => {
    nextTick(() => {
      scrollToBottom()
    })
  })
</script>

<template>
  <Split :panels="panels" :styles="{ separator: 'bg-black/10 dark:bg-white/20' }">
    <template #chats>
      <div class="overflow-auto flex flex-col gap-6 h-[82vh] max-h-[1040px]">
        <div class="flex flex-col gap-6 pt-7 pb-2 -mb-2 px-5 sticky top-0 bg-stone-100 dark:bg-stone-900 z-11">
          <div class="flex items-center justify-between gap-6 text-color">
            <div class="text-2xl font-medium text-black dark:text-zinc-300">{{ t("start.example.chat.title") }}</div>
            <Button type="icon" icon="plus" mode="ghost"> {{ t("button.add") }}</Button>
          </div>
        </div>
        <div class="pr-5 pl-2">
          <Input mode="filled" class="bg-black/10 dark:bg-white/5" :placeholder="t('Search')">
            <template #before>
              <Icons type="magnifying-glass" class="size-4 text-neutral-400 dark:text-neutral-500" />
            </template>
          </Input>
        </div>
        <div class="flex-1 flex flex-col">
          <div
            v-for="chatItem in chats"
            :key="chatItem.name"
            :class="[chatItem.name === activationChat ? 'bg-black/10 dark:bg-white/5' : '']"
            class="flex items-center gap-2 p-4 mt-2 cursor-pointer rounded-l-3xl hover:bg-black/10 dark:hover:bg-white/5 transition-all">
            <div v-if="chatItem.avatar" class="relative">
              <div
                v-if="chatItem.isOnline"
                class="absolute top-0 right-0 p-[1px] bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center">
                <span
                  class="bg-green-500 text-white size-2 min-w-2 rounded-full p-0 inline-flex items-center justify-center text-xs"></span>
              </div>
              <div
                class="inline-flex items-center justify-center bg-transparent rounded-full size-12 text-2xl font-medium">
                <img
                  :src="`/avatars/${chatItem.avatar}`"
                  alt="avatar"
                  class="rounded-full h-full min-w-full object-cover" />
              </div>
            </div>
            <div class="flex-1">
              <div class="flex items-start gap-1 justify-between">
                <div class="text-color font-medium leading-6">{{ chatItem.name }}</div>
                <div class="text-sm text-muted-color leading-5">{{ chatItem.time }}</div>
              </div>
              <div class="flex items-center gap-5 justify-between mt-1">
                <div class="text-neutral-400 dark:text-neutral-500 text-sm leading-5 line-clamp-1">
                  {{ chatItem.message }}
                </div>
                <Badge v-if="chatItem.newMessages" class="rounded-full">{{ chatItem.newMessages }}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #chat>
      <div class="flex flex-col h-[82vh] max-h-[1040px]">
        <div class="flex justify-between items-center p-4 gap-7 border-b border-black/10 dark:border-white/20">
          <div class="flex items-center">
            <div
              class="inline-flex items-center justify-center bg-transparent rounded-full size-12 text-2xl font-medium mr-2">
              <img
                :src="`/avatars/${chats[0].avatar}`"
                alt="avatar"
                class="rounded-full h-full min-w-full object-cover" />
            </div>
            <div class="flex-1">
              <div class="text-color leading-6 cursor-pointer hover:text-muted-color-emphasis transition-colors">
                {{ chats[0].name }}
              </div>
              <div class="text-muted-color leading-5 line-clamp-1 mt-1">
                {{
                  chats
                    .slice(1, 5)
                    .map((i) => i.name)
                    .join(", ")
                }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-3">
            <Button type="icon" icon="phone" mode="ghost"> {{ t("button.add") }}</Button>
            <Button type="icon" icon="magnifying-glass" mode="ghost"> {{ t("button.search") }}</Button>
            <Button type="icon" icon="ellipsis-horizontal" mode="ghost"> {{ t("button.more") }}</Button>
          </div>
        </div>
        <div ref="chatContainer" class="flex-1 overflow-y-auto flex flex-col gap-8 py-8 px-6">
          <div
            v-for="(item, key) in chat"
            :key="key"
            class="flex items-start min-w-64 w-fit max-w-[60%]"
            :class="[item.isMe ? 'ml-auto mr-0 flex-row-reverse' : '']">
            <div
              class="flex items-center gap-2 sticky top-0 transition-all"
              :class="[item.isMe ? 'flex-row-reverse' : '']">
              <div
                class="inline-flex items-center justify-center bg-transparent rounded-full size-10 text-sm font-medium">
                <img
                  :src="`/avatars/${item.avatar}`"
                  alt="avatar"
                  class="rounded-full h-full min-w-full object-cover" />
              </div>
              <div>
                <svg
                  class="fill-black/10 dark:fill-white/5"
                  :class="[item.isMe ? 'rotate-180' : '']"
                  xmlns="http://www.w3.org/2000/svg"
                  width="7"
                  height="11"
                  viewBox="0 0 7 11"
                  fill="none">
                  <path
                    d="M1.79256 7.09551C0.516424 6.31565 0.516426 4.46224 1.79256 3.68238L7 0.500055L7 10.2778L1.79256 7.09551Z"></path>
                </svg>
              </div>
            </div>
            <div class="flex-1 bg-black/10 dark:bg-white/5 px-2 py-1 rounded-lg">
              <p class="font-bold text-color leading-6 mb-0">{{ item.name }}</p>
              <p class="text-color leading-6 mb-0">{{ item.message }}</p>
            </div>
          </div>
        </div>
        <div class="p-4 flex items-end justify-between gap-2 border-t border-black/10 dark:border-white/20">
          <div class="flex items-end gap-1 flex-1">
            <Button type="icon" icon="face-smile" mode="ghost"> {{ t("button.add") }}</Button>
            <Button type="icon" icon="paper-clip" mode="ghost"> {{ t("button.add") }}</Button>
            <Aria :rows="1" width="100%"></Aria>
          </div>
          <Button type="icon" icon="lucide:send" mode="ghost"> {{ t("button.add") }}</Button>
        </div>
      </div>
    </template>
  </Split>
</template>
