<script lang="ts" setup>
import {openAlert} from "#fishtvue/alert"
import {groupHorizontal} from "~/components/demo/menu/dataForExamples";

const {t} = useI18n()

const classes = reactive({
  body: false,
  title: false,
  separator: false,
  separatorIcon: false,
  group: false,
  groupTitle: false,
  item: false,
  itemIcon: false,
  itemTitle: false,
  itemInfo: false,
  itemRightIcon: false,
})
</script>
<template>
  <div class="flex flex-wrap justify-center">
    <Switch v-model="classes.body" :label="t('label.classBody')" switchingType="switch"/>
    <Switch v-model="classes.title" :label="t('label.classTitle')" switchingType="switch"/>
  </div>
  <div class="flex flex-wrap justify-center">
    <Switch v-model="classes.separator" :label="t('label.classSeparator')" switchingType="switch"/>
    <Switch v-model="classes.separatorIcon" :label="t('label.classSeparatorIcon')" switchingType="switch"/>
  </div>
  <div class="flex flex-wrap justify-center">
    <Switch v-model="classes.group" :label="t('label.classGroup')" switchingType="switch"/>
    <Switch v-model="classes.groupTitle" :label="t('label.classGroupTitle')" switchingType="switch"/>
  </div>
  <div class="flex flex-wrap justify-center">
    <Switch v-model="classes.item" :label="t('label.classItem')" switchingType="switch"/>
    <Switch v-model="classes.itemIcon" :label="t('label.classItemIcon')" switchingType="switch"/>
    <Switch v-model="classes.itemTitle" :label="t('label.classItemTitle')" switchingType="switch"/>
  </div>
  <Separator class="w-full"></Separator>
  <Menu
      :title="t('title.myAccount')"
      :groups="groupHorizontal()"
      :separator="{gradient:[10,50], icon: 'gala:add'}"
      :styles="{
        width: '200px',
        height: '380px',
        class: {
          body: classes.body ? 'custom-body-class': '',
          title: classes.title ? 'custom-title-class': '',
          separator: classes.separator ? 'custom-separator-class': '',
          separatorIcon: classes.separatorIcon ? 'custom-separator-icon-class': '',
          group: classes.group ? 'custom-group-class': '',
          groupTitle: classes.groupTitle ? 'custom-group-title-class': '',
          item: classes.item ? 'custom-item-class': '',
          itemIcon: classes.itemIcon ? 'custom-item-icon-class': '',
          itemTitle: classes.itemTitle ? 'custom-item-title-class': '',
        }
      }"
      @on-click="(_:any, item:any) => openAlert({title: item.title, displayTime: 2000})"/>
</template>
<style scoped>
.custom-body-class{
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-title-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-separator-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-separator-icon-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-group-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-group-title-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-item-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-item-icon-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-item-title-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
</style>