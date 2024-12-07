<script setup lang="ts">
  import { computed, onMounted, ref, useSlots } from "vue"
  import { ButtonProps, ButtonExpose } from "./Button"
  import Icons from "fishtvue/icons/Icons.vue"
  import Loading from "fishtvue/loading/Loading.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Component from "fishtvue/component"
  import { StyleClass } from "fishtvue/types"
  // ---BASE-COMPONENT----------------------
  const Button = new Component<"Button">()
  const options = Button.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<ButtonProps>(), {
    disabled: undefined,
    loading: undefined
  })
  const slots = useSlots()
  // ---STATE-------------------------------
  const buttonRef = ref<HTMLButtonElement>()
  // ---STATE-------------------------------
  const baseClasses = ref(
    "group/button relative gap-2 m-1 h-min rounded inline-flex items-center justify-center leading-none " +
      "focus:outline-none focus-visible:ring-1 " +
      "disabled:opacity-50 disabled:cursor-not-allowed " +
      "data-[loading=true]:cursor-wait " +
      "transition-colors duration-200"
  )
  const modesClasses = ref({
    outline: ["border", "disabled:hover:bg-transparent"],
    ghost: ["disabled:bg-transparent", "disabled:hover:bg-transparent"]
  })
  const textColorsPrimaryClasses = ref({
    theme: [
      "text-theme-50",
      "dark:text-theme-300",
      "hover:text-theme-100",
      "group-hover/button:text-theme-100",
      "dark:hover:text-theme-200",
      "dark:group-hover/button:text-theme-200",
      "disabled:hover:text-theme-200",
      "disabled:group-hover/button:text-theme-200",
      "disabled:dark:hover:text-theme-300",
      "disabled:dark:group-hover/button:text-theme-300"
    ],
    neutral: [
      "text-neutral-800",
      "dark:text-neutral-300",
      "hover:text-neutral-900",
      "group-hover/button:text-neutral-900",
      "dark:hover:text-neutral-200",
      "dark:group-hover/button:text-neutral-200",
      "disabled:hover:text-neutral-800",
      "disabled:group-hover/button:text-neutral-800",
      "disabled:dark:hover:text-neutral-300",
      "disabled:dark:group-hover/button:text-neutral-300"
    ],
    creative: [
      "text-green-100",
      "dark:text-green-300",
      "hover:text-green-100",
      "group-hover/button:text-green-100",
      "dark:hover:text-green-200",
      "dark:group-hover/button:text-green-200",
      "disabled:hover:text-green-200",
      "disabled:group-hover/button:text-green-200",
      "disabled:dark:hover:text-green-300",
      "disabled:dark:group-hover/button:text-green-300"
    ],
    destructive: [
      "text-red-100",
      "dark:text-red-300",
      "hover:text-red-100",
      "group-hover/button:text-red-100",
      "dark:hover:text-red-200",
      "dark:group-hover/button:text-red-200",
      "disabled:hover:text-red-200",
      "disabled:group-hover/button:text-red-200",
      "disabled:dark:hover:text-red-300",
      "disabled:dark:group-hover/button:text-red-300"
    ]
  })
  const backgroundColorsPrimaryClasses = ref({
    theme: [
      "bg-theme-500",
      "hover:bg-theme-400",
      "dark:bg-theme-700",
      "dark:hover:bg-theme-800",
      "disabled:hover:bg-theme-500",
      "disabled:dark:hover:bg-theme-700",
      "active:bg-theme-600",
      "active:dark:bg-theme-700",
      "focus-visible:bg-theme-600",
      "focus-visible:dark:bg-theme-600"
    ],
    neutral: [
      "bg-neutral-200",
      "hover:bg-neutral-200/80",
      "dark:bg-neutral-800",
      "dark:hover:bg-neutral-900",
      "disabled:hover:bg-neutral-200",
      "disabled:dark:hover:bg-neutral-800",
      "active:bg-neutral-300",
      "active:dark:bg-neutral-700",
      "focus-visible:bg-neutral-300",
      "focus-visible:dark:bg-neutral-700"
    ],
    creative: [
      "bg-green-500",
      "hover:bg-green-400",
      "dark:bg-green-800",
      "dark:hover:bg-green-900",
      "disabled:hover:bg-green-500",
      "disabled:dark:hover:bg-green-800",
      "active:bg-green-700",
      "active:dark:bg-green-700",
      "focus-visible:bg-green-600",
      "focus-visible:dark:bg-green-600"
    ],
    destructive: [
      "bg-red-500",
      "hover:bg-red-400",
      "dark:bg-red-800",
      "dark:hover:bg-red-900",
      "disabled:hover:bg-red-500",
      "disabled:dark:hover:bg-red-800",
      "active:bg-red-700",
      "active:dark:bg-red-700",
      "focus-visible:bg-red-600",
      "focus-visible:dark:bg-red-600"
    ]
  })
  const ringColorsPrimaryClasses = ref({
    theme: ["ring-theme-300", "dark:ring-theme-700"],
    neutral: ["ring-neutral-300", "dark:ring-neutral-700"],
    creative: ["ring-green-300", "dark:ring-green-700"],
    destructive: ["ring-red-300", "dark:ring-red-700"]
  })
  const textColorsClasses = ref({
    theme: [
      "text-theme-600",
      "dark:text-theme-400",
      "hover:text-theme-700",
      "group-hover/button:text-theme-700",
      "dark:hover:text-theme-500",
      "dark:group-hover/button:text-theme-500",
      "disabled:hover:text-theme-800",
      "disabled:group-hover/button:text-theme-800",
      "disabled:dark:hover:text-theme-300",
      "disabled:dark:group-hover/button:text-theme-300"
    ],
    neutral: [
      "text-neutral-600",
      "dark:text-neutral-400",
      "hover:text-neutral-700",
      "group-hover/button:text-neutral-700",
      "dark:hover:text-neutral-500",
      "dark:group-hover/button:text-neutral-500",
      "disabled:hover:text-neutral-800",
      "disabled:group-hover/button:text-neutral-800",
      "disabled:dark:hover:text-neutral-300",
      "disabled:dark:group-hover/button:text-neutral-300"
    ],
    creative: [
      "text-green-600",
      "dark:text-green-400",
      "hover:text-green-700",
      "group-hover/button:text-green-700",
      "dark:hover:text-green-500",
      "dark:group-hover/button:text-green-500",
      "disabled:hover:text-green-800",
      "disabled:group-hover/button:text-green-800",
      "disabled:dark:hover:text-green-300",
      "disabled:dark:group-hover/button:text-green-300"
    ],
    destructive: [
      "text-red-600",
      "dark:text-red-400",
      "hover:text-red-700",
      "group-hover/button:text-red-700",
      "dark:hover:text-red-500",
      "dark:group-hover/button:text-red-500",
      "disabled:hover:text-red-800",
      "disabled:group-hover/button:text-red-800",
      "disabled:dark:hover:text-red-300",
      "disabled:dark:group-hover/button:text-red-300"
    ]
  })
  const backgroundColorsClasses = ref({
    theme: [
      "hover:bg-theme-200",
      "dark:hover:bg-theme-900",
      "active:bg-theme-200",
      "focus-visible:bg-theme-200",
      "dark:active:bg-theme-800",
      "dark:focus-visible:bg-theme-800"
    ],
    neutral: [
      "hover:bg-neutral-200",
      "dark:hover:bg-neutral-900",
      "active:bg-neutral-200",
      "dark:active:bg-neutral-800"
    ],
    creative: ["hover:bg-green-100", "dark:hover:bg-green-900", "active:bg-green-200", "dark:active:bg-green-800"],
    destructive: ["hover:bg-red-100", "dark:hover:bg-red-900", "active:bg-red-200", "dark:active:bg-red-800"]
  })
  const ringColorsClasses = ref({
    theme: ["ring-theme-300", "dark:ring-theme-800"],
    neutral: ["ring-neutral-300", "dark:ring-neutral-800"],
    creative: ["ring-green-300", "dark:ring-green-800"],
    destructive: ["ring-red-300", "dark:ring-red-800"]
  })
  // prettier-ignore
  const colorClasses = ref({
    theme: [
      ...textColorsClasses.value.theme,
      ...backgroundColorsClasses.value.theme,
      ...ringColorsClasses.value.theme
    ],
    neutral: [
      ...textColorsClasses.value.neutral,
      ...backgroundColorsClasses.value.neutral,
      ...ringColorsClasses.value.neutral
    ],
    creative: [
      ...textColorsClasses.value.creative,
      ...backgroundColorsClasses.value.creative,
      ...ringColorsClasses.value.creative
    ],
    destructive: [
      ...textColorsClasses.value.destructive,
      ...backgroundColorsClasses.value.destructive,
      ...ringColorsClasses.value.destructive
    ]
  })
  // prettier-ignore
  const modeClasses = ref({
    primary: {
      theme: [
        ...textColorsPrimaryClasses.value.theme,
        ...backgroundColorsPrimaryClasses.value.theme,
        ...ringColorsPrimaryClasses.value.theme
      ],
      neutral: [
        ...textColorsPrimaryClasses.value.neutral,
        ...backgroundColorsPrimaryClasses.value.neutral,
        ...ringColorsPrimaryClasses.value.neutral
      ],
      creative: [
        ...textColorsPrimaryClasses.value.creative,
        ...backgroundColorsPrimaryClasses.value.creative,
        ...ringColorsPrimaryClasses.value.creative
      ],
      destructive: [
        ...textColorsPrimaryClasses.value.destructive,
        ...backgroundColorsPrimaryClasses.value.destructive,
        ...ringColorsPrimaryClasses.value.destructive
      ]
    },
    outline: {
      theme: [...modesClasses.value.outline, ...colorClasses.value.theme, "border-theme-200", "dark:border-theme-700"],
      neutral: [...modesClasses.value.outline, ...colorClasses.value.neutral, "border-neutral-200", "dark:border-neutral-700"],
      creative: [...modesClasses.value.outline, ...colorClasses.value.creative, "border-green-200", "dark:border-green-700"],
      destructive: [...modesClasses.value.outline, ...colorClasses.value.destructive, "border-red-200", "dark:border-red-700"]
    },
    ghost: {
      theme: [...modesClasses.value.ghost, ...colorClasses.value.theme],
      neutral: [...modesClasses.value.ghost, ...colorClasses.value.neutral],
      creative: [...modesClasses.value.ghost, ...colorClasses.value.creative],
      destructive: [...modesClasses.value.ghost, ...colorClasses.value.destructive]
    }
  })
  const sizesClasses = ref({
    xs: ["text-sm", "py-1", "px-3"],
    sm: ["text-sm", "py-1.5", "px-4"],
    md: ["text-sm", "py-2", "px-4"],
    lg: ["text-md", "py-2.5", "px-5"],
    xl: ["text-md", "py-3", "px-6"]
  })
  const sizeClasses = ref({
    button: sizesClasses.value,
    icon: {
      xs: [...sizesClasses.value.xs, "p-0", "h-7", "w-7"],
      sm: [...sizesClasses.value.sm, "p-0", "h-8", "w-8"],
      md: [...sizesClasses.value.md, "p-0", "h-9", "w-9"],
      lg: [...sizesClasses.value.lg, "p-0", "h-11", "w-11"],
      xl: [...sizesClasses.value.xl, "p-0", "h-12", "w-12"]
    }
  })
  const roundedClasses = ref({
    none: "rounded-none",
    lg: "rounded-lg",
    md: "rounded-md",
    full: "rounded-full"
  })
  // ---PROPS-------------------------------
  const type = computed<ButtonProps["type"]>(() => props.type ?? "button")
  const icon = computed<ButtonProps["icon"]>(() => props.icon ?? "")
  const iconPosition = computed<ButtonProps["iconPosition"] | null>(() => props.iconPosition ?? "right")
  const isLoading = computed<ButtonProps["loading"]>(() => props.loading)
  const disabled = computed<ButtonProps["disabled"]>(() => props.disabled ?? false)
  const mode = computed<NonNullable<ButtonProps["mode"]>>(() => props?.mode ?? options?.mode ?? "primary")
  const size = computed<NonNullable<ButtonProps["size"]>>(() => props?.size ?? options?.size ?? "md")
  const rounded = computed<NonNullable<ButtonProps["rounded"]>>(() => props?.rounded ?? options?.rounded ?? "md")
  const color = computed<NonNullable<ButtonProps["color"]>>(() => props?.color ?? options?.color ?? "neutral")
  const classBase = computed<StyleClass>(() => {
    const classes = [
      baseClasses.value,
      modeClasses.value[mode.value][color.value],
      sizeClasses.value[type.value === "icon" ? "icon" : "button"][size.value],
      roundedClasses.value[rounded.value],
      options?.class ?? "",
      props?.class ?? "",
      disabled.value ? "opacity-50 cursor-not-allowed" : ""
    ]
    return Button.setStyle(classes.filter(Boolean))
  })

  const classIcon = computed<ButtonProps["classIcon"]>(() =>
    [
      "inline-flex items-center",
      mode.value === "primary" ? textColorsPrimaryClasses.value[color.value] : textColorsClasses.value[color.value],
      options?.classIcon ?? "",
      props?.classIcon ?? ""
    ]
      .flat()
      .join(" ")
  )
  defineExpose<ButtonExpose>({
    // ---PROPS-------------------------
    mode,
    size,
    rounded,
    color,
    classBase,
    classIcon
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Button.initStyle()
  })
</script>
<template>
  <button ref="buttonRef" data-button :type="type" :class="classBase" :data-loading="isLoading" v-bind="{ disabled }">
    <template v-if="type === 'icon'">
      <Icons v-if="icon" :type="icon" :class="classIcon" />
      <Loading v-if="isLoading" type="simple" :size="25" class="absolute" />
      <FixWindow v-if="slots.default" mode="filled" :class="roundedClasses[rounded]" :delay="10" :padding-window="40">
        <slot name="default" />
      </FixWindow>
    </template>
    <template v-else>
      <Icons v-if="icon && iconPosition === 'left'" :type="icon" :class="classIcon" />
      <slot name="default" />
      <Icons v-if="icon && iconPosition === 'right'" :type="icon" :class="classIcon" />
      <Loading v-if="isLoading" type="simple" :class="['-mr-2']" />
    </template>
  </button>
</template>
