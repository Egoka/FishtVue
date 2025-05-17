<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  import { dataMails, mailsPanels, menuMails } from "~/components/page/start/dataExemple"
  import type { Panel } from "fishtvue/split"
  import type { MenuExpose } from "fishtvue/menu"
  import { openAlert } from "fishtvue/alert"

  const { t } = useI18n()
  const panels = ref(mailsPanels())
  const menu = ref(menuMails())
  const mails = ref(dataMails())
  const isOnlyIcons = ref(false)
  const muteThisThread = ref(false)
  const mailsMenu = ref<MenuExpose>()
  const message = ref("")

  function updateSize(panels: Record<Panel["name"], number>) {
    if ("menu" in panels) isOnlyIcons.value = Math.round(panels.menu) < 120
  }

  const activeMail = ref<number>(0)

  function switchMail(key: number) {
    activeMail.value = key
    muteThisThread.value = false
  }

  onMounted(() => {
    mailsMenu.value?.setSelectedItem(mailsMenu.value?.listGroups[0]?.items?.[0]["_key"] ?? "")
  })

  function send() {
    message.value = ""
    openAlert({
      type: "success",
      title: "Letter Sent",
      subtitle: `To ${mails.value[activeMail.value].email}`,
      toTeleport: ".mail-box",
      displayTime: 3000,
      position: "top-right"
    })
  }
</script>

<template>
  <Split
    :panels="panels"
    units="pixels"
    :styles="{ separator: 'bg-black/5 dark:bg-white/5' }"
    class="overflow-auto"
    @updated-panels="updateSize">
    <template #menu>
      <div class="mr-3 h-full">
        <Menu
          ref="mailsMenu"
          :groups="menu"
          class="bg-transparent dark:bg-transparent shadow-none border-0 min-w-[64px]"
          :onlyIcons="isOnlyIcons"
          :styles="{
            height: '100%',
            width: '100%',
            class: {
              title: 'bg-transparent dark:bg-transparent',
              item: 'justify-around',
              group: 'gap-3'
            }
          }">
          <template #title>
            <div
              class="flex items-center justify-between"
              :class="[!isOnlyIcons ? 'justify-between' : 'justify-center']">
              <div v-show="!isOnlyIcons" class="text-2xl font-medium">{{ t("start.example.inbox.title") }}</div>
              <Button size="sm" type="icon" icon="plus" mode="ghost"></Button>
            </div>
          </template>
        </Menu>
      </div>
    </template>
    <template #mails>
      <div class="m-3">
        <Input mode="filled" class="bg-black/10 dark:bg-white/5" :placeholder="t('Search')">
          <template #before>
            <Icons type="magnifying-glass" class="size-4 text-neutral-400 dark:text-neutral-500" />
          </template>
        </Input>
      </div>
      <div class="flex flex-col gap-2 mx-3 overflow-y-auto h-[73vh] max-h-[1040px]">
        <div
          v-for="(mail, key) in mails"
          :key="key"
          class="flex flex-col items-start gap-2 rounded-lg w-full border border-black/10 dark:border-white/20 p-3 text-left text-sm transition-all cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
          :class="[key === activeMail ? 'bg-black/10 dark:bg-white/10' : '']"
          @click="switchMail(key)">
          <div class="flex flex-row w-full">
            <div
              class="inline-flex items-center justify-center bg-transparent rounded-full size-12 min-w-12 text-2xl font-medium mr-3">
              <img :src="`/avatars/${mail.avatar}`" alt="avatar" class="rounded-full h-full min-w-full object-cover" />
            </div>
            <div class="flex w-auto flex-col gap-1">
              <div class="flex items-center">
                <div class="flex items-center gap-2">
                  <div class="font-semibold">{{ mail.name }}</div>
                </div>
              </div>
              <div class="text-xs font-medium">{{ mail.title }}</div>
            </div>
            <div class="ml-auto mr-0 text-xs">{{ mail.time }}</div>
          </div>
          <div class="line-clamp-2 text-xs text-muted-foreground">
            {{ mail.text }}
          </div>
          <div v-if="mail.tags.length" class="flex items-center gap-2">
            <Badge v-for="tag in mail.tags" :key="tag" mode="neutral">{{ tag }}</Badge>
          </div>
        </div>
      </div>
    </template>
    <template #mail>
      <div class="mail-box flex h-full flex-col">
        <div class="flex items-center p-2 border-b border-black/5 dark:border-white/5">
          <div class="flex items-center gap-2">
            <Button type="icon" icon="archive-box" mode="ghost"> {{ t("button.Archive") }}</Button>
            <Button type="icon" icon="archive-box-x-mark" mode="ghost"> {{ t("button.moveToJunk") }}</Button>
            <Button type="icon" icon="trash" mode="ghost"> {{ t("button.moveToTrash") }}</Button>
            <Separator vertical class="h-10" />
            <Button type="icon" icon="clock" mode="ghost"> {{ t("button.Snooze") }}</Button>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <Button type="icon" icon="material-symbols:reply-rounded" mode="ghost">{{ t("button.Reply") }}</Button>
            <Button type="icon" icon="material-symbols:reply-all-rounded" mode="ghost"
              >{{ t("button.replyAll") }}
            </Button>
            <Button type="icon" icon="solar:forward-bold" mode="ghost"> {{ t("button.Forward") }}</Button>
          </div>
          <Separator vertical class="h-10" />
          <Button type="icon" icon="ellipsis-vertical" mode="ghost"> {{ t("button.more") }}</Button>
        </div>
        <div class="flex flex-1 flex-col h-[90%]">
          <div class="flex items-start p-4 border-b border-black/5 dark:border-white/5">
            <div class="flex items-start gap-4 text-sm">
              <div
                class="inline-flex items-center justify-center bg-transparent rounded-full size-16 min-w-16 text-2xl font-medium">
                <img
                  :src="`/avatars/${mails[activeMail].avatar}`"
                  alt="avatar"
                  class="rounded-xl h-full min-w-full object-cover" />
              </div>
              <div class="grid gap-1">
                <div class="font-semibold">{{ mails[activeMail].name }}</div>
                <div class="line-clamp-1 text-xs">{{ mails[activeMail].title }}</div>
                <div class="line-clamp-1 text-xs">
                  <span class="font-medium">{{ t("start.example.inbox.replyTo") }}</span>
                  {{ mails[activeMail].email }}
                </div>
              </div>
            </div>
            <div class="ml-auto text-xs text-muted-foreground">{{ mails[activeMail].time }}</div>
          </div>
          <div class="flex-1 whitespace-pre-wrap p-4 text-sm overflow-auto">
            {{ mails[activeMail].text }}
          </div>
          <div class="p-4 pb-0 border-t border-black/5 dark:border-white/5">
            <Aria v-model="message" :placeholder="t('placeholder.Reply', { name: mails[activeMail].name })"></Aria>
            <div class="flex justify-between">
              <Switch v-model="muteThisThread" :label="t('label.muteThisThread')" switchingType="switch"></Switch>
              <Button class="mt-4" color="theme" :disabled="!message.length" @click="send">
                {{ t("button.Send") }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Split>
</template>
