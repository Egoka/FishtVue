// Runtime barrel для `fishtvue/table` — entry rollup-сборки (table.mjs).
// Бандлит Table + renderless-дети Column/ColumnGroup (относительные импорты) в один модуль,
// чтобы compound-компоненты публиковались в npm как named-экспорты `.mjs` (а не raw `.vue`).
// Типы поставляются параллельно через Table.d.ts (поле `types` в package.json).
export { default } from "./Table.vue"
export { default as Column } from "./Column.vue"
export { default as ColumnGroup } from "./ColumnGroup.vue"
