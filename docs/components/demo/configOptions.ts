import type { DemoOption } from "~/components/demo/index.vue"
import { useNuxtApp } from "#app"
import type { InputLayoutProps } from "#fishtvue/inputlayout"
import type { InputProps } from "#fishtvue/input"
import type { SelectProps } from "#fishtvue/select"
import type { CalendarProps } from "#fishtvue/calendar"
import type { SwitchProps } from "#fishtvue/switch"
import type { AriaProps } from "#fishtvue/aria"
import type { ButtonProps } from "#fishtvue/button"
import type { BadgeProps } from "#fishtvue/badge"
import type { PaginationProps } from "#fishtvue/pagination"
import type { AccordionProps } from "#fishtvue/accordion"
import type { SeparatorProps } from "#fishtvue/separator"
import type { DialogProps } from "#fishtvue/dialog"
import type { FixWindowProps } from "#fishtvue/fixwindow"
import type { AlertProps } from "#fishtvue/alert"
import { colorsObj } from "~/components/demo/select/dataForExample"

export const dataSelectMode = ["filled", "outlined", "underlined"]
export const dataSelectLabelMode = ["offsetDynamic", "offsetStatic", "dynamic", "static", "vanishing", "none"]
export const dataSelectAnimation = [
  { id: "transition-none", value: "None" },
  { id: "transition-all duration-0", value: "0" },
  { id: "transition-all duration-100", value: "100" },
  { id: "transition-all duration-500", value: "500" },
  { id: "transition-all duration-1000", value: "1000" }
]
export const layoutConfigOptions = <
  T extends
    | InputLayoutProps
    | InputProps
    | SelectProps
    | CalendarProps
    | SwitchProps
    | ButtonProps
    | BadgeProps
    | PaginationProps
    | AccordionProps
    | SeparatorProps
    | DialogProps
    | FixWindowProps
    | AlertProps
