<script setup lang="ts">
import {openAlert} from "#fishtvue/alert"
import type {MenuStyles} from "#fishtvue/menu"
import {groupHorizontal} from "~/components/demo/menu/dataForExamples";
const {t} = useI18n()
const styles = reactive<MenuStyles>({})
</script>

<template>
  <div class="flex flex-wrap justify-center">
    <Select
        :label="t('label.width')"
        :help="t('help.width')"
        class-select="justify-end pr-px"
        :data-select="[200, 300, 400, 500, 600, 700]"
        no-query
        v-model="styles.width"
        class-body="m-2 w-52"
        clear>
      <template v-if="styles.width" #after>px</template>
      <template #item="{item}">
        {{item.value}}px
      </template>
    </Select>
    <Select
        :label="t('label.height')"
        :help="t('help.height')"
        class-select="justify-end pr-px"
        :data-select="[100, 200, 300, 400]"
        no-query
        v-model="styles.height"
        class-body="m-2 w-52"
        clear>
      <template v-if="styles.height" #after>px</template>
      <template #item="{item}">
        {{item.value}}px
      </template>
    </Select>
  </div>
  <Menu
      :title="t('title.myAccount')"
      :groups="groupHorizontal()"
      :separator="{gradient:[10,50], icon: 'gala:add'}"
      :styles="{
        width: styles.width,
        height: styles.height,
      }"
      @on-click="(_:any, item:any) => openAlert({title: item.title, displayTime: 2000})"/>
</template>