// Runtime barrel для `fishtvue/select` — entry rollup-сборки (select.mjs).
// Бандлит Select + renderless-дети SelectOption/SelectGroup (относительные импорты) в один модуль,
// чтобы compound-компоненты публиковались в npm как named-экспорты `.mjs` (а не raw `.vue`).
// Типы поставляются параллельно через Select.d.ts (поле `types` в package.json).
export { default } from "./Select.vue"
export { default as SelectOption } from "./SelectOption.vue"
export { default as SelectGroup } from "./SelectGroup.vue"
