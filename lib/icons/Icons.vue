<script lang="ts">
  // ---------------------------------------
  // Issue 1 (icons.md): heroicons подключаются через tree-shakeable const-реестр explicit
  // named-импортов (НЕ namespace `import *`). При namespace + dynamic `set[name]` bundler не
  // мог tree-shake'ить → весь набор (648 иконок, ~94 KB gzip) попадал в bundle потребителя.
  // Explicit named-импорты статичны → bundler оставляет только curated-набор.
  //
  // Реестр покрывает 37 имён: 30 публичных (`HeroIconName`, Icons.d.ts) + 7 internal, которые
  // `lib/`-компоненты хардкодят через <Icons type=...> (arrow-long-right — Calendar,
  // arrows-pointing-in/out — Split, ellipsis-vertical — Calendar/Table, exclamation-circle —
  // InputLayout, funnel — Table, square-2-stack — Table). Имя вне реестра → Iconify-fallback.
  //
  // Lookup синхронный (resolveHeroIcon → heroIcon до первого await в immediate-watcher) → иконка
  // попадает в SSR-HTML и на первый paint; корректно в prod-Vite и любом bundler. Реестры — в
  // module-scope <script> (а не setup), чтобы создаваться один раз, а не на каждый инстанс.
  // ---------------------------------------
  import {
    CheckIcon,
    XMarkIcon,
    UserIcon,
    UsersIcon,
    HomeIcon,
    Cog6ToothIcon,
    BellIcon,
    EnvelopeIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    MinusIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    TrashIcon,
    PencilIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    LockOpenIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    QuestionMarkCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowLongRightIcon,
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon,
    EllipsisVerticalIcon,
    ExclamationCircleIcon,
    FunnelIcon,
    Square2StackIcon
  } from "@heroicons/vue/24/outline"
  import {
    CheckIcon as CheckIconSolid,
    XMarkIcon as XMarkIconSolid,
    UserIcon as UserIconSolid,
    UsersIcon as UsersIconSolid,
    HomeIcon as HomeIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
    BellIcon as BellIconSolid,
    EnvelopeIcon as EnvelopeIconSolid,
    MagnifyingGlassIcon as MagnifyingGlassIconSolid,
    PlusIcon as PlusIconSolid,
    MinusIcon as MinusIconSolid,
    ChevronUpIcon as ChevronUpIconSolid,
    ChevronDownIcon as ChevronDownIconSolid,
    ChevronLeftIcon as ChevronLeftIconSolid,
    ChevronRightIcon as ChevronRightIconSolid,
    ArrowUpIcon as ArrowUpIconSolid,
    ArrowDownIcon as ArrowDownIconSolid,
    ArrowLeftIcon as ArrowLeftIconSolid,
    ArrowRightIcon as ArrowRightIconSolid,
    TrashIcon as TrashIconSolid,
    PencilIcon as PencilIconSolid,
    EyeIcon as EyeIconSolid,
    EyeSlashIcon as EyeSlashIconSolid,
    LockClosedIcon as LockClosedIconSolid,
    LockOpenIcon as LockOpenIconSolid,
    ExclamationTriangleIcon as ExclamationTriangleIconSolid,
    InformationCircleIcon as InformationCircleIconSolid,
    QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    XCircleIcon as XCircleIconSolid,
    ArrowLongRightIcon as ArrowLongRightIconSolid,
    ArrowsPointingInIcon as ArrowsPointingInIconSolid,
    ArrowsPointingOutIcon as ArrowsPointingOutIconSolid,
    EllipsisVerticalIcon as EllipsisVerticalIconSolid,
    ExclamationCircleIcon as ExclamationCircleIconSolid,
    FunnelIcon as FunnelIconSolid,
    Square2StackIcon as Square2StackIconSolid
  } from "@heroicons/vue/24/solid"

  // Ключи реестра — PascalCase + "Icon", т.е. ровно то, что даёт `convertToCamelCase(type) + "Icon"`.
  const HERO_OUTLINE: Record<string, unknown> = {
    CheckIcon,
    XMarkIcon,
    UserIcon,
    UsersIcon,
    HomeIcon,
    Cog6ToothIcon,
    BellIcon,
    EnvelopeIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    MinusIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    TrashIcon,
    PencilIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    LockOpenIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    QuestionMarkCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowLongRightIcon,
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon,
    EllipsisVerticalIcon,
    ExclamationCircleIcon,
    FunnelIcon,
    Square2StackIcon
  }
  const HERO_SOLID: Record<string, unknown> = {
    CheckIcon: CheckIconSolid,
    XMarkIcon: XMarkIconSolid,
    UserIcon: UserIconSolid,
    UsersIcon: UsersIconSolid,
    HomeIcon: HomeIconSolid,
    Cog6ToothIcon: Cog6ToothIconSolid,
    BellIcon: BellIconSolid,
    EnvelopeIcon: EnvelopeIconSolid,
    MagnifyingGlassIcon: MagnifyingGlassIconSolid,
    PlusIcon: PlusIconSolid,
    MinusIcon: MinusIconSolid,
    ChevronUpIcon: ChevronUpIconSolid,
    ChevronDownIcon: ChevronDownIconSolid,
    ChevronLeftIcon: ChevronLeftIconSolid,
    ChevronRightIcon: ChevronRightIconSolid,
    ArrowUpIcon: ArrowUpIconSolid,
    ArrowDownIcon: ArrowDownIconSolid,
    ArrowLeftIcon: ArrowLeftIconSolid,
    ArrowRightIcon: ArrowRightIconSolid,
    TrashIcon: TrashIconSolid,
    PencilIcon: PencilIconSolid,
    EyeIcon: EyeIconSolid,
    EyeSlashIcon: EyeSlashIconSolid,
    LockClosedIcon: LockClosedIconSolid,
    LockOpenIcon: LockOpenIconSolid,
    ExclamationTriangleIcon: ExclamationTriangleIconSolid,
    InformationCircleIcon: InformationCircleIconSolid,
    QuestionMarkCircleIcon: QuestionMarkCircleIconSolid,
    CheckCircleIcon: CheckCircleIconSolid,
    XCircleIcon: XCircleIconSolid,
    ArrowLongRightIcon: ArrowLongRightIconSolid,
    ArrowsPointingInIcon: ArrowsPointingInIconSolid,
    ArrowsPointingOutIcon: ArrowsPointingOutIconSolid,
    EllipsisVerticalIcon: EllipsisVerticalIconSolid,
    ExclamationCircleIcon: ExclamationCircleIconSolid,
    FunnelIcon: FunnelIconSolid,
    Square2StackIcon: Square2StackIconSolid
  }
