// Runtime barrel для `fishtvue/accordion` — entry rollup-сборки (accordion.mjs).
// Бандлит Accordion + renderless-ребёнка AccordionItem (относительные импорты) в один модуль,
// чтобы compound-компоненты публиковались в npm как named-экспорты `.mjs` (а не raw `.vue`,
// которые не попадают в `files`-whitelist tarball'а). Зеркало lib/menu/index.ts (Issue 2).
// Типы поставляются параллельно через Accordion.d.ts / AccordionItem.d.ts.
export { default } from "./Accordion.vue"
export { default as AccordionItem } from "./AccordionItem.vue"
