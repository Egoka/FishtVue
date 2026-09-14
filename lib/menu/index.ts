// Runtime barrel для `fishtvue/menu` — entry rollup-сборки (menu.mjs).
// Бандлит Menu + renderless-дети MenuItem/MenuGroup (относительные импорты) в один модуль,
// чтобы compound-компоненты публиковались в npm как named-экспорты `.mjs` (а не raw `.vue`,
// которые не попадают в `files`-whitelist tarball'а). Зеркало lib/table/index.ts (Issue 3).
// Типы поставляются параллельно через Menu.d.ts / MenuItem.d.ts / MenuGroup.d.ts.
export { default } from "./Menu.vue"
export { default as MenuItem } from "./MenuItem.vue"
export { default as MenuGroup } from "./MenuGroup.vue"