</script>

<script setup lang="ts">
  import { computed, markRaw, ref, watch } from "vue"
  import type { IconsClassKey, IconsProps } from "./Icons"
  import { convertToCamelCase } from "fishtvue/utils/stringHandler"
  // ---------------------------------------
  // https://icon-sets.iconify.design/ — fallback для имён вне heroicons-реестра (см. module-scope <script>)
  import { Icon, type IconifyIconName, loadIcons } from "@iconify/vue"
  // ---------------------------------------
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Icons = new Component<"Icons">()
  const options = Icons.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<IconsProps>()
  const { cls } = Icons.resolveClasses<IconsClassKey>(props)
  // ---REF-LINK----------------------------
  const isViewIcon = ref(false)
  // ---PROPS-------------------------------
  const type = computed(() => props.type)
  const variant = computed<"outline" | "solid">(() => props.variant ?? options?.variant ?? "outline")
  const label = computed<string | undefined>(() => (props.label ? props.label : undefined))
  const style = computed(() => props.style)
  // props 1.0 (решение 6): база размера/цвета — на корне <i data-icon>, чтобы `class` был корнем
  // (dev-patterns §2 A). svg растягивается на бокс и наследует color/fill/stroke — hand-off'ы
  // `class="h-4 w-4 text-…"` из Button/Badge/Menu продолжают работать без правок.
  const classBase = computed(() =>
    cls("root", "inline-block shrink-0 h-5 w-5 text-surface-900 dark:text-surface-100 select-none")
  )
  const classIcon = computed(() => cls("icon", "block h-full w-full"))

  const heroIcon = ref<any | undefined>(undefined)
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

  // `Icons.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84).

  // Issue 1: sync lookup heroicon по PascalCase-имени в const-реестре (HERO_OUTLINE/HERO_SOLID,
  // module-scope <script>). На успех — кладём компонент в `heroIcon`; на отсутствие (имя вне
  // curated-реестра) — false (fallback на Iconify ниже). Значение реестра — heroicons
  // render-функция, валидна как `:is` (functional component).
  function resolveHeroIcon(value: string, currentVariant: "outline" | "solid"): boolean {
    const name = convertToCamelCase(value) + "Icon"
    const set = currentVariant === "solid" ? HERO_SOLID : HERO_OUTLINE
    const comp = set[name]
    if (comp) {
      // heroicons экспортируют функциональные компоненты, а у них сквозь проваливаются только
      // class/style/on* (`getFunctionalFallthrough` в runtime-core) — `data-icon-svg` до svg не доезжал.
      // Оборачиваем render в options-компонент: полный attrs-fallthrough, инстанс на иконку копеечный.
      heroIcon.value = markRaw({ name, render: comp as (...args: unknown[]) => unknown })
      return true
    }
    return false
  }

  watch(
    [() => type.value, () => variant.value],
    async ([value, currentVariant]) => {
      heroIcon.value = undefined
      isViewIcon.value = false
      // sync — heroIcon резолвится до первого await (доступен в SSR-HTML и на первом paint)
      if (resolveHeroIcon(value, currentVariant)) return
      // не heroicon → пробуем Iconify (async: CDN / offline-коллекция)
      isViewIcon.value = await isIcon(value)
    },
    { immediate: true }
  )
  // ---------------------------------------
  defineExpose({
    // ---PROPS-------------------------
    type,
    variant,
    label,
    classBase,
    classIcon,
    style
  })
</script>

<template>
  <i data-icon :role="label ? 'img' : undefined" :aria-label="label" :class="classBase" :style="style">
    <component v-if="heroIcon" :is="heroIcon" data-icon-svg :class="classIcon" />
    <Icon v-else-if="isViewIcon" :icon="type" data-icon-svg :class="classIcon" aria-hidden="true" />
  </i>
</template>