>(
  optionsValues: T,
  namesOptions?: Array<keyof T>
): DemoOption[] => {
  const { $i18n } = useNuxtApp()
  const { t, locale } = $i18n
  const resultOptions = [
    {
      nameComp: "mode",
      typeComp: "select",
      modelValue: (optionsValues as InputLayoutProps)["mode"],
      label: t("label.mode"),
      help: t("help.mode"),
      dataSelect: dataSelectMode
    },
    {
      nameComp: "label",
      typeComp: "input",
      modelValue: (optionsValues as InputLayoutProps)["label"],
      label: t("label.label"),
      help: t("help.label")
    },
    {
      nameComp: "labelMode",
      typeComp: "select",
      modelValue: (optionsValues as InputLayoutProps)["labelMode"],
      label: t("label.labelMode"),
      help: t("help.labelMode"),
      dataSelect: dataSelectLabelMode
    },
    {
      nameComp: "isInvalid",
      modelValue: (optionsValues as InputLayoutProps)["isInvalid"],
      label: t("label.isInvalid"),
      help: t("help.isInvalid"),
      typeComp: "switch"
    },
    {
      nameComp: "messageInvalid",
      modelValue: (optionsValues as InputLayoutProps)["messageInvalid"],
      label: t("label.messageInvalid"),
      help: t("help.messageInvalid"),
      typeComp: "aria"
    },
    {
      nameComp: "required",
      typeComp: "switch",
      modelValue: (optionsValues as InputLayoutProps)["required"],
      label: t("label.required"),
      help: t("help.required")
    },
    {
      nameComp: "loading",
      modelValue: (optionsValues as InputLayoutProps)["loading"],
      label: t("label.loading"),
      help: t("help.loading"),
      typeComp: "switch"
    },
    {
      nameComp: "disabled",
      modelValue: (optionsValues as InputLayoutProps)["disabled"],
      label: t("label.disabled"),
      help: t("help.disabled"),
      typeComp: "switch"
    },
    {
      nameComp: "clear",
      modelValue: (optionsValues as InputLayoutProps)["clear"],
      label: t("label.clear"),
      help: t("help.clear"),
      typeComp: "switch"
    },
    {
      nameComp: "help",
      modelValue: (optionsValues as InputLayoutProps)["help"],
      label: t("label.help"),
      help: t("help.help"),
      typeComp: "aria"
    },
    {
      nameComp: "width",
      modelValue: (optionsValues as InputLayoutProps)["width"],
      label: t("label.width"),
      help: t("help.width"),
      typeComp: "input"
    },
    {
      nameComp: "height",
      modelValue: (optionsValues as InputLayoutProps)["height"],
      label: t("label.height"),
      help: t("help.height"),
      typeComp: "input"
    },
    {
      nameComp: "animation",
      modelValue: (optionsValues as InputLayoutProps)["animation"],
      label: t("label.animation"),
      help: t("help.animation"),
      typeComp: "select",
      dataSelect: dataSelectAnimation
    },
    {
      nameComp: "classBody",
      modelValue: (optionsValues as InputLayoutProps)["classBody"],
      label: t("label.classBody"),
      help: t("help.classBody"),
      typeComp: "aria"
    },
    {
      nameComp: "class",
      modelValue: (optionsValues as InputLayoutProps)["class"],
      label: t("label.class"),
      help: t("help.class"),
      typeComp: "aria"
    },
    //Input
    {
      nameComp: "type",
      modelValue: (optionsValues as InputProps)["type"],
      label: t("label.Type"),
      help: t("help.Type"),
      typeComp: "select",
      dataSelect: ["text", "number", "email", "password"]
    },
    {
      nameComp: "autoFocus",
      modelValue: (optionsValues as InputProps)["autoFocus"],
      label: t("label.autoFocus"),
      help: t("help.autoFocus"),
      typeComp: "switch"
    },
    {
      nameComp: "placeholder",
      modelValue: (optionsValues as InputProps)["placeholder"],
      label: t("label.placeholder"),
      help: t("help.placeholder"),
      typeComp: "input"
    },
    {
      nameComp: "autocomplete",
      modelValue: (optionsValues as InputProps)["autocomplete"],
      label: t("label.autocomplete"),
      help: t("help.autocomplete"),
      typeComp: "select",
      dataSelect: ["on", "off"]
    },
    {
      nameComp: "maskInput",
      modelValue: (optionsValues as InputProps)["maskInput"],
      label: t("label.maskInput"),
      help: t("help.maskInput"),
      typeComp: "select",
      dataSelect: ["phone", "number", "price"]
    },
    {
      nameComp: "lengthInteger",
      modelValue: (optionsValues as InputProps)["lengthInteger"],
      label: t("label.lengthInteger"),
      help: t("help.lengthInteger"),
      typeComp: "input",
      type: "number",
      maskInput: "number"
    },
    {
      nameComp: "lengthDecimal",
      modelValue: (optionsValues as InputProps)["lengthDecimal"],
      label: t("label.lengthDecimal"),
      help: t("help.lengthDecimal"),
      typeComp: "input",
      type: "number",
      maskInput: "number"
    },
    {
      nameComp: "classInput",
      modelValue: (optionsValues as InputProps)["classInput"],
      label: t("label.classInput"),
      help: t("help.classInput"),
      typeComp: "aria"
    },
    //Select
    {
      nameComp: "dataSelect",
      modelValue: (optionsValues as SelectProps)["dataSelect"],
      label: t("label.DataSelect"),
      help: t("help.DataSelect"),
      typeComp: "select",
      keySelect: "name",
      valueSelect: "name",
      multiple: true,
      maxVisible: 2,
      classSelect: "w-full",
      dataSelect: colorsObj[locale.value]
    },
    {
      nameComp: "keySelect",
      typeComp: "select",
      modelValue: (optionsValues as SelectProps)["keySelect"],
      label: t("label.keySelect"),
      help: t("help.keySelect"),
      dataSelect: Object.keys(colorsObj[locale.value][0])
    },
    {
      nameComp: "valueSelect",
      typeComp: "select",
      modelValue: (optionsValues as SelectProps)["valueSelect"],
      label: t("label.valueSelect"),
      help: t("help.valueSelect"),
      dataSelect: Object.keys(colorsObj[locale.value][0])
    },
    {
      nameComp: "multiple",
      modelValue: (optionsValues as SelectProps)["multiple"],
      label: t("label.multiple"),
      help: t("help.multiple"),
      typeComp: "switch"
    },
    {
      nameComp: "maxVisible",
      modelValue: (optionsValues as SelectProps)["maxVisible"],
      label: t("label.maxVisible"),
      help: t("help.maxVisible"),
      disabled: !(optionsValues as SelectProps)["multiple"],
      typeComp: "input",
      type: "number"
    },
    {
      nameComp: "closeButtonBadge",
      modelValue: (optionsValues as SelectProps)["closeButtonBadge"],
      label: t("label.closeButtonBadge"),
      help: t("help.closeButtonBadge"),
      typeComp: "switch"
    },
    {
      nameComp: "noData",
      modelValue: (optionsValues as SelectProps)["noData"],
      label: t("label.noData"),
      help: t("help.noData"),
      typeComp: "input"
    },
    {
      nameComp: "noQuery",
      modelValue: (optionsValues as SelectProps)["noQuery"],
      label: t("label.noQuery"),
      help: t("help.noQuery"),
      typeComp: "input"
    },
    {
      nameComp: "classSelect",
      modelValue: (optionsValues as SelectProps)["classSelect"],
      label: t("label.classSelect"),
      help: t("help.classSelect"),
      typeComp: "aria"
    },
    {
      nameComp: "classSelectList",
      modelValue: (optionsValues as SelectProps)["classSelectList"],
      label: t("label.classSelectList"),
      help: t("help.classSelectList"),
      typeComp: "aria"
    },
    {
      nameComp: "classMaskQuery",
      modelValue: (optionsValues as SelectProps)["classMaskQuery"],
      label: t("label.classMaskQuery"),
      help: t("help.classMaskQuery"),
      typeComp: "aria"
    },
    // paramsFixWindow
    //Calendar
    // paramsDatePicker
    {
      nameComp: "isNotCloseOnDateChange",
      modelValue: (optionsValues as CalendarProps)["isNotCloseOnDateChange"],
      label: t("label.isNotCloseOnDateChange"),
      help: t("help.isNotCloseOnDateChange"),
      typeComp: "switch"
    },
    {
      nameComp: "classDataPicker",
      modelValue: (optionsValues as CalendarProps)["classDataPicker"],
      label: t("label.classDataPicker"),
      help: t("help.classDataPicker"),
      typeComp: "aria"
    },
    {
      nameComp: "classPicker",
      modelValue: (optionsValues as CalendarProps)["classPicker"],
      label: t("label.classPicker"),
      help: t("help.classPicker"),
      typeComp: "aria"
    },
    {
      nameComp: "classDateText",
      modelValue: (optionsValues as CalendarProps)["classDateText"],
      label: t("label.classDateText"),
      help: t("help.classDateText"),
      typeComp: "aria"
    },
    // paramsFixWindow
    //Switch
    {
      nameComp: "switchingType",
      typeComp: "select",
      modelValue: (optionsValues as SwitchProps)["switchingType"],
      label: t("label.switchingType"),
      help: t("help.switchingType"),
      dataSelect: ["checkbox", "switch"]
    },
    {
      nameComp: "modeSwitch",
      typeComp: "select",
      modelValue: (optionsValues as SwitchProps)["mode"],
      label: t("label.modeSwitch"),
      help: t("help.modeSwitch"),
      dataSelect: [...dataSelectMode, "none"]
    },
    {
      nameComp: "rounded",
      modelValue: (optionsValues as SwitchProps)["rounded"],
      label: t("label.rounded"),
      help: t("help.rounded"),
      typeComp: "input",
      type: "number",
      maskInput: "number"
    },
    {
      nameComp: "iconActive",
      typeComp: "select",
      modelValue: (optionsValues as SwitchProps)["iconActive"],
      label: t("label.iconActive"),
      help: t("help.iconActive"),
      dataSelect: ["tabler:sun", "tabler:moon"]
    },
    {
      nameComp: "iconInactive",
      typeComp: "select",
      modelValue: (optionsValues as SwitchProps)["iconInactive"],
      label: t("label.iconInactive"),
      help: t("help.iconInactive"),
      dataSelect: ["tabler:sun", "tabler:moon"]
    },
    //Aria
    {
      nameComp: "wrap",
      typeComp: "select",
      modelValue: (optionsValues as AriaProps)["wrap"],
      label: t("label.wrap"),
      help: t("help.wrap"),
      dataSelect: ["soft", "hard", "off"]
    },
    {
      nameComp: "rows",
      modelValue: (optionsValues as AriaProps)["rows"],
      label: t("label.rows"),
      help: t("help.rows"),
      typeComp: "input",
      type: "number",
      maskInput: "number"
    },
    {
      nameComp: "maxLength",
      modelValue: (optionsValues as AriaProps)["maxLength"],
      label: t("label.maxLength"),
      help: t("help.maxLength"),
      typeComp: "input",
      type: "number",
      maskInput: "number"
    },
    //Button
    {
      id: "modeButton",
      nameComp: "mode",
      typeComp: "select",
      modelValue: (optionsValues as ButtonProps)["mode"],
      label: t("label.mode"),
      help: t("help.mode"),
      dataSelect: ["primary", "outline", "ghost"]
    },
    {
      nameComp: "size",
      typeComp: "select",
      modelValue: (optionsValues as ButtonProps)["size"],
      label: t("label.size"),
      help: t("help.size"),
      dataSelect: ["xs", "sm", "md", "lg", "xl"]
    },
    {
      id: "roundedButton",
      nameComp: "rounded",
      typeComp: "select",
      modelValue: (optionsValues as ButtonProps)["rounded"],
      label: t("label.rounded"),
      help: t("help.rounded"),
      dataSelect: ["none", "md", "lg", "full"]
    },
    {
      nameComp: "color",
      typeComp: "select",
      modelValue: (optionsValues as ButtonProps)["color"],
      label: t("label.color"),
      help: t("help.color"),
      dataSelect: ["theme", "neutral", "creative", "destructive"]
    },
    {
      nameComp: "classIcon",
      modelValue: (optionsValues as ButtonProps)["classIcon"],
      label: t("label.classIcon"),
      help: t("help.classIcon"),
      typeComp: "aria"
    },
    {
      nameComp: "icon",
      typeComp: "select",
      modelValue: (optionsValues as ButtonProps)["icon"],
      label: t("label.icon"),
      help: t("help.icon"),
      dataSelect: ["mdi-light:check", "mdi-light:alert-circle", "mdi-light:email", "mdi-light:lock"]
    },
    {
      nameComp: "iconPosition",
      typeComp: "select",
      modelValue: (optionsValues as ButtonProps)["iconPosition"],
      label: t("label.iconPosition"),
      help: t("help.iconPosition"),
      dataSelect: ["left", "right"]
    },
    {
      id: "typeButton",
      nameComp: "type",
      typeComp: "select",
      modelValue: (optionsValues as ButtonProps)["type"],
      label: t("label.type"),
      help: t("help.type"),
      dataSelect: ["button", "reset", "submit", "icon"]
    },
    //Pagination
    {
      nameComp: "sizePage",
      typeComp: "select",
      modelValue: (optionsValues as PaginationProps)["sizePage"],
      label: t("label.sizePage"),
      help: t("help.sizePage"),
      dataSelect: [2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    },
    {
      nameComp: "sizesSelector",
      typeComp: "select",
      modelValue: (optionsValues as PaginationProps)["sizesSelector"],
      label: t("label.sizesSelector"),
      help: t("help.sizesSelector"),
      multiple: true,
      maxVisible: 0,
      dataSelect: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    },
    {
      nameComp: "visibleNumberPages",
      typeComp: "select",
      modelValue: (optionsValues as PaginationProps)["visibleNumberPages"],
      label: t("label.visibleNumberPages"),
      help: t("help.visibleNumberPages"),
      dataSelect: [5, 6, 7, 8, 9, 10, 11]
    },
    {
      nameComp: "total",
      typeComp: "select",
      modelValue: (optionsValues as PaginationProps)["total"],
      label: t("label.total"),
      help: t("help.total"),
      dataSelect: [100, 200, 500, 1000, 2000, 3000]
    },
    {
      nameComp: "isInfoText",
      typeComp: "switch",
      modelValue: (optionsValues as PaginationProps)["isInfoText"],
      label: t("label.isInfoText"),
      help: t("help.isInfoText")
    },
    {
      nameComp: "isPageSizeSelector",
      typeComp: "switch",
      modelValue: (optionsValues as PaginationProps)["isPageSizeSelector"],
      label: t("label.isPageSizeSelector"),
      help: t("help.isPageSizeSelector")
    },
    {
      nameComp: "isHiddenNavigationButtons",
      typeComp: "switch",
      modelValue: (optionsValues as PaginationProps)["isHiddenNavigationButtons"],
      label: t("label.isHiddenNavigationButtons"),
      help: t("help.isHiddenNavigationButtons")
    },
    //Accordion
    {
      nameComp: "animationDuration",
      typeComp: "select",
      modelValue: (optionsValues as AccordionProps)["animationDuration"],
      label: t("label.animationDuration"),
      help: t("help.animationDuration"),
      dataSelect: [100, 200, 500, 700, 1000, 1500, 2000]
    },
    {
      nameComp: "classItem",
      modelValue: (optionsValues as AccordionProps)["classItem"],
      label: t("label.classItem"),
      help: t("help.classItem"),
      typeComp: "aria"
    },
    {
      nameComp: "classTitle",
      modelValue: (optionsValues as AccordionProps)["classTitle"],
      label: t("label.classTitle"),
      help: t("help.classTitle"),
      typeComp: "aria"
    },
    {
      nameComp: "classSubtitle",
      modelValue: (optionsValues as AccordionProps)["classSubtitle"],
      label: t("label.classSubtitle"),
      help: t("help.classSubtitle"),
      typeComp: "aria"
    },
    //Separator
    {
      nameComp: "vertical",
      modelValue: (optionsValues as SeparatorProps)["vertical"],
      label: t("label.vertical"),
      help: t("help.vertical"),
      typeComp: "switch"
    },
    {
      nameComp: "contentPosition",
      modelValue: (optionsValues as SeparatorProps)["contentPosition"],
      label: t("label.contentPosition"),
      help: t("help.contentPosition"),
      typeComp: "select",
      dataSelect: ["right", "left", "center", "full"]
    },
    {
      nameComp: "gradient",
      modelValue: (optionsValues as SeparatorProps)["gradient"],
      label: t("label.gradient"),
      help: t("help.gradient"),
      typeComp: "select",
      dataSelect: [true, 10, 30, 50, 70, 80]
    },
    {
      nameComp: "depth",
      modelValue: (optionsValues as SeparatorProps)["depth"],
      label: t("label.depth"),
      help: t("help.depth"),
      typeComp: "select",
      dataSelect: [1, 2, 3, 4, 5, 6, 7]
    },
    {
      nameComp: "classBodyLine",
      modelValue: (optionsValues as SeparatorProps)["classBodyLine"],
      label: t("label.classBodyLine"),
      help: t("help.classBodyLine"),
      typeComp: "aria"
    },
    {
      nameComp: "classLine",
      modelValue: (optionsValues as SeparatorProps)["classLine"],
      label: t("label.classLine"),
      help: t("help.classLine"),
      typeComp: "aria"
    },
    {
      nameComp: "classContent",
      modelValue: (optionsValues as SeparatorProps)["classContent"],
      label: t("label.classContent"),
      help: t("help.classContent"),
      typeComp: "aria"
    },
    {
      nameComp: "classBodyLineLeft",
      modelValue: (optionsValues as SeparatorProps)["classBodyLineLeft"],
      label: t("label.classBodyLineLeft"),
      help: t("help.classBodyLineLeft"),
      typeComp: "aria"
    },
    {
      nameComp: "classLineLeft",
      modelValue: (optionsValues as SeparatorProps)["classLineLeft"],
      label: t("label.classLineLeft"),
      help: t("help.classLineLeft"),
      typeComp: "aria"
    },
    {
      nameComp: "classBodyLineRight",
      modelValue: (optionsValues as SeparatorProps)["classBodyLineRight"],
      label: t("label.classBodyLineRight"),
      help: t("help.classBodyLineRight"),
      typeComp: "aria"
    },
    {
      nameComp: "classLineRight",
      modelValue: (optionsValues as SeparatorProps)["classLineRight"],
      label: t("label.classLineRight"),
      help: t("help.classLineRight"),
      typeComp: "aria"
    },
    //Dialog
    {
      id: "sizeDialog",
      nameComp: "size",
      typeComp: "select",
      modelValue: (optionsValues as DialogProps)["size"],
      label: t("label.size"),
      help: t("help.size"),
      dataSelect: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"]
    },
    {
      nameComp: "position",
      modelValue: (optionsValues as DialogProps)["position"],
      label: t("label.position"),
      help: t("help.position"),
      typeComp: "select",
      dataSelect: ["top", "bottom", "left", "right", "center", "bottom-left", "top-left", "bottom-right", "top-right"]
    },
    {
      nameComp: "notAnimate",
      modelValue: (optionsValues as DialogProps)["notAnimate"],
      label: t("label.notAnimate"),
      help: t("help.notAnimate"),
      typeComp: "switch"
    },
    {
      nameComp: "closeButton",
      modelValue: (optionsValues as DialogProps)["closeButton"],
      label: t("label.closeButton"),
      help: t("help.closeButton"),
      typeComp: "switch"
    },
    {
      nameComp: "withoutMargin",
      modelValue: (optionsValues as DialogProps)["withoutMargin"],
      label: t("label.withoutMargin"),
      help: t("help.withoutMargin"),
      typeComp: "switch"
    },
    {
      nameComp: "notCloseBackground",
      modelValue: (optionsValues as DialogProps)["notCloseBackground"],
      label: t("label.notCloseBackground"),
      help: t("help.notCloseBackground"),
      typeComp: "switch"
    },
    //FixWindow
    {
      nameComp: "typePosition",
      modelValue: (optionsValues as FixWindowProps)["typePosition"],
      label: t("label.typePosition"),
      help: t("help.typePosition"),
      typeComp: "select",
      dataSelect: ["absolute", "fixed"]
    },
    {
      id: "positionFixWindow",
      nameComp: "position",
      modelValue: (optionsValues as FixWindowProps)["position"],
      label: t("label.position"),
      help: t("help.position"),
      typeComp: "select",
      dataSelect: [
        "top",
        "bottom",
        "left",
        "right",
        "center",
        "bottom-left",
        "top-left",
        "bottom-right",
        "top-right",
        "center-top",
        "center-bottom",
        "center-right",
        "center-left",
        "right-top",
        "right-bottom",
        "left-top",
        "left-bottom"
      ]
    },
    {
      nameComp: "eventOpen",
      modelValue: (optionsValues as FixWindowProps)["eventOpen"],
      label: t("label.eventOpen"),
      help: t("help.eventOpen"),
      typeComp: "select",
      dataSelect: ["hover", "click", "mousedown", "mouseup", "dblclick", "contextmenu", "none"]
    },
    {
      nameComp: "eventClose",
      modelValue: (optionsValues as FixWindowProps)["eventClose"],
      label: t("label.eventClose"),
      help: t("help.eventClose"),
      typeComp: "select",
      dataSelect: ["hover", "click", "mousedown", "mouseup", "dblclick", "contextmenu", "none"]
    },
    {
      nameComp: "delay",
      modelValue: (optionsValues as FixWindowProps)["delay"],
      label: t("label.delay"),
      help: t("help.delay"),
      typeComp: "select",
      dataSelect: [
        { id: 100, value: "100 ms" },
        { id: 200, value: "200 ms" },
        { id: 300, value: "300 ms" },
        { id: 500, value: "500 ms" },
        { id: 700, value: "700 ms" },
        { id: 1000, value: "1000 ms" },
        { id: 1200, value: "1200 ms" },
        { id: 1500, value: "1500 ms" },
        { id: 2000, value: "2000 ms" }
      ]
    },
    {
      nameComp: "marginPx",
      modelValue: (optionsValues as FixWindowProps)["marginPx"],
      label: t("label.marginPx"),
      help: t("help.marginPx"),
      typeComp: "input",
      type: "number",
      maskInput: "number"
    },
    {
      nameComp: "translatePx",
      modelValue: (optionsValues as FixWindowProps)["translatePx"],
      label: t("label.translatePx"),
      help: t("help.translatePx"),
      typeComp: "input",
      type: "number",
      maskInput: "number"
    },
    {
      nameComp: "paddingWindow",
      modelValue: (optionsValues as FixWindowProps)["paddingWindow"],
      label: t("label.paddingWindow"),
      help: t("help.paddingWindow"),
      typeComp: "input",
      type: "number",
      maskInput: "number"
    },
    //Alert
    {
      id: "typeAlert",
      nameComp: "type",
      modelValue: (optionsValues as AlertProps)["type"],
      label: t("label.type"),
      help: t("help.type"),
      typeComp: "select",
      dataSelect: ["success", "warning", "info", "error", "neutral"]
    },
    {
      id: "positionAlert",
      nameComp: "position",
      modelValue: (optionsValues as AlertProps)["position"],
      label: t("label.position"),
      help: t("help.position"),
      typeComp: "select",
      dataSelect: ["top", "bottom", "left", "right", "center", "bottom-left", "top-left", "bottom-right", "top-right"]
    },
    {
      id: "sizeAlert",
      nameComp: "size",
      modelValue: (optionsValues as AlertProps)["size"],
      label: t("label.size"),
      help: t("help.size"),
      typeComp: "select",
      dataSelect: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"]
    },
    {
      nameComp: "title",
      modelValue: (optionsValues as AlertProps)["title"],
      label: t("label.title"),
      help: t("help.title"),
      typeComp: "input"
    },
    {
      nameComp: "subtitle",
      modelValue: (optionsValues as AlertProps)["subtitle"],
      label: t("label.subtitle"),
      help: t("help.subtitle"),
      typeComp: "aria"
    },
    {
      nameComp: "displayTime",
      modelValue: (optionsValues as AlertProps)["displayTime"],
      label: t("label.displayTime"),
      help: t("help.displayTime"),
      typeComp: "select",
      dataSelect: [1000, 2000, 3000, 4000, 5000]
    },
    //Badge
    {
      id: "modeBadge",
      nameComp: "mode",
      typeComp: "select",
      modelValue: (optionsValues as BadgeProps)["mode"],
      label: t("label.mode"),
      help: t("help.mode"),
      dataSelect: ["primary", "secondary", "outline", "neutral"]
    },
    {
      nameComp: "point",
      modelValue: (optionsValues as BadgeProps)["point"],
      label: t("label.point"),
      help: t("help.point"),
      typeComp: "switch"
    }
  ] as DemoOption[]
  return namesOptions?.length
    ? (namesOptions.reduce((result: DemoOption[], nameOption) => {
        const findOption = resultOptions.find((i) => nameOption === i.nameComp || nameOption === i.id)
        if (findOption) result.push(findOption)
        return result
      }, []) as DemoOption[])
    : resultOptions
}
