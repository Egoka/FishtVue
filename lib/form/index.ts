// Runtime barrel для `fishtvue/form` — entry rollup-сборки (form.mjs).
// Бандлит Form + renderless-дети FormField/FormSection (относительные импорты) + реестр типов полей
// в один модуль, чтобы compound-компоненты и registerFieldType публиковались в npm как named-экспорты
// `.mjs` (а не raw `.vue`). Типы поставляются параллельно через Form.d.ts (поле `types` в package.json).
export { default } from "./Form.vue"
export { default as FormField } from "./FormField.vue"
export { default as FormSection } from "./FormSection.vue"
export * from "./fieldRegistry"
